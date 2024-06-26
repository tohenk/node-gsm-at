/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2024 Toha <tohenk@yahoo.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documeAtion files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const EventEmitter = require('events');
const path = require('path');
const { Queue, Work } = require('@ntlab/work');
const ntutil = require('@ntlab/ntlib/util');
const Logger = require('@ntlab/ntlib/logger');
const { AtDriver, AtDriverConstants } = require('./at-driver');

/**
 * AT modem handles AT commands with underlying stream.
 */
class AtModem extends EventEmitter {

    constructor(name, stream, config) {
        super();
        this.config = config;
        this.name = name;
        this.logdir = this.getConfig('logdir', path.join(__dirname, '..', 'logs'));
        this.logfile = path.join(this.logdir, this.name + '.log');
        this.logger = new Logger(this.logfile);
        this.timeout = config.timeout || 5000;
        this.stream = stream;
        this.props = {};
        this.status = {};
        this.idle = null;
        this.timedout = 0;
        this.detected = false;
        this.qres = new Queue([], response => {
            this.emit('process', response);
            this.qres.next();
        });
        this.stream.on('data', data => {
            this.rx(data);
        });
    }

    getConfig(name, defaultValue) {
        if (this.config && this.config[name] !== undefined) {
            return this.config[name];
        }
        return defaultValue;
    }

    useDriver(name) {
        const driver = AtDriver.get(name);
        if (driver === undefined) {
            throw new Error('Unknown driver ' + name);
        }
        this.driver = driver;
    }

    detect() {
        return Work.works([
            [w => Promise.resolve(this.useDriver('Generic'))],
            [w => this.tx('AT', {timeout: 1000})],
            [w => this.tx(this.getCmd(AtDriverConstants.AT_CMD_Q_FRIENDLY_NAME))],
            [w => new Promise((resolve, reject) => {
                const result = w.getRes(2);
                let driver = AtDriver.match(result.res());
                driver = driver.length ? driver : this.driver.name;
                if (driver.length) {
                    this.detected = true;
                    this.useDriver(driver);
                }
                resolve(this.driver);
            })],
        ]);
    }

    disconnect() {
        if (this.stream) {
            this.stream.close();
            this.detected = false;
        }
    }

    setState(state) {
        Object.assign(this.status, state);
        let isIdle = true;
        Object.values(this.status).forEach(value => {
            if (value === true) {
                isIdle = false;
                return true;
            }
        });
        if (this.idle !== isIdle) {
            this.idle = isIdle;
            const states = [];
            Object.keys(this.status).forEach(state => {
                if (this.status[state] === true) {
                    states.push(state);
                }
            });
            this.emit('state');
        }
    }

    propChanged(props) {
        if (typeof props === 'object') {
            Object.assign(this.props, props);
        }
        this.emit('prop');
    }

    rx(data) {
        // when state is busy, received data should be ignored
        // as its already handled by tx
        if (!this.status.busy) {
            data = ntutil.cleanEol(data);
            this.log('RX> %s', data);
            this.recv(data);
        }
    }

    tx(data, options) {
        return new Promise((resolve, reject) => {
            if (data) {
                options = options || {};
                this.setState({busy: true});
                let timeout = null;
                const params = {};
                if (options.expect) {
                    params.expect = options.expect;
                }
                if (options.ignore) {
                    params.ignore = options.ignore;
                }
                const txres = new AtResponse(this, params);
                // set data for error handler
                txres.data = data;
                const t = () => {
                    this.setState({busy: false});
                    this.timedout++;
                    txres.timeout = true;
                    reject(txres);
                }
                const f = buffer => {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    buffer = ntutil.cleanEol(buffer);
                    this.log('RX> %s', buffer);
                    if (txres.check(buffer)) {
                        this.setState({busy: false});
                        if (txres.okay) {
                            resolve(txres);
                        }
                        if (txres.error) {
                            reject(txres);
                        }
                        if (txres.extras) {
                            this.recv(txres.extras);
                        }
                    } else {
                        timeout = setTimeout(t, options.timeout || this.timeout);
                        this.stream.once('data', f);
                    }
                }
                if (this.timedout >= 100) {
                    this.debug('!!! %s: Timeout threshold reached, modem may be unresponsive. Try to restart', this.name);
                }
                this.log('TX> %s', data);
                this.stream.write(data + this.getCmd(AtDriverConstants.AT_PARAM_TERMINATOR), err => {
                    if (err) {
                        this.log('ERR> %s', err.message);
                        return reject(err);
                    }
                    timeout = setTimeout(t, options.timeout || this.timeout);
                    this.stream.once('data', f);
                });
            } else {
                reject('No data to transmit.');
            }
        });
    }

    txqueue(queues) {
        return new Promise((resolve, reject) => {
            const q = new Queue(queues, data => {
                const cmd = Array.isArray(data) ? data[0] : data;
                const vars = Array.isArray(data) ? data[1] : null;
                this.tx(this.getCmd(cmd, vars))
                    .then(res => {
                        if (!q.responses) {
                            q.responses = {};
                        }
                        q.responses[cmd] = res;
                        q.next();
                    })
                    .catch(err => q.next())
                ;
            });
            q.once('done', () => {
                resolve(q.responses);
            });
        });
    }

    recv(data) {
        this.qres.requeue([data]);
    }

    getCmd(cmd, vars) {
        cmd = this.driver.get(cmd);
        if (cmd !== undefined) {
            // substitude character => $XX
            let match;
            while (match = cmd.match(/\$([a-zA-Z0-9]{2})/)) {
                cmd = cmd.substr(0, match.index) + String.fromCharCode(parseInt('0x' + match[1])) +
                    cmd.substr(match.index + match[0].length);
            }
            // replace place holder
            const replacements = {'NONE': '', 'CR': '\r', 'LF': '\n'};
            if (vars) {
                Object.keys(vars).forEach(key => {
                    replacements[key] = vars[key];
                });
            }
            return ntutil.trans(cmd, replacements);
        }
    }

    getResult(cmds, res, status) {
        const result = {};
        for (const prop in cmds) {
            const cmd = cmds[prop];
            if (res[cmd]) {
                if (status !== undefined && status) {
                    result[prop] = res[cmd].okay ? true : false;
                } else {
                    result[prop] = res[cmd].res();
                }
            }
        }
        return result;
    }

    log() {
        this.logger.log.apply(this.logger, Array.from(arguments))
            .then(message => {
                this.emit('log', message);
            })
        ;
    }

    debug() {
        const args = Array.from(arguments);
        if (typeof this.config.logger === 'function') {
            this.config.logger.apply(null, args);
        } else if (this.getConfig('debugToConsole', true)) {
            console.log.apply(null, args);
        } else {
            this.createDebugger.apply(this, args);
        }
    }

    createDebugger() {
        if (this.debugger === undefined) {
            this.debugger = require('debug')('at-modem:' + this.name);
        }
        return this.debugger;
    }
}

/**
 * AT response data.
 */
class AtResponse {

    /**
     * Constructor.
     *
     * @param {AtModem} parent 
     * @param {Object} options 
     */
    constructor(parent, options) {
        options = options || {};
        this.parent = parent;
        this.expect = options.expect || null;
        this.ignore = options.ignore || null;
        this.okay = false;
        this.error = false;
        this.timeout = false;
        this.responses = [];
        this.extras = null;
    }

    check(response) {
        let result = false;
        this.extras = null;
        this.excludeMatch = true;
        const responses = Array.from(this.responses);
        responses.push(...this.clean(response.split(this.parent.getCmd(AtDriverConstants.AT_PARAM_TERMINATOR))));
        if (!result && this.isExpected(responses)) {
            result = true;
        }
        if (!result && this.isOkay(responses)) {
            result = true;
        }
        if (!result && this.isError(responses)) {
            result = true;
        }
        this.collect(responses);
        return result;
    }

    clean(responses) {
        let index = responses.length;
        while (index >= 0) {
            index--;
            if ('' === responses[index]) {
                responses.splice(index, 1);
            }
        }
        return responses;
    }

    collect(responses) {
        this.responses = [];
        let i = 0, j = responses.length;
        while (true) {
            if (i >= j) {
                break;
            }
            const s = responses.shift();
            if (i === this.match.pos) {
                if (this.excludeMatch) {
                    break;
                }
            }
            if (!this.isIgnored(s)) {
                this.responses.push(s);
            }
            if (i === this.match.pos) {
                break;
            }
            i++;
        }
        if (responses.length) {
            this.extras = responses.join(this.parent.getCmd(AtDriverConstants.AT_PARAM_TERMINATOR));
        }
    }

    getMatch(responses, matches, raw) {
        this.match = {};
        raw = raw !== undefined ? raw : false;
        let pos = 0;
        while (true) {
            if (pos >= responses.length) {
                break;
            }
            for (let i = 0; i < matches.length; i++) {
                const expected = raw ? matches[i] : this.parent.getCmd(matches[i]);
                if (expected === undefined) {
                    continue;
                }
                if (this.tryMatch(responses, pos, expected)) {
                    this.match.pos = pos;
                    this.match.matched = matches[i];
                    return true;
                }
            }
            pos++;
        }
        return false;
    }

    tryMatch(responses, pos, expected) {
        if (pos < responses.length) {
            let s = responses[pos];
            // check for whole match
            if (this.matchRaw(expected, s)) {
                return true;
            }
            // check for multiline match
            if (0 === expected.indexOf(s) && ((pos + 1) < responses.length)) {
                let i = pos + 1;
                let matched = false;
                while (true) {
                    if (i >= responses.length) {
                        break;
                    }
                    s += responses[i];
                    if (this.matchRaw(expected, s)) {
                        matched = true;
                        break;
                    }
                    i++;
                }
                if (matched) {
                    // combine matched response
                    responses[pos] = s;
                    responses.splice(pos + 1, i - pos);
                    return true;
                }
            }
        }
        return false;
    }

    isOkay(responses) {
        const commands = [AtDriverConstants.AT_RESPONSE_OK];
        if (this.getMatch(responses, commands)) {
            this.okay = true;
        }
        return this.okay;
    }

    isError(responses) {
        const commands = [
            AtDriverConstants.AT_RESPONSE_ERROR,
            AtDriverConstants.AT_RESPONSE_NO_CARRIER,
            AtDriverConstants.AT_RESPONSE_NOT_SUPPORTED,
            AtDriverConstants.AT_RESPONSE_CME_ERROR,
            AtDriverConstants.AT_RESPONSE_CMS_ERROR,
        ];
        if (this.getMatch(responses, commands)) {
            if ([AtDriverConstants.AT_RESPONSE_CME_ERROR,
                    AtDriverConstants.AT_RESPONSE_CMS_ERROR]
                    .indexOf(this.match.matched) >= 0) {
                this.excludeMatch = false;
            }
            this.error = true;
        }
        return this.error;
    }

    isExpected(responses) {
        if (this.expect) {
            const commands = Array.isArray(this.expect) ? this.expect : [this.expect];
            if (this.getMatch(responses, commands)) {
                this.okay = true;
            }
        }
        return this.okay;
    }

    isIgnored(response) {
        return this.isMatch(this.ignore, response);
    }

    isMatch(value, response) {
        if (value) {
            const values = Array.isArray(value) ? value : [value];
            for (let i = 0; i < values.length; i++) {
                if (this.matchRaw(values[i], response)) {
                    return true;
                }
            }
        }
    }

    match(cmd, response) {
        return this.matchRaw(this.parent.getCmd(cmd), response);
    }

    matchRaw(s, response) {
        if (s && response.toLowerCase().substring(0, s.length) == s.toLowerCase()) {
            return true;
        }
        return false;
    }

    res() {
        return this.responses.join(' ');
    }

    pick() {
        if (this.responses.length) {
            return this.responses[0];
        }
    }

    hasResponse() {
        return this.responses.length ? true : false;
    }
}

module.exports = {
    AtModem: AtModem,
    AtResponse: AtResponse,
}
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

const AtStkConstants = require('./at-stk-const');
const AtDriver = require('./at-driver');
const AtGsm = require('./at-gsm');
const { AtProcessor } = require('./at-processor')
const Queue = require('@ntlab/work/queue');
const Work = require('@ntlab/work/work');
const token = require('@ntlab/ntlib/token');

/**
 * @callback doneCallback
 * @param {boolean|undefined} success
 */

/**
 * AT STK handler.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtStk {

    /**
     * Constructor.
     *
     * @param {AtGsm} parent Parent
     * @param {AtDriver.AtDriver} driver The driver
     * @param {AtProcessor} processor The processor
     */
    constructor(parent, driver, processor) {
        this.parent = parent;
        this.driver = driver;
        this.processor = processor;
        this.commands = [];
        this.data = {};
        this.queue = new Queue([], stk => this.consume(stk, () => this.queue.next()));
        this.initialize();
    }

    /**
     * Do initialize.
     */
    initialize() {
        const prefixes = [];
        Object.keys(this.driver.commands).forEach(cmd => {
            const command = this.driver.get(cmd);
            if (command) {
                const r = AtStkCmd.from(cmd, command);
                if (r) {
                    this.commands.push(r);
                    if (prefixes.indexOf(r.prefix) < 0) {
                        prefixes.push(r.prefix);
                    }
                }
            }
        });
        prefixes.forEach(prefix => {
            this.processor.add(prefix, 1, true, data => this.handleSTK(data));
        });
        [
            ['inkeyMode', AtStkConstants.STK_GET_INKEY_MODE],
            ['inputMode', AtStkConstants.STK_GET_INPUT_MODE],
        ].forEach(m => {
            const command = this.driver.get(m[1]);
            if (command) {
                this[m[0]] = token.split(command);
            } else {
                this[m[0]] = [];
            }
        });
        console.log('%s: STK prefixes: %s', this.parent.name, prefixes.join(', '));
    }

    /**
     * Get input validator name.
     *
     * @param {string[]} modes Input modes mapping
     * @param {number} mode Input mode
     * @returns {string}
     */
    getInputValidator(modes, mode) {
        if (Array.isArray(modes) && mode >= 0 && mode < modes.length) {
            mode = modes[mode];
        }
        return mode;
    }

    /**
     * Handle STK response.
     *
     * @param {object} data Response
     */
    handleSTK(data) {
        let cmd, vars;
        for (const mtype of [false, true]) {
            for (const r of this.commands) {
                if (r.isPrefix(data.code)) {
                    vars = r.isMatch(data.tokens, mtype);
                    if (vars !== undefined) {
                        cmd = r.cmd;
                        break;
                    }
                }
            }
            if (cmd) {
                break;
            }
        }
        if (cmd) {
            this.queue.requeue([{cmd, vars}]);
        }
    }

    /**
     * Consume STK data.
     *
     * @param {object} stk STK data
     * @param {string} stk.cmd Command
     * @param {object} stk.vars variables
     * @param {doneCallback} done Completion callback 
     */
    consume(stk, done) {
        console.log('%s: STK', this.parent.name, stk);
        let handled = false;
        switch (stk.cmd) {
            /* -- action -- */
            case AtStkConstants.STK_MAIN_MENU:
                handled = true;
                this.stkMainMenu(stk.vars, done);
                break;
            case AtStkConstants.STK_SUB_MENU:
                handled = true;
                this.stkSubMenu(stk.vars, done);
                break;
            case AtStkConstants.STK_DISPLAY_TEXT:
                handled = true;
                this.stkDisplayText(stk.vars, done);
                break;
            case AtStkConstants.STK_GET_INKEY:
                handled = true;
                this.stkInkey(stk.vars, done);
                break;
            case AtStkConstants.STK_GET_INPUT:
                handled = true;
                this.stkInput(stk.vars, done);
                break;
            case AtStkConstants.STK_SEND_SMS:
                handled = true;
                this.stkSendSms(stk.vars, done);
                break;
            case AtStkConstants.STK_SEND_USSD:
                handled = true;
                this.stkSendUssd(stk.vars, done);
                break;
            case AtStkConstants.STK_SESSION_TIMEOUT:
            case AtStkConstants.STK_SESSION_ENDED:
                this.notify({reset: true});
                break;
            /* -- response -- */
            case AtStkConstants.STK_MAIN_MENU_TITLE:
                this.updateMenu(stk.cmd, 'mainmenu', stk.vars);
                break;
            case AtStkConstants.STK_SUB_MENU_TITLE:
                this.updateMenu(stk.cmd, 'submenu', stk.vars);
                break;
            case AtStkConstants.STK_MAIN_MENU_ITEM:
            case AtStkConstants.STK_SUB_MENU_ITEM:
                this.updateMenu(stk.cmd, null, stk.vars);
                break;
            case AtStkConstants.STK_DISPLAY_TEXT_ITEM:
                if (stk.vars.TXT) {
                    this.updateMessage(stk.vars.TXT);
                }
                if (stk.vars.CLEAR === 1) {
                    this.sendCmd(AtStkConstants.STK_DISPLAY_TEXT_CONFIRM, stk.vars);
                }
                break;
            case AtStkConstants.STK_GET_INKEY_DATA:
                if (stk.vars.MODE !== undefined) {
                    stk.vars.MODE = this.getInputValidator(this.inkeyMode, stk.vars.MODE);
                }
                this.notify({inkey: stk.vars});
                break;
            case AtStkConstants.STK_GET_INPUT_DATA:
                if (stk.vars.MODE !== undefined) {
                    stk.vars.MODE = this.getInputValidator(this.inputMode, stk.vars.MODE);
                }
                this.notify({input: stk.vars});
                break;
        }
        if (handled) {
            this.data.cmd = stk.cmd;
        } else {
            done();
        }
    }

    notify(data) {
        this.parent.emit('stk', data);
    }

    updateMenu(cmd, menu, data) {
        if (data.TITLE !== undefined) {
            if (menu) {
                this.data.current = menu;
            } else {
                menu = this.data.current;
            }
            if (menu) {
                if (this.data[menu] === undefined) {
                    this.data[menu] = {};
                }
                if ([AtStkConstants.STK_MAIN_MENU_TITLE, AtStkConstants.STK_SUB_MENU_TITLE].indexOf(cmd) >= 0) {
                    // check if menu title is from mainmenu or submenu action
                    if (this.data.cmd && [AtStkConstants.STK_MAIN_MENU, AtStkConstants.STK_SUB_MENU].indexOf(this.data.cmd) < 0) {
                        this.updateMessage(data.TITLE);
                    } else {
                        this.data[menu].title = data.TITLE;
                        this.data[menu].items = [];
                        console.log(`${this.parent.name}: STK: ${menu} title: ${data.TITLE}`);
                    }
                } else {
                    if (this.data[menu].items === undefined) {
                        this.data[menu].items = [];
                    }
                    this.data[menu].items.push({id: data.ID, title: data.TITLE});
                    console.log(`${this.parent.name}: STK: ${menu} item: ${data.TITLE} (${data.ID})`);
                    if (Object.keys(this.data[menu].items).length === data.COUNT) {
                        this.data[menu].items.sort((a, b) => a.id - b.id);
                        this.notify({[menu]: this.data[menu]});
                    }
                }
            }
        }
    }

    updateMessage(message) {
        this.data.message = message;
        console.log(`${this.parent.name}: STK: message: ${message}`);
        this.notify({message: this.data.message});
    }

    sendCmd(cmd, vars = null, callback = null) {
        if (typeof vars === 'function') {
            callback = vars;
            vars = null;
        }
        const done = success => {
            if (typeof callback === 'function') {
                callback(success);
            }
        }
        const command = this.driver.get(cmd, vars);
        if (command) {
            this.parent.query(command)
                .then(() => done(true))
                .catch(err => {
                    console.error(`${this.parent.name}: ${err}`);
                    done(false);
                });
        } else {
            done();
        }
    }

    /**
     * Execute STK main menu.
     *
     * @param {object} vars Variables
     * @param {doneCallback} done Completion callback
     */
    stkMainMenu(vars, done) {
        this.sendCmd(AtStkConstants.STK_MAIN_MENU_GET, vars, done);
    }

    /**
     * Execute STK sub menu.
     *
     * @param {object} vars Variables
     * @param {doneCallback} done Completion callback
     */
    stkSubMenu(vars, done) {
        this.sendCmd(AtStkConstants.STK_SUB_MENU_GET, vars, done);
    }

    /**
     * Execute STK display text.
     *
     * @param {object} vars Variables
     * @param {doneCallback} done Completion callback
     */
    stkDisplayText(vars, done) {
        this.sendCmd(AtStkConstants.STK_DISPLAY_TEXT_GET, vars, done);
    }

    /**
     * Execute STK inkey data.
     *
     * @param {object} vars Variables
     * @param {doneCallback} done Completion callback
     */
    stkInkey(vars, done) {
        this.sendCmd(AtStkConstants.STK_GET_INKEY_GET, vars, done);
    }

    /**
     * Execute STK input data.
     *
     * @param {object} vars Variables
     * @param {doneCallback} done Completion callback
     */
    stkInput(vars, done) {
        this.sendCmd(AtStkConstants.STK_GET_INPUT_GET, vars, done);
    }

    /**
     * Execute STK send SMS.
     *
     * @param {object} vars Variables
     * @param {doneCallback} done Completion callback
     */
    stkSendSms(vars, done) {
        this.sendCmd(AtStkConstants.STK_SEND_SMS_GET, vars, done);
    }

    /**
     * Execute STK send USSD.
     *
     * @param {object} vars Variables
     * @param {doneCallback} done Completion callback
     */
    stkSendUssd(vars, done) {
        this.sendCmd(AtStkConstants.STK_SEND_USSD_GET, vars, done);
    }

    /**
     * Do finish operation.
     *
     * @param {doneCallback} callback The callback
     * @param {boolean|undefined} success Operation result
     */
    opDone(callback, success = undefined) {
        if (typeof callback === 'function') {
            callback(success);
        }
    }

    /**
     * Show SIM Toolkit application.
     *
     * @param {doneCallback} done Completion callback
     */
    showApp(done = null) {
        this.sendCmd(AtStkConstants.STK_EXECUTE, success => {
            if (success && !this.driver.get(AtStkConstants.STK_MAIN_MENU)) {
                // force cmd to mainmenu
                this.data.cmd = AtStkConstants.STK_MAIN_MENU;
            }
            this.opDone(done, success);
        });
    }

    /**
     * Execute menu selection.
     *
     * @param {object} data Menu data
     * @param {number} data.mainmenu Main menu id
     * @param {number} data.submenu Sub menu id
     * @param {doneCallback} done Completion callback
     */
    selectMenu(data, done = null) {
        if (typeof data === 'object') {
            if (data.mainmenu) {
                this.sendCmd(AtStkConstants.STK_MAIN_MENU_SELECT, {SELECT: data.mainmenu}, done);
            }
            if (data.submenu) {
                this.sendCmd(AtStkConstants.STK_SUB_MENU_SELECT, {SELECT: data.submenu}, done);
            }
        } else {
            this.opDone(done);
        }
    }

    /**
     * Execute menu cancelling.
     *
     * @param {object} data Menu data
     * @param {number} data.mainmenu Main menu id
     * @param {number} data.submenu Sub menu id
     * @param {doneCallback} done Completion callback
     */
    cancelMenu(data, done = null) {
        if (typeof data === 'object') {
            if (data.mainmenu) {
                this.sendCmd(AtStkConstants.STK_MAIN_MENU_CANCEL, {ID: data.mainmenu}, done);
            }
            if (data.submenu) {
                this.sendCmd(AtStkConstants.STK_SUB_MENU_CANCEL, {ID: data.submenu}, done);
            }
        } else {
            this.opDone(done);
        }
    }

    /**
     * Execute send an input as a response to GET_INKEY_DATA.
     *
     * @param {object} data Menu data
     * @param {doneCallback} done Completion callback
     */
    sendInkey(data, done = null) {
        if (typeof data === 'object') {
            if (data.cancel) {
                this.sendCmd(AtStkConstants.STK_GET_INKEY_CANCEL, data, done);
            } else if (data.MODE && data.INPUT) {
                const v = AtStkInput.validate(data.MODE, data.INPUT, data);
                if (v) {
                    this.opDone(done, v);
                } else {
                    this.sendCmd(AtStkConstants.STK_GET_INKEY_CONFIRM, data, done);
                }
            } else {
                this.opDone(done);
            }
        } else {
            this.opDone(done);
        }
    }

    /**
     * Execute send an input as a response to GET_INPUT_DATA.
     *
     * @param {object} data Menu data
     * @param {doneCallback} done Completion callback
     */
    sendInput(data, done = null) {
        if (typeof data === 'object') {
            if (data.cancel) {
                this.sendCmd(AtStkConstants.STK_GET_INPUT_CANCEL, data, done);
            } else if (data.MODE && data.INPUT) {
                const v = AtStkInput.validate(data.MODE, data.INPUT, data);
                if (v) {
                    this.opDone(done, v);
                } else {
                    const prompt = this.driver.get(AtStkConstants.STK_GET_INPUT_CONFIRM_PROMPT);
                    if (prompt) {
                        const options = {expect: prompt, timeout: this.parent.sendTimeout};
                        const works = [
                            [w => this.parent.doQuery(this.driver.get(AtStkConstants.STK_GET_INPUT_CONFIRM), options)],
                            [w => this.parent.doQuery(this.driver.get(AtStkConstants.STK_GET_INPUT_CONFIRM_COMMIT, data))],
                        ]
                        Work.works(works)
                            .then(() => this.opDone(done, true))
                            .catch(err => {
                                console.error(err);
                                this.opDone(done, false);
                            })
                        ;
                    } else {
                        this.sendCmd(AtStkConstants.STK_GET_INPUT_CONFIRM, data, done);
                    }
                }
            } else {
                this.opDone(done);
            }
        } else {
            this.opDone(done);
        }
    }
}

/**
 * AT STK command response matcher.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtStkCmd {

    /**
     * Constructor.
     *
     * @param {string} cmd Command
     * @param {string} prefix Prefix
     * @param {any[]} tokens tokens
     */
    constructor(cmd, prefix, tokens) {
        this.cmd = cmd;
        this.prefix = prefix;
        this.tokens = new AtStkToken(tokens);
    }

    /**
     * Check if prefix matched.
     *
     * @param {string} prefix Prefix to check
     * @returns {boolean}
     */
    isPrefix(prefix) {
        return this.prefix.toLowerCase() === prefix.toLowerCase();
    }

    /**
     * Get a matched object from tokens.
     *
     * @param {any[]} tokens Tokens
     * @param {boolean} mininum Check for minimum required tokens length
     * @returns {object}
     */
    isMatch(tokens, mininum = false) {
        return this.tokens.getMatch(tokens, mininum);
    }

    /**
     * Create a command from STK data.
     *
     * @param {string} cmd Command
     * @param {string} s STK data
     * @returns {AtStkCmd}
     */
    static from(cmd, s) {
        const idx = s.indexOf(':');
        if (idx > 0) {
            const prefix = s.substr(0, idx + 1);
            const tokens = token.split(s.substr(idx + 1).trim());
            return new AtStkCmd(cmd, prefix, tokens);
        }
    }
}

/**
 * AT STK token.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtStkToken {

    matcher = {
        '`': (a, b) => parseInt(b) == b,    // match number
        '*': (a, b) => true,                // match any
        '':  (a, b) => a == b,              // match literal
    }

    /**
     * Constructor.
     *
     * @param {string[]}} tokens Tokens
     */
    constructor(tokens) {
        this.tokens = [];
        for (const t of tokens) {
            this.tokens.push(this.getMatcher(t + ''));
        }
    }

    /**
     * Get token pattern matcher.
     *
     * @param {string} s Token pattern
     * @returns {object}
     */
    getMatcher(s) {
        const res = {};
        for (const matcher of Object.keys(this.matcher)) {
            const q = matcher === '*' ? '\\' + matcher : matcher;
            const match = s.match(`${q}(\\?)?([a-zA-Z0-9]+)${q}`);
            if (match) {
                res.name = match[2];
                res.matcher = this.matcher[matcher];
                res.required = !match[1];
                res.var = matcher !== '' ? true : false;
                break;
            }
        }
        return res;
    }

    /**
     * Get minimum length of tokens.
     *
     * @returns {number}
     */
    getMin() {
        return this.tokens.reduce((a, b) => a + (b.required ? 1 : 0), 0);
    }

    /**
     * Get maxium length of tokens.
     *
     * @returns {number}
     */
    getMax() {
        return this.tokens.length;
    }

    /**
     * Get tokens match.
     *
     * @param {any[]} tokens Tokens
     * @param {boolean} minimum Check for minimum required tokens length
     * @returns {object|undefined}
     */
    getMatch(tokens, minimum = false) {
        if ((!minimum && tokens.length === this.getMax()) || (minimum && tokens.length === this.getMin())) {
            let res = {}, matched = true, i = 0;
            for (const t of this.tokens) {
                if (minimum && !t.required) {
                    continue;
                }
                if (!t.matcher(t.name, tokens[i])) {
                    matched = false;
                    break;
                }
                if (t.var) {
                    res[t.name] = tokens[i];
                }
                i++;
            }
            if (matched) {
                return res;
            }
        }
    }
}

/**
 * AT STK input.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtStkInput {

    static get INPUT_DIGIT() { return 'DIGIT' }
    static get INPUT_SMS() { return 'SMS' }
    static get INPUT_UCS2() { return 'UCS2' }
    static get INPUT_YESNO() { return 'YESNO' }
    static get INPUT_PACKED() { return 'PACKED' }
    static get INPUT_UNPACKED() { return 'UNPACKED' }

    static validate(mode, value, options = {}) {
        let res;
        value = value + '';
        if (options.MIN && value.length < options.MIN) {
            res = `Value length must a least ${options.MIN} characters!`;
        }
        if (!res && options.MAX && value.length > options.MAX) {
            res = `Value length must a most ${options.MIN} characters!`;
        }
        if (!res) {
            switch (mode) {
                case AtStkInput.INPUT_DIGIT:
                    if (value.match(/[^0-9\*#\+]/)) {
                        res = `Value can only contains 0-9, *, #, or +!`;
                    }
                    break;
                case AtStkInput.INPUT_YESNO:
                    if (value.match(/[^ynYN]/)) {
                        res = `Value can only contains y or n!`;
                    }
                    break;
            }
        }
        return res;
    }
}

module.exports = AtStk;
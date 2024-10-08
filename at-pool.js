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

const AtDriver = require('./at-driver');
const AtDriverConstants = require('./at-driver-const');
const AtStkConstants = require('./at-stk-const');
const AtGsm = require('./at-gsm');
const Work = require('@ntlab/work/work');

/**
 * AT modems pool.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtPool {

    Driver = AtDriver(AtDriverConstants)
    Stk = AtDriver(AtStkConstants)

    constructor() {
        this.items = {};
        if (AtGsm.getDrivers() === undefined) {
            AtGsm.setDrivers(this.Driver);
        }
    }

    init(factory, config) {
        this.streamFactory = factory;
        this.config = config;
    }

    open(streamName) {
        return Work.works([
            ['opened', w => Promise.resolve(this.get(streamName))],
            ['check-factory', w => Promise.reject('Invalid stream factory, only function accepted.'),
                w => !w.getRes('opened') && typeof this.streamFactory !== 'function'],
            ['stream', w => this.streamFactory(streamName),
                w => !w.getRes('opened')],
            ['log-detect', w => Promise.resolve(console.log('%s: Try detecting modem...', streamName)),
                w => !w.getRes('opened')],
            ['gsm', w => Promise.resolve(new AtGsm(streamName, w.getRes('stream'), this.config)),
                w => !w.getRes('opened')],
            ['driver', w => new Promise((resolve, reject) => {
                /** @type {AtGsm} */
                const gsm = w.getRes('gsm');
                gsm.detect()
                    .then(res => resolve(res))
                    .catch(err => `${streamName}: not an AT modem.`);
            }), w => !w.getRes('opened')],
            ['log-detected', w => Promise.resolve(
                console.log('%s: Modem successfully detected as %s.', streamName, w.getRes('driver').desc)),
                w => !w.getRes('opened')],
            ['initialize', w => w.getRes('gsm').initialize(),
                w => !w.getRes('opened')],
            ['finish', w => new Promise((resolve, reject) => {
                /** @type {AtGsm} */
                const gsm = w.getRes('gsm');
                this.items[streamName] = gsm;
                console.log('%s: Modem information:',      streamName);
                console.log('%s: %s',                      streamName, '-'.repeat(50));
                console.log('%s: Manufacturer       = %s', streamName, gsm.info.manufacturer);
                console.log('%s: Model              = %s', streamName, gsm.info.model);
                console.log('%s: Version            = %s', streamName, gsm.info.version);
                console.log('%s: Serial             = %s', streamName, gsm.info.serial);
                console.log('%s: IMSI               = %s', streamName, gsm.info.imsi);
                console.log('%s: Call monitor       = %s', streamName, gsm.info.hasCall ? 'yes' : 'no');
                console.log('%s: SMS monitor        = %s', streamName, gsm.info.hasSms ? 'yes' : 'no');
                console.log('%s: USSD monitor       = %s', streamName, gsm.info.hasUssd ? 'yes' : 'no');
                console.log('%s: Charsets           = %s', streamName, gsm.props.charsets.join(', '));
                console.log('%s: Default charset    = %s', streamName, gsm.props.charset);
                console.log('%s: SMS Mode           = %s', streamName, gsm.props.smsMode);
                console.log('%s: Default storage    = %s', streamName, gsm.props.storage);
                console.log('%s: SMSC               = %s', streamName, gsm.props.smsc);
                console.log('%s: Network operator   = %s', streamName, gsm.props.network.code);
                console.log('%s: %s',                      streamName, '-'.repeat(50));
                const stk = this.Stk.match(gsm.driver.desc);
                if (stk.length) {
                    console.log('%s: Using STK %s', streamName, stk);
                    gsm.useStk(this.Stk.get(stk));
                }
                resolve(gsm);
            }), w => !w.getRes('opened')],
        ]);
    }

    get(streamName) {
        if (this.items[streamName]) {
            return this.items[streamName];
        }
    }
}

module.exports = new AtPool();
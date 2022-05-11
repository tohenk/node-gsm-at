/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2022 Toha <tohenk@yahoo.com>
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

const Work = require('@ntlab/work/work');
const { AtDriver } = require('./at-driver');
const AtGsm = require('./at-gsm');

/**
 * AT modems pool.
 */
class AtPool {

    Driver = AtDriver

    init(factory, config) {
        this.items = {};
        this.streamFactory = factory;
        this.config = config;
    }

    open(streamName) {
        let gsm = this.get(streamName);
        if (gsm) return Promise.resolve(gsm);
        if (typeof this.streamFactory != 'function') {
            return Promise.reject('Invalid stream factory, only function accepted.');
        }
        return Work.works([
            w => new Promise((resolve, reject) => {
                this.streamFactory(streamName)
                    .then(stream => {
                        console.log('%s: Try detecting modem...', streamName);
                        gsm = new AtGsm(streamName, stream, this.config);
                        resolve();
                    })
                    .catch(err => reject(err))
                ;
            }),
            w => new Promise((resolve, reject) => {
                gsm.detect()
                    .then(driver => {
                        console.log('%s: Modem successfully detected as %s.', streamName, driver.desc);
                        resolve();
                    })
                    .catch(err => reject(err))
                ;
            }),
            w => new Promise((resolve, reject) => {
                gsm.initialize()
                    .then(() => {
                        this.items[streamName] = gsm;
                        console.log('%s: Modem information:', streamName);
                        console.log('-'.repeat(50));
                        console.log('Manufacturer       = %s', gsm.info.manufacturer);
                        console.log('Model              = %s', gsm.info.model);
                        console.log('Version            = %s', gsm.info.version);
                        console.log('Serial             = %s', gsm.info.serial);
                        console.log('IMSI               = %s', gsm.info.imsi);
                        console.log('Call monitor       = %s', gsm.info.hasCall ? 'yes' : 'no');
                        console.log('SMS monitor        = %s', gsm.info.hasSms ? 'yes' : 'no');
                        console.log('USSD monitor       = %s', gsm.info.hasUssd ? 'yes' : 'no');
                        console.log('Charsets           = %s', gsm.props.charsets.join(', '));
                        console.log('Default charset    = %s', gsm.props.charset);
                        console.log('SMS Mode           = %s', gsm.props.smsMode);
                        console.log('Default storage    = %s', gsm.props.storage);
                        console.log('SMSC               = %s', gsm.props.smsc);
                        console.log('Network operator   = %s', gsm.props.network.code);
                        console.log('-'.repeat(50));
                        resolve(gsm);
                    })
                    .catch(err => reject(err))
                ;
            }),
        ]);
    }

    get(streamName) {
        if (this.items[streamName]) {
            return this.items[streamName];
        }
    }
}

module.exports = new AtPool();
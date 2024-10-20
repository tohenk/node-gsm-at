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

const AtDriverConstants = require('./at-driver-const');
const { AtModem } = require('./at-modem');
const { AtSms } = require('./at-sms');
const AtNetwork = require('./at-network');
const token = require('@ntlab/ntlib/token');

/**
 * @callback processorHandler
 * @param {object} data The data
 */

/**
 * AT GSM response processor.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtProcessor {

    /**
     * Constructor.
     *
     * @param {AtModem} parent 
     */
    constructor(parent) {
        this.parent = parent;
        this.processors = [];
        this.register();
    }

    /**
     * Process repsonse data.
     *
     * @param {AtProcessorData} data Data to process
     */
    process(data) {
        const matches = this.handle(data);
        if (matches.length) {
            matches.forEach(match => {
                Object.assign(data, match);
                const result = match.handler(data);
                if (typeof result === 'object') {
                    if (!data.result) {
                        data.result = {};
                    }
                    Object.assign(data.result, result);
                    this.parent.propChanged(result);
                }
            });
        }
        data.unprocessed = data.responses;
        for (let i = matches.length - 1; i >= 0; i--) {
            if (data.unprocessed[matches[i].index] !== undefined) {
                data.unprocessed.splice(matches[i].index, 1);
            }
        }
    }

    /**
     * Get response handler.
     *
     * @param {AtProcessorData} data The data
     * @returns {object[]}
     */
    handle(data) {
        const matches = [];
        /**
         * A processor matcher.
         *
         * @param {AtProcessorData} data The data
         * @param {object} processor The processor
         * @param {string} processor.cmd Command
         * @param {number} processor.len Minimum arguments count
         * @param {string|undefined} processor.separator Argument separator
         * @param {processorHandler} processor.handler Handler
         */
        const f = (data, processor) => {
            const result = data.match(processor);
            if (Array.isArray(result)) {
                result.forEach(res => {
                    if (typeof res === 'object') {
                        res.handler = processor.handler;
                        matches.push(res);
                    }
                });
            }
        }
        for (let i = 0; i < this.processors.length; i++) {
            f(data, this.processors[i]);
        }
        if (matches.length === 0 && typeof this.onHandler === 'function') {
            this.onHandler(data, f);
        }
        if (matches.length > 1) {
            matches.sort((a, b) => a.index - b.index);
        }
        return matches;
    }

    add(cmd, len, separator, raw, handler) {
        const processor = {
            cmd: cmd,
            len: len
        }
        if (typeof raw === 'function') {
            handler = raw;
            raw = null;
        }
        if (typeof separator === 'function') {
            handler = separator;
            separator = null;
        }
        if (typeof separator === 'boolean') {
            raw = separator;
            separator = null;
        }
        if (separator) {
            processor.separator = separator;
        }
        if (raw) {
            processor.raw = true;
        }
        processor.handler = handler;
        this.processors.push(processor);
    }

    register() {
        this.add(AtDriverConstants.AT_RESPONSE_CME_ERROR, 1, data => this.handleCME(data));
        this.add(AtDriverConstants.AT_RESPONSE_CMS_ERROR, 1, data => this.handleCMS(data));
        this.add(AtDriverConstants.AT_RESPONSE_SMSC, 2, data => this.handleCSCA(data));
        this.add(AtDriverConstants.AT_RESPONSE_COPS, 1, data => this.handleCOPS(data));
        this.add(AtDriverConstants.AT_RESPONSE_CSCS, 1, data => this.handleCSCS(data));
        this.add(AtDriverConstants.AT_RESPONSE_CLCK, 1, data => this.handleCLCK(data));
        this.add(AtDriverConstants.AT_RESPONSE_CSQ, 2, data => this.handleCSQ(data));
        this.add(AtDriverConstants.AT_RESPONSE_RSSI, 1, data => this.handleRSSI(data));
        this.add(AtDriverConstants.AT_RESPONSE_RING, 0, data => this.handleRING(data));
        this.add(AtDriverConstants.AT_RESPONSE_CLIP, 1, data => this.handleCLIP(data));
        this.add(AtDriverConstants.AT_RESPONSE_CALL_END, 1, data => this.handleCEND(data));
        this.add(AtDriverConstants.AT_RESPONSE_NEW_MESSAGE_DIRECT, 2, data => this.handleCMT(data));
        this.add(AtDriverConstants.AT_RESPONSE_NEW_MESSAGE, 2, data => this.handleCMTI(data));
        this.add(AtDriverConstants.AT_RESPONSE_DELIVERY_REPORT_DIRECT, 1, data => this.handleCDS(data));
        this.add(AtDriverConstants.AT_RESPONSE_DELIVERY_REPORT, 2, data => this.handleCDSI(data));
        this.add(AtDriverConstants.AT_RESPONSE_CPMS, 3, data => this.handleCPMS(data));
        this.add(AtDriverConstants.AT_RESPONSE_CMGF, 1, data => this.handleCMGF(data));
        this.add(AtDriverConstants.AT_RESPONSE_CMGL, 4, data => this.handleCMGL(data));
        this.add(AtDriverConstants.AT_RESPONSE_CMGR, 3, data => this.handleCMGR(data));
        this.add(AtDriverConstants.AT_RESPONSE_CMGS, 1, data => this.handleCMGS(data));
        this.add(AtDriverConstants.AT_RESPONSE_CUSD, 1, '\n', data => this.handleCUSD(data));
        this.add(AtDriverConstants.AT_RESPONSE_UNSOLICITED_IND, 1, data => this.handleUnsolicitedIndication(data));
        this.add(AtDriverConstants.AT_RESPONSE_MEM_FULL, 1, data => this.handleMEMFULL(data));
    }

    readPDU(data) {
        const result = [];
        const len = data.matched.len;
        let tokens, next, pdu, startIndex, processedIndex;
        let index = data.index;
        while (true) {
            if (index >= data.responses.length) {
                break;
            }
            startIndex = index;
            if (index === data.index) {
                tokens = data.tokens;
            } else {
                tokens = next;
            }
            if (!tokens) {
                break;
            }
            pdu = '';
            if (tokens.length >= len) {
                while (true) {
                    index++;
                    if (index >= data.responses.length) {
                        break;
                    }
                    let match = data.matchAt(data.matched, index);
                    if (match.matched) {
                        next = match.tokens;
                        break;
                    } else {
                        pdu += data.responses[index];
                    }
                }
                if (pdu.length) {
                    if (processedIndex === undefined) {
                        processedIndex = startIndex;
                    }
                    let msg = AtSms.decode(pdu);
                    let tplen = tokens[len - 1];
                    this.parent.debug('PDU = %s, tplen = %d, expected = %d [%s]', pdu, msg.tplen, tplen,
                        msg.tplen === tplen ? 'OK' : 'SKIPPED');
                    if (msg.tplen === tplen) {
                        let storage, storageIndex, storageStatus;
                        switch (data.matched.cmd) {
                            case AtDriverConstants.AT_RESPONSE_DELIVERY_REPORT_DIRECT:
                                break;
                            case AtDriverConstants.AT_RESPONSE_NEW_MESSAGE_DIRECT:
                                break;
                            case AtDriverConstants.AT_RESPONSE_CMGR:
                                if (this.parent.queue &&
                                    this.parent.queue.info &&
                                    this.parent.queue.info.storage) {
                                    storage = this.parent.queue.info.storage;
                                    storageIndex = this.parent.queue.info.index;
                                } else {
                                    storage = this.parent.props.storage;
                                    storageIndex = this.parent.props.storageIndex;
                                }
                                storageStatus = tokens[0];
                                break;
                            case AtDriverConstants.AT_RESPONSE_CMGL:
                                storage = this.parent.props.storage;
                                storageIndex = tokens[0];
                                storageStatus = tokens[1];
                                break;
                        }
                        const res = {message: msg};
                        if (storage) {
                            res.storage = storage;
                        }
                        if (storageIndex) {
                            res.index = storageIndex;
                        }
                        if (storageStatus) {
                            res.status = storageStatus;
                        }
                        result.push(res);
                    }
                }
            }
        }
        if (processedIndex !== undefined) {
            data.responses.splice(processedIndex, index - processedIndex + 1);
        }
        return result;
    }

    readStorage(data) {
        return {
            queues: [{
                op: 'read',
                storage: data.tokens[0],
                index: data.tokens[1]
            }]
        }
    }

    handleCME(data) {
        // +CME ERROR: 100
        return {
            cme_error: data.tokens[0]
        }
    }

    handleCMS(data) {
        // +CMS ERROR: 500
        return {
            cms_error: data.tokens[0]
        }
    }

    handleCSCA(data) {
        // +CSCA: "+628315000032",145
        return {
            smsc: data.tokens[0]
        }
    }

    handleCOPS(data) {
        // +COPS: <mode>,<format>,<oper>,<rat>
        if (!Array.isArray(data.tokens[0])) {
            return {
                network: AtNetwork.from(data.tokens)
            }
        } else {
            return {
                networks: AtNetwork.list(data.tokens)
            }
        }
    }

    handleCSCS(data) {
        // +CSCS: "GSM"
        // +CSCS: ("GSM","IRA","8859-1","UTF-8","UCS2")
        if (Array.isArray(data.tokens[0])) {
            return {
                charsets: data.tokens[0]
            }
        } else {
            return {
                charset: data.tokens[0]
            }
        }
    }

    handleCLCK(data) {
        // +CLCK: 1
        // +CLCK: ("CS","PS","..","..","..")
        if (!isNaN(data.tokens[0])) {
            return {
                keylock: parseInt(data.tokens[0]) === 1
            }
        } else {
            return {
                locks: data.tokens[0]
            }
        }
    }

    handleCSQ(data) {
        // +CSQ: 99,99
        // ^HCSQ:"LTE",46,36,81,14
        if (isNaN(data.tokens[0])) {
            data.tokens.shift();
        }
        return {
            rssi: data.tokens[0]
        }
    }

    handleRSSI(data) {
        // ^CRSSI: 31
        return {
            rssi: data.tokens[0]
        }
    }

    handleRING(data) {
        return {
            ringing: true
        }
    }

    handleCLIP(data) {
        // +CLIP: "+6281357909840",145,,,"Someone"
        return {
            caller: data.tokens[0]
        }
    }

    handleCEND(data) {
        // ^CEND: <no>,<duration>,<status>,<cause>
        return {
            ringing: false
        }
    }

    handleCMT(data) {
        const result = this.readPDU(data);
        if (result.length) {
            return {
                messages: result
            }
        }
    }

    handleCMTI(data) {
        // +CMTI: "ME",268516608
        return this.readStorage(data);
    }

    handleCDS(data) {
        const result = this.readPDU(data);
        if (result.length) {
            return {
                messages: result
            }
        }
    }

    handleCDSI(data) {
        return this.readStorage(data);
    }

    handleCPMS(data) {
        // +CPMS: "SM",6,40,"SR",6,40,"SM",6,40
        // +CPMS: 6,40,6,40,6,40
        // +CPMS: (("SM", "SR"),"SM")
        const result = {};
        const storages = {};
        while (true) {
            // response must be at least 3 part
            if (data.tokens.length < 3) {
                break;
            }
            // ensure storage is not number
            if (!isNaN(data.tokens[0])) {
                break;
            }
            const info = {storage: data.tokens.shift()};
            // used storage
            let value = data.tokens.shift();
            if (!isNaN(value)) {
                info.used = parseInt(value);
            }
            // total storage
            value = data.tokens.shift();
            if (!isNaN(value)) {
                info.total = parseInt(value);
            }
            // add unique storage information
            if (!storages[info.storage] && info.used !== undefined && info.total !== undefined) {
                storages[info.storage] = info;
            }
        }
        const keys = Object.keys(storages);
        if (keys.length) {
            const storage = keys[0];
            result.storage = storages[storage].storage;
            result.storageUsed = storages[storage].used;
            result.storageTotal = storages[storage].total;
            result.storages = storages;
        }
        return result;
    }

    handleCMGF(data) {
        // +CMGF: 0
        return {
            smsMode: data.tokens[0]
        }
    }

    handleCMGL(data) {
        // +CMGL: 0,0,,123
        // 0691261801000004048122550000115071015064827BD3E6140495BF410A45CC059A96E5F6F4B80C4ABACD6F85CC050AD6E96F90B40C67E71533178898B697E5749082E6020DDFF0BCA2E60209D9E1F11AC44CCFE90A9B0B7445A7E96510333DA72B14D372BB1E064D9B531039CC0EB741F3F27C9E7EBB4169771A749687E9E9B90B
        const result = this.readPDU(data);
        if (result.length) {
            return {
                messages: result
            }
        }
    }

    handleCMGR(data) {
        // +CMGR: 0,,123
        // 0691261801000004048122550000115071015064827BD3E6140495BF410A45CC059A96E5F6F4B80C4ABACD6F85CC050AD6E96F90B40C67E71533178898B697E5749082E6020DDFF0BCA2E60209D9E1F11AC44CCFE90A9B0B7445A7E96510333DA72B14D372BB1E064D9B531039CC0EB741F3F27C9E7EBB4169771A749687E9E9B90B
        const result = this.readPDU(data);
        if (result.length) {
            return {
                messages: result
            }
        }
    }

    handleCMGS(data) {
        // +CMGS: 29
        return {
            messageReference: data.tokens[0]
        }
    }

    handleCUSD(data) {
        // +CUSD: 1
        // +CUSD: (0-2)
        // +CUSD: 0,<str>,<dcs>
        if (data.tokens.length >= 3) {
            // 0 -> code, 1 -> data, 2 -> dcs
            const enc = parseInt(data.tokens[2]);
            let message = data.tokens[1];
            if (parseInt(this.parent.getCmd(AtDriverConstants.AT_PARAM_USSD_ENCODING)) !== enc ||
                1 === parseInt(this.parent.getCmd(AtDriverConstants.AT_PARAM_USSD_ENCODED)) ||
                1 === parseInt(this.parent.getCmd(AtDriverConstants.AT_PARAM_USSD_RESPONSE_ENCODED))) {
                message = this.parent.decodeUssd(enc, message);
            }
            return {
                ussd: {
                    code: data.tokens[0],
                    message: message
                }
            }
        } else if (!isNaN(data.tokens[0])) {
            return {
                ussd: {
                    code: data.tokens[0]
                }
            }
        }
    }

    handleUnsolicitedIndication(data) {
        // +WIND: 1
        return {
            indicator: data.tokens[0]
        }
    }

    handleMEMFULL(data) {
        // ^SMMEMFULL: "SM"
        return {
            memfull: data.tokens[0]
        }
    }
}

/**
 * AT response data.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtProcessorData {

    /**
     * Constructor.
     *
     * @param {AtModem} parent 
     * @param {String[]} response 
     */
    constructor(parent, response) {
        this.parent = parent;
        this.responses = (Array.isArray(response) ? response :
                response.split(this.parent.terminator))
            .filter(a => a.trim().length);
    }

    /**
     * Get reponse match using the processor.
     *
     * @param {object} processor The processor
     * @param {string} processor.cmd Command
     * @param {number} processor.len Minimum arguments count
     * @param {string|undefined} processor.separator Argument separator
     * @param {processorHandler} processor.handler Handler
     * @returns {object[]}
     */
    match(processor) {
        const res = [];
        let i = 0;
        while (true) {
            if (i === this.responses.length) {
                break;
            }
            const result = this.matchAt(processor, i);
            if (result.matched) {
                res.push(result);
            }
            i++;
        }
        return res;
    }

    /**
     * Get reponse match using the processor at specified index.
     *
     * @param {object} processor The processor
     * @param {string} processor.cmd Command
     * @param {number} processor.len Minimum arguments count
     * @param {string|undefined} processor.separator Argument separator
     * @param {processorHandler} processor.handler Handler
     * @param {number} index Response index
     * @returns {object}
     */
    matchAt(processor, index) {
        const result = {};
        if (index < this.responses.length) {
            const command = processor.raw ? processor.cmd : this.parent.getCmd(processor.cmd);
            const response = this.responses[index];
            if (this.isMatch(command, response)) {
                let value = null, tokens = null;
                let found = processor.len === 0 ? true : false; 
                if (!found) {
                    value = response.substring(command.length).trimLeft();
                    if (value.length) {
                        let okay;
                        let nextIndex = index;
                        while (true) {
                            if (nextIndex >= this.responses.length) {
                                break;
                            }
                            if (nextIndex > index) {
                                if (processor.separator) {
                                    value += processor.separator;
                                }
                                value += this.responses[nextIndex];
                            }
                            okay = true;
                            try {
                                tokens = token.split(value, {throwError: true});
                            }
                            catch (e) {
                                okay = false;
                            }
                            if (okay && tokens.length >= processor.len) {
                                found = true;
                            }
                            if (found) {
                                break;
                            } else {
                                nextIndex++;
                            }
                        }
                        if (found && nextIndex > index) {
                            this.responses.splice(nextIndex, nextIndex - index);
                        }
                    }
                }
                if (found) {
                    result.index = index;
                    result.code = command;
                    result.value = value;
                    result.tokens = tokens;
                    result.matched = processor;
                }
            }
        }
        return result;
    }

    /**
     * Is command matched sub string of response.
     *
     * @param {string} command Command
     * @param {string} response Response
     * @returns {boolean|undefined}
     */
    isMatch(command, response) {
        if (command && response.toLowerCase().substring(0, command.length) === command.toLowerCase()) {
            return true;
        }
        return false;
    }
}

module.exports = {
    AtProcessor,
    AtProcessorData,
}
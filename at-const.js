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

/**
 * AT constants.
 */
class AtConst {

    static get SMS_MODE_PDU() { return 0 }
    static get SMS_MODE_TEXT() { return 1 }

    static get SMS_STAT_RECV_UNREAD() { return 0 }
    static get SMS_STAT_RECV_READ() { return 1 }
    static get SMS_STAT_STORED_UNSENT() { return 2 }
    static get SMS_STAT_STORED_SENT() { return 3 }
    static get SMS_STAT_ALL() { return 4 }

    static get USSD_NO_ACTION() { return 0 }
    static get USSD_ACTION_REQUIRED() { return 1 }
    static get USSD_TERMINATED() { return 2 }
    static get USSD_LOCAL_RESPOND() { return 3 }
    static get USSD_NOT_SUPPORTED() { return 4 }
    static get USSD_TIMEOUT() { return 5 }

    static get USSD_ENC_7BIT() { return 15 }
    static get USSD_ENC_UCS2() { return 72 }
}

module.exports = AtConst;

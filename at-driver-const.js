/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2024 Toha <tohenk@yahoo.com>
 *
 * Permission is hereby granted]: free of charge]: to any person obtaining a copy of
 * this software and associated documeAtion files (the "Software")]: to deal in
 * the Software without restriction]: including without limitation the rights to
 * use]: copy]: modify]: merge]: publish]: distribute]: sublicense]: and/or sell copies
 * of the Software]: and to permit persons to whom the Software is furnished to do
 * so]: subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS"]: WITHOUT WARRANTY OF ANY KIND]: EXPRESS OR
 * IMPLIED]: INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM]: DAMAGES OR OTHER
 * LIABILITY]: WHETHER IN AN ACTION OF CONTRACT]: TORT OR OTHERWISE]: ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const AtConst = require('./at-const');

/**
 * AT driver constants.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtDriverConstants {

    static get AT_PARAM_TERMINATOR()                                { return 'PARAM_TERMINATOR' }
    static get AT_PARAM_DEVICE_NAME()                               { return 'PARAM_DEVICE_NAME' }
    static get AT_PARAM_KEYPAD_CHARSET()                            { return 'PARAM_KEYPAD_CHARSET' }
    static get AT_PARAM_SMS_MODE()                                  { return 'PARAM_SMS_MODE' }
    static get AT_PARAM_SMS_COMMIT()                                { return 'PARAM_SMS_COMMIT' }
    static get AT_PARAM_SMS_CANCEL()                                { return 'PARAM_SMS_CANCEL' }
    static get AT_PARAM_SMS_STORAGE()                               { return 'PARAM_SMS_STORAGE' }
    static get AT_PARAM_SMS_WAIT_PROMPT()                           { return 'PARAM_SMS_WAIT_PROMPT' }
    static get AT_PARAM_REPORT_STORAGE()                            { return 'PARAM_REPORT_STORAGE' }
    static get AT_PARAM_USSD_ENCODED()                              { return 'PARAM_USSD_ENCODED' }
    static get AT_PARAM_USSD_ENCODING()                             { return 'PARAM_USSD_ENCODING' }
    static get AT_PARAM_USSD_RESPONSE_ENCODED()                     { return 'PARAM_USSD_RESPONSE_ENCODED' }
    static get AT_CMD_INIT()                                        { return 'CMD_INIT' }
    static get AT_CMD_Q_FRIENDLY_NAME()                             { return 'CMD_QUERY_FRIENDLY_NAME' }
    static get AT_CMD_Q_MANUFACTURER()                              { return 'CMD_QUERY_MANUFACTURER' }
    static get AT_CMD_Q_MODEL()                                     { return 'CMD_QUERY_MODEL' }
    static get AT_CMD_Q_VERSION()                                   { return 'CMD_QUERY_VERSION' }
    static get AT_CMD_Q_IMEI()                                      { return 'CMD_QUERY_IMEI' }
    static get AT_CMD_Q_IMSI()                                      { return 'CMD_QUERY_IMSI' }
    static get AT_CMD_Q_SMSC()                                      { return 'CMD_QUERY_SMSC' }
    static get AT_CMD_DIAL()                                        { return 'CMD_DIAL' }
    static get AT_CMD_ANSWER()                                      { return 'CMD_ANSWER' }
    static get AT_CMD_HANGUP()                                      { return 'CMD_HANGUP' }
    static get AT_CMD_CALL_MONITOR()                                { return 'CMD_CALL_MONITOR' }
    static get AT_CMD_SMS_MONITOR()                                 { return 'CMD_SMS_MONITOR' }
    static get AT_CMD_SMS_STORAGE_GET()                             { return 'CMD_SMS_STORAGE_GET' }
    static get AT_CMD_SMS_STORAGE_SET()                             { return 'CMD_SMS_STORAGE_SET' }
    static get AT_CMD_SMS_READ()                                    { return 'CMD_SMS_READ' }
    static get AT_CMD_SMS_DELETE()                                  { return 'CMD_SMS_DELETE' }
    static get AT_CMD_SMS_LIST()                                    { return 'CMD_SMS_LIST' }
    static get AT_CMD_SMS_MODE_SET()                                { return 'CMD_SMS_MODE_SET' }
    static get AT_CMD_SMS_MODE_GET()                                { return 'CMD_SMS_MODE_GET' }
    static get AT_CMD_SMS_SEND_PDU()                                { return 'CMD_SMS_SEND_PDU' }
    static get AT_CMD_SMS_SEND_TEXT()                               { return 'CMD_SMS_SEND_TEXT' }
    static get AT_CMD_SMS_SEND_COMMIT()                             { return 'CMD_SMS_SEND_COMMIT' }
    static get AT_CMD_USSD_SET()                                    { return 'CMD_USSD_SET' }
    static get AT_CMD_USSD_CANCEL()                                 { return 'CMD_USSD_CANCEL' }
    static get AT_CMD_USSD_SEND()                                   { return 'CMD_USSD_SEND' }
    static get AT_CMD_KEYPAD()                                      { return 'CMD_KEYPAD' }
    static get AT_CMD_KEYPAD_ACCESS()                               { return 'CMD_KEYPAD_ACCESS' }
    static get AT_CMD_KEYPAD_LOCK()                                 { return 'CMD_KEYPAD_LOCK' }
    static get AT_CMD_CSQ()                                         { return 'CMD_CSQ' }
    static get AT_CMD_CHARSET_LIST()                                { return 'CMD_CHARSET_LIST' }
    static get AT_CMD_CHARSET_GET()                                 { return 'CMD_CHARSET_GET' }
    static get AT_CMD_CHARSET_SET()                                 { return 'CMD_CHARSET_SET' }
    static get AT_CMD_NETWORK_LIST()                                { return 'CMD_NETWORK_LIST' }
    static get AT_CMD_NETWORK_GET()                                 { return 'CMD_NETWORK_GET' }
    static get AT_RESPONSE_OK()                                     { return 'RESPONSE_OK' }
    static get AT_RESPONSE_ERROR()                                  { return 'RESPONSE_ERROR' }
    static get AT_RESPONSE_RING()                                   { return 'RESPONSE_RING' }
    static get AT_RESPONSE_NO_CARRIER()                             { return 'RESPONSE_NO_CARRIER' }
    static get AT_RESPONSE_NOT_SUPPORTED()                          { return 'RESPONSE_NOT_SUPPORTED' }
    static get AT_RESPONSE_SMSC()                                   { return 'RESPONSE_SMSC' }
    static get AT_RESPONSE_SMS_PROMPT()                             { return 'RESPONSE_SMS_PROMPT' }
    static get AT_RESPONSE_NEW_MESSAGE()                            { return 'RESPONSE_NEW_MESSAGE' }
    static get AT_RESPONSE_NEW_MESSAGE_DIRECT()                     { return 'RESPONSE_NEW_MESSAGE_DIRECT' }
    static get AT_RESPONSE_DELIVERY_REPORT()                        { return 'RESPONSE_DELIVERY_REPORT' }
    static get AT_RESPONSE_DELIVERY_REPORT_DIRECT()                 { return 'RESPONSE_DELIVERY_REPORT_DIRECT' }
    static get AT_RESPONSE_CPMS()                                   { return 'RESPONSE_CPMS' }
    static get AT_RESPONSE_CMGF()                                   { return 'RESPONSE_CMGF' }
    static get AT_RESPONSE_CMGR()                                   { return 'RESPONSE_CMGR' }
    static get AT_RESPONSE_CMGL()                                   { return 'RESPONSE_CMGL' }
    static get AT_RESPONSE_CMGS()                                   { return 'RESPONSE_CMGS' }
    static get AT_RESPONSE_CLIP()                                   { return 'RESPONSE_CLIP' }
    static get AT_RESPONSE_CUSD()                                   { return 'RESPONSE_CUSD' }
    static get AT_RESPONSE_CSCS()                                   { return 'RESPONSE_CSCS' }
    static get AT_RESPONSE_CLCK()                                   { return 'RESPONSE_CLCK' }
    static get AT_RESPONSE_CSQ()                                    { return 'RESPONSE_CSQ' }
    static get AT_RESPONSE_RSSI()                                   { return 'RESPONSE_RSSI' }
    static get AT_RESPONSE_CALL_END()                               { return 'RESPONSE_CALL_END' }
    static get AT_RESPONSE_COPS()                                   { return 'RESPONSE_COPS' }
    static get AT_RESPONSE_MEM_FULL()                               { return 'RESPONSE_MEM_FULL' }
    static get AT_RESPONSE_STK()                                    { return 'RESPONSE_STK' }
    static get AT_RESPONSE_CME_ERROR()                              { return 'RESPONSE_CME_ERROR' }
    static get AT_RESPONSE_CMS_ERROR()                              { return 'RESPONSE_CMS_ERROR' }

    static get DefaultDriver()                                      { return 'Generic' }

    static defaults() {
        return {
            [AtDriverConstants.AT_PARAM_TERMINATOR]:                '%CR%%LF%',
            [AtDriverConstants.AT_PARAM_DEVICE_NAME]:               '%MANUF% %MODEL%',
            [AtDriverConstants.AT_PARAM_KEYPAD_CHARSET]:            '%NONE%',
            [AtDriverConstants.AT_PARAM_SMS_MODE]:                  AtConst.SMS_MODE_PDU.toString(),
            [AtDriverConstants.AT_PARAM_SMS_COMMIT]:                String.fromCharCode(0x1a),
            [AtDriverConstants.AT_PARAM_SMS_CANCEL]:                String.fromCharCode(0x1b),
            [AtDriverConstants.AT_PARAM_SMS_STORAGE]:               '%NONE%',
            [AtDriverConstants.AT_PARAM_SMS_WAIT_PROMPT]:           '1',
            [AtDriverConstants.AT_PARAM_REPORT_STORAGE]:            '%NONE%',
            [AtDriverConstants.AT_PARAM_USSD_ENCODED]:              '0',
            [AtDriverConstants.AT_PARAM_USSD_ENCODING]:             AtConst.USSD_ENC_7BIT.toString(),
            [AtDriverConstants.AT_PARAM_USSD_RESPONSE_ENCODED]:     '0',
            [AtDriverConstants.AT_CMD_INIT]:                        'ATZ',
            [AtDriverConstants.AT_CMD_INIT + '1']:                  'ATE0',
            [AtDriverConstants.AT_CMD_Q_FRIENDLY_NAME]:             'ATI',
            [AtDriverConstants.AT_CMD_Q_MANUFACTURER]:              'AT+CGMI',
            [AtDriverConstants.AT_CMD_Q_MODEL]:                     'AT+CGMM',
            [AtDriverConstants.AT_CMD_Q_VERSION]:                   'AT+CGMR',
            [AtDriverConstants.AT_CMD_Q_IMEI]:                      'AT+CGSN',
            [AtDriverConstants.AT_CMD_Q_IMSI]:                      'AT+CIMI',
            [AtDriverConstants.AT_CMD_Q_SMSC]:                      'AT+CSCA?',
            [AtDriverConstants.AT_CMD_CALL_MONITOR]:                'AT+CLIP=1',
            [AtDriverConstants.AT_CMD_SMS_MONITOR]:                 'AT+CNMI=2,1,,2',
            [AtDriverConstants.AT_CMD_DIAL]:                        'ATD%PHONE_NUMBER%;',
            [AtDriverConstants.AT_CMD_ANSWER]:                      'ATA',
            [AtDriverConstants.AT_CMD_HANGUP]:                      'ATH',
            [AtDriverConstants.AT_CMD_SMS_STORAGE_GET]:             'AT+CPMS?',
            [AtDriverConstants.AT_CMD_SMS_STORAGE_SET]:             'AT+CPMS="%STORAGE%"',
            [AtDriverConstants.AT_CMD_SMS_READ]:                    'AT+CMGR=%SMS_ID%',
            [AtDriverConstants.AT_CMD_SMS_DELETE]:                  'AT+CMGD=%SMS_ID%',
            [AtDriverConstants.AT_CMD_SMS_LIST]:                    'AT+CMGL=%SMS_STAT%',
            [AtDriverConstants.AT_CMD_SMS_MODE_GET]:                'AT+CMGF?',
            [AtDriverConstants.AT_CMD_SMS_MODE_SET]:                'AT+CMGF=%SMS_MODE%',
            [AtDriverConstants.AT_CMD_SMS_SEND_PDU]:                'AT+CMGS=%SMS_LEN%',
            [AtDriverConstants.AT_CMD_SMS_SEND_TEXT]:               'AT+CMGS="%PHONE_NUMBER%"',
            [AtDriverConstants.AT_CMD_SMS_SEND_COMMIT]:             '%MESSAGE%%COMMIT%',
            [AtDriverConstants.AT_CMD_USSD_SET]:                    'AT+CUSD=1',
            [AtDriverConstants.AT_CMD_USSD_CANCEL]:                 'AT+CUSD=2',
            [AtDriverConstants.AT_CMD_USSD_SEND]:                   'AT+CUSD=1,%SERVICE_NUMBER%,%ENC%',
            [AtDriverConstants.AT_CMD_KEYPAD]:                      'AT+CKPD="%KEYS%"',
            [AtDriverConstants.AT_CMD_KEYPAD_ACCESS]:               'AT+CMEC=2',
            [AtDriverConstants.AT_CMD_KEYPAD_LOCK]:                 'AT+CLCK="CS",%VALUE%',
            [AtDriverConstants.AT_CMD_CSQ]:                         'AT+CSQ',
            [AtDriverConstants.AT_CMD_CHARSET_LIST]:                'AT+CSCS=?',
            [AtDriverConstants.AT_CMD_CHARSET_GET]:                 'AT+CSCS?',
            [AtDriverConstants.AT_CMD_CHARSET_SET]:                 'AT+CSCS="%CHARSET%"',
            [AtDriverConstants.AT_CMD_NETWORK_LIST]:                'AT+COPS=?',
            [AtDriverConstants.AT_CMD_NETWORK_GET]:                 'AT+COPS?',
            [AtDriverConstants.AT_RESPONSE_OK]:                     'OK',
            [AtDriverConstants.AT_RESPONSE_ERROR]:                  'ERROR',
            [AtDriverConstants.AT_RESPONSE_RING]:                   'RING',
            [AtDriverConstants.AT_RESPONSE_NO_CARRIER]:             'NO CARRIER',
            [AtDriverConstants.AT_RESPONSE_NOT_SUPPORTED]:          'COMMAND NOT SUPPORT',
            [AtDriverConstants.AT_RESPONSE_SMSC]:                   '+CSCA:',
            [AtDriverConstants.AT_RESPONSE_SMS_PROMPT]:             '> ',
            [AtDriverConstants.AT_RESPONSE_NEW_MESSAGE]:            '+CMTI:',
            [AtDriverConstants.AT_RESPONSE_NEW_MESSAGE_DIRECT]:     '+CMT:',
            [AtDriverConstants.AT_RESPONSE_DELIVERY_REPORT]:        '+CDSI:',
            [AtDriverConstants.AT_RESPONSE_DELIVERY_REPORT_DIRECT]: '+CDS:',
            [AtDriverConstants.AT_RESPONSE_CPMS]:                   '+CPMS:',
            [AtDriverConstants.AT_RESPONSE_CMGF]:                   '+CMGF:',
            [AtDriverConstants.AT_RESPONSE_CMGR]:                   '+CMGR:',
            [AtDriverConstants.AT_RESPONSE_CMGL]:                   '+CMGL:',
            [AtDriverConstants.AT_RESPONSE_CMGS]:                   '+CMGS:',
            [AtDriverConstants.AT_RESPONSE_CLIP]:                   '+CLIP:',
            [AtDriverConstants.AT_RESPONSE_CUSD]:                   '+CUSD:',
            [AtDriverConstants.AT_RESPONSE_CSCS]:                   '+CSCS:',
            [AtDriverConstants.AT_RESPONSE_CLCK]:                   '+CLCK:',
            [AtDriverConstants.AT_RESPONSE_CSQ]:                    '+CSQ:',
            [AtDriverConstants.AT_RESPONSE_RSSI]:                   '%NONE%',
            [AtDriverConstants.AT_RESPONSE_CALL_END]:               '%NONE%',
            [AtDriverConstants.AT_RESPONSE_COPS]:                   '+COPS:',
            [AtDriverConstants.AT_RESPONSE_MEM_FULL]:               '%NONE%',
            [AtDriverConstants.AT_RESPONSE_STK]:                    '%NONE%',
            [AtDriverConstants.AT_RESPONSE_CME_ERROR]:              '+CME ERROR:',
            [AtDriverConstants.AT_RESPONSE_CMS_ERROR]:              '+CMS ERROR:',
        }
    }
}

module.exports = AtDriverConstants;

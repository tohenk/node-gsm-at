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

/**
 * AT STK constants.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtStkConstants {

    static get STK_EXECUTE()                                { return 'EXECUTE' }
    static get STK_MAIN_MENU()                              { return 'MAIN_MENU' }
    static get STK_MAIN_MENU_GET()                          { return 'MAIN_MENU_GET' }
    static get STK_MAIN_MENU_TITLE()                        { return 'MAIN_MENU_TITLE' }
    static get STK_MAIN_MENU_ITEM()                         { return 'MAIN_MENU_ITEM' }
    static get STK_MAIN_MENU_SELECT()                       { return 'MAIN_MENU_SELECT' }
    static get STK_MAIN_MENU_CANCEL()                       { return 'MAIN_MENU_CANCEL' }
    static get STK_SUB_MENU()                               { return 'SUB_MENU' }
    static get STK_SUB_MENU_GET()                           { return 'SUB_MENU_GET' }
    static get STK_SUB_MENU_TITLE()                         { return 'SUB_MENU_TITLE' }
    static get STK_SUB_MENU_ITEM()                          { return 'SUB_MENU_ITEM' }
    static get STK_SUB_MENU_SELECT()                        { return 'SUB_MENU_SELECT' }
    static get STK_SUB_MENU_CANCEL()                        { return 'SUB_MENU_CANCEL' }
    static get STK_DISPLAY_TEXT()                           { return 'DISPLAY_TEXT' }
    static get STK_DISPLAY_TEXT_GET()                       { return 'DISPLAY_TEXT_GET' }
    static get STK_DISPLAY_TEXT_ITEM()                      { return 'DISPLAY_TEXT_ITEM' }
    static get STK_DISPLAY_TEXT_CONFIRM()                   { return 'DISPLAY_TEXT_CONFIRM' }
    static get STK_DISPLAY_TEXT_CANCEL()                    { return 'DISPLAY_TEXT_CANCEL' }
    static get STK_GET_INKEY()                              { return 'GET_INKEY' }
    static get STK_GET_INKEY_GET()                          { return 'GET_INKEY_GET' }
    static get STK_GET_INKEY_DATA()                         { return 'GET_INKEY_DATA' }
    static get STK_GET_INKEY_CONFIRM()                      { return 'GET_INKEY_CONFIRM' }
    static get STK_GET_INKEY_CANCEL()                       { return 'GET_INKEY_CANCEL' }
    static get STK_GET_INKEY_MODE()                         { return 'GET_INKEY_MODE' }
    static get STK_GET_INPUT()                              { return 'GET_INPUT' }
    static get STK_GET_INPUT_GET()                          { return 'GET_INPUT_GET' }
    static get STK_GET_INPUT_DATA()                         { return 'GET_INPUT_DATA' }
    static get STK_GET_INPUT_CONFIRM()                      { return 'GET_INPUT_CONFIRM' }
    static get STK_GET_INPUT_CONFIRM_COMMIT()               { return 'GET_INPUT_CONFIRM_COMMIT' }
    static get STK_GET_INPUT_CONFIRM_PROMPT()               { return 'GET_INPUT_CONFIRM_PROMPT' }
    static get STK_GET_INPUT_CANCEL()                       { return 'GET_INPUT_CANCEL' }
    static get STK_GET_INPUT_MODE()                         { return 'GET_INPUT_MODE' }
    static get STK_SEND_SMS()                               { return 'SEND_SMS' }
    static get STK_SEND_SMS_GET()                           { return 'SEND_SMS_GET' }
    static get STK_SEND_USSD()                              { return 'SEND_USSD' }
    static get STK_SEND_USSD_GET()                          { return 'SEND_USSD_GET' }
    static get STK_GO_BACK()                                { return 'GO_BACK' }
    static get STK_SESSION_TIMEOUT()                        { return 'SESSION_TIMEOUT' }
    static get STK_SESSION_ENDED()                          { return 'SESSION_ENDED' }

    static defaults() {
        return {
            [AtStkConstants.STK_EXECUTE]:                   '%NONE%',
            [AtStkConstants.STK_MAIN_MENU]:                 '%NONE%',
            [AtStkConstants.STK_MAIN_MENU_GET]:             '%NONE%',
            [AtStkConstants.STK_MAIN_MENU_TITLE]:           '%NONE%',
            [AtStkConstants.STK_MAIN_MENU_ITEM]:            '%NONE%',
            [AtStkConstants.STK_MAIN_MENU_SELECT]:          '%NONE%',
            [AtStkConstants.STK_MAIN_MENU_CANCEL]:          '%NONE%',
            [AtStkConstants.STK_SUB_MENU]:                  '%NONE%',
            [AtStkConstants.STK_SUB_MENU_GET]:              '%NONE%',
            [AtStkConstants.STK_SUB_MENU_TITLE]:            '%NONE%',
            [AtStkConstants.STK_SUB_MENU_ITEM]:             '%NONE%',
            [AtStkConstants.STK_SUB_MENU_SELECT]:           '%NONE%',
            [AtStkConstants.STK_SUB_MENU_CANCEL]:           '%NONE%',
            [AtStkConstants.STK_DISPLAY_TEXT]:              '%NONE%',
            [AtStkConstants.STK_DISPLAY_TEXT_GET]:          '%NONE%',
            [AtStkConstants.STK_DISPLAY_TEXT_ITEM]:         '%NONE%',
            [AtStkConstants.STK_DISPLAY_TEXT_CONFIRM]:      '%NONE%',
            [AtStkConstants.STK_DISPLAY_TEXT_CANCEL]:       '%NONE%',
            [AtStkConstants.STK_GET_INKEY]:                 '%NONE%',
            [AtStkConstants.STK_GET_INKEY_GET]:             '%NONE%',
            [AtStkConstants.STK_GET_INKEY_DATA]:            '%NONE%',
            [AtStkConstants.STK_GET_INKEY_CONFIRM]:         '%NONE%',
            [AtStkConstants.STK_GET_INKEY_CANCEL]:          '%NONE%',
            [AtStkConstants.STK_GET_INKEY_MODE]:            '%NONE%',
            [AtStkConstants.STK_GET_INPUT]:                 '%NONE%',
            [AtStkConstants.STK_GET_INPUT_GET]:             '%NONE%',
            [AtStkConstants.STK_GET_INPUT_DATA]:            '%NONE%',
            [AtStkConstants.STK_GET_INPUT_CONFIRM]:         '%NONE%',
            [AtStkConstants.STK_GET_INPUT_CONFIRM_COMMIT]:  '%NONE%',
            [AtStkConstants.STK_GET_INPUT_CONFIRM_PROMPT]:  '%NONE%',
            [AtStkConstants.STK_GET_INPUT_CANCEL]:          '%NONE%',
            [AtStkConstants.STK_GET_INPUT_MODE]:            '%NONE%',
            [AtStkConstants.STK_SEND_SMS]:                  '%NONE%',
            [AtStkConstants.STK_SEND_SMS_GET]:              '%NONE%',
            [AtStkConstants.STK_SEND_USSD]:                 '%NONE%',
            [AtStkConstants.STK_SEND_USSD_GET]:             '%NONE%',
            [AtStkConstants.STK_GO_BACK]:                   '%NONE%',
            [AtStkConstants.STK_SESSION_TIMEOUT]:           '%NONE%',
            [AtStkConstants.STK_SESSION_ENDED]:             '%NONE%',
        }
    }
}

module.exports = AtStkConstants;

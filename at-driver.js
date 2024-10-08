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

const fs = require('fs');
const ini = require('ini');
const ntutil = require('@ntlab/ntlib/util');

/**
 * AT communication driver.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtDriver {

    /** @type {string} */
    name = 'Generic'
    /** @type {string} */
    desc = 'Generic'
    /** @type {AtDriver} */
    parent = null
    /** @type {object} */
    commands = {}

    /**
     * Constructor.
     *
     * @param {object} driver Driver constants
     * @param {AtDriver} parent Driver parent
     */
    constructor(driver, parent = null) {
        this.import(driver.defaults());
        if (parent && parent.constructor && parent.constructor.name === this.constructor.name) {
            this.parent = parent;
            this.import(this.parent.commands);
        }
    }

    /**
     * Import commands.
     *
     * @param {object} commands The commands
     */
    import(commands) {
        commands = commands || {};
        for (const cmd in commands) {
            this.add(cmd, commands[cmd]);
        }
    }

    /**
     * Check if key is not undefined.
     *
     * @param {string} key The key to check
     * @throws {Error}
     */
    check(key) {
        if (key === undefined) {
            throw new Error('Key must be defined!');
        }
    }

    /**
     * Add a command.
     *
     * @param {string} key Command key
     * @param {string} value Command value
     */
    add(key, value) {
        this.check(key);
        this.commands[key] = value;
    }

    /**
     * Get command value.
     *
     * @param {string} key Command key
     * @param {object} vars Command variables
     * @returns {string|undefined}
     */
    get(key, vars = null) {
        this.check(key);
        if (this.commands[key]) {
            let value = this.commands[key];
            // substitude character => $XX
            let match;
            while (match = value.match(/\$([a-zA-Z0-9]{2})/)) {
                value = value.substr(0, match.index) + String.fromCharCode(parseInt('0x' + match[1])) +
                    value.substr(match.index + match[0].length);
            }
            // replace place holder
            const replacements = Object.assign({'NONE': '', 'CR': '\r', 'LF': '\n'}, vars || {});
            return ntutil.trans(value, replacements);
        }
    }

    /**
     * Is a command defined?
     *
     * @param {string} key Command key
     * @returns {boolean}
     */
    has(key) {
        this.check(key);
        return this.commands[key] !== undefined ? true : false;
    }
}

/**
 * AT driver collection.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class AtDrivers {

    drivers = {}

    constructor(factory) {
        this.factory = factory;
    }

    /**
     * Get non command property of object.
     *
     * @param {object} o The object
     * @returns {string|undefined}
     */
    getNonCmdProp(o) {
        if (typeof o === 'object') {
            const keys = Object.keys(o);
            if (keys.length === 1) {
                if (this.prefixes === undefined) {
                    this.prefixes = [];
                    const commands = this.factory.defaults();
                    Object.keys(commands).forEach(cmd => {
                        const idx = cmd.indexOf('_');
                        if (idx > 0) {
                            cmd = cmd.substr(0, idx + 1);
                        }
                        if (this.prefixes.indexOf(cmd) < 0) {
                            this.prefixes.push(cmd);
                        }
                    });
                }
                const key = keys[0];
                let cmd = false;
                this.prefixes.forEach(prefix => {
                    if (key.substr(0, prefix.length) === prefix) {
                        cmd = true;
                        return true;
                    }
                });
                if (!cmd) {
                    return key;
                }
            }
        }
    }

    /**
     * Load driver from INI file.
     *
     * @param {String} filename The filename
     */
    load(filename) {
        if (fs.existsSync(filename)) {
            const config = ini.parse(fs.readFileSync(filename, 'utf-8'));
            for (const key in config) {
                let items = config[key];
                let drvName = key, drvDesc = key, drvParent = null;
                // description
                let s = this.getNonCmdProp(items);
                if (s !== undefined) {
                    drvDesc = s;
                    items = items[s];
                }
                // parent
                s = this.getNonCmdProp(items);
                if (s !== undefined) {
                    drvParent = this.get(s);
                    items = items[s];
                }
                const drv = this.create(drvName, drvDesc, drvParent);
                drv.import(items);
                this.add(drv);
            }
        }
    }

    /**
     * Create a driver.
     *
     * @param {string} name Driver name
     * @param {string} desc Driver description
     * @param {AtDriver} parent Driver parent
     * @returns {AtDriver}
     */
    create(name = null, desc = null, parent = null) {
        const drv = new AtDriver(this.factory, parent);
        if (name) {
            drv.name = name;
        }
        if (desc) {
            drv.desc = desc;
        }
        return drv;
    }

    /**
     * Add driver.
     *
     * @param {AtDriver} driver The driver
     */
    add(driver) {
        if (driver.name === undefined) {
            throw new Error('Invalid AT driver object.');
        }
        if (this.drivers[driver.name] !== undefined) {
            throw new Error('Driver ' + driver.name + ' already registered.');
        }
        this.drivers[driver.name] = driver;
    }

    /**
     * Get driver.
     *
     * @param {String} name  The driver name
     * @returns {AtDriver} The driver
     */
    get(name) {
        if (this.drivers[name] !== undefined) {
            return this.drivers[name];
        }
    }

    /**
     * Get available driver names.
     *
     * @returns {String[]}
     */
    names() {
        return Object.keys(this.drivers);
    }

    /**
     * Get driver matched a name.
     *
     * @param {string} s Driver name to search for
     * @returns {string}
     */
    match(s) {
        let driver = '';
        for (const drv in this.drivers) {
            if (s.toLowerCase() === drv.toLowerCase()) {
                driver = drv;
                break;
            } else {
                if (s.toLowerCase().indexOf(drv.toLowerCase()) >= 0) {
                    if (driver.length < drv.length) {
                        driver = drv;
                    }
                }
            }
        }
        return driver;
    }
}

module.exports = factory => {
    const drivers = new AtDrivers(factory);
    const defaultDriver = factory.DefaultDriver;
    if (defaultDriver !== undefined && drivers.get(defaultDriver) === undefined) {
        drivers.add(drivers.create(defaultDriver));
    }
    return drivers;
}
module.exports.AtDriver = AtDriver;
module.exports.AtDrivers = AtDrivers;

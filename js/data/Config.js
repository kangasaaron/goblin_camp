/* Copyright 2010-2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/

import { Paths } from "./Paths.js";
import { Path } from "./Path.js";

// Data refactoring: game configuration.


/**
    Interface to manage game's configuration.
*/
export class Config {
    /**
    @var cvars
    A map of configuration variables.
    */
    cvars = new Map();
    /**
    @var keys
    A map of key bindings.
    */
    keys = new Map();
    GetCVar(type, name) {
        if (typeof name === "undefined") {
            name = type;
            type = "";
        }
        let result = this.GetStringCVar(name);
        switch (type) {
            case "int":
                result = parseInt(result, 10);
                break;
            case "float":
                result = parseFloat(result);
                break;
            case "bool":
                result = !(!(parseInt(result, 10)));
                break;
        }
        return result;
    }
    SetCVar(name, value) {
        this.SetStringCVar(name, String(value));
    }

    /**
        Saves current configuration to user's configuration file.
    	
        @see Paths
    */
    Save() {
        let configObj = {
            "saved on": Date.now()
        };

        configObj.cvars = {};
        // dump cvars
        for (let pair of this.cvars.entries()) {
            configObj.cvars[pair[0]] = pair[1];
        }

        configObj.keys = {};
        // dump keys
        for (let pair of this.keys.entries()) {
            configObj.keys[pair[0]] = pair[1];
        }

        localStorage.setItem(this.Paths.Get(Path.Config), JSON.stringify(configObj));
    }

    static instance;
    static Reset() {
        this.instance = null;
        this.instance = new Config();
        return this.instance;
    }

    /**
        Creates configuration variables, and default key bindings.
    */
    constructor() {
        if (Config.instance) return Config.instance;

        this.Paths = new Paths();

        this.cvars = new Map([
            ["resolutionX", "800"],
            ["resolutionY", "600"],
            ["fullscreen", "0"],
            ["renderer", "0"],
            ["useTileset", "0"],
            ["tileset", ""],
            ["tutorial", "1"],
            ["riverWidth", "30"],
            ["riverDepth", "5"],
            ["halfRendering", "0"],
            ["compressSaves", "0"],
            ["translucentUI", "0"],
            ["autosave", "1"],
            ["pauseOnDanger", "0"]
        ]);

        this.keys = new Map([
            ["Exit", 'q'],
            ["Basics", 'b'],
            ["Workshops", 'w'],
            ["Orders", 'o'],
            ["Furniture", 'f'],
            ["StockManager", 's'],
            ["Squads", 'm'],
            ["Announcements", 'a'],
            ["Center", 'c'],
            ["Help", 'h'],
            ["Pause", ' '],
            ["Jobs", 'j'],
            ["DevConsole", '`'],
            ["TerrainOverlay", 't'],
            ["Permanent", 'p']
        ]);
    }

    /**
        Changes value of a configuration variable.
    	
        @param[in] name  Name of the variable.
        @param[in] value New value for the variable.
    */
    SetStringCVar(nm, value) {
        console.log(`Setting ${nm} to ${value}`);
        this.cvars.set(nm, value);
    }

    /**
        Retrieves value of a configuration variable. If the variable doesn't exist,
        it will be created, set to empty string and then returned.
    	
        @param[in] name Name of the variable.
        @returns        Value of the variable.
    */
    GetStringCVar(nm) {
        if (!(this.cvars.has(nm))) {
            console.warn(`WARNING: CVar ${nm} doesn't exist.`);
            return "";
        }
        return this.cvars.get(nm);
    }


    /**
        Retrieves all defined configuration variables.
    	
        @returns A constant reference to the configuration variables map.
    */
    GetCVarMap() {
        return this.cvars;
    }

    /**
        Retrieves keycode bound to a named key. If the key doesn't exist,
        null keycode (\c 0) will be returned and warning will be logged.
    	
        @param[in] name Name of the key.
        @returns        Currently bound keycode, or 0.
    */
    GetKey(nm) {
        if (!(this.keys.has(nm))) {
            console.warn(`WARNING: Key ${nm} doesn't exist -- this may indicate outdated code.`);
            return '\0';
        }

        return this.keys.get(nm);
    }

    /**
        Changes keycode bound to a named key. If the key doesn't exist,
        a warning will be logged (but the binding will be saved).
    	
        @param[in] name  Name of the key.
        @param[in] value New keycode for the key.
    */
    SetKey(nm, value) {
        console.log(`Setting ${nm} to '${value}'`);

        if (!(this.keys.has(nm))) {
            console.warn(`WARNING: Key ${nm} was not specified in the defaults -- it could mean the name has changed between releases.`);
        }

        this.keys.set(nm, value);
    }

    /**
        Retrieves all key bindings.
    	
        @returns Non-constant reference to the key bindings map. Callers should be careful not to introduce new keys this way.
    */
    GetKeyMap() {
        return this.keys;
    }
    static Init() {
        if (this.instance) return this.instance;
        return this.Reset();
    }
}

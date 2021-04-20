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

// import "./Config.js"
// import "./Data.js"
// import "./Paths.js"
// import "../UI/MessageBox.js"
// import "../Game.js"
// import "../scripting/Event.js"
// import "../scripting/Engine.js"

import { Config } from "./Config.js";
import { Save } from "./Save.js";
import { Paths } from "./Paths.js";
import { Path } from "./Path.js";
import { FilePath } from "../other/FilePath.js";

class DataClass {
    /**
    	Converts an UNIX timestamp to ISO8601 date string (YYYY-MM-DDTHH:MM:SS.ssssZ).
    	
    	@param[in]  timestamp A source UNIX timestamp.
    	@returns  dest      A string buffer to receive formatted date.
    */
    FormatTimestamp(timestamp) {
        return timestamp.toISOString();
    }

    /**
    	Converts a file size in bytes into more human-readable larger units
    	(NB: uses kB/MB/GB as 1024-based units).
    	
    	@param[in]  filesize File size (in bytes).
    	@returns       A formatted file size.
    */
    FormatFileSize(filesize) {
        let result = "",
            unit = "B";
        if (filesize > 1000000000) { // 1 gb
            filesize /= 1000000000;
            unit = "GB";
        } else if (filesize > 1000000) { // 1 mb
            filesize /= 1000000;
            unit = "MB";
        } else if (filesize > 1000) { // 1 kb
            filesize /= 1000;
            unit = "KB";
        }
        result = filesize.toFixed(2);
        while (result.endsWith("0")) {
            result = result.slice(0, result.length - 1);
        }
        while (result.endsWith(".")) {
            result = result.slice(0, result.length - 1);
        }


        return result + " " + unit;
    }

    /**
    	Removes invalid (<tt>\\/:*?"\<\>|</tt>) characters from the
    	filename (removes characters that are rejected by Windows,
    	but allowed by *nixes for consistency).
    	
    	@param[in] filename Filename as supplied by the user.
    	@returns            Sanitized filename.
    */
    SanitizeFilename(filename) {
        let sanitized = '';
        let invalid = new RegExp("\\/:*?\"<>|");

        return filename;
        /* TODO: Check why the Mac side of things apparently needed a non-sanitizing filename-sanitizer
        		std.remove_copy_if(
        			filename.begin(), filename.end(),
        			std.back_inserter(sanitized),

        			[&invalid](char x) . bool {
        				return invalid.find(x) != std.string.npos;
        			}
        		);
        		
        		return sanitized;
        */
    }

    /**
    	Saves current game to a given file. Emits onGameSaved scripting event.
    	
    	@param[in]  file   Full path to the save.
    	@param[out] result Boolean indicating success or failure.
    */
    DoSave(file, result) {
        console.log("Saving game to " + file);

        if ((result = Game.SaveGame(file))) {
            Script.Event.GameSaved(file);
        }
    }

    /**
    	Checks whether given file exists in the user's personal directory, and if not,
    	tries to copy it from the global data directory.
    	
    	@see Paths
    	@param[in] target File to check for (full path).
    */
    CopyDefault(target) {
        let me = this,
            filepath = new FilePath(target);
        return filepath.GetCache(Paths).keys().then(function (keys) {
            if (keys.includes(filepath.GetURL(Paths))) return true;
            return false;
        })
            .then(function (exists) {
                if (exists) return;

                let file = filepath.GetURL(Paths);
                let source = Paths.GetName(Path.GlobalData) + "/" + file;

                console.log("User's " + file + " does not exist -- trying to copy " + source);

                if (!fs.exists(source)) {
                    console.error("Global data file doesn't exist!");
                    throw new ReferenceError("Global data file doesn't exist");
                }

                try {
                    fs.copy_file(source, target);
                } catch (e) {
                    console.error("Error while copying: " + e.message);
                    throw e;
                }
            });
    }

    /**
    	Checks whether given file exists in the user's personal directory, and if not,
    	tries to create a new one.
    	
    	@see Paths
    	@param[in] target File to check for (full path).
    	@param[in] source Default content to use for the new file.
    */
    CreateDefault(target, source) {
        let me = this,
            filepath = new FilePath(target);
        return filepath.GetCache(Paths).keys().then(function (keys) {
            if (keys.includes(filepath.GetURL(Paths))) return true;
            return false;
        })
            .then(function (exists) {
                if (exists) return;
                console.log("Creating default " + target);
                return filepath
                    .GetCache(Paths)
                    .put(filepath.GetURL(Paths), new Response(source));
            })
            .catch(function (e) {
                console.error("Error while writing to file: " + e.message());
            })
    }

    /**
    	Ensures that @ref Config.Save won't throw at exit.
    */
    SaveConfig() {
        try {
            Config.Save();
        } catch (e) {
            // pass
        }
    }

    /**
    	Retrieves a list of saved games.
    	@param {Array} @out list    Storage for the list.
    */
    async GetSavedGames(list) {
        let keys = await Paths.Get(Path.Saves).keys();
        for (let it of keys) {
            let save = it.path();
            if (!save.endsWith(".sav")) continue;

            save.replace_extension();

            list.push(new Save(
                save.filename,
                fs.file_size(it),
                fs.last_write_time(it)
            ));
        }
    }

    /**
    	Retrieves a count of saved games.
    	
    	@returns Number of saved games found.
    */
    CountSavedGames() {
        let saves = [];
        this.GetSavedGames(saves);
        return saves.length;
    }

    /**
    	Loads the game from given file.
    	
    	@param[in] save Save filename.
    	@returns        Boolean indicating success or failure.
    */
    LoadGame(save) {
        let file = (Paths.Get(Path.Saves) + "/" + save) + ".sav";
        console.log("Loading game from " + file);

        if (!Game.LoadGame(file)) return false;
        Script.Event.GameLoaded(file);

        return true;
    }

    /**
    	Saves the game to given file. If it exists, prompts the user whether to override.
    	
    	@see DoSave
    	@bug If sanitized filename is empty, will use @c _ instead. Should tell the user.
    	
    	@param[in] save    Save filename.
    	@param[in] confirm Boolean indicating whether to confirm overwriting an existing save
    	@returns           Boolean indicating success or failure.
    */
    SaveGame(save, confirm) {
        let file = this.SanitizeFilename(save);

        if (file.length == 0) {
            file = "_";
        }

        file = (Paths.Get(Path.Saves) + '/' + file) + ".sav";

        let result = false;

        if (!fs.exists(file) || !confirm) {
            this.DoSave(file, result);
        } else {
            MessageBox.ShowMessageBox(
                "Save game exists, overwrite?", this.DoSave.bind(this, file, result), "Yes",
                null, "No");
        }

        return result;
    }

    /**
    	Executes the user's configuration file.
    */
    LoadConfig() {
        let me = this;
        console.log("Loading user config.");
        let config = Paths.GetName(Path.Config);
        me.CreateDefault(config + '/default.json', "{'name': 'Goblin Camp default empty configuration file'}")
            .then(function (config) {
                return me.SaveConfig();
            })
        /*
                let globals = py.import("_gcampconfig").attr("__dict__");
                let locals = py.import("__gcuserconfig__").attr("__dict__");
                try {
                    py.exec_file(config, globals, locals);
                } catch (e) {
                    console.log("Cannot load user config.");
                    Script.LogException();
                    return;
                }
                setTimeout(this.SaveConfig.bind(this), 6000);
        */
    }
    again = false;
    /**
    	Loads the user's bitmap font.
    */
    LoadFont() {
        console.log("Loading the font " + (this.again ? "(again)" : ""));
        let font = Paths.GetName(Path.Font);

        this.CopyDefault(font);
        // TCODConsole.setCustomFont(font); // TODO! need to check this to set the font;
        this.again = true;
    }

    /**
    	Saves a screenshot of the game. Takes care of automatic numbering.
    */
    SaveScreenshot() {
        // sadly, libtcod supports autonumbering only when saving to current dir
        let largest = 0;

        for (let it of fs.readDirectory(Paths.Get(Path.Screenshots))) {
            let png = it;
            if (!it.endsWith(".png")) continue;

            png.replace_extension();

            let file = png;
            try {
                // screens are saved as screenXXXXXX.png
                largest = Math.max(largest, Number.parseInt(file.substr(0, 6)));
            } catch (e) {
                // not worth terminating the game for
                console.error(e); // variable not referenced warning
            }
        }

        let png = (
            Paths.Get(Path.Screenshots) + `screen${largest + 1}.png`
        );

        console.log("Saving screenshot to " + png);
        TCODSystem.saveScreenshot(png);
    }
}

export let Data = new DataClass();

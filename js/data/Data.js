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

// import "data/Config.js"
// import "data/Data.js"
// import "data/Paths.js"
// import "Logger.js"
// import "UI/MessageBox.js"
// import "Game.js"
// import "scripting/Event.js"
// import "scripting/Engine.js"

/** 
 * saves
 */
export class Save {
    filename = "";
    size = 0;
    date = "";
    timestamp = 0; // for sorting

    constructor(filename, size, timestamp) {
        this.filename = filename;
        this.timestamexp = timestamp;
        this.size = Data.FormatFileSize(size);
        this.date = Data.FormatTimestamp(timestamp);
    }

    isLessThan(that) {
        return this.timestamp < that.timestamp;
    }
    isGreaterThan(that) {
        return this.timestamp > that.timestamp;
    }
    isLessThanOrEqualTo(that) {
        return this.timestamp <= that.timestamp;
    }
    isGreaterThanOrEqualTo(that) {
        return this.timestamp >= that.timestamp;
    }
}

export class Data {
    /**
    	Converts an UNIX timestamp to ISO8601 date string (YYYY-MM-DDTHH:MM:SS.ssssZ).
    	
    	@param[in]  timestamp A source UNIX timestamp.
    	@returns  dest      A string buffer to receive formatted date.
    */
    static FormatTimestamp(timestamp) {
        return timestamp.toISOString();
    }

    /**
    	Converts a file size in bytes into more human-readable larger units
    	(NB: uses kB/MB/GB as 1024-based units).
    	
    	@param[in]  filesize File size (in bytes).
    	@returns       A formatted file size.
    */
    static FormatFileSize(filesize) {
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
    static SanitizeFilename(filename) {
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
    static DoSave(file, result) {
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
    static CopyDefault(target) {
        if (fs.exists(target)) return;

        let file = target.filename();
        let source = Paths.Get(Paths.GlobalData) + "/" + file;

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
    }

    /**
    	Checks whether given file exists in the user's personal directory, and if not,
    	tries to create a new one.
    	
    	@see Paths
    	@param[in] target File to check for (full path).
    	@param[in] source Default content to use for the new file.
    */
    static CreateDefault(target, source) {
        if (fs.exists(target)) return;

        console.log("Creating default " + target);

        try {
            let file = fs.newFile(target);
            file.data = source;
            file.close();
        } catch (e) {
            console.error("Error while writing to file: " + e.message());
        }
    }

    /**
    	Ensures that @ref Config.Save won't throw at exit.
    */
    static SaveConfig() {
        try {
            Config.Save();
        } catch (e) {
            // pass
        }
    }

    /**
    	Retrieves a list of saved games.
    	
    	@param[out] list Storage for the list.
    */
    static GetSavedGames(list) {
        for (let it of Paths.Get(Paths.Saves)) {
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
    static CountSavedGames() {
        let saves = [];
        this.GetSavedGames(saves);
        return saves.length;
    }

    /**
    	Loads the game from given file.
    	
    	@param[in] save Save filename.
    	@returns        Boolean indicating success or failure.
    */
    static LoadGame(save) {
        let file = (Paths.Get(Paths.Saves) + "/" + save) + ".sav";
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
    static SaveGame(save, confirm) {
        let file = this.SanitizeFilename(save);

        if (file.length == 0) {
            file = "_";
        }

        file = (Paths.Get(Paths.Saves) + '/' + file) + ".sav";

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
    static LoadConfig() {
        console.log("Loading user config.");
        let config = Paths.Get(Paths.Config);
        this.CreateDefault(config, "## Goblin Camp default empty configuration file");

        let globals = py.import("_gcampconfig").attr("__dict__");
        let locals = py.import("__gcuserconfig__").attr("__dict__");
        try {
            py.exec_file(config, globals, locals);
        } catch (e) {
            console.log("Cannot load user config.");
            Script.LogException();
            return;
        }
        setInterval(this.SaveConfig.bind(this), 6000);

    }
    static again = false;
    /**
    	Loads the user's bitmap font.
    */
    static LoadFont() {
        console.log("Loading the font " + (this.again ? "(again)" : ""));
        let font = Paths.Get(Paths.Font);

        this.CopyDefault(font);
        TCODConsole.setCustomFont(font);
        this.again = true;
    }

    /**
    	Saves a screenshot of the game. Takes care of automatic numbering.
    */
    static SaveScreenshot() {
        // sadly, libtcod supports autonumbering only when saving to current dir
        let largest = 0;

        for (let it of fs.readDirectory(Paths.Get(Paths.Screenshots))) {
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
            Paths.Get(Paths.Screenshots) + `screen${largest+1}.png`
        );

        console.log("Saving screenshot to " + png);
        TCODSystem.saveScreenshot(png);
    }
}
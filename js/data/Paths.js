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

import {
	defineEnum
} from "../other/enums.js";
import {
	fs
} from "../other/fakefs.js";

/**
 * Interface to manage platform-specific paths in a platform-agnostic way.
 * Basic building block of data handling code.
 */
class PathsImplementation {
	/**
	 * @var personalDir
	 * Path to user's personal directory for Goblin %Camp.
	 * @see PathsImpl.FindPersonalDirectory
	 */
	personalDir = "";
	/*
	 * @var exec
	 * Path to Goblin %Camp executable file.
	 * @see PathsImpl.FindExecutableDirectory
	 */
	exec = "";
	/*
	 * @var execDir
	 * Path to Goblin %Camp executable directory.
	 * @see PathsImpl.FindExecutableDirectory
	 */
	execDir = "";
	/*
	 * @var dataDir
	 * Path to Goblin %Camp global data directory.
	 * @see PathsImpl.FindExecutableDirectory
	 */
	dataDir = "";
	/*
	 * @var savesDir
	 * Path to user's save directory (subdir of personalDir).
	 */
	savesDir = "";
	/*
	 * @var screensDir
	 * Path to user's screenshot directory (subdir of personalDir).
	 */
	screensDir = "";
	/*
	 * @var modsDir
	 * Path to user's mods directory (subdir of personalDir).
	 */
	modsDir = "";
	/*
	 * @var coreTilesetsDir
	 * Path to core tilesets directory (subdir of dataDir).
	 */
	coreTilesetsDir = "";
	/*
	 * @var tilesetsDir
	 * Path to user's tilesets directory (subdir of personalDir).
	 */
	tilesetsDir = "";
	/*
	 * @var config
	 * Path to user's configuration file.
	 */
	config = "";
	/*
	 * @var font
	 * Path to user's bitmap font.
	 */
	font = "";

	/**
	 * Finds current user's personal directory.
	 * 
	 * @param[out] personalDir Must be set to the correct path by the implementation.
	 */
	FindPersonalDirectory() {
		return "personal/";
	}

	/**
	 * Finds Goblin %Camp executable and data directories.
	 * 
	 * @param[out] exec    Must be set to the correct path to the executable file by the implementation.
	 * @param[out] execDir Must be set to the correct path to the executable directory by the implementation.
	 * @param[out] dataDir Must be set to the correct path to the global data directory by the implementation.
	 */
	FindExecutableDirectory() {
		return {
			exec: "",
			execDir: "exec/",
			dataDir: "data/",
		};
	}

	/** 
	 * Finds platform-specific directories (see PathsImpl), creates personal directory
	 * if doesn't exist, and opens log file.
	 * 
	 * This has to be called before anything else, especially anything
	 * that uses logging.
	 * 
	 * @returns Whether portable mode has been activated through binDir/goblin-camp.portable
	 */
	Bootstrap() {
		let {
			exec,
			execDir,
			dataDir
		} = this.FindExecutableDirectory();

		let portableMode = localStorage.getItem(execDir + "goblin-camp.portable");

		if (!portableMode) {
			this.personalDir = this.FindPersonalDirectory();
		} else {
			this.personalDir = dataDir + "user-data/";
		}
		this.execDir = execDir;
		this.dataDir = dataDir;
		this.savesDir = this.personalDir + "saves/";
		this.screensDir = this.personalDir + "screenshots/";
		this.modsDir = this.personalDir + "mods/";
		this.tilesetsDir = this.personalDir + "tilesets/";

		this.config = this.personalDir + "config.json";
		this.font = this.personalDir + "terminal.png";

		this.coreTilesetsDir = dataDir + "lib/tilesets_core/";

		return portableMode;
	}

	/**
	 * Calls Paths.Bootstrap and then tries to create user directory structure.
	 */
	constructor() {
		if (this.Bootstrap()) {
			console.log("Portable mode active.");
		}

		console.log("Personal directory: " + this.personalDir);
		console.log("Saves directory: " + this.savesDir);
		console.log("Screenshots directory: " + this.screensDir);
		console.log("Mods directory: " + this.modsDir);
		console.log("CoreTilesets directory: " + this.coreTilesetsDir);
		console.log("Tilesets directory: " + this.tilesetsDir);
		console.log("Executable directory: " + this.execDir);
		console.log("Global data directory: " + this.dataDir);
		console.log("Executable: " + this.exec);
		console.log("Config: " + this.config);
		console.log("Font: " + this.font);

		fs.writeDirectory(this.personalDir);
		fs.writeDirectory(this.savesDir);
		fs.writeDirectory(this.screensDir);
		fs.writeDirectory(this.modsDir);
		fs.writeDirectory(this.coreTilesetsDir);
		fs.writeDirectory(this.tilesetsDir);
		fs.writeDirectory(this.execDir);
		fs.writeDirectory(this.dataDir);
	}

	/**
	 * Retrieves reference to a given path. Exists to hide implementation details of path storage.
	 * 
	 * @param[in] what What to return, a member of Path enumeration.
	 * @returns Constant reference to given path (a boost.filesystem.path object).
	 */
	Get(what) {
		switch (what) {
			case Path.Executable:
				return this.exec;
			case Path.GlobalData:
				return this.dataDir;
			case Path.Personal:
				return this.personalDir;
			case Path.Mods:
				return this.modsDir;
			case Path.Saves:
				return this.savesDir;
			case Path.Screenshots:
				return this.screensDir;
			case Path.Font:
				return this.font;
			case Path.Config:
				return this.config;
			case Path.ExecutableDir:
				return this.execDir;
			case Path.CoreTilesets:
				return this.coreTilesetsDir;
			case Path.Tilesets:
				return this.tilesetsDir;
		}

		// If control reaches here, then someone added new value to the const /* enum */,
		// forgot to add it here, and missed the 'switch not checking
		// every value' warning. So, crash and burn.
		console.error("Impossible code path, crashing.");
		throw new Error("Impossible code path, crashing.");
	}
}

/** 
 * @const Paths.Path 
 * @see Paths.Get 
 */
export const Path = defineEnum("Paths",
	[
		/**
		 * @var Paths.Path.Executable
		 * @see Globals.exec
		 */
		"Executable",

		/**
		@var Paths.Path.GlobalData
		@see Globals.dataDir
		*/
		"GlobalData",

		/**
		 * @var Paths.Path.Personal
		 * @see Globals.personalDir 
		 */
		"Personal",

		/**
		 * @var Paths.Path.Mods
		 * @see Globals.modsDir 
		 */
		"Mods",

		/**
		 * @var Paths.Path.Saves
		 * @see Globals.savesDir 
		 */
		"Saves",


		/**
		 * @var Paths.Path.Screenshots
		 * @see Globals.screensDir 
		 */
		"Screenshots",

		/**
		 * @var Paths.Path.Font
		 * @see Globals.font 
		 */
		"Font",

		/**
		 * @var Paths.Path.Config
		 * @see Globals.config 
		 */
		"Config",

		/**
		 * @var Paths.Path.ExecutableDir
		 * @see Globals.execDir 
		 */
		"ExecutableDir",

		/**
		 * @var Paths.Path.CoreTilesets
		 * @see Globals.coreTilesetsDir 
		 */
		"CoreTilesets",

		/**
		 * @var Paths.Path.Tilesets
		 * @see Globals.tilesetsDir 
		 */
		"Tilesets"
	]
);

export let Paths = new PathsImplementation();
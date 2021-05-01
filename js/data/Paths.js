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

import { FilePath } from "../other/FilePath.js";
import { Path } from "./Path.js";

/**
 * Interface to manage platform-specific paths in a platform-agnostic way.
 * Basic building block of data handling code.
 */
export class Paths {
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

    Reset() {
        this.instance = null;
        this.instance = new Paths();
        return this.instance;
    }
    constructor() {
        if (Paths.instance) return Paths.instance;

        return this;
    }

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
    // Bootstrap() {
    //     let { exec, execDir, dataDir } = this.FindExecutableDirectory();

    //     let portableMode = localStorage.getItem(execDir + "goblin-camp.portable");

    //     if (!portableMode) {
    //         this.personalDir = this.FindPersonalDirectory();
    //     } else {
    //         this.personalDir = dataDir + "user-data/";
    //     }
    //     this.execDir = execDir;
    //     this.dataDir = dataDir;
    //     this.savesDir = this.personalDir + "saves/";
    //     this.screensDir = this.personalDir + "screenshots/";
    //     this.modsDir = this.personalDir + "mods/";
    //     this.tilesetsDir = this.personalDir + "tilesets/";

    //     this.config = this.personalDir + "config.json";
    //     this.font = this.personalDir + "terminal.png";

    //     this.coreTilesetsDir = dataDir + "lib/tilesets_core/";

    //     return portableMode;
    // }

    ready = false;
    caches = {};
    personalDir = "personal";
    savesDir = "saves";
    screensDir = "screens";
    modsDir = "screens";
    coreTilesetsDir = "coreTilesets";
    tilesetsDir = "tilesets";
    execDir = "exec";
    dataDir = "data";
    exec = "e";
    config = "config";
    font = "font";

    /**
     * Calls Paths.Bootstrap and then tries to create user directory structure.
     */
    Init() {
        // if (this.Bootstrap()) {
        //     console.log("Portable mode active.");
        // }

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

        let me = this;
        return Promise.all([
            me.openCache(this.personalDir).then(function (cache) {
                me.caches.personalDir = cache;
            }),
            me.openCache(this.savesDir).then(function (cache) {
                me.caches.savesDir = cache;
            }),
            me.openCache(this.screensDir).then(function (cache) {
                me.caches.screensDir = cache;
            }),
            me.openCache(this.modsDir).then(function (cache) {
                me.caches.modsDir = cache;
            }),
            me.openCache(this.coreTilesetsDir).then(function (cache) {
                me.caches.coreTilesetsDir = cache;
            }),
            me.openCache(this.tilesetsDir).then(function (cache) {
                me.caches.tilesetsDir = cache;
            }),
            me.openCache(this.tilesetsDir).then(function (cache) {
                me.caches.tilesetsDir = cache;
            }),
            me.openCache(this.execDir).then(function (cache) {
                me.caches.execDir = cache;
            }),
            me.openCache(this.dataDir).then(function (cache) {
                me.caches.dataDir = cache;
            }),
            me.openCache(this.exec).then(function (cache) {
                me.caches.exec = cache;
            }),
            me.openCache(this.config).then(function (cache) {
                me.caches.config = cache;
            }),
            me.openCache(this.font).then(function (cache) {
                me.caches.font = cache;
            }),
        ]).then(function (caches) {
            me.ready = true;
        });
    }

    /**
     *
     * @param {String} dirName
     * @returns {Promise} that resolves into {Cache};
     */
    openCache(dirName) {
        return caches.open(dirName);
    }

    /**
     * Retrieves reference to a given path. Exists to hide implementation details of path storage.
     *
     * @param {Path} what - What to return, a member of Path enumeration.
     * @returns {Cache} cache from that path
     */
    Get(what) {
        switch (what) {
            case Path.Executable:
                return this.caches.exec;
            case Path.GlobalData:
                return this.caches.dataDir;
            case Path.Personal:
                return this.caches.personalDir;
            case Path.Mods:
                return this.caches.modsDir;
            case Path.Saves:
                return this.caches.savesDir;
            case Path.Screenshots:
                return this.caches.screensDir;
            case Path.Font:
                return this.caches.font;
            case Path.Config:
                return this.caches.config;
            case Path.ExecutableDir:
                return this.caches.execDir;
            case Path.CoreTilesets:
                return this.caches.coreTilesetsDir;
            case Path.Tilesets:
                return this.caches.tilesetsDir;
        }

        // If control reaches here, then someone added new value to the const /* enum */,
        // forgot to add it here, and missed the 'switch not checking
        // every value' warning. So, crash and burn.
        console.error("Impossible code path, crashing.");
        throw new Error("Impossible code path, crashing.");
    }
    GetFilePath(filepath, fetch = true) {
        if (typeof filepath == "string") filepath = new FilePath(filepath);
        let cache = this.Get(filepath.GetCache(this));
        let url = filepath.GetURL();
        return cache.keys(function (keys) {
            if (keys.includes(url) || !fetch)
                // if we know it's in there, or we're not supposed to fetch it
                return cache.match(url);
            return cache.add(url);
        });
    }

    /**
     * Retrieves path name. Exists to hide implementation details of path storage.
     *
     * @param what What to return, a member of Path enumeration.
     * @returns Constant reference to given path (a boost.filesystem.path object).
     */
    GetName(what) {
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



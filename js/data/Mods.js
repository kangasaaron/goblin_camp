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

// Data refactoring: mods.
// import "tileRenderer/TileSetLoader.js"

// need to be public: Load function, Metadata type, GetLoaded function, GetAvailableTilesetMods function
class Metadata {
    mod = "";
    name = "";
    author = "";
    version = "";
    apiVersion = 0;
    /**
     * 
     * @param {string} mod 
     * @param {string} name 
     * @param {string} author 
     * @param {string} version 
     * @param {number} apiVersion 
     */
    constructor(mod, name, author, version, apiVersion) {
        this.mod = String(mod);
        this.name = String(name);
        this.author = String(author);
        this.version = String(version);
        this.apiVersion = Math.round(Number(apiVersion));
    }
}

/**
    Interface to load and query mods.
*/
class Modifications {
    Metadata = Metadata;
    /**
     * List of loaded mods. NB: removing an entry from this list does not unload the mod.
     * @type {Array<Metadata>}
     */
    loadedMods = [];
    /**
     * @type {Array<TilesetModMetadata>}
     */
    availableTilesetMods = [];
    /**
     * @type {FileSystem}
     */
    fs = null;
    /**
     * Retrieves the list of loaded mods.
     * @returns {Array<Metadata>} Constant reference to list of mods metadata.
     */
    GetLoaded() {
        return this.loadedMods;
    }

    /**
     * @returns {Array<TilesetModMetadata>}
     */
    GetAvailableTilesetMods() {
        return this.availableTilesetMods;
    }

    /**
        Loads global mod and then tries to load user mods.
    */
    Load() {
        // load core data
        let me = this,
            modNames = [];
        return this.LoadMod(Paths.GetName(Paths.GlobalData) + "gcamp_core", true)
            .then(function() {
                return me.loadedMods.push(new MetaData("Goblin Camp"));
            }).then(function() {
                return Paths.Mods.keys();
            }).then(function(keys) {
                // load user mods
                return Promise.all(keys.map(function(key) {
                    let modName = key.substring(0, key.indexOf("/"));
                    if (modNames.includes(modName)) return true;
                    return me.LoadMod(Paths.GetName(Paths.Mods) + modName);
                }));
            }).then(function() {
                // now resolve containers and products
                Item.ResolveContainers();
                Construction.ResolveProducts();
                return me;
            });
    }

    /**
      Loads given mod and inserts it's metadata into loadedMods.
      NB: Currently there is no way to unload a mod.

      @param[in] dir      Mod's directory.
      @param[in] required Passed down to @ref{Modifications.LoadFile} for every data file of the mod.
     */
    LoadMod(dir, required = false) {
        let mod = dir.GetCache();

        console.log("Trying to load mod '" + mod + "' from " + dir, "LoadMod");

        // Removed magic apiVersion in favour of reusing already-hardcoded 'required' code path.
        let metadata = new Metadata(mod, mod, "", "1.0", (required ? Script.version : -1));
        return mod.keys().then(function(keys) {
                if (keys.includes(dir.GetURL() + "mod.dat")) {
                    console.log("Loading metadata.", "LoadMod");
                    return this.LoadMetadata(metadata, dir.GetURL() + "mod.dat");
                }
                return Promise.all([]);
            }).then(function() {
                return this.LoadModFiles(dir, required)
            })
            .then(function() {
                return TileSetLoader.LoadTilesetModMetadata(dir);
            })
            .then(function(tilesetMods) {
                for (let iter of tilesetMods)
                    this.availableTilesetMods.push(iter);

                let p;
                if (metadata.apiVersion != -1) {
                    if (metadata.apiVersion != Script.version) {
                        console.log("WARNING: Ignoring mod scripts because of an incorrect API version.", "LoadMod");
                    } else {
                        p = Script.LoadScript(mod, dir.string());
                    }
                }
                this.loadedMods.push(metadata);
                if (p) return p;
                return Promise.all([]);
            })
            .catch(function(e) {
                console.log("Failed to load mod due to std.runtime_error: " + e.message, "LoadMod");
                if (required)
                    Game.ErrorScreen(); // FIXME: hangs
            })
    }

    LoadModFiles(dir, required) {
        return Promise.all([
            this.LoadFile("spells", dir, Spell.LoadPresets.bind(Spell), required),
            this.LoadFile("items", dir, Item.LoadPresets.bind(Item), required),
            this.LoadFile("constructions", dir, Construction.LoadPresets.bind(Construction), required),
            this.LoadFile("wildplants", dir, NatureObject.LoadPresets.bind(NatureObject), required),
            this.LoadFile("names", dir, LoadNames.bind(this), required),
            this.LoadFile("creatures", dir, NPC.LoadPresets.bind(NPC), required),
            this.LoadFile("factions", dir, Faction.LoadPresets.bind(Faction), required)
        ]);
    }

    /**
        Loads mod metadata from given file. Doesn't modify loadedMods.

        @param {Metadata}  metadata     Mods.Metadata structure to fill.
        @param {string}  metadataFile Full path to the metadata file.
    */
    LoadMetadata(metadata, metadataFile) {
        return new ModListener(this, metadata, metadataFile).fetch();
    }

    /**
        Loads given data file with given function.

        @param {string} filename Name of the file, without .dat extension.
        @param {string} dir      Directory containing the file.
        @param {function} loadFunc Function that loads the data file.
        @param {boolean} required If true, and file doesn't exist, the game will exit completely.
    */
    LoadFile(filename, dir, loadFunc, required = false) {
        filename += ".dat";

        console.log("Trying to load " + filename + " from " + dir, "LoadFile");

        if (!this.fs.exists(dir + "/" + filename)) {
            console.log("Doesn't exist.", "LoadFile");

            if (required) {
                throw new Error("Doesn't exist.");
            } else {
                return;
            }
        }

        loadFunc(dir + "/" + filename);
    }
    LoadNames(fn) {
        NameGen.parse(fn);
    }
}

export let Mods = new Modifications();
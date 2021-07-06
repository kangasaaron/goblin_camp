/* Copyright 2010-2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but without any warranty; without even the implied warranty of
merchantability or fitness for a particular purpose. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/

import {
    Path,
    Paths
} from "./Paths.js";
import {
    fs
} from "../other/fakefs.js";

export class Tilesets {
    static instance;
    static Reset() {
        this.instance = null;
        this.instance = new Tilesets();
        return this.instance();
    }
    constructor() {
        if (Tilesets.instance) return Tilesets.instance;

        this.Paths = new Paths();

        return this;
    }
    /**
     * Reads in the metadata for the given tileset.
     * @param[in] dir      Tileset's directory.
     * @param[in] metadataList The metadata list to populate on a successful read
     */
    LoadMetadata(dir, metadataList) {
        console.log(`Trying to load tileset metadata from ${dir}`);

        let metadata = TileSetLoader.LoadTileSetMetadata(dir);
        if (metadata.valid && metadata.width > 0 && metadata.height > 0) {
            metadataList.push(metadata);
        }
    }

    /**
     * Loads default tileset and then tries to load user tilesets.
     */
    LoadTilesetMetadata() {
        let metadata = [];
        return this.loadCoreTilesets(metadata)
            .then(function () {
                return this.loadUserTilesets(metadata);
            });
    }

    /**
     * load core tilesets
     * */
    loadCoreTilesets(metadata) {
        return this.Paths.Get(Path.CoreTilesets).keys()
            .then(keys => this.loadDirectoryTilesets(keys, metadata));
    };

    /** 
     * load user tilesets
     * */
    loadUserTilesets(metadata) {
        return this.Paths.Get(Path.Tilesets).keys()
            .then((keys) => this.loadDirectoryTilesets(keys, metadata));
    }

    /**
     * load a directory of tilesets
     */
    loadDirectoryTilesets(path, metadata) {
        for (let it of fs.readDirectory(path)) {
            if (!fs.isDirectory(it))
                continue;
            this.LoadMetadata(it, metadata);
        }
    }
}

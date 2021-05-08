/* Copyright 2011 Ilkka Halila
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

export class TileSetLoader {
    static instance;
    static Reset(){
        this.instance = null;
        this.instance = new TileSetLoader();
        return this.instance;
    }
    constructor(){
        if(TileSetLoader.instance) return TileSetLoader.instance;

        this.Paths = new Paths();

        return this;
    }
    
    // boost.shared_ptr < TileSet > LoadTileSet(boost.shared_ptr < TilesetRenderer > spriteFactory, std.string name);
    // boost.shared_ptr < TileSet > TileSetLoader.LoadTileSet(boost.shared_ptr < TilesetRenderer > spriteFactory, std.string tilesetName) {
    LoadTileSet(spriteFactory, tilesetName) {
        // Resolve path
        let tilesetPath = (this.Paths.Get(Path.CoreTilesets) + "/" + tilesetName);
        if (!boost.filesystem.is_directory(tilesetPath)) {
            tilesetPath = this.Paths.Get(Path.Tilesets) + "/" + tilesetName;
        }
        return LoadTileSet(spriteFactory, tilesetPath);
    }

    // boost.shared_ptr < TileSet > LoadTileSet(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.filesystem.path path);
    // boost.shared_ptr < TileSet > TileSetLoader.LoadTileSet(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.filesystem.path path) {
    LoadTileSet(spriteFactory, path) {
        let fs = boost.filesystem;
        /**fs.path**/
        let tileSetV1Path = (path / "tileset.dat");
        /**fs.path**/
        let tileSetV2Path = (path / "tilesetV2.dat");

        // boost.shared_ptr < TileSet > 
        let tileset;

        if (fs.exists(tileSetV2Path)) {
            TileSetParserV2 parser(spriteFactory);
            tileset = parser.Run(tileSetV2Path);
        } else if (fs.exists(tileSetV1Path)) {
            TileSetParserV1 parser(spriteFactory);
            tileset = parser.Run(tileSetV1Path);
        } else {
            return boost.shared_ptr < TileSet > ();
        }

        if (tileset) {
            for (std.list < TilesetModMetadata > .const_iterator iter = Mods.GetAvailableTilesetMods().begin(); iter != Mods.GetAvailableTilesetMods().end(); ++iter) {
                if (iter.height == tileset.TileHeight() && iter.width == tileset.TileWidth()) {
                    fs.path tileSetModV2Path(iter.location / "tilesetModV2.dat");
                    if (fs.exists(tileSetModV2Path)) {
                        TileSetParserV2 parser(spriteFactory);
                        parser.Modify(tileset, tileSetModV2Path);
                    }
                }
            }
        }
        return tileset;
    }

    // TileSetMetadata LoadTileSetMetadata(boost.filesystem.path path);
    // TileSetMetadata TileSetLoader.LoadTileSetMetadata(boost.filesystem.path path) {
    LoadTileSetMetadata(path) {
        let fs = boost.filesystem;
        /**fs.path*/
        let tileSetV1Path = (path + "/" + "tileset.dat");
        /**fs.path*/
        let tileSetV2Path = (path + "/" + "tilesetV2.dat");

        if (fs.exists(tileSetV2Path)) {
            parser = new TileSetMetadataParserV2();
            return parser.Run(tileSetV2Path);
        } else if (fs.exists(tileSetV1Path)) {
            parser = new TileSetMetadataParserV1();
            return parser.Run(tileSetV1Path);
        }
        return new TileSetMetadata();
    }

    // std.list < TilesetModMetadata > LoadTilesetModMetadata(boost.filesystem.path path);
    // std.list < TilesetModMetadata > TileSetLoader.LoadTilesetModMetadata(boost.filesystem.path path) {
    LoadTilesetModMetadata(path) {
        let fs = boost.filesystem;
        /**fs.path**/
        tileSetV2Path = (path + "/" + "tilesetModV2.dat");
        if (fs.exists(tileSetV2Path)) {
            let parser = TileSetModMetadataParserV2();
            return parser.Run(tileSetV2Path);
        }
        return /**std.list < TilesetModMetadata > ();*/ [];
    }


}

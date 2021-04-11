export class TileSetMetadata {
    /**boost.filesystem.path**/
    path = new URL();
    name = "";
    author = "";
    version = "";
    description = "";
    width = 0;
    height = 0;
    valid = false;

    // explicit TileSetMetadata();
    // TileSetMetadata.TileSetMetadata(): 
    constructor() {
        path();
    }

    // explicit TileSetMetadata(boost.filesystem.path tilesetPath);
    // TileSetMetadata.TileSetMetadata(boost.filesystem.path tilesetPath);
    contructor(tilesetPath) {
        path(tilesetPath);
    }
}
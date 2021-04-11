export class TileSetModMetadata {
    /**boost.filesystem.path*/
    location = new URL();
    width = 0;
    height = 0;

    // explicit TileSetModMetadata(boost.filesystem.path loc);
    // TileSetModMetadata.TileSetModMetadata(boost.filesystem.path loc): 
    constructor(loc) {
        location = loc;
    }
}
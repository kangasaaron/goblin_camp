import {
    Enum
} from "./cplusplus/Enums.js";

export class TileType extends Enum {
    static TILENONE;
    static TILEGRASS;
    static TILEDITCH;
    static TILERIVERBED;
    static TILEBOG;
    static TILEROCK;
    static TILEMUD;
    static TILESNOW;
    static TILE_TYPE_COUNT;
};
TileType.enumify();
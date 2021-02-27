import {
    defineEnum
} from "./other/Enums.js";

export const TileType = defineEnum('TileType', [
    "TILENONE",
    "TILEGRASS",
    "TILEDITCH",
    "TILERIVERBED",
    "TILEBOG",
    "TILEROCK",
    "TILEMUD",
    "TILESNOW",
    "TILE_TYPE_COUNT"
]);
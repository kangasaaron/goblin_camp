import {
    defineEnum
} from "./other/enums.js";

export const Direction = defineEnum(
    "Direction",
    [
        "NORTH",
        "NORTHEAST",
        "EAST",
        "SOUTHEAST",
        "SOUTH",
        "SOUTHWEST",
        "WEST",
        "NORTHWEST",
        "NODIRECTION"
    ],
);
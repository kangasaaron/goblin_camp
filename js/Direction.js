import {
    Enum
} from "./other/enums.js";
/**
 * @enum
 */
export class Direction extends Enum {
    static NORTH;
    static NORTHEAST;
    static EAST;
    static SOUTHEAST;
    static SOUTH;
    static SOUTHWEST;
    static WEST;
    static NORTHWEST;
    static NODIRECTION
}
Direction.enumify();
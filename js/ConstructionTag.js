import {
    Enum
} from "./other/Enums.js";

/**
 * @enum
 */
export class ConstructionTag extends Enum {
    static STOCKPILE;
    static FARMPLOT;
    static DOOR;
    static WALL;
    static BED;
    static WORKSHOP;
    static FURNITURE;
    static CENTERSCAMP;
    static SPAWNINGPOOL;
    static BRIDGE;
    static TRAP;
    static RANGEDADVANTAGE;
    static PERMANENT;
    static TAGCOUNT;
}
ConstructionTag.enumify();
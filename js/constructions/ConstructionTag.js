import {
    Enumify
} from "../cplusplus/Enums.js";

/**
 * @enum
 */
export const ConstructionTag ={
    STOCKPILE: null,
    FARMPLOT: null,
    DOOR: null,
    WALL: null,
    BED: null,
    WORKSHOP: null,
    FURNITURE: null,
    CENTERSCAMP: null,
    SPAWNINGPOOL: null,
    BRIDGE: null,
    TRAP: null,
    RANGEDADVANTAGE: null,
    PERMANENT: null,
    TAGCOUNT: null,
};

Enumify(ConstructionTag);
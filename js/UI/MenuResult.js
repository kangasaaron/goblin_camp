import {
    Enum
} from "./other/Enums.js";

/**
 * @enum
 */
export class MenuResult extends Enum {
    static MENUHIT = 1;
    static NOMENUHIT = 2;
    static KEYRESPOND = 4;
    static DISMISS = 8;
}
MenuResult.enumify();
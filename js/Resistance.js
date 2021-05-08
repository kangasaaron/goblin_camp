import {
    Enum
} from "./other/Enums.js";
/**
 * @enum
 */
export class Resistance extends Enum {
    static PHYSICAL_RES;
    static MAGIC_RES;
    static POISON_RES;
    static COLD_RES;
    static FIRE_RES;
    static DISEASE_RES;
    static BLEEDING_RES;
    static RES_COUNT;
}
Resistance.enumify();

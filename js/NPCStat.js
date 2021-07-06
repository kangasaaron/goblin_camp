import {
    Enum
} from "./cplusplus/Enums.js";
/**
 * @enum
 */
export class NPCStat extends Enum {
    static MOVESPEED;
    static DODGE;
    static STRENGTH;
    static NPCSIZE;
    static STAT_COUNT;
}
NPCStat.enumify();

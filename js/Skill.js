import {
    Enum
} from "./cplusplus/Enums.js";

/**
 * @enum
 */
export class Skill extends Enum {
    /** @static @type {Skill} */
    static MASONRY;
    /** @static @type {Skill} */
    static CARPENTRY;
    /** @static @type {Skill} the number of skills */
    static SKILLAMOUNT;
}
Skill.enumify();

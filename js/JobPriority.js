import {
    Enum
} from "./other/Enums.js";

/**
 * @enum
 */
export class JobPriority extends Enum {
    /** @property {Enum} VERYHIGH - indicates urgent job*/
    static VERYHIGH;
    /** @property {Enum} HIGH - indicates important job*/
    static HIGH;
    /** @property {Enum} MED - most jobs*/
    static MED;
    /** @property {Enum} LOW - menial tasks*/
    static LOW;
    /** @property {Enum} PRIORITY_COUNT - # of Job priority types*/
    static PRIORITY_COUNT;
};
JobPriority.enumify();
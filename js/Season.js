import {
    Enum
} from "./cplusplus/Enums.js";
/**
 * @enum
 */
export class Season extends Enum {
    static EarlySpring;
    static Spring;
    static LateSpring;
    static EarlySummer;
    static Summer;
    static LateSummer;
    static EarlyFall;
    static Fall;
    static LateFall;
    static EarlyWinter;
    static Winter;
    static LateWinter;
};
Season.enumify();

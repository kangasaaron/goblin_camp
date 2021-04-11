import {
    Enum
} from "./other/enums.js";
/**
 * @enum
 */
export class StatusEffectType extends Enum {
    static HUNGER;
    static THIRST;
    static PANIC;
    static CONCUSSION;
    static DROWSY;
    static SLEEPING;
    static POISON;
    static BLEEDING;
    static FLYING;
    static BADSLEEP;
    static RAGE;
    static SWIM;
    static EATING;
    static DRINKING;
    static CARRYING;
    static WORKING;
    static BURNING;
    static CRACKEDSKULLEFFECT;
    static INVIGORATED;
    static DRUNK;
    static HEALING;
    static HELPLESS;
    static HIGHGROUND;
    static TRIPPED;
    static BRAVE;
    static COLLYWOBBLES;
    static DROOPS;
    static RATTLES;
    static CHILLS;
    static STATUS_EFFECT_COUNT;
};
StatusEffectType.enumify();
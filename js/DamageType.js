import {
    Enum
} from "./other/Enums.js";

/**
 * @enum
 */
export class DamageType extends Enum {
    static DAMAGE_SLASH;
    static DAMAGE_PIERCE;
    static DAMAGE_BLUNT;
    static DAMAGE_MAGIC;
    static DAMAGE_FIRE;
    static DAMAGE_COLD;
    static DAMAGE_POISON;
    static DAMAGE_COUNT; // nothing can deal "wielded" or "ranged" damage
    static DAMAGE_WIELDED;
    static DAMAGE_RANGED;
};
DamageType.enumify();
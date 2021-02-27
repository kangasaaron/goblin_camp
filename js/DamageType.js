import {
    defineEnum
} from "./other/Enums.js";

export const DamageType = defineEnum("DamageType", [
    'DAMAGE_SLASH',
    'DAMAGE_PIERCE',
    'DAMAGE_BLUNT',
    'DAMAGE_MAGIC',
    'DAMAGE_FIRE',
    'DAMAGE_COLD',
    'DAMAGE_POISON',
    'DAMAGE_COUNT', //Nothing can deal "wielded" or "ranged" damage
    'DAMAGE_WIELDED',
    'DAMAGE_RANGED'
]);
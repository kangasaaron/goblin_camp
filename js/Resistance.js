import {
    defineEnum
} from "./other/enums.js";

export const Resistance = defineEnum("Resistance", [
    "PHYSICAL_RES",
    "MAGIC_RES",
    "POISON_RES",
    "COLD_RES",
    "FIRE_RES",
    "DISEASE_RES",
    "BLEEDING_RES",
    "RES_COUNT"
]);
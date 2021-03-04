import {
    defineEnum
} from "./other/Enums.js";

export const FactionGoal = defineEnum("FactionGoal", [
    'FACTIONDESTROY', //Destroy buildings
    'FACTIONKILL', //Kill hostiles
    'FACTIONSTEAL', //Steal items valuable to the faction
    'FACTIONPATROL', //Patrol area
    'FACTIONIDLE' //Idle
]);
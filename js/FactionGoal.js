import {
    Enum
} from "./cplusplus/Enums.js";
/**
 * @enum
 */
export class FactionGoal extends Enum {
    static FACTIONDESTROY; //Destroy buildings
    static FACTIONKILL; //Kill hostiles
    static FACTIONSTEAL; //Steal items valuable to the faction
    static FACTIONPATROL; //Patrol area
    static FACTIONIDLE; //Idle
}
FactionGoal.enumify();

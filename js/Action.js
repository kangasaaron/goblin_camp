import {
    Enum
} from "./other/Enums.js";

/**
 * @enum
 */
export class Action extends Enum {
    static NOACTION;
    static USE;
    static TAKE;
    static DROP;
    static PUTIN;
    static BUILD;
    static MOVE;
    static MOVEADJACENT;
    static MOVENEAR;
    static WAIT;
    static DRINK;
    static EAT;
    static FIND;
    static HARVEST;
    static FELL;
    static HARVESTWILDPLANT;
    static KILL;
    static FLEEMAP;
    static SLEEP;
    static DISMANTLE;
    static WIELD;
    static WEAR;
    static BOGIRON;
    static STOCKPILEITEM;
    static QUIVER;
    static FILL;
    static POUR;
    static DIG;
    static FORGET;
    static UNWIELD;
    static GETANGRY;
    static CALMDOWN;
    static STARTFIRE;
    static REPAIR;
    static FILLDITCH;
}
Action.enumify();
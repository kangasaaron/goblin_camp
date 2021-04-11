import {
    Enum
} from "../other/Enums.js";

/**
 * @enum CursorType
 */

export class CursorType extends Enum {
    /** @type {CursorType} Cursor_None */
    static Cursor_None;
    /** @type {CursorType} Cursor_Construct */
    static Cursor_Construct;
    /** @type {CursorType} Cursor_Stockpile */
    static Cursor_Stockpile;
    /** @type {CursorType} Cursor_TreeFelling */
    static Cursor_TreeFelling;
    /** @type {CursorType} Cursor_Harvest */
    static Cursor_Harvest;
    /** @type {CursorType} Cursor_Order */
    static Cursor_Order;
    /** @type {CursorType} Cursor_Tree */
    static Cursor_Tree;
    /** @type {CursorType} Cursor_Dismantle */
    static Cursor_Dismantle;
    /** @type {CursorType} Cursor_Undesignate */
    static Cursor_Undesignate;
    /** @type {CursorType} Cursor_Bog */
    static Cursor_Bog;
    /** @type {CursorType} Cursor_Dig */
    static Cursor_Dig;
    /** @type {CursorType} Cursor_AddTerritory */
    static Cursor_AddTerritory;
    /** @type {CursorType} Cursor_RemoveTerritory */
    static Cursor_RemoveTerritory;
    /** @type {CursorType} Cursor_Gather */
    static Cursor_Gather;
    /** @type {CursorType} Cursor_Simple_Mode_Count */
    static Cursor_Simple_Mode_Count;
    /** @type {CursorType} Cursor_NPC_Mode */
    static Cursor_NPC_Mode;
    /** @type {CursorType} Cursor_Item_Mode */
    static Cursor_Item_Mode;
}

CursorType.enumify();
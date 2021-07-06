import {
    Enumify
} from "../cplusplus/Enums.js";

/**
 * @enum CursorType
 */

export const CursorType = {
    /** @type {CursorType} Cursor_None */
    Cursor_None: null,
    /** @type {CursorType} Cursor_Construct */
    Cursor_Construct: null,
    /** @type {CursorType} Cursor_Stockpile */
    Cursor_Stockpile: null,
    /** @type {CursorType} Cursor_TreeFelling */
    Cursor_TreeFelling: null,
    /** @type {CursorType} Cursor_Harvest */
    Cursor_Harvest: null,
    /** @type {CursorType} Cursor_Order */
    Cursor_Order: null,
    /** @type {CursorType} Cursor_Tree */
    Cursor_Tree: null,
    /** @type {CursorType} Cursor_Dismantle */
    Cursor_Dismantle: null,
    /** @type {CursorType} Cursor_Undesignate */
    Cursor_Undesignate: null,
    /** @type {CursorType} Cursor_Bog */
    Cursor_Bog: null,
    /** @type {CursorType} Cursor_Dig */
    Cursor_Dig: null,
    /** @type {CursorType} Cursor_AddTerritory */
    Cursor_AddTerritory: null,
    /** @type {CursorType} Cursor_RemoveTerritory */
    Cursor_RemoveTerritory: null,
    /** @type {CursorType} Cursor_Gather */
    Cursor_Gather: null,
    /** @type {CursorType} Cursor_Simple_Mode_Count */
    Cursor_Simple_Mode_Count: null,
    /** @type {CursorType} Cursor_NPC_Mode */
    Cursor_NPC_Mode: null,
    /** @type {CursorType} Cursor_Item_Mode */
    Cursor_Item_Mode: null,
}

Enumify(CursorType);
import {
    defineEnum
} from "./other/enums.js";

export const CursorType = defineEnum("CursorType", [
    'Cursor_None',
    'Cursor_Construct',
    'Cursor_Stockpile',
    'Cursor_TreeFelling',
    'Cursor_Harvest',
    'Cursor_Order',
    'Cursor_Tree',
    'Cursor_Dismantle',
    'Cursor_Undesignate',
    'Cursor_Bog',
    'Cursor_Dig',
    'Cursor_AddTerritory',
    'Cursor_RemoveTerritory',
    'Cursor_Gather',
    'Cursor_Simple_Mode_Count',
    'Cursor_NPC_Mode',
    'Cursor_Item_Mode'
]);
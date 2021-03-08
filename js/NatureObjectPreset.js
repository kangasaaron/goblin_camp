import {
    Color
} from "../other/Color.js";

export class NatureObjectPreset {
    name = "NATUREOBJECT PRESET";
    graphic = '?';
    color = Color.pink;
    components = [];
    rarity = 100;
    cluster = 1;
    condition = 1;
    tree = false;
    harvestable = false;
    walkable = false;
    evil = false;
    minHeight = 0.0;
    maxHeight = 2.0;
    fallbackGraphicsSet = "";
    graphicsHint = -1;
}
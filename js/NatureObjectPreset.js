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
    constructor(obj) {
        this.name = ("plant_type" in obj) ? obj.plant_type : this.name;
        this.graphic = ("graphic" in obj) ? obj.graphic : this.graphic;
        this.color = ("col" in obj) ? new Color(...obj.col) : this.color;
        this.components = ("components" in obj) ? obj.components : this.components;
        this.rarity = ("rarity" in obj) ? obj.rarity : this.rarity;
        this.condition = ("condition" in obj) ? obj.condition : this.condition;
        this.cluster = ("cluster" in obj) ? obj.cluster : this.cluster;
        this.tree = ("tree" in obj) ? obj.tree : this.tree;
        this.harvestable = ("harvestable" in obj) ? obj.harvestable : this.harvestable;
        this.walkable = ("walkable" in obj) ? obj.walkable : this.walkable;
        this.minHeight = ("minheight" in obj) ? obj.minheight : this.minHeight;
        this.maxHeight = ("maxheight" in obj) ? obj.maxheight : this.maxHeight;
        this.fallbackGraphicsSet = ("fallbackgraphicsset" in obj) ? obj.fallbackgraphicsset : this.fallbackGraphicsSet;
        this.evil = ("evil" in obj) ? obj.evil : this.evil;
    }
}
import {
    NatureObjectPreset
} from "./NatureObjectPreset";
import { PreserParser } from "./PresetParser.js";

export class NatureObjectListener extends PreserParser {
    natureIndex = 0;
    constructor(NatureObject) {
        this.NatureObject = NatureObject;
    }

    parserNewStruct(str, name) {
        let foundInPreset = false;
        let lowerName = name.toLowerCase();

        for (let i = 0; i < this.NatureObject.Presets.length; ++i) {
            if (this.NatureObject.Presets[i].name.toLowerCase() === lowerName)) {
                this.natureIndex = i;
                this.NatureObject.Presets[i] = new NatureObjectPreset();
                foundInPreset = true;
                break;
            }
        }

        if (!foundInPreset) {
            this.natureIndex = this.NatureObject.Presets.length;
            this.NatureObject.Presets.push(new NatureObjectPreset());
        }

        this.NatureObject.Presets[this.natureIndex].name = name;
        return true;
    }

    parserFlag(name, value) {
        let lowerName = name.toLowerCase();
        if (lowerName === "walkable") {
            this.NatureObject.Presets[this.natureIndex].walkable = value;
        } else if (lowerName === "harvestable") {
            this.NatureObject.Presets[this.natureIndex].harvestable = value;
        } else if (lowerName === "tree") {
            this.NatureObject.Presets[this.natureIndex].tree = value;
        } else if (lowerName === "evil") {
            this.NatureObject.Presets[this.natureIndex].evil = value;
        }
        return true;
    }

    parserProperty(name, value) {
        let lowerName = name.toLowerCase();
        if (lowerName === "graphic") {
            this.NatureObject.Presets[this.natureIndex].graphic = value;
        } else if (lowerName === "components") {
            for (let i = 0; i < value.length; ++i) {
                this.NatureObject.Presets[this.natureIndex].components.push(Item.StringToItemType(value[i]));
            }
        } else if (lowerName === "col") {
            this.NatureObject.Presets[this.natureIndex].color = new Color(...value);
        } else if (lowerName === "rarity") {
            this.NatureObject.Presets[this.natureIndex].rarity = value;
        } else if (lowerName === "cluster") {
            this.NatureObject.Presets[this.natureIndex].cluster = value;
        } else if (lowerName === "condition") {
            this.NatureObject.Presets[this.natureIndex].condition = value;
        } else if (lowerName === "minheight") {
            this.NatureObject.Presets[this.natureIndex].minHeight = value;
        } else if (lowerName === "maxheight") {
            this.NatureObject.Presets[this.natureIndex].maxHeight = value;
        } else if (lowerName === "fallbackGraphicsSet") {
            this.NatureObject.Presets[this.natureIndex].fallbackGraphicsSet = value;
        }
        return true;
    }

}

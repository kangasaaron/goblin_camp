
import {TCODColor} from "../../fakeTCOD/libtcod.js";
import { Attack } from "../Attack.js";
export class ItemPreset {
    graphic = '?';
    color = TCODColor.pink;
    name = "Preset default";
    specificCategories = new Set();
    categories = new Set();
    nutrition = -1;
    growth = -1;
    fruits = [];
    components = [];
    organic = false;
    container = 0;
    multiplier = 1;
    fitsInRaw = "";
    containInRaw = "";
    constructedInRaw = "";
    fitsin = -1;
    containIn = -1;
    decays = false;
    decaySpeed = 0;
    decayList = [];
    attack = new Attack();
    resistances = new Array(RES_COUNT).fill(0);
    bulk = 1;
    condition = 1;
    fallbackGraphicsSet = "";
    graphicsHint = -1;
    /**
     * nx2 array of effect, chance to add
     */
    addsEffects = [];
    /**
     * nx2 array of effect, chance to remove
     */
    removesEffects = [];

}
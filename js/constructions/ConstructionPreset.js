import { Attack } from "../Attack.js";
import { TCODColor } from "../../fakeTCOD/libtcod.js";
import { ConstructionTag } from "./ConstructionTag.js";
import { Coordinate } from "../Coordinate.js";
import { OrderedSet } from "../cplusplus/OrderedSet.js";
import { UIState } from "../UI/UIState.js";

export class ConstructionPreset {
    constructor(){
        this.maxCondition = 0;
        this.graphic = [];
        this.walkable = false;
        this.materials = []
        this.producer = false;
        this.products = [];
        this.name = "???";
        this.blueprint = new Coordinate(1, 1);
        this.tags = new Array(ConstructionTag.TAGCOUNT).fill(false);
        this.productionSpot = new Coordinate();
        this.dynamic = false;
        this.spawnCreaturesTag = "";
        this.spawnFrequency = 10;
        this.category = "";
        this.placementType = UIState.UIPLACEMENT;
        this.blocksLight = true;
        this.permanent = false;
        this.color = new TCODColor();
        this.tileReqs = new OrderedSet();
        this.tier = 0;
        this.description = "";
        this.fallbackGraphicsSet = "";
        this.graphicsHint = -1;
        this.chimney = new Coordinate(-1, -1);
        this.trapAttack = new Attack();
        this.trapReloadItem = -1;
        this.moveSpeedModifier = 2;
        this.passiveStatusEffects = [];
    }
}
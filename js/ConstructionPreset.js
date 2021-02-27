import {
    Coordinate
} from "./Coordinate.js";
import {
    Attack
} from "./Attack.js";
import {
    OrderedSet
} from "./other/OrderedSet.js";

export class ConstructionPreset {
    maxCondition = 0;
    graphic = [];
    walkable = false;
    materials = []
    producer = false;
    products = [];
    name = "???";
    blueprint = new Coordinate(1, 1);
    tags = new Array(ConstructionTag.TAGCOUNT).fill(false);
    productionSpot = new Coordinate();
    dynamic = false;
    spawnCreaturesTag = "";
    spawnFrequency = 10;
    category = "";
    placementType = UIPLACEMENT;
    blocksLight = true;
    permanent = false;
    color = [0, 0, 0];
    tileReqs = new OrderedSet();
    tier = 0;
    description = "";
    fallbackGraphicsSet = "";
    graphicsHint = -1;
    chimney = new Coordinate(-1, -1);
    trapAttack = new Attack();
    trapReloadItem = -1;
    moveSpeedModifier = 2;
    passiveStatusEffects = [];
}
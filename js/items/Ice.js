import {Coordinate} from "./Coordinate.js";
import {Game} from "./Game.js";
import {GameMap} from "./GameMap.js";
import {Item} from "./Item.js";
import {NatureObject} from "./NatureObject.js";
import {Random} from "./Random.js";
import {WaterNode} from "./WaterNode.js";

export class Ice extends NatureObject {
    constructor(pos = Coordinate.zero, typeVal = 0) {
        super(pos, typeVal);
        this.frozenWater = null;
        this.Game = new Game();
        this.Random = new Random();
        this.ice = true;
        GameMap.i.SetBlocksWater(pos, true);
        let water = GameMap.i.GetWater(pos).lock();
        if (water) {
            this.frozenWater = water;
            this.Game.i.RemoveWater(pos);
        }
    }
    destructor() {
        GameMap.i.SetBlocksWater(this.pos, false);
        if (!this.frozenWater) return;
        this.Game.i.CreateWaterFromNode(this.frozenWater);
        if (this.Random.i.Generate(4) === 0) {
            this.Game.i.CreateItem(this.Position, Item.StringToItemType("ice"), false, -1);
        }
        super.destructor();
    }
    serialize(ar, version) {
        ar.register_type(WaterNode);
        let result = super.serialize(ar, version);
        result.frozenWater = ar.serialize(this.frozenWater);
        return result;
    }
    static deserialize(data, version, deserializer) {
        let result = NatureObject.deserialize(data, version, deserializer);
        result.frozenWater = deserializer.deserialize(data.frozenWater);
        return result;
    }
}
Ice.CLASS_VERSION = 0;
import {
    Coordinate
} from "./Coordinate";
import {
    NatureObjectType
} from "./NatureObjectType.js";
import {
    WaterNode
} from "./Water.js";

export class Ice extends NatureObject {
    static CLASS_VERSION = 0;

    frozenWater = null;
    constructor(pos = Coordinate.zero, typeVal = 0) {
        super(pos, typeVal);
        this.ice = true;
        Map.SetBlocksWater(pos, true);
        let water = Map.GetWater(pos).lock();
        if (water) {
            this.frozenWater = water;
            Game.RemoveWater(pos);
        }
    }
    destructor() {
        Map.SetBlocksWater(this.pos, false);
        if (!this.frozenWater) return;
        Game.CreateWaterFromNode(this.frozenWater);
        if (Random.Generate(4) == 0) {
            Game.CreateItem(this.Position, Item.StringToItemType("ice"), false, -1);
        }
        super.destructor();
    }
    serialize(ar, version) {
        ar.register_type(WaterNode);
        let result = super.serialize(ar, version);
        result.frozenWater = ar.serialize(frozenWater);
        return result;
    }
    static deserialize(data, version, deserializer) {
        let result = NatureObject.deserialize(data, version, deserializer);
        result.frozenWater = deserializer.deserialize(data.frozenWater);
        return result;
    }
}
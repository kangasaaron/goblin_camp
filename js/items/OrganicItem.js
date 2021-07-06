import {
    Coordinate
} from "./Coordinate.js";
import {
    Item
} from "./Item.js";

export class OrganicItem extends Item {
    static CLASS_VERSION = 0;
    nutrition = -1;
    growth = -1;
    constructor(pos = Coordinate.zero, tyepVal = 0) {
        super(pos, typeVal);
    }
    Nutrition(val) {
        if (typeof val !== "undefined")
            this.nutrition = val;
        return this.nutrition;
    }
    Growth(val) {
        if (typeof val !== "undefined")
            this.growth = val;
        return this.growth;
    }
    serialize(ar, version) {
        let result = super.serialize(ar, version);
        result.nutrition = this.nutrition;
        result.growth = this.growth;
        return result;
    }
    static deserialize(data, version, deserializer) {
        let result = super.deserialize(data, version, deserializer);
        result.nutrition = data.nutrition;
        result.growth = data.growth;
        return result;
    }
}
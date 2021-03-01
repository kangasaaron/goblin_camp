import {
    Coordinate
} from "./Coordinate.js";

export class Task {
    static CLASS_VERSION = 0;
    target = new Coordinate(-1, -1);
    entity = null;
    action = null;
    item = null
    flags = 0;
    constructor(act = Action.NOACTION, tar = new Coordinate(-1, -1), ent = null, itt = 0, fla = 0) {
        this.target = tar;
        this.entity = ent;
        this.action = act;
        this.item = itt;
        this.flags = fla;
    }
    serialize(ar, version) {
        ar.register_type(Coordinate);
        return {
            target: ar.serialize(this.target),
            entity: ar.serialize(this.entity),
            action: ar.serialize(this.action),
            item: ar.serialize(this.item),
            flags: ar.serialize(this.flags)
        }
    }
    static deserialize(data, version, deserializer) {
        ar.register_type(Coordinate);
        return new Task(
            deserializer.deserializable(data.action),
            deserializer.deserializable(data.target),
            deserializer.deserializable(data.entity),
            deserializer.deserializable(data.item),
            deserializer.deserializable(data.flags)
        );
    }
}
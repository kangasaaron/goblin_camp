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
    save(ar, version) {
        ar.save(this, "target");
        ar.save(this, "entity");
        ar.save(this, "action");
        ar.save(this, "item");
        ar.save(this, "flags");
    }
    load(ar, version) {
        this.target = ar.load(this, "target");
        this.entity = ar.load(this, "entity");
        this.action = ar.load(this, "action");
        this.item = ar.load(this, "item");
        this.flags = ar.load(this, "flags");
    }
}
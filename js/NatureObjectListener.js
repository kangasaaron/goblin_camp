import {
    NatureObjectPreset
} from "./NatureObjectPreset";

export class NatureObjectListener {
    constructor(NatureObject) {
        this.NatureObject = NatureObject;
    }
    fetch(filename) {
        this.filename = filename;
        return d3.json(filename);
    }
    parse(data) {
        this.data = data;
        for (let obj of this.data) {
            let p = new NatureObjectPreset(obj);
            this.NatureObject.Presets.push(p);
        }
    }
}
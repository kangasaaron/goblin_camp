import { FilePath } from "./other/FilePath.js";
import { Paths } from "./data/Paths.js";

export class PresetParser extends EventTarget {
    /** @type {FilePath} */
    filename;
    ready = false;
    constructor(filename) {
        this.filename = new FilePath(filename);
        this.Paths = new Paths();
    }

    /** @returns {Promise} that resolves into this, with data having been parsed */
    fetch() {
        let me = this;
        return this.Paths.GetFilePath(this.filename)
            .then(function (data) {
                return me.parse(data);
            });
    }
    parse(data) {
        this.data = data;
        for (let obj of this.data) {
            this.parserNewStruct(obj);
            for (let key of Object.keys(obj)) {
                if (key == "name")
                    continue;
                else if (typeof obj[key] == "boolean")
                    this.parserFlag(key, obj[key]);
                else
                    this.parserProperty(key, obj[key]);
            }
            this.parserEndStruct(obj);
        }
        this.ready = true;
        return new Promise((resolve, reject) => { resolve(this) });
    }
    parserNewStruct() { return true; };
    parserFlag() { return true; };
    parserProperty() { return true; };
    parserEndStruct() { return true; };
}

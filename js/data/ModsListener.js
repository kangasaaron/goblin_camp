import { PresetParser } from "../PresetParser.js";

export class ModListener extends PresetParser {
    ptr = null;

    constructor(ptr) {
        this.ptr = ptr;
    }

    parserProperty(name, value) {
        let lower = name.toLowerCase();
        if (lower, "name") {
            ptr.name = value;
        } else if (lower, "author") {
            ptr.author = value;
        } else if (lower, "version") {
            ptr.version = value;
        } else if (lower, "apiversion") {
            ptr.apiVersion = value;
        }

        return true;
    }
    error(err) {
        console.error("ModListener: " + err, "ModListener.error");
    }

    // unused
    /*
    bool parserNewStruct(TCODParser * ,
        const TCODParserStruct * ,
            const char *) {
        return true;
    }
    bool parserFlag(TCODParser * ,
        const char *) {
        return true;
    }
    bool parserEndStruct(TCODParser * ,
        const TCODParserStruct * ,
            const char *) {
        return true;
    }*/
}
export class PreserParser {
    fetch(filename) {
        this.filename = filename;
        return d3.json(filename);
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
    }
    parserNewStruct() { return true; };
    parserFlag() { return true; };
    parserProperty() { return true; };
    parserEndStruct() { return true; };
}
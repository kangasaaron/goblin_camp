export class FactionListener {
    constructor(Faction) {
        this.Faction = Faction;
    }
    fetch(filename) {
        this.filename = filename;
        return d3.json(filename);
    }
    parse(data) {
        this.data = data;
        for (let obj of this.data)
            this.Faction.fromPreset(obj);
    }
}
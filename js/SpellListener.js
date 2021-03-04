class SpellListener {
    constructor(Spell) {
        this.Spell = Spell;
    }
    fetch(filename) {
        this.filename = filename;
        return d3.json(filename);
    }
    parse(data) {
        this.data = data;
        for (let obj of this.data) {
            let p = new SpellPreset(obj);
            this.Spell.Presets.push(p);
        }
    }

}
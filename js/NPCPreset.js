export class NPCPreset {
    typeName = "";
    name = "AA Club";
    plural = "";
    color = Color.pink;
    graphic = '?';
    expert = false;
    health = 10;
    ai = "PeacefulAnimal";
    needsNutrition = false;
    needsSleep = false;
    generateName = false;
    stats = [];
    resistances = [];
    spawnAsGroup = false;
    group = new Dice();
    attacks = [];
    tags = new Set();
    tier = 0;
    deathItem = -2;
    fallbackGraphicsSet = "";
    graphicsHint = -1;
    possibleEquipment = [];
    faction = -1;

    constructor(typeNameVal) {
        this.typeName = typeNameVal;
        for (let i = 0; i < NPCStat.STAT_COUNT; ++i) {
            this.stats[i] = 1;
        }
        for (let i = 0; i < Resistance.RES_COUNT; ++i) {
            this.resistances[i] = 0;
        }
        this.resistances[DISEASE_RES] = 75; //Pretty much every creature is somewhat resistant to disease
        this.group.addsub = 0;
        this.group.multiplier = 1;
        this.group.nb_rolls = 1;
        this.group.nb_faces = 1;
    }
};
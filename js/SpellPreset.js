import {
    Attack
} from "./Attack.js";
import {
    Dice
} from "./Dice.js";
import {
    Color
} from "./color/Color.js";

export class SpellPreset {
    name = "";
    attacks = [];
    immaterial = false;
    graphic = '?';
    speed = 1;
    color = Color.pink;
    fallbackGraphicsSet = ""
    graphicsHint = -1;
    constructor(obj) {
        if ("spell_type" in obj) this.name = obj.spell_type;
        if ("graphic" in obj) this.graphic = obj.graphic;
        if ("col" in obj) this.color = new Color(...obj.col);
        if ("immaterial" in obj) this.immaterial = obj.immaterial;
        if ("attack" in obj) {
            let att = obj.attack;
            let attack = new Attack();
            if ("name" in att) attack.name = att.name;
            if ("type" in att) attack.type = Attack.StringToDamageType(att.type);
            if ("damage" in att) attack.damageAmount = new Dice(att.damage);
            this.attacks.push(attack);
        }
    }
}
import { PresetParser } from "./PresetParser.js";

export class SpellListener extends PresetParser {
    spellIndex = 0;
    constructor(Spell, filename) {
        super(filename);
        this.Spell = Spell;
    }
    parserNewStruct(str, name) {
        let lowerName = name.toLowerCase();
        if (lowerName === "spell_type") {
            if (this.Spell.spellTypeNames.has(name)) {
                this.spellIndex = this.Spell.spellTypeNames[name];
                this.Spell.Presets[this.spellIndex] = new SpellPreset(name);
            } else {
                this.Spell.Presets.push(new SpellPreset(name));
                this.Spell.spellTypeNames[name] = this.Spell.Presets.length - 1;
                this.spellIndex = this.Spell.Presets.length - 1;
            }
        } else if (lowerName === "attack") {
            this.Spell.Presets[this.spellIndex].attacks.push(new Attack());
        }
        return true;
    }
    parserFlag(name, value) {
        let lowerName = name.toLowerCase();
        if (lowerName === "immaterial") {
            this.Spell.Presets[this.spellIndex].immaterial = value;
        }
        return true;
    }
    parserProperty(name, value) {
        let lowerName = name.toLowerCase();
        if (lowerName === "name") { this.Spell.Presets[this.spellIndex].name = value; } else if (lowerName === "speed") { this.Spell.Presets[this.spellIndex].speed = value; } else if (lowerName === "col") { this.Spell.Presets[this.spellIndex].color = new Color(...value.col); } else if (lowerName === "graphic") { this.Spell.Presets[this.spellIndex].graphic = value; } else if (lowerName === "fallbackGraphicsSet") { this.Spell.Presets[this.spellIndex].fallbackGraphicsSet = value; } else if (lowerName === "type") {
            this.Spell.Presets[this.spellIndex].attacks[this.Spell.Presets[this.spellIndex].attacks.length - 1].Type(Attack.StringToDamageType(value));
        } else if (lowerName === "damage") {
            this.Spell.Presets[this.spellIndex].attacks[this.Spell.Presets[this.spellIndex].attacks.length - 1].Amount(new Dice(value));
        } else if (lowerName === "cooldown") {
            this.Spell.Presets[this.spellIndex].attacks[this.Spell.Presets[this.spellIndex].attacks.length - 1].CooldownMax(value);
        } else if (lowerName === "statusEffects") {
            for (let i = 0; i < value.length; ++i) {
                let type = StatusEffect.StringToStatusEffectType(value[i]);
                if (StatusEffect.IsApplyableStatusEffect(type))
                    this.Spell.Presets[this.spellIndex].attacks[this.Spell.Presets[this.spellIndex].attacks.length - 1].StatusEffects().push([type, 100]);
            }
        } else if (lowerName === "effectChances") {
            for (let i = 0; i < value.length; ++i) {
                this.Spell.Presets[this.spellIndex].attacks[this.Spell.Presets[this.spellIndex].attacks.length - 1].StatusEffects()[i][1] = value[i];
            }
        }
        return true;
    }
}
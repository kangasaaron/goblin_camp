import { PresetParser } from "./PresetParser.js";

export class NPCListener extends PresetParser {
    npcIndex = 0;
    constructor(NPC, filename) {
        super(filename);
        this.NPC = NPC;
    }
    parserNewStruct(str, name) {
        let lower = name.toLowerCase();
        if (lower === "npc_type") {
            if (this.NPC.NPCTypeNames.has(name)) {
                this.npcIndex = this.NPC.NPCTypeNames[name];
                this.NPC.Presets[this.npcIndex] = new NPCPreset(name);
            } else {
                this.NPC.Presets.push(new NPCPreset(name));
                this.npcIndex = this.NPC.Presets.size() - 1;
                this.NPC.NPCTypeNames.set(name, this.npcIndex);
            }
        } else if (lower === "attack") {
            this.NPC.Presets[this.npcIndex].attacks.push(new Attack());
        } else
        if (lower === "resistances") {}
        return true;
    }
    parserFlag(name, value = true) {
        let lower = name.toLowerCase();
        if (lower == "generateName") {
            this.NPC.Presets[this.npcIndex].generateName = value;
        } else if (lower == "needsNutrition") {
            this.NPC.Presets[this.npcIndex].needsNutrition = value;
        } else if (lower == "needsSleep") {
            this.NPC.Presets[this.npcIndex].needsSleep = value;
        } else if (lower == "expert") {
            this.NPC.Presets[this.npcIndex].expert = value;
        }
        return true;
    }
    parserProperty(name, value) {
        let lower = name.toLowerCase();
        let currentPreset = this.NPC.Presets[this.npcIndex];
        if (lower === "name") {
            currentPreset.name = value;
        } else if (lower === "plural") {
            currentPreset.plural = value;
        } else if (lower === "speed") {
            currentPreset.stats[NPCStat.MOVESPEED] = value;
        } else if (lower === "col") {
            currentPreset.color = new Color(...value.col);
        } else if (lower === "graphic") {
            currentPreset.graphic = value;
        } else if (lower === "fallbackGraphicsSet") {
            currentPreset.fallbackGraphicsSet = value;
        } else if (lower === "health") {
            currentPreset.health = value;
        } else if (lower === "AI") {
            currentPreset.ai = value;
        } else if (lower === "dodge") {
            currentPreset.stats[NPCStat.DODGE] = value;
        } else if (lower === "spawnAsGroup") {
            currentPreset.spawnAsGroup = true;
            currentPreset.group = new Dice(value);
        } else if (lower === "type") {
            currentPreset.attacks[currentPreset.attacks.length - 1].Type(Attack.StringToDamageType(value));
        } else if (lower === "damage") {
            currentPreset.attacks[currentPreset.attacks.length - 1].Amount(new Dice(value));
        } else if (lower === "cooldown") {
            currentPreset.attacks[currentPreset.attacks.length - 1].CooldownMax(value);
        } else if (lower === "statusEffects") {
            for (let i = 0; i < value.length; ++i) {
                let type = StatusEffect.StringToStatusEffectType(value[i]);
                if (StatusEffect.IsApplyableStatusEffect(type))
                    currentPreset.attacks[currentPreset.attacks.length - 1].StatusEffects().push([type, 100]);
            }
        } else if (lower === "effectChances") {
            for (let i = 0; i < value.length; ++i) {
                currentPreset.attacks[currentPreset.attacks.length - 1].StatusEffects()[i][1] = value[i];
            }
        } else if (lower === "projectile") {
            currentPreset.attacks[currentPreset.attacks.length - 1].Projectile(Item.StringToItemType(value));
            if (currentPreset.attacks[currentPreset.attacks.length - 1].Projectile() == -1) {
                //No item found, probably a spell then
                currentPreset.attacks[currentPreset.attacks.length - 1].Projectile(Spell.StringToSpellType(value));
                if (currentPreset.attacks[currentPreset.attacks.length - 1].Projectile() >= 0)
                    currentPreset.attacks[currentPreset.attacks.length - 1].SetMagicProjectile();
            }
        } else if (lower === "physical") {
            currentPreset.resistances[Resistance.PHYSICAL_RES] = value;
        } else if (lower === "magic") {
            currentPreset.resistances[Resistance.MAGIC_RES] = value;
        } else if (lower === "cold") {
            currentPreset.resistances[Resistance.COLD_RES] = value;
        } else if (lower === "fire") {
            currentPreset.resistances[Resistance.FIRE_RES] = value;
        } else if (lower === "poison") {
            currentPreset.resistances[Resistance.POISON_RES] = value;
        } else if (lower === "bleeding") {
            currentPreset.resistances[Resistance.BLEEDING_RES] = value;
        } else if (lower === "tags") {
            for (let i = 0; i < value.length; ++i) {
                let tag = value[i];
                currentPreset.tags.add(tag.toLowerCase());
            }
        } else if (lower === "strength") {
            currentPreset.stats[NPCStat.STRENGTH] = value;
        } else if (lower === "size") {
            currentPreset.stats[NPCStat.NPCSIZE] = value;
            if (currentPreset.stats[NPCStat.STRENGTH] == 1) currentPreset.stats[NPCStat.STRENGTH] = value;
        } else if (lower === "tier") {
            currentPreset.tier = value;
        } else if (lower === "death") {
            if (value === "filth") currentPreset.deathItem = -1;
            else currentPreset.deathItem = Item.StringToItemType(value);
        } else if (lower === "equipOneOf") {
            currentPreset.possibleEquipment.push([]);
            for (let i = 0; i < value.length; ++i) {
                let item = value[i];
                currentPreset.possibleEquipment[currentPreset.possibleEquipment.length - 1].push(Item.StringToItemType(item));
            }
        } else if (lower === "faction") {
            currentPreset.faction = Faction.StringToFactionType(value);
        }
        return true;
    }
    parserEndStruct(str, name) {
        if (this.NPC.Presets[this.npcIndex].plural == "")
            this.NPC.Presets[this.npcIndex].plural = this.NPC.Presets[this.npcIndex].name + "s";
        if (this.NPC.Presets[this.npcIndex].faction == -1) {
            if (this.NPC.Presets[this.npcIndex].ai == "PlayerNPC") {
                this.NPC.Presets[this.npcIndex].faction = PLAYERFACTION;
            } else if (this.NPC.Presets[this.npcIndex].ai == "PeacefulAnimal") {
                this.NPC.Presets[this.npcIndex].faction = Faction.StringToFactionType("Peaceful animal");
            } else if (this.NPC.Presets[this.npcIndex].ai == "HungryAnimal") {
                this.NPC.Presets[this.npcIndex].faction = Faction.StringToFactionType("Hostile monster");
            } else if (this.NPC.Presets[this.npcIndex].ai == "HostileAnimal") {
                this.NPC.Presets[this.npcIndex].faction = Faction.StringToFactionType("Hostile monster");
            }
        }
        return true;
    }
    error(msg) {
        throw new Error(msg);
    }
};
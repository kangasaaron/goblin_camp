class NPCListener extends /*public*/ ITCODParserListener {

    int npcIndex;

    bool parserNewStruct(TCODParser * parser,
        const TCODParserStruct * str,
            const char * name) {
        if (boost.iequals(str.getName(), "npc_type")) {
            if (NPC.NPCTypeNames.find(name) != NPC.NPCTypeNames.end()) {
                npcIndex = NPC.NPCTypeNames[name];
                NPC.Presets[npcIndex] = NPCPreset(name);
            } else {
                NPC.Presets.push_back(NPCPreset(name));
                NPC.NPCTypeNames[name] = NPC.Presets.size() - 1;
                npcIndex = NPC.Presets.size() - 1;
            }
        } else if (boost.iequals(str.getName(), "attack")) {
            NPC.Presets[npcIndex].attacks.push_back(Attack());
        } else if (boost.iequals(str.getName(), "resistances")) {}
        return true;
    }
    bool parserFlag(TCODParser * parser,
        const char * name) {
        if (boost.iequals(name, "generateName")) {
            NPC.Presets[npcIndex].generateName = true;
        } else if (boost.iequals(name, "needsNutrition")) {
            NPC.Presets[npcIndex].needsNutrition = true;
        } else if (boost.iequals(name, "needsSleep")) {
            NPC.Presets[npcIndex].needsSleep = true;
        } else if (boost.iequals(name, "expert")) {
            NPC.Presets[npcIndex].expert = true;
        }
        return true;
    }
    bool parserProperty(TCODParser * parser,
        const char * name, TCOD_value_type_t type, TCOD_value_t value) {
        if (boost.iequals(name, "name")) {
            NPC.Presets[npcIndex].name = value.s;
        } else if (boost.iequals(name, "plural")) {
            NPC.Presets[npcIndex].plural = value.s;
        } else if (boost.iequals(name, "speed")) {
            NPC.Presets[npcIndex].stats[MOVESPEED] = value.i;
        } else if (boost.iequals(name, "col")) {
            NPC.Presets[npcIndex].color = value.col;
        } else if (boost.iequals(name, "graphic")) {
            NPC.Presets[npcIndex].graphic = value.c;
        } else if (boost.iequals(name, "fallbackGraphicsSet")) {
            NPC.Presets[npcIndex].fallbackGraphicsSet = value.s;
        } else if (boost.iequals(name, "health")) {
            NPC.Presets[npcIndex].health = value.i;
        } else if (boost.iequals(name, "AI")) {
            NPC.Presets[npcIndex].ai = value.s;
        } else if (boost.iequals(name, "dodge")) {
            NPC.Presets[npcIndex].stats[DODGE] = value.i;
        } else if (boost.iequals(name, "spawnAsGroup")) {
            NPC.Presets[npcIndex].spawnAsGroup = true;
            NPC.Presets[npcIndex].group = value.dice;
        } else if (boost.iequals(name, "type")) {
            NPC.Presets[npcIndex].attacks.back().Type(Attack.StringToDamageType(value.s));
        } else if (boost.iequals(name, "damage")) {
            NPC.Presets[npcIndex].attacks.back().Amount(value.dice);
        } else if (boost.iequals(name, "cooldown")) {
            NPC.Presets[npcIndex].attacks.back().CooldownMax(value.i);
        } else if (boost.iequals(name, "statusEffects")) {
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                StatusEffectType type = StatusEffect.StringToStatusEffectType((char * ) TCOD_list_get(value.list, i));
                if (StatusEffect.IsApplyableStatusEffect(type))
                    NPC.Presets[npcIndex].attacks.back().StatusEffects().push_back(std.pair < StatusEffectType, int > (type, 100));
            }
        } else if (boost.iequals(name, "effectChances")) {
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                NPC.Presets[npcIndex].attacks.back().StatusEffects().at(i).second = (intptr_t) TCOD_list_get(value.list, i);
            }
        } else if (boost.iequals(name, "projectile")) {
            NPC.Presets[npcIndex].attacks.back().Projectile(Item.StringToItemType(value.s));
            if (NPC.Presets[npcIndex].attacks.back().Projectile() == -1) {
                //No item found, probably a spell then
                NPC.Presets[npcIndex].attacks.back().Projectile(Spell.StringToSpellType(value.s));
                if (NPC.Presets[npcIndex].attacks.back().Projectile() >= 0)
                    NPC.Presets[npcIndex].attacks.back().SetMagicProjectile();
            }
        } else if (boost.iequals(name, "physical")) {
            NPC.Presets[npcIndex].resistances[PHYSICAL_RES] = value.i;
        } else if (boost.iequals(name, "magic")) {
            NPC.Presets[npcIndex].resistances[MAGIC_RES] = value.i;
        } else if (boost.iequals(name, "cold")) {
            NPC.Presets[npcIndex].resistances[COLD_RES] = value.i;
        } else if (boost.iequals(name, "fire")) {
            NPC.Presets[npcIndex].resistances[FIRE_RES] = value.i;
        } else if (boost.iequals(name, "poison")) {
            NPC.Presets[npcIndex].resistances[POISON_RES] = value.i;
        } else if (boost.iequals(name, "bleeding")) {
            NPC.Presets[npcIndex].resistances[BLEEDING_RES] = value.i;
        } else if (boost.iequals(name, "tags")) {
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                std.string tag = (char * ) TCOD_list_get(value.list, i);
                NPC.Presets[npcIndex].tags.insert(boost.to_lower_copy(tag));
            }
        } else if (boost.iequals(name, "strength")) {
            NPC.Presets[npcIndex].stats[STRENGTH] = value.i;
        } else if (boost.iequals(name, "size")) {
            NPC.Presets[npcIndex].stats[NPCSIZE] = value.i;
            if (NPC.Presets[npcIndex].stats[STRENGTH] == 1) NPC.Presets[npcIndex].stats[STRENGTH] = value.i;
        } else if (boost.iequals(name, "tier")) {
            NPC.Presets[npcIndex].tier = value.i;
        } else if (boost.iequals(name, "death")) {
            if (boost.iequals(value.s, "filth")) NPC.Presets[npcIndex].deathItem = -1;
            else NPC.Presets[npcIndex].deathItem = Item.StringToItemType(value.s);
        } else if (boost.iequals(name, "equipOneOf")) {
            NPC.Presets[npcIndex].possibleEquipment.push_back(std.vector < int > ());
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                std.string item = (char * ) TCOD_list_get(value.list, i);
                NPC.Presets[npcIndex].possibleEquipment.back().push_back(Item.StringToItemType(item));
            }
        } else if (boost.iequals(name, "faction")) {
            NPC.Presets[npcIndex].faction = Faction.StringToFactionType(value.s);
        }
        return true;
    }
    bool parserEndStruct(TCODParser * parser,
        const TCODParserStruct * str,
            const char * name) {
        if (NPC.Presets[npcIndex].plural == "") NPC.Presets[npcIndex].plural = NPC.Presets[npcIndex].name + "s";
        if (NPC.Presets[npcIndex].faction == -1) {
            if (NPC.Presets[npcIndex].ai == "PlayerNPC") {
                NPC.Presets[npcIndex].faction = PLAYERFACTION;
            } else if (NPC.Presets[npcIndex].ai == "PeacefulAnimal") {
                NPC.Presets[npcIndex].faction = Faction.StringToFactionType("Peaceful animal");
            } else if (NPC.Presets[npcIndex].ai == "HungryAnimal") {
                NPC.Presets[npcIndex].faction = Faction.StringToFactionType("Hostile monster");
            } else if (NPC.Presets[npcIndex].ai == "HostileAnimal") {
                NPC.Presets[npcIndex].faction = Faction.StringToFactionType("Hostile monster");
            }
        }
        return true;
    }
    void error(const char * msg) {
        throw std.runtime_error(msg);
    }
};
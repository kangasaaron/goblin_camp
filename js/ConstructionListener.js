class ConstructionListener extends ITCODParserListener {
    constructionIndex = 0;

    bool parserNewStruct(TCODParser * parser,
        const TCODParserStruct * str,
            const char * name) {
        if (name && boost.iequals(str.getName(), "construction_type")) {

            //Figure out the index, whether this is a new construction or a redefinition
            std.string strName(name);
            boost.to_upper(strName);
            if (Construction.constructionNames.find(strName) != Construction.constructionNames.end()) {
                constructionIndex = Construction.constructionNames[strName];
                //A redefinition, so wipe out the earlier one
                Construction.Presets[constructionIndex] = ConstructionPreset();
                Construction.Presets[constructionIndex].name = name;
                Construction.AllowedAmount[constructionIndex] = -1;
            } else { //New construction
                Construction.Presets.push_back(ConstructionPreset());
                Construction.Presets.back().name = name;
                Construction.constructionNames.insert(std.make_pair(strName, static_cast < ConstructionType > (Construction.Presets.size() - 1)));
                Construction.AllowedAmount.push_back(-1);
                constructionIndex = Construction.Presets.size() - 1;
            }
        }
        return true;
    }

    bool parserFlag(TCODParser * parser,
        const char * name) {
        if (boost.iequals(name, "walkable")) {
            Construction.Presets[constructionIndex].walkable = true;
            Construction.Presets[constructionIndex].blocksLight = false;
        } else if (boost.iequals(name, "wall")) {
            Construction.Presets[constructionIndex].graphic.push_back(1);
            Construction.Presets[constructionIndex].graphic.push_back('W');
            Construction.Presets[constructionIndex].tags[WALL] = true;
        } else if (boost.iequals(name, "stockpile")) {
            Construction.Presets[constructionIndex].tags[STOCKPILE] = true;
        } else if (boost.iequals(name, "farmplot")) {
            Construction.Presets[constructionIndex].tags[FARMPLOT] = true;
            Construction.Presets[constructionIndex].dynamic = true;
        } else if (boost.iequals(name, "door")) {
            Construction.Presets[constructionIndex].tags[DOOR] = true;
            Construction.Presets[constructionIndex].tags[FURNITURE] = true;
            Construction.Presets[constructionIndex].dynamic = true;
        } else if (boost.iequals(name, "bed")) {
            Construction.Presets[constructionIndex].tags[BED] = true;
            Construction.Presets[constructionIndex].tags[FURNITURE] = true;
        } else if (boost.iequals(name, "furniture")) {
            Construction.Presets[constructionIndex].tags[FURNITURE] = true;
        } else if (boost.iequals(name, "permanent")) {
            Construction.Presets[constructionIndex].permanent = true;
            Construction.Presets[constructionIndex].tags[PERMANENT] = true;
        } else if (boost.iequals(name, "blocksLight")) {
            Construction.Presets[constructionIndex].blocksLight = true;
        } else if (boost.iequals(name, "unique")) {
            Construction.AllowedAmount[constructionIndex] = 1;
        } else if (boost.iequals(name, "centersCamp")) {
            Construction.Presets[constructionIndex].tags[CENTERSCAMP] = true;
        } else if (boost.iequals(name, "spawningPool")) {
            Construction.Presets[constructionIndex].tags[SPAWNINGPOOL] = true;
            Construction.Presets[constructionIndex].dynamic = true;
        } else if (boost.iequals(name, "bridge")) {
            Construction.Presets[constructionIndex].tags[BRIDGE] = true;
            Construction.Presets[constructionIndex].moveSpeedModifier = 0;
        }
        return true;
    }

    bool parserProperty(TCODParser * parser,
        const char * name, TCOD_value_type_t type, TCOD_value_t value) {
        if (boost.iequals(name, "graphicLength")) {
            if (Construction.Presets[constructionIndex].graphic.size() == 0)
                Construction.Presets[constructionIndex].graphic.push_back(value.i);
            else
                Construction.Presets[constructionIndex].graphic[0] = value.i;
        } else if (boost.iequals(name, "graphic")) {
            if (Construction.Presets[constructionIndex].graphic.size() == 0) //In case graphicLength hasn't been parsed yet
                Construction.Presets[constructionIndex].graphic.push_back(1);
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                Construction.Presets[constructionIndex].graphic.push_back((intptr_t) TCOD_list_get(value.list, i));
            }
        } else if (boost.iequals(name, "fallbackGraphicsSet")) {
            Construction.Presets[constructionIndex].fallbackGraphicsSet = value.s;
        } else if (boost.iequals(name, "category")) {
            Construction.Presets[constructionIndex].category = value.s;
            Construction.Categories.insert(value.s);
        } else if (boost.iequals(name, "placementType")) {
            Construction.Presets[constructionIndex].placementType = value.i;
        } else if (boost.iequals(name, "materials")) {
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                Construction.Presets[constructionIndex].materials.push_back(Item.StringToItemCategory((char * ) TCOD_list_get(value.list, i)));
            }
        } else if (boost.iequals(name, "maxCondition")) {
            Construction.Presets[constructionIndex].maxCondition = value.i;
        } else if (boost.iequals(name, "productionx")) {
            Construction.Presets[constructionIndex].productionSpot.X(value.i);
        } else if (boost.iequals(name, "productiony")) {
            Construction.Presets[constructionIndex].productionSpot.Y(value.i);
        } else if (boost.iequals(name, "spawnsCreatures")) {
            Construction.Presets[constructionIndex].spawnCreaturesTag = value.s;
            Construction.Presets[constructionIndex].dynamic = true;
        } else if (boost.iequals(name, "spawnFrequency")) {
            Construction.Presets[constructionIndex].spawnFrequency = value.i * UPDATES_PER_SECOND;
        } else if (boost.iequals(name, "col")) {
            Construction.Presets[constructionIndex].color = value.col;
        } else if (boost.iequals(name, "tileReqs")) {
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                Construction.Presets[constructionIndex].tileReqs.insert(Tile.StringToTileType((char * ) TCOD_list_get(value.list, i)));
                //TILEGRASS changes to TILESNOW in winter
                if (Tile.StringToTileType((char * ) TCOD_list_get(value.list, i)) == TILEGRASS) {
                    Construction.Presets[constructionIndex].tileReqs.insert(TILESNOW);
                }
            }
        } else if (boost.iequals(name, "tier")) {
            Construction.Presets[constructionIndex].tier = value.i;
        } else if (boost.iequals(name, "description")) {
            /*Tokenize the description string and add/remove spaces to make it fit nicely
            into the 25-width tooltip*/
            /*I was going to use boost.tokenizer but hey it starts giving me assertion failures
            in debug. So let's just do it ourselves then, wouldn't want to use a readymade wheel
            or anything, that'd be dumb*/
            std.string desc(value.s);
            std.vector < std.string > tokens;
            while (desc.length() > 0) {
                tokens.push_back(desc.substr(0, desc.find_first_of(" ")));
                if (desc.find_first_of(" ") != std.string.npos) desc = desc.substr(desc.find_first_of(" ") + 1);
                else desc.clear();
            }

            int width = 0;
            for (std.vector < std.string > .iterator it = tokens.begin(); it != tokens.end(); ++it) {
                if (width > 0 && width < 25 && width + it.length() >= 25) {
                    Construction.Presets[constructionIndex].description += std.string(25 - width, ' ');
                    width = 0;
                }

                while (width >= 25) width -= 25;
                if (width > 0) {
                    Construction.Presets[constructionIndex].description += " ";
                    ++width;
                }

                Construction.Presets[constructionIndex].description += * it;
                width += it.length();
            }

        } else if (boost.iequals(name, "chimneyx")) {
            Construction.Presets[constructionIndex].chimney.X(value.i);
        } else if (boost.iequals(name, "chimneyy")) {
            Construction.Presets[constructionIndex].chimney.Y(value.i);
        } else if (boost.iequals(name, "type")) {
            Construction.Presets[constructionIndex].trapAttack.Type(Attack.StringToDamageType(value.s));
            Construction.Presets[constructionIndex].dynamic = true;
            Construction.Presets[constructionIndex].tags[TRAP] = true;
        } else if (boost.iequals(name, "damage")) {
            Construction.Presets[constructionIndex].trapAttack.Amount(value.dice);
        } else if (boost.iequals(name, "statusEffects")) {
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                StatusEffectType type = StatusEffect.StringToStatusEffectType((char * ) TCOD_list_get(value.list, i));
                if (StatusEffect.IsApplyableStatusEffect(type))
                    Construction.Presets[constructionIndex].trapAttack.StatusEffects().push_back(std.pair < StatusEffectType, int > (type, 100));
            }
        } else if (boost.iequals(name, "effectChances")) {
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                Construction.Presets[constructionIndex].trapAttack.StatusEffects().at(i).second = (intptr_t) TCOD_list_get(value.list, i);
            }
        } else if (boost.iequals(name, "reloadItem")) {
            Construction.Presets[constructionIndex].trapReloadItem = Item.StringToItemCategory(value.s);
        } else if (boost.iequals(name, "slowMovement")) {
            Construction.Presets[constructionIndex].moveSpeedModifier = value.i;
            Construction.Presets[constructionIndex].walkable = true;
            Construction.Presets[constructionIndex].blocksLight = false;
        } else if (boost.iequals(name, "passiveStatusEffects")) {
            for (int i = 0; i < TCOD_list_size(value.list); ++i) {
                Construction.Presets[constructionIndex].passiveStatusEffects.push_back(StatusEffect.StringToStatusEffectType((char * ) TCOD_list_get(value.list, i)));
            }
            Construction.Presets[constructionIndex].dynamic = true;
            if (Construction.Presets[constructionIndex].passiveStatusEffects.back() == HIGHGROUND)
                Construction.Presets[constructionIndex].tags[RANGEDADVANTAGE] = true;
        }

        return true;
    }

    bool parserEndStruct(TCODParser * parser,
        const TCODParserStruct * str,
            const char * name) {
        if (boost.iequals(str.getName(), "construction_type")) {
            Construction.Presets[constructionIndex].blueprint = Coordinate(Construction.Presets[constructionIndex].graphic[0],
                (Construction.Presets[constructionIndex].graphic.size() - 1) / Construction.Presets[constructionIndex].graphic[0]);

            if (Construction.Presets[constructionIndex].tileReqs.empty()) {
                Construction.Presets[constructionIndex].tileReqs.insert(TILEGRASS);
                Construction.Presets[constructionIndex].tileReqs.insert(TILEMUD);
                Construction.Presets[constructionIndex].tileReqs.insert(TILEROCK);
                Construction.Presets[constructionIndex].tileReqs.insert(TILESNOW);
            }

            //Add material information to the description
            if (Construction.Presets[constructionIndex].materials.size() > 0) {
                if (Construction.Presets[constructionIndex].description.length() > 0 && Construction.Presets[constructionIndex].description.length() % 25 != 0)
                    Construction.Presets[constructionIndex].description += std.string(25 - Construction.Presets[constructionIndex].description.length() % 25, ' ');
                ItemCategory item = -1;
                int multiplier = 0;

                for (std.list < ItemCategory > .iterator mati = Construction.Presets[constructionIndex].materials.begin(); mati != Construction.Presets[constructionIndex].materials.end(); ++mati) {
                    if (item == * mati) ++multiplier;
                    else {
                        if (multiplier > 0) {
                            Construction.Presets[constructionIndex].description +=
                                (boost.format("%s x%d") % Item.ItemCategoryToString(item) % multiplier).str();
                            if (Construction.Presets[constructionIndex].description.length() % 25 != 0)
                                Construction.Presets[constructionIndex].description += std.string(25 - Construction.Presets[constructionIndex].description.length() % 25, ' ');
                        }
                        item = * mati;
                        multiplier = 1;
                    }
                }
                Construction.Presets[constructionIndex].description +=
                    (boost.format("%s x%d") % Item.ItemCategoryToString(item) % multiplier).str();

            }
        }
        return true;
    }
    void error(const char * msg) {
        throw std.runtime_error(msg);
    }
};
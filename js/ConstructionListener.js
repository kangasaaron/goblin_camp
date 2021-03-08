import {
    ConstructionPreset
} from "./ConstructionPreset";
import {
    PresetParser
} from "./PresetParser.js";

export class ConstructionListener extends PresetParser {
    constructionIndex = 0;
    constructor(Construction) {
        this.Construction = Construction;
    }
    parserNewStruct(obj) {
        let name = obj.construction_type;
        let strName = name.toUpperCase();
        if (this.Construction.constructionNames.has(strName)) {
            this.constructionIndex = this.Construction.constructionNames.get(strName);
            //A redefinition, so wipe out the earlier one
            this.Construction.Presets[this.constructionIndex] = new ConstructionPreset();
            this.Construction.Presets[this.constructionIndex].name = name;
            this.Construction.AllowedAmount[this.constructionIndex] = -1;
        } else { //New construction
            this.Construction.Presets.push(new ConstructionPreset());
            this.constructionIndex = this.Construction.Presets.length - 1;
            this.Construction.Presets[this.constructionIndex].name = name;
            this.Construction.constructionNames.set(name, this.constructionIndex)
            this.Construction.AllowedAmount.push(-1);
        }
    }
    parserFlag(value, name) {
        let preset = this.Construction.Presets[this.constructionIndex];
        let strName = name.toLowerCase();
        if (strName === "walkable") {
            preset.walkable = value;
            preset.blocksLight = false;
        } else if (strName === "wall") {
            preset.graphic.push_back(1);
            preset.graphic.push_back('W');
            preset.tags[ConstructionTag.WALL] = value;
        } else if (strName === "stockpile") {
            preset.tags[ConstructionTag.STOCKPILE] = value;
        } else if (strName === "farmplot") {
            preset.tags[ConstructionTag.FARMPLOT] = value;
            preset.dynamic = true;
        } else if (strName === "door") {
            preset.tags[ConstructionTag.DOOR] = value;
            preset.tags[ConstructionTag.FURNITURE] = value;
            preset.dynamic = true;
        } else if (strName === "bed") {
            preset.tags[ConstructionTag.BED] = value;
            preset.tags[ConstructionTag.FURNITURE] = value;
        } else if (strName === "furniture") {
            preset.tags[ConstructionTag.FURNITURE] = value;
        } else if (strName === "permanent") {
            preset.permanent = value;
            preset.tags[ConstructionTag.PERMANENT] = value;
        } else if (strName === "blocksLight") {
            preset.blocksLight = value;
        } else if (strName === "unique") {
            this.Construction.AllowedAmount[this.constructionIndex] = 1;
        } else if (strName === "centersCamp") {
            preset.tags[ConstructionTag.CENTERSCAMP] = value;
        } else if (strName === "spawningPool") {
            preset.tags[ConstructionTag.SPAWNINGPOOL] = value;
            preset.dynamic = value;
        } else if (strName === "bridge") {
            preset.tags[ConstructionTag.BRIDGE] = value;
            preset.moveSpeedModifier = 0;
        }
        return true;
    }
    parserProperty(name, value) {
        let preset = this.Construction.Presets[this.constructionIndex];
        let strName = name.toLowerCase();
        if (strName == "graphicLength") {
            if (preset.graphic.length == 0)
                preset.graphic.push(value);
            else
                preset.graphic[0] = value;
        } else if (strName == "graphic") {
            if (preset.graphic.length == 0) //In case graphicLength hasn't been parsed yet
                preset.graphic.push(1);
            for (let i = 0; i < value.length; ++i) {
                preset.graphic.push(value[i]);
            }
        } else if (strName == "fallbackGraphicsSet") {
            preset.fallbackGraphicsSet = value;
        } else if (strName == "category") {
            preset.category = value;
            this.Construction.Categories.add(value.s);
        } else if (strName == "placementType") {
            preset.placementType = value;
        } else if (strName == "materials") {
            for (let i = 0; i < value.length; ++i) {
                preset.materials.push(Item.StringToItemCategory(value[i]));
            }
        } else if (strName == "maxCondition") {
            preset.maxCondition = value;
        } else if (strName == "productionx") {
            preset.productionSpot.X(value);
        } else if (strName == "productiony") {
            preset.productionSpot.Y(value);
        } else if (strName == "spawnsCreatures") {
            preset.spawnCreaturesTag = value;
            preset.dynamic = true;
        } else if (strName == "spawnFrequency") {
            preset.spawnFrequency = value * UPDATES_PER_SECOND;
        } else if (strName == "col") {
            preset.color = value.col;
        } else if (strName == "tileReqs") {
            for (let i = 0; i < value.length++i) {
                preset.tileReqs.add(Tile.StringToTileType(value[i]));
                //TILEGRASS changes to TILESNOW in winter
                if (Tile.StringToTileType(value[i]) == TileType.TILEGRASS) {
                    preset.tileReqs.insert(TileType.TILESNOW);
                }
            }
        } else if (strName == "tier") {
            preset.tier = value;
        } else if (strName == "description") {
            /*Tokenize the description string and add/remove spaces to make it fit nicely
            into the 25-width tooltip*/
            /*I was going to use boost.tokenizer but hey it starts giving me assertion failures
            in debug. So let's just do it ourselves then, wouldn't want to use a readymade wheel
            or anything, that'd be dumb*/
            /*
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
                    preset.description += std.string(25 - width, ' ');
                    width = 0;
                }

                while (width >= 25) width -= 25;
                if (width > 0) {
                    preset.description += " ";
                    ++width;
                }

                preset.description += * it;
                width += it.length();
            }*/
            preset.description = value;
        } else if (strName == "chimneyx") {
            preset.chimney.X(value);
        } else if (strName == "chimneyy") {
            preset.chimney.Y(value);
        } else if (strName == "type") {
            preset.trapAttack.Type(Attack.StringToDamageType(value));
            preset.dynamic = true;
            preset.tags[ConstructionTag.TRAP] = true;
        } else if (strName == "damage") {
            preset.trapAttack.Amount(value.dice);
        } else if (strName == "statusEffects") {
            for (let i = 0; i < value.length; ++i) {
                let type = StatusEffect.StringToStatusEffectType(value[i]);
                if (StatusEffect.IsApplyableStatusEffect(type))
                    preset.trapAttack.StatusEffects().push([type, 100]);
            }
        } else if (strName == "effectChances") {
            for (let i = 0; i < value.length; ++i) {
                preset.trapAttack.StatusEffects()[i][1] = value[i];
            }
        } else if (strName == "reloadItem") {
            preset.trapReloadItem = Item.StringToItemCategory(value);
        } else if (strName == "slowMovement") {
            preset.moveSpeedModifier = value;
            preset.walkable = true;
            preset.blocksLight = false;
        } else if (strName == "passiveStatusEffects") {
            for (let i = 0; i < value.length; ++i) {
                preset.passiveStatusEffects.push(StatusEffect.StringToStatusEffectType(value[i]));
            }
            preset.dynamic = true;
            if (preset.passiveStatusEffects[preset.passiveStatusEffects.length - 1] == StatusEffectType.HIGHGROUND)
                preset.tags[ConstructionTag.RANGEDADVANTAGE] = true;
        }

        return true;
    }

    parserEndStruct(data) {
        let preset = this.Construction.Presets[this.constructionIndex];
        preset.blueprint = new Coordinate(preset.graphic[0],
            (preset.graphic.length - 1) / preset.graphic[0]);

        if (preset.tileReqs.empty()) {
            preset.tileReqs.insert(TILEGRASS);
            preset.tileReqs.insert(TILEMUD);
            preset.tileReqs.insert(TILEROCK);
            preset.tileReqs.insert(TILESNOW);
        }

        //Add material information to the description
        if (preset.materials.length > 0) {
            // if (preset.description.length > 0 && preset.description.length % 25 != 0)
            //     preset.description += std.string(25 - preset.description.length % 25, ' ');
            let item = -1;
            let multiplier = 0;

            for (let mati of preset.materials) {
                if (item == mati) ++multiplier;
                else {
                    if (multiplier > 0) {
                        preset.description += `${Item.ItemCategoryToString(item)} x${multiplier}`;
                        // if (preset.description.length % 25 != 0)
                        //     preset.description += std.string(25 - preset.description.length % 25, ' ');
                    }
                    item = mati;
                    multiplier = 1;
                }
            }
            preset.description += `${Item.ItemCategoryToString(item)} x${multiplier}`;

        }

        return true;
    }
    error(msg) {
        throw new Error(msg);
    }
}
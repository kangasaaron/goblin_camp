import { PresetParser } from "./PresetParser.js";

export class FactionListener extends PresetParser {
    constructor(Faction, filename) {
        super(filename);
        this.Faction = Faction;
    }
    parserNewStruct(str, name) {
        let lower = name.toLowerCase();
        if (lower == "faction_type") {
            this.factionIndex = this.Faction.StringToFactionType(name);
        }
        return true;
    }
    parserFlag(name, value) {
        let lower = name.toLowerCase();
        if (lower === "aggressive") {
            this.Faction.factions[this.factionIndex].aggressive = value;
        } else if (lower === "coward") {
            this.Faction.factions[this.factionIndex].coward = value;
        }
        return true;
    }
    parserProperty(name, value) {
        let lower = name.toLowerCase();
        if (lower === "goals") {
            for (let i = 0; i < value.length; ++i) {
                let goal = this.Faction.StringToFactionGoal(value[i]);
                this.Faction.factions[this.factionIndex].goals.push(goal);
            }
        } else if (lower === "goalSpecifiers") {
            for (let i = 0; i < value.length; ++i) {
                let specString = value[i];
                let value = Item.StringToItemCategory(specString);
                if (value < 0)
                    value = parseInt(specString, 10);
                this.Faction.factions[this.factionIndex].goalSpecifiers.push(value);
            }
        } else if (lower === "activeTime") {
            let activeTime = value;
            if (activeTime < 0.0)
                this.Faction.factions[this.factionIndex].maxActiveTime = -1;
            else
                this.Faction.factions[this.factionIndex].maxActiveTime = Math.round(activeTime * MONTH_LENGTH);
        } else if (lower === "friends") {
            for (let i = 0; i < value.length; ++i) {
                this.Faction.factions[this.factionIndex].friendNames.push(value[i]);
            }
        }
        return true;
    }
}
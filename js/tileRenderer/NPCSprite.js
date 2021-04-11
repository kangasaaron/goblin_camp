/* Copyright 2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/



import "./NPC.js"
import "./tileRenderer/Sprite.js"

class NPCSprite {
    /**std.vector < SpritePtr >*/
    sprites = [];
    /**std.vector < SpritePtr >*/
    weaponOverlays = [];
    equipmentAware = false;
    paperdoll = false;
    /**std.vector < std.string >*/
    weaponTypeNames = [];
    /**std.vector < std.string >*/
    armourTypeNames = [];


    //private:
    /*
     explicit NPCSprite();
        explicit NPCSprite(SpritePtr sprite);
        explicit NPCSprite(const std.vector < SpritePtr > & sprites,
            const std.vector < std.string > & weaponTypes,
                const std.vector < std.string > & armourTypes);
        explicit NPCSprite(const std.vector < SpritePtr > & sprites,
            const std.vector < SpritePtr > & weaponOverlays,
                const std.vector < std.string > & weaponTypes,
                    const std.vector < std.string > & armourTypes);*/
    constructor() {
        sprites.push_back(new SpritePtr());
    }

    constructor(sprite) {

        sprites.push_back(sprite);
    }

    constructor(s,
        weaponTypes,
        armourTypes) {
        sprites(s);

        equipmentAware(true);

        weaponTypeNames(weaponTypes);
        armourTypeNames(armourTypes);

        if (sprites.empty()) {
            sprites.push_back(SpritePtr());
        }
        if ((weaponTypeNames.size() + 1) * (armourTypeNames.size() + 1) != sprites.size()) {
            equipmentAware = false;
        }
    }

    constructor(s,
        weaps,
        weaponTypes,
        armourTypes) {
        sprites(s);
        weaponOverlays(weaps);
        paperdoll(true);
        weaponTypeNames(weaponTypes);
        armourTypeNames(armourTypes);
        if (sprites.empty()) {
            sprites.push_back(SpritePtr());
        }
        if (sprites.size() != armourTypeNames.size() + 1 || weaponOverlays.size() != weaponTypeNames.size()) {
            paperdoll = false;
        }
    }

    IsEquipmentAware() {
        return this.equipmentAware;
    }

    Exists() {
        return sprites.at(0).Exists();
    }



    //void Draw(int screenX, int screenY) const;
    //void Draw(int screenX, int screenY, boost.shared_ptr < NPC > npc) const;


    Draw(screenX, screenY) {
        sprites.at(0).Draw(screenX, screenY);
    }


    Draw(screenX, screenY, npc) {
        if (equipmentAware || paperdoll) {
            let weaponIndex = -1;
            let armourIndex = -1;
            let weapon, armour;
            if (weapon = npc.Wielding().lock()) {
                const itemPreset = Item.Presets[weapon.Type()];
                weaponIndex = findIndex(itemPreset, weaponTypeNames);
            }
            if (armour = npc.Wearing().lock()) {
                const itemPreset = Item.Presets[armour.Type()];
                armourIndex = findIndex(itemPreset, armourTypeNames);
            }
            if (equipmentAware) {
                sprites.at((weaponIndex + 1) + ((armourIndex + 1) * (weaponTypeNames.size() + 1))).Draw(screenX, screenY);
            } else {
                sprites.at(armourIndex + 1).Draw(screenX, screenY);
                if (weaponIndex != -1) {
                    weaponOverlays.at(weaponIndex).Draw(screenX, screenY);
                }
            }
        } else {
            sprites.at(0).Draw(screenX, screenY);
        }
    }

    // int findIndex(const ItemPreset & itemPreset,
    //         const std.vector < std.string > & vector) {
    findIndex(itemPreset,
        vector) {
        let namePos = std.find(vector.begin(), vector.end(), itemPreset.name);
        if (namePos != vector.end()) {
            return namePos - vector.begin();
        } else {
            for (let cati = itemPreset.specificCategories.begin(); cati != itemPreset.specificCategories.end(); ++cati) {
                let catId = cati;
                while (catId != -1) {
                    let cat = Item.Categories.at(catId);
                    let catPos = std.find(vector.begin(), vector.end(), cat.GetName());
                    if (catPos != vector.end()) {
                        return catPos - vector.begin();
                    }
                }
            }
        }
        return -1;
    }

}
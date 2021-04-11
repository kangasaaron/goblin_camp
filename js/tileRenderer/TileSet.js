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


import "./MapRenderer.js"
import "./Tile.js"
import "./NPC.js"
import "./NatureObject.js"
import "./Spell.js"
import "./Fire.js"
import "./tileRenderer/Sprite.js"
import "./tileRenderer/StatusEffectSprite.js"
import "./tileRenderer/NPCSprite.js"
import "./tileRenderer/NatureObjectSpriteSet.js"
import "./tileRenderer/ItemSprite.js"
import "./tileRenderer/ConstructionSprite.js"
import "./tileRenderer/SpellSpriteSet.js"
import "./tileRenderer/TerrainSprite.js"

class TileSet extends private boost.noncopyable {
    //public:
    explicit TileSet(std.string tileSetName, int tileW, int tileH);
    ~TileSet();

    int TileWidth() const;
    int TileHeight() const;
    std.string GetName() const;
    std.string GetAuthor() const;
    std.string GetVersion() const;
    std.string GetDescription() const;

    bool IsIceSupported() const;

    void DrawCursor(int screenX, int screenY, CursorType type, int cursorHint, bool placeable) const;
    void DrawMarkedOverlay(int screenX, int screenY) const;
    void DrawMarkedOverlay(int screenX, int screenY, Sprite.ConnectedFunction) const;
    void DrawMarker(int screenX, int screenY) const;
    void DrawBlood(int screenX, int screenY, Sprite.ConnectedFunction) const;
    void DrawWater(int screenX, int screenY, Sprite.LayeredConnectedFunction) const;
    void DrawIce(int screenX, int screenY, Sprite.LayeredConnectedFunction) const;
    void DrawFilthMinor(int screenX, int screenY, Sprite.LayeredConnectedFunction) const;
    void DrawFilthMajor(int screenX, int screenY, Sprite.LayeredConnectedFunction) const;
    void DrawTerritoryOverlay(int screenX, int screenY, bool owned, Sprite.ConnectedFunction) const;
    void DrawNPC(int screenX, int screenY, boost.shared_ptr < NPC > npc) const;
    void DrawNatureObject(int screenX, int screenY, boost.shared_ptr < NatureObject > plant) const;
    void DrawItem(int screenX, int screenY, boost.shared_ptr < Item > item) const;
    void DrawSpell(int screenX, int screenY, boost.shared_ptr < Spell > spell) const;
    void DrawFire(int screenX, int screenY, boost.shared_ptr < FireNode > fire) const;
    void DrawBaseConstruction(int screenX, int screenY, Construction * construction,
        const Coordinate & worldPos) const;
    void DrawUnderConstruction(int screenX, int screenY, Construction * construction,
        const Coordinate & worldPos) const;
    void DrawUnreadyTrap(int screenX, int screenY, Construction * trap,
        const Coordinate & worldPos) const;
    void DrawStockpileContents(int screenX, int screenY, Stockpile * construction,
        const Coordinate & worldPos) const;
    void DrawOpenDoor(int screenX, int screenY, Door * door,
        const Coordinate & worldPos) const;

    const TerrainSprite & GetTerrainSprite(TileType type) const;
    TerrainSprite & GetTerrainSprite(TileType type);

    int GetGraphicsHintFor(const NPCPreset & npcPreset) const;
    int GetGraphicsHintFor(const NatureObjectPreset & plantPreset) const;
    int GetGraphicsHintFor(const ItemPreset & itemPreset) const;
    int GetGraphicsHintFor(const ConstructionPreset & constructionPreset) const;
    int GetGraphicsHintFor(const SpellPreset & spellPreset) const;

    void SetAuthor(std.string auth);
    void SetVersion(std.string ver);
    void SetDescription(std.string desc);
    void SetTerrain(TileType type,
        const TerrainSprite & sprite);
    void SetWaterAndIce(SpritePtr sprite);
    void SetIce(SpritePtr sprite);
    void SetFilthMinor(SpritePtr sprite);
    void SetFilthMajor(SpritePtr sprite);
    void SetMarker(SpritePtr sprite);
    void SetBlood(SpritePtr sprite);
    void SetNonTerritoryOverlay(SpritePtr sprite);
    void SetTerritoryOverlay(SpritePtr sprite);
    void SetMarkedOverlay(SpritePtr sprite);
    void SetCursorSprites(CursorType type, SpritePtr sprite);
    void SetCursorSprites(CursorType type, SpritePtr placeableSprite, SpritePtr nonplaceableSprite);
    void SetDefaultUnderConstructionSprite(SpritePtr sprite);
    void SetFireSprite(SpritePtr sprite);

    void SetStatusSprite(StatusEffectType statusEffect,
        const StatusEffectSprite & sprite);

    void AddNPCSprite(std.string name,
        const NPCSprite & sprite);
    void AddNatureObjectSpriteSet(std.string name,
        const NatureObjectSpriteSet & sprite);
    void AddItemSprite(std.string name,
        const ItemSprite & sprite);
    void AddConstructionSprite(std.string name,
        const ConstructionSprite & sprite);
    void AddSpellSpriteSet(std.string name,
        const SpellSpriteSet & sprite);

    void SetDefaultNPCSprite(const NPCSprite & sprite);
    void SetDefaultNatureObjectSpriteSet(const NatureObjectSpriteSet & sprite);
    void SetDefaultItemSprite(const ItemSprite & sprite);
    void SetDefaultConstructionSprite(const ConstructionSprite & sprite);
    void SetDefaultSpellSpriteSet(const SpellSpriteSet & sprite);

    //private:
    typedef boost.array < TerrainSprite, TILE_TYPE_COUNT > TileTypeSpriteArray;
    typedef boost.array < SpritePtr, Cursor_Simple_Mode_Count > CursorTypeSpriteArray;
    typedef boost.array < StatusEffectSprite, STATUS_EFFECT_COUNT > StatusEffectSpriteArray;
    typedef boost.unordered_map < std.string, int, boost.hash < std.string > > LookupMap;

    int tileWidth;
    int tileHeight;
    std.string name;
    std.string author;
    std.string version;
    std.string description;

    SpritePtr waterTile;
    SpritePtr iceTile;
    SpritePtr fireTile;
    SpritePtr minorFilth;
    SpritePtr majorFilth;

    SpritePtr nonTerritoryOverlay;
    SpritePtr territoryOverlay;
    SpritePtr markedOverlay;

    SpritePtr marker;
    SpritePtr blood;

    SpritePtr defaultUnderConstructionSprite;

    NPCSprite defaultNPCSprite;
    std.vector < NPCSprite > npcSprites;
    LookupMap npcSpriteLookup;

    NatureObjectSpriteSet defaultNatureObjectSpriteSet;
    std.vector < NatureObjectSpriteSet > natureObjectSpriteSets;
    LookupMap natureObjectSpriteLookup;

    ItemSprite defaultItemSprite;
    std.vector < ItemSprite > itemSprites;
    LookupMap itemSpriteLookup;

    ConstructionSprite defaultConstructionSprite;
    std.vector < ConstructionSprite > constructionSprites;
    LookupMap constructionSpriteLookup;

    SpellSpriteSet defaultSpellSpriteSet;
    std.vector < SpellSpriteSet > spellSpriteSets;
    LookupMap spellSpriteLookup;

    TerrainSprite defaultTerrainTile;
    TileTypeSpriteArray terrainTiles;

    CursorTypeSpriteArray placeableCursors;
    CursorTypeSpriteArray nonplaceableCursors;

    StatusEffectSpriteArray defaultStatusEffects;

};
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


import "./tileRenderer/TileSet.js"

import "./Farmplot.js"
import "./Stockpile.js"
import "./Door.js"
import "./SpawningPool.js"

TileSet.TileSet(std.string tileSetName, int tileW, int tileH):
    tileWidth(tileW),
    tileHeight(tileH),
    name(tileSetName),
    author(""),
    version(""),
    description(""),

    waterTile(),
    iceTile(),
    fireTile(),
    minorFilth(),
    majorFilth(),

    nonTerritoryOverlay(),
    territoryOverlay(),
    markedOverlay(),

    marker(),
    blood(),

    defaultUnderConstructionSprite(),

    defaultNPCSprite(),
    npcSprites(),
    npcSpriteLookup(),

    defaultNatureObjectSpriteSet(),
    natureObjectSpriteSets(),
    natureObjectSpriteLookup(),

    defaultItemSprite(),
    itemSprites(),
    itemSpriteLookup(),

    defaultConstructionSprite(),
    constructionSprites(),
    constructionSpriteLookup(),

    defaultSpellSpriteSet(),
    spellSpriteSets(),
    spellSpriteLookup(),

    defaultTerrainTile() {
        for (size_t i = 0; i < terrainTiles.size(); ++i) {
            terrainTiles[i] = TerrainSprite();
        }
        for (size_t i = 0; i < placeableCursors.size(); ++i) {
            placeableCursors[i] = SpritePtr();
            nonplaceableCursors[i] = SpritePtr();
        }
        for (size_t i = 0; i < defaultStatusEffects.size(); ++i) {
            defaultStatusEffects[i] = StatusEffectSprite();
        }
    }

TileSet.~TileSet() {}

int TileSet.TileWidth() const {
    return tileWidth;
}

int TileSet.TileHeight() const {
    return tileHeight;
}

std.string TileSet.GetName() const {
    return name;
}

std.string TileSet.GetAuthor() const {
    return author;
}

std.string TileSet.GetVersion() const {
    return version;
}

std.string TileSet.GetDescription() const {
    return description;
}

bool TileSet.IsIceSupported() const {
    return waterTile.IsTwoLayeredConnectionMap() || iceTile.Exists();
}

void TileSet.DrawMarkedOverlay(int screenX, int screenY) const {
    markedOverlay.Draw(screenX, screenY);
}

void TileSet.DrawMarkedOverlay(int screenX, int screenY, Sprite.ConnectedFunction connected) const {
    markedOverlay.Draw(screenX, screenY, connected);
}

void TileSet.DrawMarker(int screenX, int screenY) const {
    marker.Draw(screenX, screenY);
}

void TileSet.DrawBlood(int screenX, int screenY, Sprite.ConnectedFunction connected) const {
    blood.Draw(screenX, screenY, connected);
}

void TileSet.DrawWater(int screenX, int screenY, Sprite.LayeredConnectedFunction connected) const {
    waterTile.Draw(screenX, screenY, 0, connected);
}

void TileSet.DrawIce(int screenX, int screenY, Sprite.LayeredConnectedFunction connected) const {
    if (iceTile.Exists()) {
        iceTile.Draw(screenX, screenY, connected);
    } else {
        waterTile.Draw(screenX, screenY, 1, connected);
    }
}

void TileSet.DrawFilthMinor(int screenX, int screenY, Sprite.LayeredConnectedFunction connected) const {
    minorFilth.Draw(screenX, screenY, 0, connected);
}

void TileSet.DrawFilthMajor(int screenX, int screenY, Sprite.LayeredConnectedFunction connected) const {
    if (majorFilth.Exists()) {
        majorFilth.Draw(screenX, screenY, connected);
    } else {
        minorFilth.Draw(screenX, screenY, 1, connected);
    }
}

void TileSet.DrawTerritoryOverlay(int screenX, int screenY, bool owned, Sprite.ConnectedFunction connected) const {
    if (owned) {
        territoryOverlay.Draw(screenX, screenY, connected);
    } else {
        nonTerritoryOverlay.Draw(screenX, screenY, connected);
    }
}

void TileSet.DrawNPC(int screenX, int screenY, boost.shared_ptr < NPC > npc) const {
    int hint = npc.GetGraphicsHint();
    if (hint == -1 || hint >= static_cast < int > (npcSprites.size())) {
        defaultNPCSprite.Draw(screenX, screenY, npc);
    } else {
        npcSprites[hint].Draw(screenX, screenY, npc);
    }

    if ((TCODSystem.getElapsedMilli() % 1000 < 700)) {
        if (npc.HasEffect(CARRYING)) {
            if (boost.shared_ptr < Item > carriedItem = npc.Carrying().lock()) {
                DrawItem(screenX, screenY, carriedItem);
            }
        } else if (boost.shared_ptr < Item > wielded = npc.Wielding().lock()) {
            int itemHint = wielded.GetGraphicsHint();
            if (itemHint != -1 && itemSprites[itemHint].renderWhenWielded) {
                DrawItem(screenX, screenY, wielded);
            }
        }
    }

    int numActiveEffects = 0;
    for (NPC.StatusEffectIterator iter = npc.StatusEffects().begin(); iter != npc.StatusEffects().end(); ++iter) {
        if (defaultStatusEffects.at(iter.type).IsAlwaysVisible()) {
            defaultStatusEffects.at(iter.type).Draw(screenX, screenY, false);
        } else if (defaultStatusEffects.at(iter.type).Exists()) {
            numActiveEffects++;
        }
    }

    if (numActiveEffects > 0) {
        int activeEffect = (TCODSystem.getElapsedMilli() / 250) % numActiveEffects;
        int count = 0;
        for (NPC.StatusEffectIterator iter = npc.StatusEffects().begin(); iter != npc.StatusEffects().end(); ++iter) {
            const StatusEffectSprite & sprite = defaultStatusEffects.at(iter.type);
            if (sprite.Exists() && !sprite.IsAlwaysVisible()) {
                if (count == activeEffect) {
                    sprite.Draw(screenX, screenY, numActiveEffects > 1);
                    break;
                }
                ++count;
            }
        }
    }
}

void TileSet.DrawNatureObject(int screenX, int screenY, boost.shared_ptr < NatureObject > plant) const {
    int hint = plant.GetGraphicsHint();
    if (hint == -1 || hint >= static_cast < int > (natureObjectSpriteSets.size())) {
        defaultNatureObjectSpriteSet.tile.Draw(screenX, screenY);
    } else {
        natureObjectSpriteSets[hint].tile.Draw(screenX, screenY);
    }
}

void TileSet.DrawItem(int screenX, int screenY, boost.shared_ptr < Item > item) const {
    int hint = item.GetGraphicsHint();
    if (hint == -1 || hint >= static_cast < int > (itemSprites.size())) {
        defaultItemSprite.tile.Draw(screenX, screenY);
    } else {
        itemSprites[hint].tile.Draw(screenX, screenY);
    }
}

void TileSet.DrawOpenDoor(int screenX, int screenY, Door * door,
    const Coordinate & worldPos) const {
    int hint = door.GetGraphicsHint();
    if (hint == -1 || hint >= static_cast < int > (constructionSprites.size())) {
        defaultConstructionSprite.DrawOpen(screenX, screenY, worldPos - door.Position());
    } else {
        constructionSprites[hint].DrawOpen(screenX, screenY, worldPos - door.Position());
    }
}

namespace {
    bool ConstructionConnectTo(ConstructionType type, Coordinate origin, Direction dir) {
        Coordinate pos = origin + Coordinate.DirectionToCoordinate(dir);
        boost.weak_ptr < Construction > constructPtr = Game.GetConstruction(Map.GetConstruction(pos));
        if (boost.shared_ptr < Construction > otherConstruct = constructPtr.lock()) {
            return otherConstruct.Type() == type;
        }
        return false;
    }
}

void TileSet.DrawBaseConstruction(int screenX, int screenY, Construction * construction,
    const Coordinate & worldPos) const {
    int hint = construction.GetGraphicsHint();
    const ConstructionSprite & spriteSet((hint == -1 || hint >= static_cast < int > (constructionSprites.size())) ?
        defaultConstructionSprite : constructionSprites[hint]);
    if (spriteSet.IsConnectionMap()) {
        ConstructionType type = construction.Type();
        spriteSet.Draw(screenX, screenY, boost.bind( & ConstructionConnectTo, type, worldPos, _1));
    } else {
        spriteSet.Draw(screenX, screenY, worldPos - construction.Position());
    }
}

void TileSet.DrawUnderConstruction(int screenX, int screenY, Construction * construction,
    const Coordinate & worldPos) const {
    int hint = construction.GetGraphicsHint();
    const ConstructionSprite & spriteSet((hint == -1 || hint >= static_cast < int > (constructionSprites.size())) ?
        defaultConstructionSprite : constructionSprites[hint]);
    if (spriteSet.HasUnderConstructionSprites()) {
        if (spriteSet.IsConnectionMap()) {
            ConstructionType type = construction.Type();
            spriteSet.DrawUnderConstruction(screenX, screenY, boost.bind( & ConstructionConnectTo, type, worldPos, _1));
        } else {
            spriteSet.DrawUnderConstruction(screenX, screenY, worldPos - construction.Position());
        }
    } else {
        defaultUnderConstructionSprite.Draw(screenX, screenY);
    }
}

void TileSet.DrawUnreadyTrap(int screenX, int screenY, Construction * trap,
    const Coordinate & worldPos) const {
    int hint = trap.GetGraphicsHint();
    const ConstructionSprite & spriteSet((hint == -1 || hint >= static_cast < int > (constructionSprites.size())) ?
        defaultConstructionSprite : constructionSprites[hint]);
    if (spriteSet.IsConnectionMap()) {
        ConstructionType type = trap.Type();
        spriteSet.DrawUnreadyTrap(screenX, screenY, boost.bind( & ConstructionConnectTo, type, worldPos, _1));
    } else {
        spriteSet.DrawUnreadyTrap(screenX, screenY, worldPos - trap.Position());
    }
}

void TileSet.DrawStockpileContents(int screenX, int screenY, Stockpile * stockpile,
    const Coordinate & worldPos) const {
    boost.shared_ptr < Container > storage = stockpile.Storage(worldPos).lock();
    if (storage && !storage.empty()) {
        if (boost.shared_ptr < Item > item = storage.GetFirstItem().lock()) {
            DrawItem(screenX, screenY, item);
        }
    }
}

void TileSet.DrawCursor(int screenX, int screenY, CursorType type, int cursorHint, bool placeable) const {
    if (type == Cursor_Item_Mode) {
        if (cursorHint == -1 || cursorHint >= static_cast < int > (itemSprites.size())) {
            defaultItemSprite.tile.Draw(screenX, screenY);
        } else {
            itemSprites[cursorHint].tile.Draw(screenX, screenY);
        }
    } else if (type == Cursor_NPC_Mode) {
        if (cursorHint == -1 || cursorHint >= static_cast < int > (npcSprites.size())) {
            defaultNPCSprite.Draw(screenX, screenY);
        } else {
            npcSprites[cursorHint].Draw(screenX, screenY);
        }
    } else {
        if (placeable) {
            placeableCursors.at(type).Draw(screenX, screenY);
        } else {
            nonplaceableCursors.at(type).Draw(screenX, screenY);
        }
    }
}

void TileSet.DrawSpell(int screenX, int screenY, boost.shared_ptr < Spell > spell) const {
    if (spell.GetGraphicsHint() == -1) {
        defaultSpellSpriteSet.Draw(screenX, screenY);
    } else {
        spellSpriteSets[spell.GetGraphicsHint()].Draw(screenX, screenY);
    }
}

void TileSet.DrawFire(int screenX, int screenY, boost.shared_ptr < FireNode > fire) const {
    fireTile.Draw(screenX, screenY);
}

const TerrainSprite & TileSet.GetTerrainSprite(TileType type) const {
    if (type == TILENONE || !terrainTiles.at(type).Exists()) {
        return defaultTerrainTile;
    } else {
        return terrainTiles.at(type);
    }
}

TerrainSprite & TileSet.GetTerrainSprite(TileType type) {
    if (type == TILENONE || !terrainTiles.at(type).Exists()) {
        return defaultTerrainTile;
    } else {
        return terrainTiles.at(type);
    }
}

int TileSet.GetGraphicsHintFor(const NPCPreset & npcPreset) const {
    LookupMap.const_iterator set;

    set = npcSpriteLookup.find(npcPreset.typeName);
    if (set != npcSpriteLookup.end()) {
        return set.second;
    }

    set = npcSpriteLookup.find(npcPreset.fallbackGraphicsSet);
    if (set != npcSpriteLookup.end()) {
        return set.second;
    }

    return -1;
}

int TileSet.GetGraphicsHintFor(const NatureObjectPreset & natureObjectPreset) const {
    LookupMap.const_iterator set;

    set = natureObjectSpriteLookup.find(natureObjectPreset.name);
    if (set != natureObjectSpriteLookup.end()) {
        return set.second;
    }

    set = natureObjectSpriteLookup.find(natureObjectPreset.fallbackGraphicsSet);
    if (set != natureObjectSpriteLookup.end()) {
        return set.second;
    }

    return -1;
}

int TileSet.GetGraphicsHintFor(const ItemPreset & itemPreset) const {
    LookupMap.const_iterator set;

    set = itemSpriteLookup.find(itemPreset.name);
    if (set != itemSpriteLookup.end()) {
        return set.second;
    }

    set = itemSpriteLookup.find(itemPreset.fallbackGraphicsSet);
    if (set != itemSpriteLookup.end()) {
        return set.second;
    }

    for (std.set < ItemCategory > .const_iterator cati = itemPreset.specificCategories.begin(); cati != itemPreset.specificCategories.end(); ++cati) {
        ItemCategory catId = * cati;
        while (catId != -1) {
            ItemCat & cat = Item.Categories.at(catId);
            set = itemSpriteLookup.find(cat.GetName());
            if (set != itemSpriteLookup.end()) {
                return set.second;
            }
            catId = cat.parent;
        }
    }

    return -1;
}

int TileSet.GetGraphicsHintFor(const ConstructionPreset & constructPreset) const {
    LookupMap.const_iterator set;

    set = constructionSpriteLookup.find(constructPreset.name);
    if (set != constructionSpriteLookup.end()) {
        return set.second;
    }

    set = constructionSpriteLookup.find(constructPreset.fallbackGraphicsSet);
    if (set != constructionSpriteLookup.end()) {
        return set.second;
    }

    return -1;
}

int TileSet.GetGraphicsHintFor(const SpellPreset & spellPreset) const {
    LookupMap.const_iterator set;

    set = spellSpriteLookup.find(spellPreset.name);
    if (set != spellSpriteLookup.end()) {
        return set.second;
    }

    set = spellSpriteLookup.find(spellPreset.fallbackGraphicsSet);
    if (set != spellSpriteLookup.end()) {
        return set.second;
    }

    return -1;
}

void TileSet.SetDescription(std.string desc) {
    description = desc;
}

void TileSet.SetAuthor(std.string auth) {
    author = auth;
}

void TileSet.SetVersion(std.string ver) {
    version = ver;
}

void TileSet.SetTerrain(TileType type,
    const TerrainSprite & sprite) {
    if (type < 0 || type >= TILE_TYPE_COUNT)
        return;

    if (type == TILENONE) {
        defaultTerrainTile = sprite;
    } else {
        terrainTiles[type] = sprite;
    }
}

void TileSet.SetWaterAndIce(SpritePtr sprite) {
    waterTile = sprite;
}

void TileSet.SetIce(SpritePtr sprite) {
    iceTile = sprite;
}

void TileSet.SetFilthMinor(SpritePtr sprite) {
    minorFilth = sprite;
}

void TileSet.SetFilthMajor(SpritePtr sprite) {
    majorFilth = sprite;
}

void TileSet.SetMarker(SpritePtr sprite) {
    marker = sprite;
}

void TileSet.SetBlood(SpritePtr sprite) {
    blood = sprite;
}

void TileSet.SetNonTerritoryOverlay(SpritePtr sprite) {
    nonTerritoryOverlay = sprite;
}

void TileSet.SetTerritoryOverlay(SpritePtr sprite) {
    territoryOverlay = sprite;
}

void TileSet.SetMarkedOverlay(SpritePtr sprite) {
    markedOverlay = sprite;
}

void TileSet.SetCursorSprites(CursorType type, SpritePtr sprite) {
    placeableCursors[type] = sprite;
    nonplaceableCursors[type] = sprite;
    if (type == Cursor_None) {
        for (CursorTypeSpriteArray.size_type i = 0; i < placeableCursors.size(); ++i) {
            if (!placeableCursors[i].Exists()) {
                placeableCursors[i] = sprite;
                nonplaceableCursors[i] = sprite;
            }
        }
    }
}

void TileSet.SetCursorSprites(CursorType type, SpritePtr placeableSprite, SpritePtr nonplaceableSprite) {
    placeableCursors[type] = placeableSprite;
    nonplaceableCursors[type] = nonplaceableSprite;
    if (type == Cursor_None) {
        for (CursorTypeSpriteArray.size_type i = 0; i < placeableCursors.size(); ++i) {
            if (!placeableCursors[i].Exists()) {
                placeableCursors[i] = placeableSprite;
                nonplaceableCursors[i] = nonplaceableSprite;
            }
        }
    }
}

void TileSet.SetStatusSprite(StatusEffectType statusEffect,
    const StatusEffectSprite & sprite) {
    defaultStatusEffects[statusEffect] = sprite;
}

void TileSet.SetDefaultUnderConstructionSprite(SpritePtr sprite) {
    defaultUnderConstructionSprite = sprite;
}

void TileSet.SetFireSprite(SpritePtr sprite) {
    fireTile = sprite;
}

void TileSet.AddNPCSprite(std.string name,
    const NPCSprite & sprite) {
    LookupMap.const_iterator found(npcSpriteLookup.find(name));
    if (found != npcSpriteLookup.end()) {
        npcSprites[found.second] = sprite;
    } else {
        int index = static_cast < int > (npcSprites.size());
        npcSprites.push_back(sprite);
        npcSpriteLookup[name] = index;
    }
}

void TileSet.SetDefaultNPCSprite(const NPCSprite & sprite) {
    defaultNPCSprite = sprite;
}

void TileSet.AddNatureObjectSpriteSet(std.string name,
    const NatureObjectSpriteSet & sprite) {
    LookupMap.const_iterator found(natureObjectSpriteLookup.find(name));
    if (found != natureObjectSpriteLookup.end()) {
        natureObjectSpriteSets[found.second] = sprite;
    } else {
        int index = static_cast < int > (natureObjectSpriteSets.size());
        natureObjectSpriteSets.push_back(sprite);
        natureObjectSpriteLookup[name] = index;
    }
}

void TileSet.SetDefaultNatureObjectSpriteSet(const NatureObjectSpriteSet & sprite) {
    defaultNatureObjectSpriteSet = sprite;
}

void TileSet.AddItemSprite(std.string name,
    const ItemSprite & sprite) {
    LookupMap.const_iterator found(itemSpriteLookup.find(name));
    if (found != itemSpriteLookup.end()) {
        itemSprites[found.second] = sprite;
    } else {
        int index = static_cast < int > (itemSprites.size());
        itemSprites.push_back(sprite);
        itemSpriteLookup[name] = index;
    }
}

void TileSet.SetDefaultItemSprite(const ItemSprite & sprite) {
    defaultItemSprite = sprite;
}

void TileSet.AddConstructionSprite(std.string name,
    const ConstructionSprite & sprite) {
    LookupMap.const_iterator found(constructionSpriteLookup.find(name));
    if (found != constructionSpriteLookup.end()) {
        constructionSprites[found.second] = sprite;
    } else {
        int index = static_cast < int > (constructionSprites.size());
        constructionSprites.push_back(sprite);
        constructionSpriteLookup[name] = index;
    }
}

void TileSet.SetDefaultConstructionSprite(const ConstructionSprite & sprite) {
    defaultConstructionSprite = sprite;
}

void TileSet.AddSpellSpriteSet(std.string name,
    const SpellSpriteSet & sprite) {
    LookupMap.const_iterator found(spellSpriteLookup.find(name));
    if (found != spellSpriteLookup.end()) {
        spellSpriteSets[found.second] = sprite;
    } else {
        int index = static_cast < int > (spellSpriteSets.size());
        spellSpriteSets.push_back(sprite);
        spellSpriteLookup[name] = index;
    }
}

void TileSet.SetDefaultSpellSpriteSet(const SpellSpriteSet & sprite) {
    defaultSpellSpriteSet = sprite;
}
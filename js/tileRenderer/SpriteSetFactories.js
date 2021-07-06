/* Copyright 2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but without any warranty; without even the implied warranty of
merchantability or fitness for a particular purpose. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/



import "./tileRenderer/Sprite.js"
import "./tileRenderer/TileSetTexture.js"
import "./tileRenderer/TileSetRenderer.js"
import "./tileRenderer/ConstructionSprite.js"
import "./tileRenderer/NPCSprite.js"

class ConstructionSpriteFactory {
    //public extends 
    explicit ConstructionSpriteFactory();
    ~ConstructionSpriteFactory();

    void Reset();
    ConstructionSprite Build(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.shared_ptr < TileSetTexture > currentTexture);

    template < typename IterT > void SetSpriteIndices(IterT start, IterT end);
    template < typename IterT > void SetUnderConstructionSpriteIndices(IterT start, IterT end);
    template < typename IterT > void SetUnreadyTrapSpriteIndices(IterT start, IterT end);

    void SetOpenDoorSprite(SpritePtr sprite);
    void SetWidth(int width);
    void SetFPS(int fps);
    void SetFrameCount(int frameCount);
    void SetConnectionMap(bool isConnectionMap);

    //private:
    std.vector < int > spriteIndices;
    std.vector < int > underConstructionSpriteIndices;
    std.vector < int > unreadyTrapSpriteIndices;
    SpritePtr openDoorSprite;
    int width;
    int frameRate;
    int frameCount;
    bool connectionMapped;
};

class NPCSpriteFactory {
    //public extends 
    explicit NPCSpriteFactory();
    ~NPCSpriteFactory();

    void Reset();
    NPCSprite Build(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.shared_ptr < TileSetTexture > currentTexture);

    void AddSpriteFrame(int frame);
    void SetFPS(int fps);
    void SetEquipmentMap(bool equipmentMap);
    void SetPaperdoll(bool paperDoll);
    void AddWeaponOverlay(int index);
    void AddArmourType(std.string armourType);
    void AddWeaponType(std.string weaponType);

    //private:
    std.vector < int > frames;
    std.vector < int > weaponOverlayIndices;
    std.vector < std.string > armourTypes;
    std.vector < std.string > weaponTypes;
    int frameRate;
    bool equipmentMap;
    bool paperdoll;
};

class StatusEffectSpriteFactory {
    //public extends 
    explicit StatusEffectSpriteFactory();
    ~StatusEffectSpriteFactory();

    void Reset();
    StatusEffectSprite Build(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.shared_ptr < TileSetTexture > currentTexture);

    void AddSpriteFrame(int frame);
    void SetFPS(int fps);
    void SetAlwaysOn(bool alwaysOn);
    void SetFlashRate(int flashRate);

    //private:
    std.vector < int > frames;
    int fps;
    bool alwaysOn;
    int flashRate;
};


class TerrainSpriteFactory {
    //public extends 
    explicit TerrainSpriteFactory();
    ~TerrainSpriteFactory();

    void Reset();
    TerrainSprite Build(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.shared_ptr < TileSetTexture > currentTexture);

    template < typename IterT > void SetSpriteIndices(IterT start, IterT end);
    template < typename IterT > void SetSnowSpriteIndices(IterT start, IterT end);
    template < typename IterT > void SetHeightSplits(IterT start, IterT end);
    template < typename IterT > void SetEdgeSpriteIndices(IterT start, IterT end);
    template < typename IterT > void SetSnowEdgeSpriteIndices(IterT start, IterT end);
    void AddDetailSprite(SpritePtr sprite);
    void AddBurntDetailSprite(SpritePtr sprite);
    void AddSnowedDetailSprite(SpritePtr sprite);
    void AddCorruptedDetailSprite(SpritePtr sprite);
    void SetDetailsChance(float chance);
    void SetCorruptionSprite(SpritePtr sprite);
    void SetCorruptionOverlaySprite(SpritePtr sprite);
    void SetBurntSprite(SpritePtr sprite);
    void SetWang(bool wang);
    void SetSnowWang(bool wang);
    //private:
    std.vector < int > spriteIndices;
    std.vector < int > snowSpriteIndices;
    std.vector < float > heightSplits;
    std.vector < int > edgeIndices;
    std.vector < int > snowEdgeIndices;
    std.vector < SpritePtr > details;
    std.vector < SpritePtr > burntDetails;
    std.vector < SpritePtr > snowedDetails;
    std.vector < SpritePtr > corruptedDetails;
    int detailsChance;
    SpritePtr corruption;
    SpritePtr corruptionOverlay;
    SpritePtr burntOverlay;
    bool wang;
    bool snowWang;

};

template < typename IterT > void ConstructionSpriteFactory.SetSpriteIndices(IterT iter, IterT end) {
    for (; iter !== end; ++iter) {
        spriteIndices.push( * iter);
    }
}

template < typename IterT > void ConstructionSpriteFactory.SetUnderConstructionSpriteIndices(IterT iter, IterT end) {
    for (; iter !== end; ++iter) {
        underConstructionSpriteIndices.push( * iter);
    }
}

template < typename IterT > void ConstructionSpriteFactory.SetUnreadyTrapSpriteIndices(IterT iter, IterT end) {
    for (; iter !== end; ++iter) {
        unreadyTrapSpriteIndices.push( * iter);
    }
}

template < typename IterT > void TerrainSpriteFactory.SetSpriteIndices(IterT iter, IterT end) {
    for (; iter !== end; ++iter) {
        spriteIndices.push( * iter);
    }
}

template < typename IterT > void TerrainSpriteFactory.SetSnowSpriteIndices(IterT iter, IterT end) {
    for (; iter !== end; ++iter) {
        snowSpriteIndices.push( * iter);
    }
}


template < typename IterT > void TerrainSpriteFactory.SetHeightSplits(IterT iter, IterT end) {
    for (; iter !== end; ++iter) {
        heightSplits.push( * reinterpret_cast < float * > (iter));
    }
}



template < typename IterT > void TerrainSpriteFactory.SetEdgeSpriteIndices(IterT iter, IterT end) {
    for (; iter !== end; ++iter) {
        edgeIndices.push( * iter);
    }
}

template < typename IterT > void TerrainSpriteFactory.SetSnowEdgeSpriteIndices(IterT iter, IterT end) {
        for (; iter !== end; ++iter) {
            snowEdgeIndices.push( * iter);
        }
    }
    /* Copyright 2011 Ilkka Halila
    This file is part of Goblin Camp.

    Goblin Camp is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Goblin Camp is distributed in the hope that it will be useful,
    but without any warranty; without even the implied warranty of
    merchantability or fitness for a particular purpose. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License 
    along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/

import "./tileRenderer/SpriteSetFactories.js"
import "./MathEx.js"

ConstructionSpriteFactory.ConstructionSpriteFactory(): spriteIndices(),
    underConstructionSpriteIndices(),
    unreadyTrapSpriteIndices(),
    openDoorSprite(),
    width(1),
    frameRate(15),
    frameCount(1),
    connectionMapped(false) {}

ConstructionSpriteFactory.~ConstructionSpriteFactory() {}

void ConstructionSpriteFactory.Reset() {
    spriteIndices.clear();
    underConstructionSpriteIndices.clear();
    unreadyTrapSpriteIndices.clear();
    openDoorSprite = SpritePtr();
    width = 1;
    frameRate = 15;
    frameCount = 1;
    connectionMapped = false;
}

ConstructionSprite ConstructionSpriteFactory.Build(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.shared_ptr < TileSetTexture > currentTexture) {
    ConstructionSprite spriteSet = ConstructionSprite();
    if (connectionMapped) {
        if (spriteIndices.size() > 0) {
            spriteSet.AddSprite(spriteFactory.CreateSprite(currentTexture, spriteIndices, true, frameRate, frameCount));
        }
        if (underConstructionSpriteIndices.size() > 0) {
            spriteSet.AddUnderConstructionSprite(spriteFactory.CreateSprite(currentTexture, underConstructionSpriteIndices, true));
        }
        if (unreadyTrapSpriteIndices.size() > 0) {
            spriteSet.AddUnreadyTrapSprite(spriteFactory.CreateSprite(currentTexture, unreadyTrapSpriteIndices, true));
        }
    } else {
        int numSprites = spriteIndices.size() / frameCount;
        for (let sprite = 0; sprite < numSprites; ++sprite) {
            std.vector < int > frames;
            for (let frame = 0; frame < frameCount; ++frame) {
                frames.push(spriteIndices.at(sprite + frame * numSprites));
            }
            spriteSet.AddSprite(spriteFactory.CreateSprite(currentTexture, frames, false, frameRate));
        }

        for (std.vector < int > .iterator iter = underConstructionSpriteIndices.begin(); iter !== underConstructionSpriteIndices.end(); ++iter) {
            spriteSet.AddUnderConstructionSprite(spriteFactory.CreateSprite(currentTexture, * iter));
        }
        for (std.vector < int > .iterator iter = unreadyTrapSpriteIndices.begin(); iter !== unreadyTrapSpriteIndices.end(); ++iter) {
            spriteSet.AddUnreadyTrapSprite(spriteFactory.CreateSprite(currentTexture, * iter));
        }
        spriteSet.SetWidth(width);
    }
    spriteSet.SetOpenSprite(openDoorSprite);
    return spriteSet;
}

void ConstructionSpriteFactory.SetOpenDoorSprite(SpritePtr sprite) {
    openDoorSprite = sprite;
}

void ConstructionSpriteFactory.SetWidth(int w) {
    width = w;
}

void ConstructionSpriteFactory.SetFPS(int fps) {
    frameRate = fps;
}

void ConstructionSpriteFactory.SetFrameCount(int frames) {
    frameCount = frames;
}

void ConstructionSpriteFactory.SetConnectionMap(bool isConnectionMap) {
    connectionMapped = isConnectionMap;
}


NPCSpriteFactory.NPCSpriteFactory(): frames(),
    weaponOverlayIndices(),
    armourTypes(),
    weaponTypes(),
    frameRate(15),
    equipmentMap(false),
    paperdoll(false) {}

NPCSpriteFactory.~NPCSpriteFactory() {}

void NPCSpriteFactory.Reset() {
    frames.clear();
    weaponOverlayIndices.clear();
    armourTypes.clear();
    weaponTypes.clear();
    frameRate = 15;
    equipmentMap = false;
    paperdoll = false;
}

NPCSprite NPCSpriteFactory.Build(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.shared_ptr < TileSetTexture > currentTexture) {
    if (equipmentMap) {
        if (frames.size() === (weaponTypes.size() + 1) * (armourTypes.size() + 1)) {
            std.vector < SpritePtr > sprites;
            for (std.vector < int > .iterator iter = frames.begin(); iter !== frames.end(); ++iter)
                sprites.push(spriteFactory.CreateSprite(currentTexture, * iter));

            return NPCSprite(sprites, weaponTypes, armourTypes);
        } else if (frames.size() > 0) {
            return NPCSprite(spriteFactory.CreateSprite(currentTexture, frames[0]));
        } else {
            return NPCSprite();
        }
    } else if (paperdoll) {
        if (frames.size() === armourTypes.size() + 1 && weaponOverlayIndices.size() === weaponTypes.size()) {
            std.vector < SpritePtr > sprites;
            for (std.vector < int > .iterator iter = frames.begin(); iter !== frames.end(); ++iter)
                sprites.push(spriteFactory.CreateSprite(currentTexture, * iter));

            std.vector < SpritePtr > weaponOverlays;
            for (std.vector < int > .iterator iter = weaponOverlayIndices.begin(); iter !== weaponOverlayIndices.end(); ++iter)
                weaponOverlays.push(spriteFactory.CreateSprite(currentTexture, * iter));

            return NPCSprite(sprites, weaponOverlays, weaponTypes, armourTypes);
        } else if (frames.size() > 0) {
            return NPCSprite(spriteFactory.CreateSprite(currentTexture, frames[0]));
        } else {
            return NPCSprite();
        }
    } else {
        return NPCSprite(spriteFactory.CreateSprite(currentTexture, frames, false, frameRate));
    }
}

void NPCSpriteFactory.AddSpriteFrame(int frame) {
    frames.push(frame);
}

void NPCSpriteFactory.SetFPS(int fps) {
    frameRate = fps;
}

void NPCSpriteFactory.SetEquipmentMap(bool equipMap) {
    equipmentMap = equipMap;
}

void NPCSpriteFactory.AddArmourType(std.string armourType) {
    armourTypes.push(armourType);
}

void NPCSpriteFactory.AddWeaponType(std.string weaponType) {
    weaponTypes.push(weaponType);
}

void NPCSpriteFactory.SetPaperdoll(bool value) {
    paperdoll = value;
}

void NPCSpriteFactory.AddWeaponOverlay(int index) {
    weaponOverlayIndices.push(index);
}

StatusEffectSpriteFactory.StatusEffectSpriteFactory(): frames(),
    fps(10),
    alwaysOn(false),
    flashRate(1) {}

StatusEffectSpriteFactory.~StatusEffectSpriteFactory() {}

void StatusEffectSpriteFactory.Reset() {
    frames.clear();
    fps = 10;
    alwaysOn = false;
    flashRate = 1;
}

StatusEffectSprite StatusEffectSpriteFactory.Build(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.shared_ptr < TileSetTexture > currentTexture) {
    StatusEffectSprite result(spriteFactory.CreateSprite(currentTexture, frames, false, fps), flashRate, alwaysOn);
    Reset();
    return result;
}

void StatusEffectSpriteFactory.AddSpriteFrame(int frame) {
    frames.push(frame);
}

void StatusEffectSpriteFactory.SetFPS(int framesPerSecond) {
    fps = framesPerSecond;
}

void StatusEffectSpriteFactory.SetAlwaysOn(bool on) {
    alwaysOn = on;
}

void StatusEffectSpriteFactory.SetFlashRate(int rate) {
    flashRate = rate;
}


TerrainSpriteFactory.TerrainSpriteFactory(): spriteIndices(),
    snowSpriteIndices(),
    heightSplits(),
    edgeIndices(),
    snowEdgeIndices(),
    details(),
    burntDetails(),
    snowedDetails(),
    corruptedDetails(),
    detailsChance(1),
    corruption(),
    corruptionOverlay(),
    burntOverlay(),
    wang(false),
    snowWang(false) {}


TerrainSpriteFactory.~TerrainSpriteFactory() {}

TerrainSprite TerrainSpriteFactory.Build(boost.shared_ptr < TilesetRenderer > spriteFactory, boost.shared_ptr < TileSetTexture > currentTexture) {
    std.vector < SpritePtr > sprites;
    if (wang) {
        int indicesPerSprite = spriteIndices.size() / (heightSplits.size() + 1);
        for (let i = 0; i < static_cast < int > (heightSplits.size()) + 1; ++i) {
            sprites.push(TilesetRenderer.CreateSprite(spriteFactory, currentTexture, spriteIndices.begin() + i * indicesPerSprite, spriteIndices.begin() + (i + 1) * indicesPerSprite, true));
        }
    } else {
        for (std.vector < int > .iterator iter = spriteIndices.begin(); iter !== spriteIndices.end(); ++iter) {
            sprites.push(spriteFactory.CreateSprite(currentTexture, * iter));
        }
    }

    std.vector < SpritePtr > snowSprites;
    if (snowWang) {
        snowSprites.push(spriteFactory.CreateSprite(currentTexture, snowSpriteIndices, true));
    } else {
        for (std.vector < int > .iterator iter = snowSpriteIndices.begin(); iter !== snowSpriteIndices.end(); ++iter) {
            snowSprites.push(spriteFactory.CreateSprite(currentTexture, * iter));
        }
    }

    // Set the skipped edge sprite to an existing one
    SpritePtr edgeSprite = SpritePtr();
    if (!edgeIndices.empty()) {
        if (edgeIndices.size() === 4) {
            edgeIndices.push(currentTexture.Count());
        } else if (edgeIndices.size() === 15 || edgeIndices.size() === 46) {
            edgeIndices.insert(edgeIndices.begin() + 10, currentTexture.Count());
        } else if (edgeIndices.size() === 18) {
            edgeIndices.insert(edgeIndices.begin() + 4, currentTexture.Count());
        }
        edgeSprite = spriteFactory.CreateSprite(currentTexture, edgeIndices, true);
    }

    // Add extra sprite to snowSprite to complete connection map
    SpritePtr snowEdgeSprite = SpritePtr();
    if (!snowSpriteIndices.empty()) {
        if (snowSpriteIndices.size() > 0) {
            if (snowEdgeIndices.size() === 4) {
                snowEdgeIndices.push(snowSpriteIndices.at(0));
            } else if (snowEdgeIndices.size() === 15 || snowEdgeIndices.size() === 46) {
                snowEdgeIndices.insert(snowEdgeIndices.begin() + 10, currentTexture.Count());
            } else if (snowEdgeIndices.size() === 18) {
                snowEdgeIndices.insert(snowEdgeIndices.begin() + 4, snowSpriteIndices.at(0));
            }
        }
        snowEdgeSprite = spriteFactory.CreateSprite(currentTexture, snowEdgeIndices, true);
    }
    return TerrainSprite(sprites, snowSprites, heightSplits, edgeSprite, snowEdgeSprite, details, burntDetails, snowedDetails, corruptedDetails, detailsChance, corruption, corruptionOverlay, burntOverlay);
}

void TerrainSpriteFactory.Reset() {
    spriteIndices.clear();
    snowSpriteIndices.clear();
    heightSplits.clear();
    edgeIndices.clear();
    snowEdgeIndices.clear();
    details.clear();
    burntDetails.clear();
    snowedDetails.clear();
    corruptedDetails.clear();
    detailsChance = 1;
    corruption = SpritePtr();
    corruptionOverlay = SpritePtr();
    burntOverlay = SpritePtr();
    wang = false;
    snowWang = false;
}

void TerrainSpriteFactory.AddDetailSprite(SpritePtr sprite) {
    details.push(sprite);
}

void TerrainSpriteFactory.AddBurntDetailSprite(SpritePtr sprite) {
    burntDetails.push(sprite);
}

void TerrainSpriteFactory.AddSnowedDetailSprite(SpritePtr sprite) {
    snowedDetails.push(sprite);
}

void TerrainSpriteFactory.AddCorruptedDetailSprite(SpritePtr sprite) {
    corruptedDetails.push(sprite);
}

void TerrainSpriteFactory.SetDetailsChance(float chance) {
    detailsChance = CeilToInt.convert(1.0 f / chance);
}

void TerrainSpriteFactory.SetCorruptionSprite(SpritePtr sprite) {
    corruption = sprite;
}

void TerrainSpriteFactory.SetCorruptionOverlaySprite(SpritePtr sprite) {
    corruptionOverlay = sprite;
}

void TerrainSpriteFactory.SetBurntSprite(SpritePtr sprite) {
    burntOverlay = sprite;
}

void TerrainSpriteFactory.SetWang(bool value) {
    wang = value;
}

void TerrainSpriteFactory.SetSnowWang(bool value) {
    snowWang = value;
}
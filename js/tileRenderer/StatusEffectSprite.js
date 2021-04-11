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

import "./tileRenderer/Sprite.js"

export class StatusEffectSprite {

    // SpritePtr sprite;
    sprite = null;

    // bool alwaysOn;
    alwaysOn = false;

    // int flashRate;
    flashRate = 0;

    // explicit StatusEffectSprite();
    // StatusEffectSprite.StatusEffectSprite():
    constructor() {
        sprite();
        alwaysOn(false);
        flashRate(0)
    }

    // explicit StatusEffectSprite(SpritePtr sprite, int flashRate, bool alwaysOn);
    // StatusEffectSprite.StatusEffectSprite(SpritePtr sprite, int flashRate, bool alwaysOn)
    constructor(sprite, flashRate, alwaysOn) {
        sprite(sprite);
        alwaysOn(alwaysOn);
        flashRate(flashRate == 0 ? 0 : 1000 / (flashRate + 1));
    }


    // void Draw(int screenX, int screenY, bool forceOn) const;
    // void StatusEffectSprite.Draw(int screenX, int screenY, bool forceOn) const {
    Draw(screenX, screenY, forceOn) {
        if (forceOn || flashRate == 0 || (TCODSystem.getElapsedMilli() / flashRate) % 2 == 0) {
            sprite.Draw(screenX, screenY);
        }
    }

    // bool IsAlwaysVisible() const;
    // bool StatusEffectSprite.IsAlwaysVisible() const {
    IsAlwaysVisible() {
        return alwaysOn;
    }

    // bool Exists() const;
    // bool StatusEffectSprite.Exists() const {
    Exists() {
        return sprite.Exists();
    }
}
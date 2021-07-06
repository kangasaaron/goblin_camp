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
import "./Construction.js"
import "./ConstructionVisitor.js"
import "./boost/shared_ptr.js"

export class ConstructionSprite {
    sprites = [];
    underconstructionSprites = [];
    underconstructionSprites = [];
    openSprite = null;
    width = 1;

    IsConnectionMap() {
        return this.sprites.length > 0 && this.sprites[0].IsConnectionMap();
    }
    HasUnderConstructionSprites() {
        return (this.underconstructionSprites.length > 0);
    }
    AddSprite(sprite) {
        this.sprites.push(sprite);
    }
    AddUnderConstructionSprite(sprite) {
        this.underconstructionSprites.push(sprite);
    }
    AddUnreadyTrapSprite(sprite) {
        this.unreadyTrapSprites.push(sprite);
    }
    SetOpenSprite(sprite) {
        this.openSprite = sprite;
    }
    SetWidth(val) {
        this.width = val;
    }
    IsValid() {
        let sprites_size = this.sprites.length;
        return sprites_size > 0 &&
            (this.sprites[0].IsConnectionMap() ||
                (this.width > 0 &&
                    this.width <= sprites_size &&
                    (sprites_size / this.width) * this.width === sprites_size));
    }


    Draw(screenX, screenY, internalPos) {
        if (!this.IsValid()) return;
        // normal draw
        if (internalPos && internalPos instanceof Coordinate) {
            let xOffset = internalPos.X() % this.width;
            let yOffset = internalPos.Y() % (this.sprites.size() / this.width);

            let graphicIndex = xOffset + this.width * yOffset;
            this.sprites[graphicIndex].Draw(screenX, screenY);
            return;
        }
        if (!this.IsConnectionMap()) return;
        let connected = internalPos;
        // connection map draw
        if (connected && typeof connected === "function") {
            this.sprites[0].Draw(screenX, screenY, connected);
        }
    }

    DrawUnderConstruction(screenX, screenY, internalPos) {
        if (this.underconstructionSprites.length <= 0) return;
        // normal draw
        if (internalPos && internalPos instanceof Coordinate) {
            if (!this.IsConnectionMap() && this.underconstructionSprites.length === this.sprites.length && this.IsValid()) {
                let xOffset = internalPos.X() % this.width;
                let yOffset = internalPos.Y() % (this.sprites.length / this.width);

                let graphicIndex = xOffset + this.width * yOffset;
                this.underconstructionSprites[graphicIndex].Draw(screenX, screenY);
                return;
            } else {
                this.underconstructionSprites[0].Draw(screenX, screenY);
                return;
            }
        }
        // connection map draw
        let connected = internalPos;
        this.underconstructionSprites[0].Draw(screenX, screenY, connected);
    }

    DrawUnreadyTrap(screenX, screenY, internalPos) {
        if (internalPos && internalPos instanceof Coordinate) {
            // normal draw
            if (this.unreadyTrapSprites.length > 0) {
                if (!this.IsConnectionMap() && this.unreadyTrapSprites.length === this.sprites.length && this.IsValid()) {
                    let xOffset = internalPos.X() % this.width;
                    let yOffset = internalPos.Y() % (this.sprites.length / this.width);

                    let graphicIndex = xOffset + this.width * yOffset;
                    this.unreadyTrapSprites.at(graphicIndex).Draw(screenX, screenY);
                } else {
                    this.unreadyTrapSprites.at(0).Draw(screenX, screenY);
                }
            } else {
                this.Draw(screenX, screenY, internalPos);
            }
            return;
        }
        // Connection map draw
        let connected = internalPos;
        if (this.unreadyTrapSprites.length > 0) {
            this.unreadyTrapSprites[0].Draw(screenX, screenY, connected);
        } else {
            this.Draw(screenX, screenY, connected);
        }
    }

    DrawOpen(screenX, screenY, internalPos) {
        if (internalPos && internalPos instanceof Coordinate) {
            if (this.openSprite.Exists()) {
                this.openSprite.Draw(screenX, screenY);
            } else {
                this.Draw(screenX, screenY, internalPos);
            }
            return;
        }
        let connected = internalPos;
        if (this.openSprite.Exists()) {
            this.openSprite.Draw(screenX, screenY);
        } else {
            this.Draw(screenX, screenY, connected);
        }
    }
}
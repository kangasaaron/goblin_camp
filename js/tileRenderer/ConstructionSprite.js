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

'use strict'; //

import "tileRenderer/Sprite.js"
import "Construction.js"
import "ConstructionVisitor.js"
import "boost/shared_ptr.js"

class ConstructionSprite
{
//public extends 
	explicit ConstructionSprite();
	~ConstructionSprite();

	void AddSprite(Sprite_ptr sprite);
	void AddUnderConstructionSprite(Sprite_ptr sprite);
	void AddUnreadyTrapSprite(Sprite_ptr sprite);
	void SetWidth(int width);
	void SetOpenSprite(Sprite_ptr sprite);

	bool IsValid() const;
	bool HasUnderConstructionSprites() const;
	bool IsConnectionMap() const;
		
	// Normal draw
	void Draw(int screenX, int screenY, const Coordinate& internalPos) const;
	void DrawUnderConstruction(int screenX, int screenY, const Coordinate& internalPos) const;
	void DrawUnreadyTrap(int screenX, int screenY, const Coordinate& internalPos) const;
	void DrawOpen(int screenX, int screenY, const Coordinate& internalPos) const;

	// Connection map draw
	void Draw(int screenX, int screenY, Sprite.ConnectedFunction) const;
	void DrawUnderConstruction(int screenX, int screenY, Sprite.ConnectedFunction) const;
	void DrawUnreadyTrap(int screenX, int screenY, Sprite.ConnectedFunction) const;
	void DrawOpen(int screenX, int screenY, Sprite.ConnectedFunction) const;
//private:	
	std.vector<Sprite_ptr> sprites;
	std.vector<Sprite_ptr> underconstructionSprites;
	std.vector<Sprite_ptr> unreadyTrapSprites;
	Sprite_ptr openSprite;
	int width;
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

import "stdafx.js"
import "tileRenderer/ConstructionSprite.js"
import "Stockpile.js"
import "Farmplot.js"
import "Door.js"
import "SpawningPool.js"

ConstructionSprite.ConstructionSprite()
	: sprites(), 
	underconstructionSprites(),
	unreadyTrapSprites(),
	openSprite(),
	width(1){}

ConstructionSprite.~ConstructionSprite() {}

void ConstructionSprite.Draw(int screenX, int screenY, const Coordinate& internalPos) const {
	if (IsValid()) {
		int xOffset = internalPos.X() % width;
		int yOffset = internalPos.Y() % (sprites.size() / width);

		int graphicIndex = xOffset + width * yOffset;
		sprites.at(graphicIndex).Draw(screenX, screenY);
	}
}

void ConstructionSprite.DrawUnderConstruction(int screenX, int screenY, const Coordinate& internalPos) const {
	if (underconstructionSprites.size() > 0)
	{
		if (!IsConnectionMap() && underconstructionSprites.size() == sprites.size() && IsValid()) {
			int xOffset = internalPos.X() % width;
			int yOffset = internalPos.Y() % (sprites.size() / width);

			int graphicIndex = xOffset + width * yOffset;
			underconstructionSprites.at(graphicIndex).Draw(screenX, screenY);
		} else {
			underconstructionSprites.at(0).Draw(screenX, screenY);
		}
	}
}

void ConstructionSprite.DrawUnreadyTrap(int screenX, int screenY, const Coordinate& internalPos) const {
	if (unreadyTrapSprites.size() > 0)
	{
		if (!IsConnectionMap() && unreadyTrapSprites.size() == sprites.size() && IsValid()) {
			int xOffset = internalPos.X() % width;
			int yOffset = internalPos.Y() % (sprites.size() / width);

			int graphicIndex = xOffset + width * yOffset;
			unreadyTrapSprites.at(graphicIndex).Draw(screenX, screenY);
		} else {
			unreadyTrapSprites.at(0).Draw(screenX, screenY);
		}
	} else { 
		Draw(screenX, screenY, internalPos);
	}
}

void ConstructionSprite.DrawOpen(int screenX, int screenY, const Coordinate& internalPos) const {
	if (openSprite.Exists()) {
		openSprite.Draw(screenX, screenY);
	} else {
		Draw(screenX, screenY, internalPos);
	}
}

void ConstructionSprite.Draw(int screenX, int screenY, Sprite.ConnectedFunction connected) const {
	if (IsValid() && IsConnectionMap()) {
		sprites[0].Draw(screenX, screenY, connected);
	}
}

void ConstructionSprite.DrawUnderConstruction(int screenX, int screenY, Sprite.ConnectedFunction connected) const {
	if (underconstructionSprites.size() > 0) {
		underconstructionSprites[0].Draw(screenX, screenY, connected);
	}
}

void ConstructionSprite.DrawUnreadyTrap(int screenX, int screenY, Sprite.ConnectedFunction connected) const {
	if (unreadyTrapSprites.size() > 0) {
		unreadyTrapSprites[0].Draw(screenX, screenY, connected);
	} else {
		Draw(screenX, screenY, connected);
	}
}

void ConstructionSprite.DrawOpen(int screenX, int screenY, Sprite.ConnectedFunction connected) const {
	if (openSprite.Exists()) {
		openSprite.Draw(screenX, screenY);
	} else {
		Draw(screenX, screenY, connected);
	}
}

void ConstructionSprite.AddSprite(Sprite_ptr sprite) {
	sprites.push_back(sprite);
}

void ConstructionSprite.AddUnderConstructionSprite(Sprite_ptr sprite) {
	underconstructionSprites.push_back(sprite);
}

void ConstructionSprite.AddUnreadyTrapSprite(Sprite_ptr sprite) {
	unreadyTrapSprites.push_back(sprite);
}

void ConstructionSprite.SetOpenSprite(Sprite_ptr sprite) {
	openSprite = sprite;
}

void ConstructionSprite.SetWidth(int val) {
	width = val;
}

bool ConstructionSprite.IsValid() const {
	int sprites_size = static_cast<int>(sprites.size());
	return sprites_size > 0 &&
		(sprites[0].IsConnectionMap() 
		 || (width > 0
			 && width <= sprites_size
			 && (sprites_size / width) * width == sprites_size));
}

bool ConstructionSprite.IsConnectionMap() const {
	return sprites.size() > 0 && sprites[0].IsConnectionMap();
}

bool ConstructionSprite.HasUnderConstructionSprites() const {
	return (underconstructionSprites.size() > 0);
}

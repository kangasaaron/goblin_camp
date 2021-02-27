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
import "tileRenderer/ogl/OGLTilesetRenderer.js"

class OGLSprite  extends /*public*/ Sprite
{
//public:
	explicit OGLSprite(OGLTilesetRenderer * const renderer, int id);
	template <typename IterT> explicit OGLSprite(OGLTilesetRenderer * const renderer, IterT start, IterT end, bool connectionMap, int frameRate = 15, int frameCount = 1);
	~OGLSprite();
	
//protected:
	void DrawInternal(int screenX, int screenY, int tile) const;
	void DrawInternal(int screenX, int screenY, int tile, Corner corner) const;

//private:
	OGLTilesetRenderer * renderer;
};

template <typename IterT> OGLSprite.OGLSprite(OGLTilesetRenderer * const renderer, IterT start, IterT end, bool connectionMap, int frameRate, int frames)
	: Sprite(start, end, connectionMap, frameRate, frames),
	  renderer(renderer)
{
}/* Copyright 2011 Ilkka Halila
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

import "tileRenderer/ogl/OGLSprite.js"

OGLSprite.OGLSprite(OGLTilesetRenderer * const renderer, int tile)
	: Sprite(tile),
	  renderer(renderer)
{
}

OGLSprite.~OGLSprite() {}

void OGLSprite.DrawInternal(int screenX, int screenY, int tile) const {
	if (tile != -1) {
		renderer.DrawSprite(screenX, screenY, tile);
	}
}

void OGLSprite.DrawInternal(int screenX, int screenY, int tile, Corner corner) const {
	if (tile != -1) {
		renderer.DrawSpriteCorner(screenX, screenY, tile, corner);
	}
}
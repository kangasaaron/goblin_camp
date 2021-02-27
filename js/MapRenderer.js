/* Copyright 2010-2011 Ilkka Halila
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

import {
	CursorType
} from "./UI/CursorType.js";

import "boost/noncopyable.js"
import "libtcod.js"
import "NPC.js"
import "Item.js"
import "Coordinate.js"
import "Map.js"


class MapRenderer {
	virtual~MapRenderer() = 0;

	virtual void PreparePrefabs() = 0;

	/**
	 * Draws the map.
	 *
	 * focus is the location in tile space the viewport is focused on
	 * viewport is the location on the screen in pixels being rendered to
	 **/
	virtual void DrawMap(Map * map, float focusX, float focusY, int viewportX = 0, int viewportY = 0, int viewportW = -1, int viewportH = -1) = 0;

	/**
	 * Calculates the coordinate in tile space under the given screen location
	 *
	 * screen is the location in screen space (pixels) to get the tile under
	 * focus is the location in tile space the viewport is focused on
	 * viewport is the location on the screen in pixels where the viewport is
	 **/
	virtual Coordinate TileAt(int screenX, int screenY, float focusX, float focusY, int viewportX = 0, int viewportY = 0, int viewportW = -1, int viewportH = -1) const = 0;

	/**
	 * Returns the rate the camera should move at. This allows for it to be modified by zoom distance or tile size
	 */
	virtual float ScrollRate() const = 0;

	virtual void SetCursorMode(CursorType mode) = 0;
	virtual void SetCursorMode(const NPCPreset & preset) = 0;
	virtual void SetCursorMode(const ItemPreset & preset) = 0;
	virtual void SetCursorMode(int other) = 0;

	virtual void DrawCursor(const Coordinate & pos, bool placeable) = 0;
	virtual void DrawCursor(const Coordinate & start,
		const Coordinate & end, bool placeable) = 0;

	virtual void SetTranslucentUI(bool translucent) = 0;
};


MapRenderer.~MapRenderer() {}
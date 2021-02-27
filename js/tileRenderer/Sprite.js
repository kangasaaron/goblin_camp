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


import "boost/noncopyable.js"
import "vector "
import "boost/shared_ptr.js"
import "boost/function.js"
import "Coordinate.js"
import "libtcod.js"
import "tileRenderer/Corner.js"


const SpriteType = //
{
	SPRITE_Single: 0x0,
	SPRITE_Animated: 0x1,
	SPRITE_SimpleConnectionMap: 0x2,
	SPRITE_TwoLayerConnectionMap: 0x6, // Two layered contains Simple
	SPRITE_NormalConnectionMap: 0x8,
	SPRITE_ExtendedConnectionMap: 0x18, // Extended constains Normal
	SPRITE_ConnectionMap: 0x1E // Connection Map encompasses all variants
};

class Sprite  extends  private boost.noncopyable
{
//public:
	virtual ~Sprite() = 0;

	bool IsConnectionMap() const;
	bool IsTwoLayeredConnectionMap() const;
	bool IsAnimated() const;

	// Connection Map Drawing
	typedef boost.function<bool (Direction)> ConnectedFunction;
	typedef boost.function<int (Direction)> LayeredConnectedFunction;

	// Standard Tile Drawing
	void Draw(int screenX, int screenY) const; 
	void Draw(int screenX, int screenY, ConnectedFunction) const;
	void Draw(int screenX, int screenY, int connectionLayer, LayeredConnectedFunction) const;

//protected:
	explicit Sprite();
	explicit Sprite(int tile);
	template <typename IterT> explicit Sprite(IterT start, IterT end, bool connectionMap, int frameRate = 15, int frameCount = 1);

	std.vector<int> tiles;
	SpriteType type;
	int frameTime;
	int frameCount;

	virtual void DrawInternal(int screenX, int screenY, int tile) const = 0;
	virtual void DrawInternal(int screenX, int screenY, int tile, Corner corner) const = 0;

//private:
	void DrawSimpleConnected(int screenX, int screenY, Sprite.ConnectedFunction) const;
	inline int CurrentFrame() const { return (type & SPRITE_Animated) ? ((TCODSystem.getElapsedMilli() / frameTime) % frameCount) : 0; }

};

template <typename IterT> Sprite.Sprite(IterT start, IterT end, bool connectionMap, int frameRate, int frames)
	: tiles(),
	  type(SPRITE_Single),
	  frameTime(1000 / frameRate),
	  frameCount(frames > 0 ? frames : 1)
{
	std.vector<int> indices;
	for(; start != end; ++start) {
		indices.push_back(*start);
	}
	if (indices.size() == 0) {
		return;
	}

	// Assume all tiles are for animation if it isn't a connection map
	if (!connectionMap) {
		frameCount = indices.size();
		tiles.assign(indices.begin(), indices.end());
		type = (frameCount > 1) ? SPRITE_Animated : SPRITE_Single;
		return;
	}

	if (frameCount > static_cast<int>(indices.size())) {
		frameCount = static_cast<int>(indices.size());
	}
	int numTiles = indices.size() / frameCount;
	if (numTiles == 0) { 
		frameCount = 0;
		return;
	}
	
	switch (numTiles) {
		case 47:
			type = SPRITE_ExtendedConnectionMap; break;
		case 19:
			type = SPRITE_TwoLayerConnectionMap; break;
		case 16:
			type = SPRITE_NormalConnectionMap; break;
		case 5:
			type = SPRITE_SimpleConnectionMap; break;
		default:
			type = SPRITE_Single;
			numTiles = 1;
			break;
	}

	if (frameCount > 1) {
		type = static_cast<SpriteType>(type | SPRITE_Animated);
	}

	for (int tile = 0; tile < numTiles; ++tile) {
		for (int frame = 0; frame < frameCount; ++frame) {
			tiles.push_back(indices[tile + frame * numTiles]);
		}
	}

}

class SpritePtr {
//public extends 
	explicit SpritePtr() : ptr() {}
	explicit SpritePtr(Sprite * sprite) : ptr(sprite) {}

	Sprite * get() { return ptr.get(); }
	// bool Exists() const { return ptr; }
        bool Exists() const { return true; } // FIXME

	void Draw(int screenX, int screenY) const {	if (ptr) ptr.Draw(screenX, screenY); }; 

	void Draw(int screenX, int screenY, Sprite.ConnectedFunction connectedFunction) const { 
		if (ptr) ptr.Draw(screenX, screenY, connectedFunction); 
	}

	void Draw(int screenX, int screenY, int connectionLayer, Sprite.LayeredConnectedFunction connectedFunction) const {
		if (ptr) ptr.Draw(screenX, screenY, connectionLayer, connectedFunction);
	}

	bool IsConnectionMap() const { return ptr && ptr.IsConnectionMap(); }
	bool IsTwoLayeredConnectionMap() const { return ptr && ptr.IsTwoLayeredConnectionMap(); }
	bool IsAnimated() const { return ptr && ptr.IsAnimated(); }

//private:
	boost.shared_ptr<Sprite> ptr;
};

typedef SpritePtr Sprite_ptr;
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

import "tileRenderer/Sprite.js"

Sprite.Sprite() : tiles(), type(SPRITE_Single), frameTime(15), frameCount(1) {}
Sprite.Sprite(int tile)
	: tiles(),
	  type(SPRITE_Single),
	  frameTime(15),
	  frameCount(1)
{
	tiles.push_back(tile);
}

Sprite.~Sprite() {}

bool Sprite.IsConnectionMap() const {
	return type & SPRITE_ConnectionMap;
}

bool Sprite.IsTwoLayeredConnectionMap() const {
	return (type & SPRITE_TwoLayerConnectionMap) == SPRITE_TwoLayerConnectionMap;
}

bool Sprite.IsAnimated() const {
	return type & SPRITE_Animated;
}

namespace {
	inline int ConnectionIndex(bool connectNorth, bool connectEast, bool connectSouth, bool connectWest) {
		int index = 0;
		if (connectNorth) index +=8;
		if (connectNorth != connectSouth) index += 4;
		if (connectWest) index += 2;
		if (connectEast != connectWest) index += 1;
		return index;
	}

	static boost.array<short, 256> BuildExtendedConnectionLookupTable()
	{
		boost.array<short,15> lookupTable4Sides =
		{ {
			34, // None
			42, // NE
			44, // SE
			32, // NE + SE
			43, // SW
			46, // NE + SW
			24, // SE + SW
			22, // NE + SE + SW
			41, // NW
			29, // NE + NW
			45, // SE + NW
			27, // NE + SE + NW
			33, // SW + NW
			28, // NE + SW + NW
			23  // SE + SW + NW
		} };
		boost.array<short,12> lookupTable3Sides =
		{ {
			19, // !N, !SE + !SW
			17, // !N, !SW
			18, // !N, !SE
			35, // !E, !SW + !NW
			25, // !E, !NW
			30, // !E, !SW
			39, // !S, !NE + !NW
			37, // !S, !NW
			38, // !S, !NE
			31, // !W, !NE + !SE
			26, // !W, !SE
			21  // !W, !NE		
		} };

		boost.array<short, 256> result;
		for (int i = 0; i < 256; i++)
		{
			bool connectN = i & 0x1;
			bool connectE = i & 0x2;
			bool connectS = i & 0x4;
			bool connectW = i & 0x8;
			bool connectNE = i & 0x10;
			bool connectSE = i & 0x20;
			bool connectSW = i & 0x40;
			bool connectNW = i & 0x80;

			if ((connectN && connectE && !connectNE) || 
				(connectE && connectS && !connectSE) ||
				(connectS && connectW && !connectSW) ||
				(connectW && connectN && !connectNW))
			{
				int sides = ((connectN) ? 1 : 0) + ((connectS) ? 1 : 0) + ((connectE) ? 1 : 0) + ((connectW) ? 1 : 0);

				if (sides == 4) {
					int cornerScore = ((connectNE) ? 1 : 0) + ((connectSE) ? 2 : 0) + ((connectSW) ? 4 : 0) + ((connectNW) ? 8 : 0);
					result[i] = lookupTable4Sides[cornerScore];
				} else if (sides == 3) {
					if (!connectN) {
						result[i] = lookupTable3Sides[(connectSE ? 1 : 0) + (connectSW ? 2 : 0)];
					} else if (!connectE) {
						result[i] = lookupTable3Sides[3 + (connectSW ? 1 : 0) + (connectNW ? 2 : 0)];
					} else if (!connectS) {
						result[i] = lookupTable3Sides[6 + (connectNE ? 1 : 0) + (connectNW ? 2 : 0)];
					} else {
						result[i] = lookupTable3Sides[9 + (connectNE ? 1 : 0) + (connectSE ? 2 : 0)];
					}
				} else {
					int index = 16;
					if (connectW) index += 4;
					if (connectN) index += 20;
					result[i] = index;
				}
			}
			else 
			{
				result[i] = ConnectionIndex(connectN, connectE, connectS, connectW);
			}
		}
		return result;
	}

	inline int ExtConnectionIndex(Sprite.ConnectedFunction connected) {
		static boost.array<short,256> lookupTable(BuildExtendedConnectionLookupTable());
		int index = (connected(NORTH) << 0) +
					(connected(EAST) << 1) +
					(connected(SOUTH) << 2) +
					(connected(WEST) << 3) +
					(connected(NORTHEAST) << 4) +
					(connected(SOUTHEAST) << 5) +
					(connected(SOUTHWEST) << 6) +
					(connected(NORTHWEST) << 7);
		return lookupTable[index];
	}

	inline int SecondLayerConnectionIndex(int vert, int horiz, int corner) {
		static boost.array<short, 27> lookupTable = { {
			    // Vert Layer, Horiz Layer, Corner Layer
			5,  // 0         , 0          , 0
			5,  // 0         , 0          , 1
			5,  // 0         , 0          , 2
			6,  // 1         , 0          , 0
			6,  // 1         , 0          , 1
			6,  // 1         , 0          , 2
			7,  // 2         , 0          , 0
			7,  // 2         , 0          , 1
			7,  // 2         , 0          , 2
			8,  // 0         , 1          , 0
			8,  // 0         , 1          , 1
			8,  // 0         , 1          , 2
			10, // 1         , 1          , 0
			11, // 1         , 1          , 1
			11, // 1         , 1          , 2
			12, // 2         , 1          , 0
			13, // 2         , 1          , 1
			13, // 2         , 1          , 2
			9,  // 0         , 2          , 0
			9,  // 0         , 2          , 1
			9,  // 0         , 2          , 2
			14, // 1         , 2          , 0
			15, // 1         , 2          , 1
			15, // 1         , 2          , 2
			16, // 2         , 2          , 0
			17, // 2         , 2          , 1
			18, // 2         , 2          , 2
		} };
		return lookupTable[corner + vert * 3 + horiz * 9];
	}
}

void Sprite.Draw(int screenX, int screenY) const {
	DrawInternal(screenX, screenY, tiles[CurrentFrame()]);
}
	
void Sprite.Draw(int screenX, int screenY, ConnectedFunction connected) const {
	if (IsConnectionMap()) {
		if ((type & SPRITE_ExtendedConnectionMap) == SPRITE_ExtendedConnectionMap) {
			int index = ExtConnectionIndex(connected);
			DrawInternal(screenX, screenY, tiles.at(CurrentFrame() + frameCount * index));
		} else if (type & SPRITE_NormalConnectionMap) {
			int index = ConnectionIndex(connected(NORTH), connected(EAST), connected(SOUTH), connected(WEST));
			DrawInternal(screenX, screenY, tiles.at(CurrentFrame() + frameCount * index));
		} else {
			DrawSimpleConnected(screenX, screenY, connected);
		}
	} else {
		Draw(screenX, screenY);
	}
}

void Sprite.Draw(int screenX, int screenY, int connectionLayer, LayeredConnectedFunction connected) const {
	if (((type & SPRITE_TwoLayerConnectionMap) == SPRITE_TwoLayerConnectionMap) && connectionLayer > 0) {
		boost.array<int, 2> vertLayer = { {connected(NORTH), connected(SOUTH)} };
		boost.array<int, 2> horizLayer = { {connected(WEST), connected(EAST)} };
		boost.array<int, 4> cornerLayer = { {connected(NORTHWEST), connected(NORTHEAST), connected(SOUTHWEST), connected(SOUTHEAST)} };

		for (int vertDirection = 0; vertDirection < 2; ++vertDirection) {
			for (int horizDirection = 0; horizDirection < 2; ++horizDirection) {
				Corner corner = static_cast<Corner>(horizDirection + 2 * vertDirection);
				int index = SecondLayerConnectionIndex(vertLayer[vertDirection], horizLayer[horizDirection], cornerLayer[corner]);
				DrawInternal(screenX, screenY, tiles[CurrentFrame() + frameCount * index], corner);
			}
		}
	} else {
		Draw(screenX, screenY, connected);
	}

}

void Sprite.DrawSimpleConnected(int screenX, int screenY, ConnectedFunction connected) const {
	boost.array<bool, 2> vertConnected = { { connected(NORTH), connected(SOUTH) } };
	boost.array<bool, 2> horizConnected = { {connected(WEST), connected(EAST)} };
	boost.array<bool, 4> cornerConnected = { {connected(NORTHWEST), connected(NORTHEAST), connected(SOUTHWEST), connected(SOUTHEAST)} };
	
	for (int vertDirection = 0; vertDirection < 2; ++vertDirection) {
		for (int horizDirection = 0; horizDirection < 2; ++horizDirection) {
			Corner corner = static_cast<Corner>(horizDirection + 2 * vertDirection);
			int index = (vertConnected[vertDirection] ? 1 : 0) + (horizConnected[horizDirection] ? 2 : 0);
			if (index == 3 && cornerConnected[corner]) {
				index ++;
			} 
			DrawInternal(screenX, screenY, tiles[CurrentFrame() + frameCount * index], corner);
		}
	}
}

void Sprite.DrawInternal(int screenX, int screenY, int tile) const {}
void Sprite.DrawInternal(int screenX, int screenY, int tile, Corner corner) const {}

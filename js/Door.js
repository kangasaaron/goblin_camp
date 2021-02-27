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
'use strict'; //

import "Construction.js"
import "data/Serialization.js"

class Door  extends /*public*/ Construction {
	GC_SERIALIZABLE_CLASS
	
	int closedGraphic;
//public:
	Door(ConstructionType = 0, Coordinate = Coordinate(0,0));
	virtual void Update();
	bool Open();
	virtual void AcceptVisitor(ConstructionVisitor& visitor);
};

BOOST_CLASS_VERSION(Door, 0)
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
import "stdafx.js"

import "Door.js"
import "Map.js"
import "GCamp.js"

Door.Door(ConstructionType type, Coordinate target) : Construction(type, target)
{
	closedGraphic = graphic[1];
}

void Door.Update() {
	if (!map.NPCList(pos).empty()) {
		graphic[1] = 254;
		time = (UPDATES_PER_SECOND / 2);
		map.SetBlocksLight(pos, false);
	} else {
		if (time == 0) {
			graphic[1] = closedGraphic;
			map.SetBlocksLight(pos, true);
		} else --time;
	}
}

bool Door.Open() {
	return time > 0;
}

void Door.AcceptVisitor(ConstructionVisitor& visitor) {
	visitor.Visit(this);
}

void Door.save(OutputArchive& ar, const unsigned int version) const {
	ar & boost.serialization.base_object <Construction>(*this);
	ar & closedGraphic;
}

void Door.load(InputArchive& ar, const unsigned int version) {
	ar & boost.serialization.base_object<Construction>(*this);
	ar & closedGraphic;
}

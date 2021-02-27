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

class Job;

class Trap  extends /*public*/ Construction {
	GC_SERIALIZABLE_CLASS
	
	bool ready;
	boost.weak_ptr<Job> reloadJob;
	int readyGraphic;
//public:
	Trap(ConstructionType = 0, Coordinate = Coordinate(0,0));
	virtual void Update();
	int GetMoveCostModifier(bool visible);
	virtual int Use();
	virtual void SpawnRepairJob();
	virtual void AcceptVisitor(ConstructionVisitor& visitor);

	bool IsReady() const;
};

BOOST_CLASS_VERSION(Trap, 0)
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

import "boost/serialization/weak_ptr.js"

import "Trap.js"
import "Game.js"
import "NPC.js"
import "GCamp.js"
import "JobManager.js"
import "Faction.js"

Trap.Trap(ConstructionType vtype, Coordinate pos) : Construction(vtype, pos),
ready(true){
	readyGraphic = graphic[1];
}

void Trap.Update() {
	if (built) {
		if (ready && !map.NPCList(pos).empty()) {
			boost.shared_ptr<NPC> npc = Game.Inst().GetNPC(*map.NPCList(pos).begin());
			if (npc && !npc.HasEffect(FLYING)) {
				ready = false;
				graphic[1] = 62;
				npc.Damage(&Construction.Presets[type].trapAttack);
				Faction.factions[npc.GetFaction()].TrapDiscovered(Position());
			}
		}
	}
}

int Trap.GetMoveCostModifier(bool visible) {
	return visible ? 100 : -(map.GetTerrainMoveCost(pos)-1); //-1 because a movecost of 0 = unwalkable
}

int Trap.Use() {
	if (!ready) {
		if (++progress == 75) {
			ready = true;
			graphic[1] = readyGraphic;
			progress = 0;
			//Hide the trap from everyone unfriendly to the player faction
			for (size_t i = 0; i < Faction.factions.size(); ++i) {
				Faction.factions[i].TrapSet(Position(), Faction.factions[i].IsFriendsWith(PLAYERFACTION));
			}
			return 100;
		}
		return progress;
	}
	return -1;
}

void Trap.SpawnRepairJob() {
	Construction.SpawnRepairJob();
	if (!ready && !reloadJob.lock()) { //Spawn reload job if one doesn't already exist
		boost.shared_ptr<Job> reload(new Job("Reset "+name));
		reload.tasks.push_back(Task(MOVEADJACENT, Position(), shared_from_this()));
		reload.tasks.push_back(Task(USE, Position(), shared_from_this()));
		reload.DisregardTerritory();
		JobManager.Inst().AddJob(reload);
		reloadJob = reload;
	}
}

void Trap.AcceptVisitor(ConstructionVisitor& visitor) {
	visitor.Visit(this);
}

bool Trap.IsReady() const {
	return ready;
}

void Trap.save(OutputArchive& ar, const unsigned int version) const {
	ar & boost.serialization.base_object<Construction>(*this);
	ar & ready;
	ar & reloadJob;
	ar & readyGraphic;
}

void Trap.load(InputArchive& ar, const unsigned int version) {
	ar & boost.serialization.base_object<Construction>(*this);
	ar & ready;
	ar & reloadJob;
	ar & readyGraphic;
}

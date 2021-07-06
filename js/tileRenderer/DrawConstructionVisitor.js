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

import { Coordinate } from "../Coordinate.js";
import { ConstructionVisitor } from "../ConstructionVisitor.js";
import { TileSetRenderer } from "./TileSetRenderer.js";
import { TileSet } from "./TileSet.js";


class DrawConstructionVisitor extends ConstructionVisitor {
	/** @type {TileSetRenderer} **/
	tileSetRenderer = null;
	/** @type {TileSet} */
	tileSet = null;
	screenX = 0;
	screenY = 0;
	/** @type {Coordinate} */
	coordinate;

	/**
	 * 
	 * @param {TileSetRenderer} tileSetRenderer 
	 * @param {TileSet} tileSet 
	 * @param {number} screenX 
	 * @param {number} screenY 
	 * @param {Coordinate} pos 
	 */
	constructor(tileSetRenderer, tileSet, screenX, screenY, pos) {
		this.tileSetRenderer = tileSetRenderer;
		this.tileSet = tileSet;
		this.screenX = screenX;
		this.screenY = screenY;
		this.coordinate = pos;
	}
	Visit(anything) {
		if (anything instanceof FarmPlot)
			this.VisitFarmPlot(anything);
		if (anything instanceof Stockpile)
			this.VisitStockpile(anything);
		if (anything instanceof SpawningPool)
			this.VisitSpawningPool(anything);
		if (anything instanceof Door)
			this.VisitDoor(anything);
		if (anything instanceof Trap)
			this.VisitTrap(anything);
		if (anything instanceof Construction)
			this.VisitConstruction(anything);
	}
	VisitFarmPlot(farmplot) {
		this.tileSet.DrawBaseConstruction(screenX, screenY, farmplot, this.coordinate);
		this.tileSetRenderer.DrawFilth(screenX, screenY, this.coordinate);
		this.tileSet.DrawStockpileContents(screenX, screenY, farmplot, this.coordinate);
	}
	VisitStockpile(stockpile) {
		this.tileSet.DrawBaseConstruction(screenX, screenY, stockpile, this.coordinate);
		this.tileSetRenderer.DrawFilth(screenX, screenY, this.coordinate);
		this.tileSet.DrawStockpileContents(screenX, screenY, stockpile, this.coordinate);
	}
	VisitConstruction(construction) {
		this.tileSetRenderer.DrawFilth(screenX, screenY, this.coordinate);

		let internal_pos = this.coordinate.minusCoordinate(construction.Position());
		let pos = internal_pos.X() + internal_pos.Y() * Construction.Blueprint(construction.Type()).X();
		let maxPos = Construction.Blueprint(construction.Type()).X() * Construction.Blueprint(construction.Type()).Y();
		if ((construction.GetMaxCondition() + construction.Condition()) * maxPos > (pos + 1) * construction.GetMaxCondition()) {
			this.tileSet.DrawBaseConstruction(screenX, screenY, construction, this.coordinate);
		} else {
			this.tileSet.DrawUnderConstruction(screenX, screenY, construction, this.coordinate);
		}
	}

	VisitSpawningPool(spawningPool) {
		this.tileSetRenderer.DrawFilth(screenX, screenY, this.coordinate);
		if (spawningPool.Condition() < 0) {
			this.tileSet.DrawUnderConstruction(screenX, screenY, spawningPool, this.coordinate);
		} else {
			this.tileSet.DrawBaseConstruction(screenX, screenY, spawningPool, this.coordinate);
		}
	}

	VisitDoor(door) {
		this.tileSetRenderer.DrawFilth(screenX, screenY, this.coordinate);
		if (door.Condition() < 0) {
			this.tileSet.DrawUnderConstruction(screenX, screenY, door, this.coordinate);
		} else if (door.Open()) {
			this.tileSet.DrawOpenDoor(screenX, screenY, door, this.coordinate);
		} else {
			this.tileSet.DrawBaseConstruction(screenX, screenY, door, this.coordinate);
		}

	}

	VisitTrap(trap) {
		this.tileSetRenderer.DrawFilth(screenX, screenY, this.coordinate);
		let internal_pos = this.coordinate.minusCoordinate(trap.Position());

		let pos = internal_pos.X() + internal_pos.Y() * Construction.Blueprint(trap.Type()).X();
		let maxPos = Construction.Blueprint(trap.Type()).X() * Construction.Blueprint(trap.Type()).Y();
		if ((trap.GetMaxCondition() + trap.Condition()) * maxPos <= (pos + 1) * trap.GetMaxCondition()) {
			this.tileSet.DrawUnderConstruction(screenX, screenY, trap, this.coordinate);
		} else if (trap.IsReady()) {
			this.tileSet.DrawBaseConstruction(screenX, screenY, trap, this.coordinate);
		} else {
			this.tileSet.DrawUnreadyTrap(screenX, screenY, trap, this.coordinate);
		}
	}
}
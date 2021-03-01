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
    UIContainer
} from "./UIContainer.js";
import {
    Dialog
} from "./Dialog.js";
import {
    ScrollPanel
} from "./ScrollPanel.js";
import {
    UIList
} from "./UIList.js";

export class NPCDialog extends UIContainer {
    npcListDialog = null;
    NPCListDialog() {
        if (!this.npcListDialog) {
            this.npcListDialog = new Dialog(new NPCDialog(), "NPCs", Game.ScreenWidth() - 20, Game.ScreenHeight() - 20);
        }
        return this.npcListDialog;
    }

    constructor() {
        super([], 0, 0, Game.ScreenWidth() - 20, Game.ScreenHeight() - 20)
        this.AddComponent(
            new ScrollPanel(0, 0, width, height,
                new UIList(
                    (Game.npcList), 0, 0, width - 2, height, this.DrawNPC.bind(this)
                ),
                false
            )
        );
    }

    DrawNPC(npci, i, x, y, width, selected, the_console) {
        the_console.print(x, y, "NPC: %d", npci.second.Uid());
        the_console.print(x + 11, y, "%s: %s",
            npci.second.currentJob().lock() ? npci.second.currentJob().lock().name : "No job",
            npci.second.currentTask() ? Job.ActionToString(npci.second.currentTask().action) : "No task");
    }
}
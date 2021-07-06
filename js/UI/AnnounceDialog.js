/* Copyright 2010-2011 Ilkka Halila
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

import { Announce } from "../Announce.js";
import { Coordinate } from "../Coordinate.js";
import { Dialog } from "./Dialog.js";
import { Game } from "../Game.js";
import { MenuResult } from "./MenuResult.js";
import { Scrollable } from "./Scrollable.js";
import { ScrollPanel } from "./ScrollPanel.js";

export class AnnounceDialog extends Scrollable {
    constructor(){
        super();
        this.announcementsDialog = null;
        this.Announce = new Announce();
        this.Game = new Game();
    }

    Draw(x, y, scroll, width, height, the_console) {
        this.Announce.Draw(new Coordinate(x + 1, y), scroll, height, the_console);
    }

    Update(x, y, clicked, key) {
        if (clicked) {
            this.Announce.AnnouncementClicked(y - 1);
        }
        return MenuResult.MENUHIT;
    }

    TotalHeight() {
        return this.Announce.AnnounceAmount();
    }

    AnnouncementsDialog() {
        if (!this.announcementsDialog) {
            let width = Game.i.ScreenWidth() - 20;
            let height = Game.i.ScreenHeight() - 20;
            this.announcementsDialog = new Dialog(
                new ScrollPanel(0, 0, width, height, new AnnounceDialog(), false),
                "Announcements", width, height
            );
        }
        return this.announcementsDialog;
    }
}
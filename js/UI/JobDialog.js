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

import {
    Scrollable
} from "./Scrollable.js";
import {
    Dialog
} from "./Dialog.js";
import {
    ScrollPanel
} from "./ScrollPanel.js";

export class JobDialog extends Scrollable {
    Draw(_x, _y, scroll, width, height, the_console) {
        JobManager.Draw(new Coordinate(_x + 1, _y), scroll, width, height, the_console);
    }
    TotalHeight() {
        return JobManager.JobAmount();
    }

    jobListingDialog = null;
    JobListingDialog() {
        if (this.jobListingDialog) return this.jobListingDialog;

        let width = 50;
        if (Globals.DEBUG) {
            width = 100;
        }
        let height = Game.i.ScreenHeight() - 20;
        this.jobListingDialog = new Dialog(new ScrollPanel(0, 0, width, height, new JobDialog(), false), "Jobs", width, height);

        return this.jobListingDialog;
    }
}
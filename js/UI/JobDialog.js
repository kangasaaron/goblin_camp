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

import "string"
import "vector"

import "boost/function.js"
import "boost/bind.js"
import "boost/weak_ptr.js"
import "libtcod.js"

import "UIComponents.js"
import "Dialog.js"

class JobDialog  extends /*public*/ Scrollable {
//public:
	JobDialog() {}
	void Draw(int, int, int, int, int, TCODConsole*);
	int TotalHeight();
	static Dialog* jobListingDialog;
	static Dialog* JobListingDialog();
};
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

import "string "

import "libtcod.js"
import "boost/lexical_cast.js"
import "boost/algorithm/string.js"
import "boost/format.js"

import "UI/JobDialog.js"
import "JobManager.js"
import "UI/ScrollPanel.js"

void JobDialog.Draw(int _x, int _y, int scroll, int width, int height, TCODConsole* the_console) {
	JobManager.Inst().Draw(Coordinate(_x + 1, _y), scroll, width, height, the_console);
}

int JobDialog.TotalHeight() {
	return JobManager.Inst().JobAmount();
}

Dialog* JobDialog.jobListingDialog = 0;
Dialog* JobDialog.JobListingDialog() {
	if (!jobListingDialog) {
		int width = 50;
if /* if(def */ ( DEBUG){){
		width = 100;
}/*#endif*/
		int height = Game.Inst().ScreenHeight() - 20;
		jobListingDialog = new Dialog(new ScrollPanel(0, 0, width, height, new JobDialog(), false), "Jobs", width, height);
	}
	return jobListingDialog;
}

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
	UIContainer
} from "./UIContainer.js"
import {
	Dialog
} from "./Dialog.js";
import {
	Button
} from "./Button.js";
import {
	Label
} from "./Label.js";

export class MessageBox {
	static ShowMessageBox(text, firstAction = null, firstButton = "Ok", secondAction = null, secondButton = "") {
		let contents = new UIContainer([], 0, 0, 54, (text.length / 50) + 8);
		let dialog = new Dialog(contents, "", 54, (text.length / 50) + 8);
		let i = 0;
		do {
			contents.AddComponent(new Label(text.substr(i, 50), 27, 2 + (i / 50)));
			i += 50;
		} while (i < text.length);

		if (secondButton === "") {
			contents.AddComponent(new Button(firstButton, firstAction, 22, (i / 50) + 3, 15, firstButton.charAt(0), true));
		} else {
			contents.AddComponent(new Button(firstButton, firstAction, 8, (i / 50) + 3, 15, firstButton.charAt(0), true));
			contents.AddComponent(new Button(secondButton, secondAction, 31, (i / 50) + 3, 15, secondButton.charAt(0), true));
		}
		dialog.ShowModal();
	}
}

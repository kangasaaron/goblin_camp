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
    Button
} from "./Button.js";
import {
    Label
} from "./Label.js";
import {
    ScrollPanel
} from "./ScrollPanel.js";
import {
    UIList
} from "./UIList.js";
import {
    TextBox
} from "./TextBox.js";

import "UI/Spinner.js"
import "UI.js"
import "Game.js"
import "Stockpile.js"

export class ConstructionDialog extends UIContainer {
    construct = null;
    constructor(nwidth, nheight) {
        super([], 0, 0, nwidth, nheight);
    }
    Construct(Construction);
    Rename();
    Dismantle();
    Expand();
    CancelJob(job);
    static constructionInfoDialog = null;
    static cachedConstruct = null;
    static ConstructionInfoDialog(wcons) {
        if (letcons = wcons.lock()) {
            if (this.constructionInfoDialog && (!this.cachedConstruct.lock() || cons != this.cachedConstruct.lock())) {
                delete this.constructionInfoDialog;
                this.constructionInfoDialog = null;
            }
            if (!this.constructionInfoDialog) {
                this.cachedConstruct = cons;
                let dialog = new ConstructionDialog(50, 5);
                this.constructionInfoDialog = new Dialog(dialog, "", 50, 5);
                if (!cons.HasTag(FARMPLOT)) {
                    dialog.AddComponent(new Button("Rename", ConstructionDialog.Rename.bind(this, dialog), 12, 1, 10));
                    dialog.AddComponent(new Button("Dismantle", ConstructionDialog.Dismantle.bind(this, dialog), 28, 1, 13));
                } else {
                    dialog.AddComponent(new Button("Rename", ConstructionDialog.Rename.bind(this, dialog), 2, 1, 10));
                    dialog.AddComponent(new Button("Dismantle", ConstructionDialog.Dismantle.bind(this, dialog), 18, 1, 13));
                    dialog.AddComponent(new Button("Expand", ConstructionDialog.Expand.bind(this, dialog), 37, 1, 10));
                }

                if (cons.Producer()) {
                    this.constructionInfoDialog.SetHeight(40);
                    dialog.AddComponent(new Label("Job Queue", 2, 5, TCOD_LEFT));
                    dialog.AddComponent(new ScrollPanel(2, 6, 23, 34,
                        new UIList(cons.JobList(), 0, 0, 20, 34,
                            ConstructionDialog.DrawJob,
                            ConstructionDialog.CancelJob.bind(this, dialog)),
                        false));
                    dialog.AddComponent(new Label("Product List", 26, 5, TCOD_LEFT));
                    let productList = new ProductList(cons);
                    for (let prodi = 0; prodi < cons.Products().length; ++prodi) {
                        productList.productPlacement.push(productList.height);
                        productList.height += 2 + Item.Components(cons.Products(prodi)).length;
                    }
                    dialog.AddComponent(new ScrollPanel(26, 6, 23, 34,
                        productList,
                        false));
                }
                this.constructionInfoDialog.SetTitle(cons.Name());
                dialog.Construct(cons);
            }
        } else if (this.constructionInfoDialog) {
            delete this.constructionInfoDialog;
            this.constructionInfoDialog = null;
        }
        return this.constructionInfoDialog;
    }

    Construct(cons) {
        this.construct = cons;
    }

    Rename() {
        if (this.construct.lock()) {
            let contents = new UIContainer([], 1, 1, 28, 7);
            contents.AddComponent(new TextBox(0, 1, 28, Entity.Name.bind(Entity, construct.lock()), Entity.Name.bind(Entity, construct.lock())));
            contents.AddComponent(new Button("OK", null, 11, 3, 6, TCODK_ENTER, true));
            let renameDialog = new Dialog(contents, "Rename", 30, 8);
            renameDialog.ShowModal();
        }
    }

    Dismantle() {
        if (this.construct.lock()) {
            UI.CloseMenu();
            this.construct.lock().Dismantle(undefined);
        }
    }

    Expand() {
        if (this.construct.lock()) {
            let rectCall = Stockpile.Expand.bind(this, construct.lock());
            let placement = Game.CheckPlacement.bind(this, Coordinate(1, 1),
                Construction.Presets[this.construct.lock().Type()].tileReqs);
            UI.CloseMenu();
            UI.ChooseRectPlacementCursor(rectCall, placement, Cursor_Stockpile);
        }
    }

    CancelJob(job) {
        let cons;
        if (cons = construct.lock()) {
            cons.CancelJob(job);
        }
    }

    static DrawJob(category, i, x, y, width, selected, the_console) {
        the_console.setDefaultForeground(i == 0 ? Color.white : Color.grey);
        the_console.print(x, y, Item.ItemTypeToString(category));
        the_console.setDefaultForeground(Color.white);
    }
}

ConstructionDialog.ProductList = class ProductList extends Scrollable {
    construct = null;
    height = 0;
    productPlacement = [];
    constructor(nconstruct) {
        super();
        this.construct = nconstruct;
    }

    Draw(x, _y, scroll, width, _height, the_console) {
        let cons;
        if (cons = this.construct.lock()) {
            let y = 0;
            for (let prodi = 0; prodi < cons.Products().length && y < scroll + _height; ++prodi) {
                if (y >= scroll) {
                    the_console.setDefaultForeground(Color.white);
                    the_console.print(x, _y + y - scroll, "%s x%d", Item.ItemTypeToString(cons.Products(prodi)), Item.Presets[cons.Products(prodi)].multiplier);
                }
                ++y;
                for (let compi = 0; compi < Item.Components(cons.Products(prodi)).length && y < scroll + _height; ++compi) {
                    if (y >= scroll) {
                        the_console.setDefaultForeground(Color.white);
                        the_console.putChar(x + 1, _y + y - scroll, compi + 1 < Item.Components(cons.Products(prodi)).length ? TCOD_CHAR_TEEE : TCOD_CHAR_SW, TCOD_BKGND_SET);
                        the_console.setDefaultForeground(Color.grey);
                        the_console.print(x + 2, _y + y - scroll, Item.ItemCategoryToString(Item.Components(cons.Products(prodi), compi)));
                    }
                    ++y;
                }
                ++y;
            }
        }
        the_console.setDefaultForeground(Color.white);
    }

    TotalHeight() {
        return height;
    }

    Update(x, y, clicked, key) {
        for (let i = 0; i < this.productPlacement.length; ++i) {
            if (y == this.productPlacement[i]) {
                if (clicked && this.construct.lock()) {
                    this.construct.lock().AddJob(this.construct.lock().Products(i));
                }
                return MenuResult.MENUHIT;
            }
        }
        return MenuResult.NOMENUHIT;
    }
}
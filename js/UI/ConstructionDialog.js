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

 import {Button} from "./Button.js";
 import {TCOD_alignment_t, Color, TCOD_keycode_t} from "../libtcod.js";
 import {Construction} from "../Construction.js";
 import {ConstructionTag} from "../ConstructionTag.js";
 import {Coordinate} from "../Coordinate.js";
 import {CursorType} from "./CursorType.js";
 import {Dialog} from "./Dialog.js";
 import {Entity} from "../Entity.js";
//  import {Game} from "../Game.js";
 import {Item} from "../Item.js";
 import {Label} from "./Label.js";
 import {ProductList} from "./ProductList.js";
 import {ScrollPanel} from "./ScrollPanel.js";
//  import {Spinner} "./UI/Spinner.js";
 import {Stockpile} from "../Stockpile.js";
 import {TextBox} from "./TextBox.js";
//  import {UI} from "./UI.js";
 import {UIContainer} from "./UIContainer.js";
 import {UIList} from "./UIList.js";
 import {UI} from "./UI.js";


export class ConstructionDialog extends UIContainer {
    constructor(nwidth, nheight) {
        super([], 0, 0, nwidth, nheight);
        this.construct = null;    
    }
    static ConstructionInfoDialog(wcons) {
        let cons = wcons.lock();
        if (cons ) {
            if (this.constructionInfoDialog && (!this.cachedConstruct.lock() || cons !== this.cachedConstruct.lock())) {
                delete this.constructionInfoDialog;
                this.constructionInfoDialog = null;
            }
            if (!this.constructionInfoDialog) {
                this.cachedConstruct = cons;
                let dialog = new ConstructionDialog(50, 5);
                this.constructionInfoDialog = new Dialog(dialog, "", 50, 5);
                if (!cons.HasTag(ConstructionTag.FARMPLOT)) {
                    dialog.AddComponent(new Button("Rename", ConstructionDialog.Rename.bind(this, dialog), 12, 1, 10));
                    dialog.AddComponent(new Button("Dismantle", ConstructionDialog.Dismantle.bind(this, dialog), 28, 1, 13));
                } else {
                    dialog.AddComponent(new Button("Rename", ConstructionDialog.Rename.bind(this, dialog), 2, 1, 10));
                    dialog.AddComponent(new Button("Dismantle", ConstructionDialog.Dismantle.bind(this, dialog), 18, 1, 13));
                    dialog.AddComponent(new Button("Expand", ConstructionDialog.Expand.bind(this, dialog), 37, 1, 10));
                }

                if (cons.Producer()) {
                    this.constructionInfoDialog.SetHeight(40);
                    dialog.AddComponent(new Label("Job Queue", 2, 5, TCOD_alignment_t.TCOD_LEFT));
                    dialog.AddComponent(new ScrollPanel(2, 6, 23, 34,
                        new UIList(cons.JobList(), 0, 0, 20, 34,
                            ConstructionDialog.DrawJob,
                            ConstructionDialog.CancelJob.bind(this, dialog)),
                        false));
                    dialog.AddComponent(new Label("Product List", 26, 5, TCOD_alignment_t.TCOD_LEFT));
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
            contents.AddComponent(new TextBox(0, 1, 28, Entity.Name.bind(Entity, this.construct.lock()), Entity.Name.bind(Entity, this.construct.lock())));
            contents.AddComponent(new Button("OK", null, 11, 3, 6, TCOD_keycode_t.TCODK_ENTER, true));
            let renameDialog = new Dialog(contents, "Rename", 30, 8);
            renameDialog.ShowModal();
        }
    }

    Dismantle() {
        if (this.construct.lock()) {
            UI.i.CloseMenu();
            this.construct.lock().Dismantle(undefined);
        }
    }

    Expand() {
        if (this.construct.lock()) {
            let rectCall = Stockpile.Expand.bind(this, this.construct.lock());
            let placement = this.Game.i.CheckPlacement.bind(this, Coordinate(1, 1),
                Construction.Presets[this.construct.lock().Type()].tileReqs);
            UI.i.CloseMenu();
            UI.i.ChooseRectPlacementCursor(rectCall, placement, CursorType.Cursor_Stockpile);
        }
    }

    CancelJob(job) {
        let cons = this.construct.lock();
        if (cons ) {
            cons.CancelJob(job);
        }
    }

    static DrawJob(category, i, x, y, width, selected, the_console) {
        the_console.setDefaultForeground(i === 0 ? Color.white : Color.grey);
        the_console.print(x, y, Item.ItemTypeToString(category));
        the_console.setDefaultForeground(Color.white);
    }
}

ConstructionDialog.constructionInfoDialog = null;
ConstructionDialog.cachedConstruct = null;
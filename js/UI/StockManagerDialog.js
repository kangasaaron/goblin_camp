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


import "string"
import "vector"

import "boost/function.js"
import "boost/bind.js"
import "boost/weak_ptr.js"
import "libtcod.js"

import "UIComponents.js"
import "Dialog.js"
import "Grid.js"

class StockManagerDialog extends Dialog {
    filter = "";
    /** @type {Grid *} */
    grid;
    static stocksDialog = 0;


    constructor() {
        super(0, "Stock Manager", 68, 75);

        contents = new UIContainer([], 0, 0, 68, 75);

        (contents).AddComponent(new Label("Filter", 34, 1));
        (contents).AddComponent(new TextBox(1, 2, 66, filter));

        let grid = new Grid([], 4, 0, 0, 68, 71);
        for (let it = StockManager.Producables().begin(); it !== StockManager.Producables().end(); it++) {
            grid.AddComponent(new StockPanel(it, this));
        }
        (contents).AddComponent(new ScrollPanel(0, 3, 68, 72, grid, false, 4));
    }

    static StocksDialog() {
        if (!stocksDialog)
            stocksDialog = new StockManagerDialog();
        return stocksDialog;
    }

    GetFilter() { return filter; }
}


class StockPanel extends UIContainer {
    //ItemType 
    itemType;
    //StockManagerDialog * 
    owner;
    //public:
    ShowItem() {
        if (boost.icontains(Item.Presets[itemType].name, owner.GetFilter()))
            return StockManager.TypeQuantity(itemType) > -1;
        else {
            for (let cati = Item.Presets[itemType].categories.begin(); cati !== Item.Presets[itemType].categories.end(); ++cati) {
                if (boost.icontains(Item.Categories[cati].name, owner.GetFilter()))
                    return StockManager.TypeQuantity(itemType) > -1;
            }
        }
        return false;
    }
    _GetTooltip(x, y, tooltip) {
        if (x >= _x && x < _x + width && y >= _y && y < _y + height - 2) { // subtract 2 from height so tooltip doesn't appear when mouse is over spinner
            tooltip.AddEntry(TooltipEntry(Item.ItemTypeToString(itemType), Color.white));
            let compName = "";
            let compAmt = 0;
            for (let compi = 0; compi < Item.Components(itemType).size(); ++compi) {
                let thisCompName = Item.ItemCategoryToString(Item.Components(itemType, compi));
                if (compName === thisCompName) {
                    compAmt++;
                } else {
                    if (compName.length() > 0) {
                        tooltip.AddEntry(TooltipEntry((boost.format(" %s x%d") % compName % compAmt).str(), Color.grey));
                    }
                    compName = thisCompName;
                    compAmt = 1;
                }
            }
            if (compName.length() > 0) {
                tooltip.AddEntry(TooltipEntry((boost.format(" %s x%d") % compName % compAmt).str(), Color.grey));
            }
        }
    }

    constructor(nItemType, nowner) {
        super([], 0, 0, 16, 4);
        itemType(nItemType);
        owner(nowner);
        AddComponent(new Spinner(0, 2, 16, boost.bind(StockManager.Minimum, StockManager.i, itemType),
            boost.bind(StockManager.SetMinimum, StockManager.i, itemType, _1)));
        SetTooltip(boost.bind(StockPanel._GetTooltip, this, _1, _2, _3));
        visible = boost.bind(StockPanel.ShowItem, this);
    }

    Draw(x, y, the_console) {
        the_console.setAlignment(TCOD_alignment_t.TCOD_CENTER);
        the_console.setDefaultForeground(Item.Presets[itemType].color);
        the_console.print(x + 8, y, "%c %s", Item.Presets[itemType].graphic, Item.Presets[itemType].name.c_str());
        the_console.setDefaultForeground(Color.white);
        the_console.print(x + 8, y + 1, "%d", StockManager.TypeQuantity(itemType));
        UIContainer.Draw(x, y, the_console);
    }

}
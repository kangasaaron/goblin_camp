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


import {AnnounceDialog} from "./AnnounceDialog.js";
import {Camp} from "../Camp.js";
import {TCODColor, TCOD_alignment_t, TCOD_bkgnd_flag_t} from "../../fakeTCOD/libtcod.js";
import {Constants} from "../Constants.js";
import {Construction} from "../Construction.js";
import {ConstructionTag} from "../ConstructionTag.js";
import {Coordinate} from "../Coordinate.js";
import {Game} from "../Game.js";
import {GameMap} from "../GameMap.js";
import {Globals} from "../Globals.js";
import {JobDialog} from "./JobDialog.js";
import {MenuChoice} from "./MenuChoice.js";
import {MenuResult} from "./MenuResult.js";
import {NPCDialog} from "./NPCDialog.js";
import {Panel} from "./Panel.js";
import {SquadsDialog} from "./SquadsDialog.js";
import {StockManagerDialog} from "./StockManagerDialog.js";
import {TileType} from "../TileType.js";
import {TooltipEntry} from "./TooltipEntry.js";
import {UI} from "./UI.js";
import {UIState} from "./UIState.js";

class Menu extends Panel {
    constructor(newChoices, ntitle = "") {
        super(0, 0);
        this._selected = -1;
        this.choices = newChoices;
        this.title = ntitle;
        this.CalculateSize();
    }
    CalculateSize() {
        this.height = this.choices.length * 2 + 1;
        this.width = 0;
        for (let iter of this.choices) {
            if (iter.label.length > this.width)
                this.width = iter.label.length;
        }
        this.width += 2;
    }
    selected(newSel) {
        this._selected = newSel;
    }

    AddChoice(newChoice) {
        this.choices.push(newChoice);
        this.CalculateSize();
    }

    Callback(choice) {
        if (this.choices.length > choice) {
            this.choices[choice].callback();
        }
    }

    GetTooltip(x, y, tooltip) {
        if (x <= 0 || y <= 0) return;
        if (x <= this._x || x >= this._x + this.width) return;
        y -= this._y;
        if (y <= 0 || y >= this.height) return;
        --y;
        if (y > 0)
            y /= 2;
        this._selected = y;
        if (y >= this.choices.length || this.choices[y].tooltip === "") return;
        tooltip.OffsetPosition((this._x + this.width) - x - 1, 0);
        for (let i = 0; i < this.choices[y].tooltip.length; i += 25) {
            tooltip.AddEntry(new TooltipEntry(this.choices[y].tooltip.substr(i, 25), TCODColor.white));
        }
    }

    Update(x, y, clicked, key) {
        if (key.c >= '0' && key.c <= '9') {
            this.selected(parseInt(key.c, 10) - 1);
            this.Callback(parseInt(key.c, 10) - 1);
        }
        if (x <= 0 || y <= 0) return MenuResult.NOMENUHIT;
        if (x <= this._x || x >= this._x + this.width) return MenuResult.NOMENUHIT;
        y -= this._y;
        if (y <= 0 || y >= this.height) return MenuResult.NOMENUHIT;
        --y;
        if (y > 0) y /= 2;
        this._selected = y;
        if (!this.clicked || !this.choices[y].enabled) return MenuResult.MENUHIT;

        this.choices[y].callback();
        return MenuResult.DISMISS | MenuResult.MENUHIT;
    }
    Draw(x, y, the_console) {
        the_console.setAlignment((TCOD_alignment_t.TCOD_LEFT));
        //Draw the box
        if (x + this.width >= the_console.getWidth()) x = Math.max(the_console.getWidth() - this.width - 1, 0);
        if (y + this.height >= the_console.getHeight()) y = Math.max(the_console.getHeight() - this.height - 1, 0);
        this._x = x;
        this._y = y; //Save coordinates of menu top-left corner
        the_console.printFrame(x, y, this.width, this.height, true, TCOD_bkgnd_flag_t.TCOD_BKGND_SET, (this.title.length === 0) ? 0 : this.title);
        the_console.setBackgroundFlag(TCOD_bkgnd_flag_t.TCOD_BKGND_SET);
        //Draw the menu entries
        for (let i = 0; i < this.choices.length; ++i) {
            the_console.setDefaultBackground(TCODColor.black);
            if (UI.i.KeyHelpTextColor() > 0) {
                the_console.setDefaultForeground(new TCODColor(0, Math.min(255, UI.i.KeyHelpTextColor()), 0));
                the_console.print(x, y + 1 + (i * 2), `${i + 1}`);
            }
            if (this.choices[i].enabled) the_console.setDefaultForeground(TCODColor.white);
            else the_console.setDefaultForeground(TCODColor.grey);
            if (this._selected === i) {
                the_console.setDefaultBackground(TCODColor.white);
                the_console.setDefaultForeground(TCODColor.darkerGrey);
            }
            the_console.print(x + 1, y + 1 + (i * 2), this.choices[i].label);
        }
        the_console.setDefaultForeground(TCODColor.white);
        the_console.setDefaultBackground(TCODColor.black);
    }

    
    // static ItemCategory WeaponChoiceDialog();
    static MainMenu() {
        if (this.mainMenu && this.menuTier === Camp.i.GetTier()) return this.mainMenu;

        if (this.mainMenu) { //Tier has changed
            delete this.mainMenu;
            this.mainMenu = 0;
            if (this.constructionMenu) {
                delete this.constructionMenu;
                this.constructionMenu = 0;
            }
            if (this.constructionCategoryMenus.size) {
                for (let iterator of this.constructionCategoryMenus.entries()) {
                    if (iterator[1])
                    this.constructionCategoryMenus.delete(iterator[0]);
                }
                this.constructionCategoryMenus = new Map();
            }
            this.menuTier = Camp.i.GetTier();
        }
        this.mainMenu = new Menu([]);
        if (Game.i.DevMode())
            this.mainMenu.AddChoice(new MenuChoice("Dev", () => UI.i.ChangeMenu(this, Menu.DevMenu())));
        this.mainMenu.AddChoice(new MenuChoice("Build", () => UI.i.ChangeMenu(this, Menu.ConstructionMenu())));
        this.mainMenu.AddChoice(new MenuChoice("Dismantle", () => UI.i.ChooseDismantle(this)));
        this.mainMenu.AddChoice(new MenuChoice("Orders", () => UI.i.ChangeMenu(this, Menu.OrdersMenu())));
        this.mainMenu.AddChoice(new MenuChoice("Stock Manager", () => UI.i.ChangeMenu(this, StockManagerDialog.StocksDialog())));
        this.mainMenu.AddChoice(new MenuChoice("Jobs", () => UI.i.ChangeMenu(this, JobDialog.JobListingDialog())));
        if (Globals.DEBUG) {
            this.mainMenu.AddChoice(new MenuChoice("NPC List", () => UI.i.ChangeMenu(this, NPCDialog.NPCListDialog())));
        }
        this.mainMenu.AddChoice(new MenuChoice("Announcements", () => UI.i.ChangeMenu(this, AnnounceDialog.AnnouncementsDialog())));
        this.mainMenu.AddChoice(new MenuChoice("Squads", () => UI.i.ChangeMenu(this, SquadsDialog.SquadDialog())));
        this.mainMenu.AddChoice(new MenuChoice("Territory", () => UI.i.ChangeMenu(this, Menu.TerritoryMenu())));
        this.mainMenu.AddChoice(new MenuChoice("Stats", () => Game.i.DisplayStats(this)));
        this.mainMenu.AddChoice(new MenuChoice("Main Menu", () => Game.i.ToMainMenu(this, true)));
        this.mainMenu.AddChoice(new MenuChoice("Quit", () => Game.i.Exit(this, true)));
        
        return this.mainMenu;
    }
    
    static ConstructionMenu() {
        if (this.constructionMenu) return this.constructionMenu;
        this.constructionMenu = new Menu([]);
        for (let it of Construction.Categories) {
            this.constructionMenu.AddChoice(new MenuChoice(it, () => UI.i.ChangeMenu(this, Menu.ConstructionCategoryMenu(it))));
        }
        
        return this.constructionMenu;
    }
    
    static ConstructionCategoryMenu(category) {
        let found = this.constructionCategoryMenus.has(category);
        let menu;
        if (found) {
            menu = found.second;
            return menu;
        }
        menu = new Menu([]);
        for (let i = 0; i < Construction.Presets.length; ++i) {
            let preset = Construction.Presets[i];
            if ((preset.category.toLowerCase() === category.toLowerCase()) && preset.tier <= Camp.i.GetTier() + 1) {
                if (preset.tags[ConstructionTag.STOCKPILE] || preset.tags[ConstructionTag.FARMPLOT]) {
                    menu.AddChoice(new MenuChoice(preset.name, () => UI.i.ChooseStockpile(i), preset.tier <= Camp.i.GetTier(), preset.description));
                } else {
                    let placementType = UIState.UIPLACEMENT;
                    if (preset.placementType > 0 && preset.placementType < UIState.UICOUNT) {
                        placementType = preset.placementType;
                    }
                    menu.AddChoice(new MenuChoice(preset.name, () => UI.i.ChooseConstruct(i, placementType), preset.tier <= Camp.i.GetTier(), preset.description));
                }
            }
        }
        this.constructionCategoryMenus.set(category, menu);
        
        return menu;
    }
    static BasicsMenu() {
        return this.ConstructionCategoryMenu("Basics");
    }
    static WorkshopsMenu() {
        return this.ConstructionCategoryMenu("Workshops");
    }

    static FurnitureMenu() {
        return this.ConstructionCategoryMenu("Furniture");
    }

    static OrdersMenu() {
        if(this.ordersMenu) return this.ordersMenu;
        
        this.ordersMenu = new Menu([]);

        let checkDitch = (target, size) => Game.i.CheckTileType(TileType.TILEDITCH,target,size);
        let rectCall = (a,b) => Game.i.FillDitch(a,b);

        this.ordersMenu.AddChoice(new MenuChoice("Fell trees", () => UI.i.ChooseTreeFelling()));
        this.ordersMenu.AddChoice(new MenuChoice("Designate trees", () => UI.i.ChooseDesignateTree()));
        this.ordersMenu.AddChoice(new MenuChoice("Harvest wild plants", () => UI.i.ChoosePlantHarvest()));
        this.ordersMenu.AddChoice(new MenuChoice("Dig", () => UI.i.ChooseDig()));
        this.ordersMenu.AddChoice(new MenuChoice("Fill ditches", () => UI.i.ChooseRectPlacement( rectCall, checkDitch, 178, "Fill ditches")));
        this.ordersMenu.AddChoice(new MenuChoice("Designate bog for iron", () => UI.i.ChooseDesignateBog()));
        this.ordersMenu.AddChoice(new MenuChoice("Gather items", () => UI.i.ChooseGatherItems()));

        let checkTree = () => Game.i.CheckTree(new Coordinate(1, 1));

        rectCall = (_1, _2) => Camp.i.AddWaterZone(_1, _2);
        this.ordersMenu.AddChoice(new MenuChoice("Pour water", () => UI.i.ChooseRectPlacement( rectCall, checkTree, 'W', "Pour water")));

        let call = (_1) => Game.i.StartFire(_1);
        this.ordersMenu.AddChoice(new MenuChoice("Start fire", () => UI.i.ChooseNormalPlacement(call, checkTree, 'F', "Start fire")));

        this.ordersMenu.AddChoice(new MenuChoice("Undesignate", () => UI.i.ChooseUndesignate()));
    
        return this.ordersMenu;
    }

    
    DevMenu() {
        if(this.devMenu) return this.devMenu;
        
        this.devMenu = new Menu([]);

        this.devMenu.AddChoice(new MenuChoice("Create NPC", () => UI.i.ChooseCreateNPC()));
        this.devMenu.AddChoice(new MenuChoice("Create item", () => UI.i.ChooseCreateItem()));

        let checkTree = (_1) => Game.i.CheckTree(_1, new Coordinate(1, 1));
        let call = (_1) => Game.i.CreateFilth(_1, 100);
        this.devMenu.AddChoice(new MenuChoice("Create filth", () => UI.i.ChooseNormalPlacement(call, checkTree), '~', "Filth"));

        call = (_1) => Game.i.CreateWater( _1);
        this.devMenu.AddChoice(new MenuChoice("Create water", () => UI.i.ChooseNormalPlacement(call, checkTree), '~', "Water"));

        call = (_1) => GameMap.i.Corrupt( _1, 500000);
        this.devMenu.AddChoice(new MenuChoice("Corrupt", () => UI.i.ChooseNormalPlacement(call, checkTree), 'C', "Corrupt"));

        this.devMenu.AddChoice(new MenuChoice("Naturify world", () => UI.i.ChooseNaturify()));

        let rectCall = (_1, _2) => Game.i.RemoveNatureObject(_1, _2);
        this.devMenu.AddChoice(new MenuChoice("Remove NatureObjects", () => UI.i.ChooseRectPlacement(rectCall, checkTree), 'R', "Remove NatureObjects"));
        this.devMenu.AddChoice(new MenuChoice("Trigger attack", () => Game.i.TriggerAttack()));
        this.devMenu.AddChoice(new MenuChoice("Trigger migration", () => Game.i.TriggerMigration()));

        call = (_1) => Game.i.Damage(_1);
        this.devMenu.AddChoice(new MenuChoice("Explode", () => UI.i.ChooseNormalPlacement(call, checkTree), 'E', "Explode"));

        call = (_1) => Game.i.Hungerize(_1);
        this.devMenu.AddChoice(new MenuChoice("Hungerize", () => UI.i.ChooseNormalPlacement(call, checkTree), 'H', "Hunger"));

        call = (_1) => Game.i.Tire(_1);
        this.devMenu.AddChoice(new MenuChoice("Tire", () => UI.i.ChooseNormalPlacement(call, checkTree), 'T', "Tire"));

        call = (_1) => Game.i.CreateFire(_1);
        this.devMenu.AddChoice(new MenuChoice("Fire", () => UI.i.ChooseNormalPlacement(call, checkTree), '!', "Fire"));

        call = (_1) => Game.i.CreateDitch(_1);
        this.devMenu.AddChoice(new MenuChoice("Dig", () => UI.i.ChooseABPlacement(call, checkTree), '_', "Dig"));

        call = (_1) => Game.i.Thirstify(_1);
        this.devMenu.AddChoice(new MenuChoice("Thirstify", () => UI.i.ChooseNormalPlacement(call, checkTree), 'T', "Thirst"));
        call = (_1) => Game.i.Badsleepify(_1);
        this.devMenu.AddChoice(new MenuChoice("Badsleepify", () => UI.i.ChooseNormalPlacement(call, checkTree), 'T', "Bad sleep"));

        call = (_1) => Game.i.Diseasify(_1);
        this.devMenu.AddChoice(new MenuChoice("Diseasify", () => UI.i.ChooseNormalPlacement(call, checkTree), 'D', "Disease"));
    
        return this.devMenu;
    }

    static TerritoryMenu() {
        if(this.territoryMenu) return this.territoryMenu;
        
        this.territoryMenu = new Menu([]);
        this.territoryMenu.AddChoice(new MenuChoice("Toggle territory overlay", () => GameMap.i.ToggleOverlay(Constants.TERRITORY_OVERLAY)));
        this.territoryMenu.AddChoice(new MenuChoice("Expand territory", () => UI.i.ChooseChangeTerritory(true)));
        this.territoryMenu.AddChoice(new MenuChoice("Shrink territory", () => UI.i.ChooseChangeTerritory(false)));
        this.territoryMenu.AddChoice(new MenuChoice("Toggle automatic territory",   () => Camp.i.ToggleAutoTerritory()));
    
        return this.territoryMenu;
    }
}
    
Menu.constructionCategoryMenus = new Map();
Menu.menuTier = 0;
Menu.mainMenu;
Menu.constructionMenu;
Menu.basicsMenu;
Menu.ordersMenu;
Menu.devMenu;
Menu.territoryMenu;
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
    MenuChoice
} from "./MenuChoice.js";
import {
    MenuResult
} from "./MenuResult.js";
import {
    Panel
} from "./Panel.js";

class Menu extends Panel {
    static constructionCategoryMenus = new Map();
    static menuTier = 0;
    choices = [];
    _selected = -1;
    title = "";

    Menu.Menu(newChoices, ntitle = "") {
        super(0, 0);
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
        if (y <= 0 || y >= height) return;
        --y;
        if (y > 0)
            y /= 2;
        this._selected = y;
        if (y >= this.choices.length || choices[y].tooltip === "") return;
        tooltip.OffsetPosition((this._x + this.width) - x - 1, 0);
        for (let i = 0; i < this.choices[y].tooltip.length; i += 25) {
            tooltip.AddEntry(new TooltipEntry(this.choices[y].tooltip.substr(i, 25), Color.white));
        }
    }

    Update(x, y, clicked, key) {
        if (key.c >= '0' && key.c <= '9') {
            this.selected(parseInt(key.c, 10) - 1);
            this.Callback(parseInt(key.c, 10) - 1);
        }
        if (x <= 0 || y <= 0) return MenuResult.NOMENUHIT;
        if (x <= this._x || x >= this._x + this.width) return MenuResult.NOMENUHIT;
        y -= _y;
        if (y <= 0 || y >= this.height) return MenuResult.NOMENUHIT;
        --y;
        if (y > 0) y /= 2;
        this._selected = y;
        if (!this.clicked || !this.choices[y].enabled) return MenuResult.MENUHIT;

        choices[y].callback();
        return MenuResult.DISMISS | MenuResult.MENUHIT;
    }
    Draw(x, y, the_console) {
        the_console.setAlignment(TCOD_LEFT);
        //Draw the box
        if (x + this.width >= the_console.getWidth()) x = Math.max(the_console.getWidth() - this.width - 1, 0);
        if (y + this.height >= the_console.getHeight()) y = Math.max(the_console.getHeight() - this.height - 1, 0);
        this._x = x;
        this._y = y; //Save coordinates of menu top-left corner
        the_console.printFrame(x, y, this.width, this.height, true, TCOD_BKGND_SET, (this.title.length == 0) ? 0 : this.title);
        the_console.setBackgroundFlag(TCOD_BKGND_SET);
        //Draw the menu entries
        for (let i = 0; i < this.choices.length; ++i) {
            the_console.setDefaultBackground(Color.black);
            if (UI.KeyHelpTextColor() > 0) {
                the_console.setDefaultForeground(new Color(0, Math.min(255, UI.KeyHelpTextColor()), 0));
                the_console.print(x, y + 1 + (i * 2), `${i + 1}`);
            }
            if (this.choices[i].enabled) the_console.setDefaultForeground(Color.white);
            else the_console.setDefaultForeground(Color.grey);
            if (this._selected == i) {
                the_console.setDefaultBackground(Color.white);
                the_console.setDefaultForeground(Color.darkerGrey);
            }
            the_console.print(x + 1, y + 1 + (i * 2), this.choices[i].label);
        }
        the_console.setDefaultForeground(Color.white);
        the_console.setDefaultBackground(Color.black);
    }

    static mainMenu;
    static MainMenu();
    static constructionMenu;
    static ConstructionMenu();
    static basicsMenu;
    static BasicsMenu();
    static WorkshopsMenu();
    static ordersMenu;
    static OrdersMenu();
    static FurnitureMenu();
    static ConstructionCategoryMenu();
    static devMenu;
    static DevMenu();
    static territoryMenu;
    static TerritoryMenu();

    // static ItemCategory WeaponChoiceDialog();
    static MainMenu() {
        if (this.mainMenu && this.menuTier == Camp.GetTier()) return this.mainMenu;
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
            this.menuTier = Camp.GetTier();
        }
        this.mainMenu = new Menu([]);
        if (Game.DevMode())
            this.mainMenu.AddChoice(new MenuChoice("Dev", UI.ChangeMenu.bind(this, Menu.DevMenu())));
        this.mainMenu.AddChoice(new MenuChoice("Build", UI.ChangeMenu.bind(this, Menu.ConstructionMenu())));
        this.mainMenu.AddChoice(new MenuChoice("Dismantle", UI.ChooseDismantle.bind(this)));
        this.mainMenu.AddChoice(new MenuChoice("Orders", UI.ChangeMenu.bind(this, Menu.OrdersMenu())));
        this.mainMenu.AddChoice(new MenuChoice("Stock Manager", UI.ChangeMenu.bind(this, StockManagerDialog.StocksDialog())));
        this.mainMenu.AddChoice(new MenuChoice("Jobs", UI.ChangeMenu.bind(this, JobDialog.JobListingDialog())));
        if (DEBUG) {
            this.mainMenu.AddChoice(new MenuChoice("NPC List", UI.ChangeMenu.bind(this, NPCDialog.NPCListDialog())));
        }
        this.mainMenu.AddChoice(new MenuChoice("Announcements", UI.ChangeMenu.bind(this, AnnounceDialog.AnnouncementsDialog())));
        this.mainMenu.AddChoice(new MenuChoice("Squads", UI.ChangeMenu.bind(this, SquadsDialog.SquadDialog())));
        this.mainMenu.AddChoice(new MenuChoice("Territory", UI.ChangeMenu.bind(this, Menu.TerritoryMenu())));
        this.mainMenu.AddChoice(new MenuChoice("Stats", & Game.bind(this, DisplayStats, Game.Inst())));
        this.mainMenu.AddChoice(new MenuChoice("Main Menu", Game.ToMainMenu.bind(this, true)));
        this.mainMenu.AddChoice(new MenuChoice("Quit", Game.Exit.bind(this, true)));

        return this.mainMenu;
    }

    static ConstructionMenu() {
        if (this.constructionMenu) return this.constructionMenu;
        this.constructionMenu = new Menu([]);
        for (let it of Construction.Categories) {
            this.constructionMenu.AddChoice(new MenuChoice(it, UI.ChangeMenu.bind(this, Menu.ConstructionCategoryMenu(it))));
        }

        return this.constructionMenu;
    }

    ConstructionCategoryMenu(category) {
        let found = this.constructionCategoryMenus.has(category);
        let menu;
        if (found) {
            menu = found.second;
            return menu;
        }
        menu = new Menu([]);
        for (let i = 0; i < Construction.Presets.length; ++i) {
            let preset = Construction.Presets[i];
            if (boost.iequals(preset.category, category) && preset.tier <= Camp.GetTier() + 1) {
                if (preset.tags[STOCKPILE] || preset.tags[FARMPLOT]) {
                    menu.AddChoice(MenuChoice(preset.name, boost.bind(UI.ChooseStockpile, i), preset.tier <= Camp.GetTier(), preset.description));
                } else {
                    UIState placementType = UIPLACEMENT;
                    if (preset.placementType > 0 && preset.placementType < UICOUNT) {
                        placementType = (UIState) preset.placementType;
                    }
                    menu.AddChoice(MenuChoice(preset.name, boost.bind(UI.ChooseConstruct, i, placementType), preset.tier <= Camp.GetTier(), preset.description));
                }
            }
        }
        this.constructionCategoryMenus.set(category, menu);

        return menu;
    }

    Menu * Menu.BasicsMenu() {
        return ConstructionCategoryMenu("Basics");
    }

    Menu * Menu.WorkshopsMenu() {
        return ConstructionCategoryMenu("Workshops");
    }

    Menu * Menu.FurnitureMenu() {
        return ConstructionCategoryMenu("Furniture");
    }

    Menu * Menu.OrdersMenu() {
        if (!ordersMenu) {
            ordersMenu = new Menu(std.vector < MenuChoice > ());

            boost.function < bool(Coordinate, Coordinate) > checkDitch = boost.bind(Game.CheckTileType, TILEDITCH, _1, _2);
            boost.function < void(Coordinate, Coordinate) > rectCall = boost.bind(Game.FillDitch, _1, _2);

            ordersMenu.AddChoice(MenuChoice("Fell trees", boost.bind(UI.ChooseTreeFelling)));
            ordersMenu.AddChoice(MenuChoice("Designate trees", boost.bind(UI.ChooseDesignateTree)));
            ordersMenu.AddChoice(MenuChoice("Harvest wild plants", boost.bind(UI.ChoosePlantHarvest)));
            ordersMenu.AddChoice(MenuChoice("Dig", boost.bind(UI.ChooseDig)));
            ordersMenu.AddChoice(MenuChoice("Fill ditches", boost.bind(UI.ChooseRectPlacement, rectCall, checkDitch, 178, "Fill ditches")));
            ordersMenu.AddChoice(MenuChoice("Designate bog for iron", boost.bind(UI.ChooseDesignateBog)));
            ordersMenu.AddChoice(MenuChoice("Gather items", boost.bind(UI.ChooseGatherItems)));

            boost.function < bool(Coordinate, Coordinate) > checkTree = boost.bind(Game.CheckTree, _1, Coordinate(1, 1));
            rectCall = boost.bind( & Camp.AddWaterZone, Camp.Inst(), _1, _2);
            ordersMenu.AddChoice(MenuChoice("Pour water", boost.bind(UI.ChooseRectPlacement, rectCall, checkTree, 'W', "Pour water")));

            boost.function < void(Coordinate) > call = boost.bind( & Game.StartFire, Game.Inst(), _1);
            ordersMenu.AddChoice(MenuChoice("Start fire", boost.bind(UI.ChooseNormalPlacement, call, checkTree, 'F', "Start fire")));

            ordersMenu.AddChoice(MenuChoice("Undesignate", boost.bind(UI.ChooseUndesignate)));
        }
        return ordersMenu;
    }

    Menu * Menu.DevMenu() {
        if (!devMenu) {
            devMenu = new Menu(std.vector < MenuChoice > ());

            devMenu.AddChoice(MenuChoice("Create NPC", boost.bind(UI.ChooseCreateNPC)));
            devMenu.AddChoice(MenuChoice("Create item", boost.bind(UI.ChooseCreateItem)));

            boost.function < bool(Coordinate, Coordinate) > checkTree = boost.bind(Game.CheckTree, _1, Coordinate(1, 1));
            boost.function < void(Coordinate) > call = boost.bind( & Game.CreateFilth, Game.Inst(), _1, 100);
            devMenu.AddChoice(MenuChoice("Create filth", boost.bind(UI.ChooseNormalPlacement, call, checkTree, '~', "Filth")));

            call = boost.bind( & Game.CreateWater, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Create water", boost.bind(UI.ChooseNormalPlacement, call, checkTree, '~', "Water")));

            call = boost.bind( & Map.Corrupt, Map.Inst(), _1, 500000);
            devMenu.AddChoice(MenuChoice("Corrupt", boost.bind(UI.ChooseNormalPlacement, call, checkTree, 'C', "Corrupt")));

            devMenu.AddChoice(MenuChoice("Naturify world", boost.bind(UI.ChooseNaturify)));

            boost.function < void(Coordinate, Coordinate) > rectCall = boost.bind( & Game.RemoveNatureObject, Game.Inst(), _1, _2);
            devMenu.AddChoice(MenuChoice("Remove NatureObjects", boost.bind(UI.ChooseRectPlacement, rectCall, checkTree, 'R', "Remove NatureObjects")));
            devMenu.AddChoice(MenuChoice("Trigger attack", boost.bind( & Game.TriggerAttack, Game.Inst())));
            devMenu.AddChoice(MenuChoice("Trigger migration", boost.bind( & Game.TriggerMigration, Game.Inst())));

            call = boost.bind( & Game.Damage, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Explode", boost.bind(UI.ChooseNormalPlacement, call, checkTree, 'E', "Explode")));

            call = boost.bind( & Game.Hungerize, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Hungerize", boost.bind(UI.ChooseNormalPlacement, call, checkTree, 'H', "Hunger")));

            call = boost.bind( & Game.Tire, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Tire", boost.bind(UI.ChooseNormalPlacement, call, checkTree, 'T', "Tire")));

            call = boost.bind( & Game.CreateFire, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Fire", boost.bind(UI.ChooseNormalPlacement, call, checkTree, '!', "Fire")));

            call = boost.bind( & Game.CreateDitch, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Dig", boost.bind(UI.ChooseABPlacement, call, checkTree, '_', "Dig")));

            call = boost.bind( & Game.Thirstify, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Thirstify", boost.bind(UI.ChooseNormalPlacement, call, checkTree, 'T', "Thirst")));
            call = boost.bind( & Game.Badsleepify, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Badsleepify", boost.bind(UI.ChooseNormalPlacement, call, checkTree, 'T', "Bad sleep")));

            call = boost.bind( & Game.Diseasify, Game.Inst(), _1);
            devMenu.AddChoice(MenuChoice("Diseasify", boost.bind(UI.ChooseNormalPlacement, call, checkTree, 'D', "Disease")));
        }
        return devMenu;
    }


    Menu * Menu.TerritoryMenu() {
        if (!territoryMenu) {
            territoryMenu = new Menu(std.vector < MenuChoice > ());
            territoryMenu.AddChoice(MenuChoice("Toggle territory overlay", boost.bind( & Map.ToggleOverlay, Map.Inst(), TERRITORY_OVERLAY)));
            territoryMenu.AddChoice(MenuChoice("Expand territory", boost.bind(UI.ChooseChangeTerritory, true)));
            territoryMenu.AddChoice(MenuChoice("Shrink territory", boost.bind(UI.ChooseChangeTerritory, false)));
            territoryMenu.AddChoice(MenuChoice("Toggle automatic territory", boost.bind( & Camp.ToggleAutoTerritory, Camp.Inst())));
        }
        return territoryMenu;
    }
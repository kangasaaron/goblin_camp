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


import "string"
import "vector"
import "list"

import "boost/function.js"
import "boost/bind.js"
import "boost/weak_ptr.js"
import "libtcod.js"

import "UIComponents.js"
import "Dialog.js"
import "UIList.js"
import "Frame.js"

class SquadsDialog extends Dialog {
    //static SquadsDialog * squadDialog;
    squadDialog = null;

    squadName = "";
    squadMembers = 1;
    squadPriority = 0;
    // UIList < std.pair < std.string, boost.shared_ptr < Squad > > , std.map < std.string, boost.shared_ptr < Squad > > > * squadList;
    squadList = new UIList();
    /**Frame * */
    rightFrame;
    /**Frame * */
    orders;
    //std.list < int >
    markers = [];


    // static SquadsDialog * SquadDialog();
    // SquadsDialog * SquadsDialog.SquadDialog() {
    SquadDialog() {
        if (!squadDialog) {
            // UIContainer * 
            let contents = new UIContainer([], 0, 0, 50, 20);
            squadDialog = new SquadsDialog(contents, "Squads", 50, 20);
            // squadDialog.squadList = new UIList < std.pair < std.string, boost.shared_ptr < Squad > > , std.map < std.string, boost.shared_ptr < Squad > > > ( &
            //     (Game.squadList), 0, 0, 46, 16, SquadsDialog.DrawSquad, boost.bind( & SquadsDialog.SelectSquad, squadDialog, _1), true, & SquadsDialog.GetSquadTooltip);
            squadDialog.squadList = new UIList((Game.squadList), 0, 0, 46, 16, SquadsDialog.DrawSquad, boost.bind(SquadsDialog.SelectSquad, squadDialog, _1), true, SquadsDialog.GetSquadTooltip);
            let left = new Frame("Existing", [], 1, 1, 24, 18);
            left.AddComponent(new ScrollPanel(1, 0, 23, 18, squadDialog.squadList, false));
            contents.AddComponent(left);
            squadDialog.rightFrame = new Frame("New Squad", [], 25, 1, 24, 18);
            squadDialog.rightFrame.AddComponent(new Label("Name (required)", 12, 2));
            squadDialog.rightFrame.AddComponent(new TextBox(1, 3, 22, (squadDialog.squadName)));
            squadDialog.rightFrame.AddComponent(new Label("Members", 12, 5));
            squadDialog.rightFrame.AddComponent(new Spinner(1, 6, 22, (squadDialog.squadMembers), 1, Number.MAX_SAFE_INTEGER));
            squadDialog.rightFrame.AddComponent(new Label("Priority", 12, 8));
            squadDialog.rightFrame.AddComponent(new Spinner(1, 9, 22, (squadDialog.squadPriority), 0, Number.MAX_SAFE_INTEGER));
            //Button * 
            let create = new Button("Create", boost.bind(SquadsDialog.CreateSquad, squadDialog), 2, 11, 10);
            create.SetVisible(boost.bind(SquadsDialog.SquadSelected, squadDialog, false));
            //Button * 
            let modify = new Button("Modify", boost.bind(SquadsDialog.ModifySquad, squadDialog), 2, 11, 10);
            modify.SetVisible(boost.bind(SquadsDialog.SquadSelected, squadDialog, true));
            //Button * 
            let deleteSquad = new Button("Delete", boost.bind(SquadsDialog.DeleteSquad, squadDialog), 13, 11, 10);
            deleteSquad.SetVisible(boost.bind(SquadsDialog.SquadSelected, squadDialog, true));
            squadDialog.rightFrame.AddComponent(create);
            squadDialog.rightFrame.AddComponent(modify);
            squadDialog.rightFrame.AddComponent(deleteSquad);
            contents.AddComponent(squadDialog.rightFrame);
            squadDialog.orders = new Frame("Orders for ", [], 0, 20, 50, 5);
            squadDialog.orders.SetVisible(boost.bind(SquadsDialog.SquadSelected, squadDialog, true));
            contents.AddComponent(squadDialog.orders);
            squadDialog.orders.AddComponent(new ToggleButton("Guard", boost.bind(SquadsDialog.SelectOrder, squadDialog, GUARD), boost.bind(SquadsDialog.OrderSelected, squadDialog, GUARD), 2, 1, 9));
            squadDialog.orders.AddComponent(new ToggleButton("Follow", boost.bind(SquadsDialog.SelectOrder, squadDialog, FOLLOW), boost.bind(SquadsDialog.OrderSelected, squadDialog, FOLLOW), 14, 1, 10));
            squadDialog.orders.AddComponent(new ToggleButton("Patrol", boost.bind(SquadsDialog.SelectOrder, squadDialog, PATROL), boost.bind(SquadsDialog.OrderSelected, squadDialog, PATROL), 27, 1, 10));
            //Frame * 
            let weapons = new Frame("Weapons", [], 0, 25, 23, 5);
            weapons.SetVisible(boost.bind(SquadsDialog.SquadSelected, squadDialog, true));
            contents.AddComponent(weapons);
            weapons.AddComponent(new LiveButton(boost.bind(SquadsDialog.SelectedSquadWeapon, squadDialog), boost.bind(SquadsDialog.SelectWeapon, squadDialog), 1, 1, 21));
            //Button * 
            let rearm = new Button("Rearm", boost.bind(SquadsDialog.Rearm, squadDialog), 0, 30, 10);
            rearm.SetVisible(boost.bind(SquadsDialog.SquadSelected, squadDialog, true));
            contents.AddComponent(rearm);

            //Frame * 
            let armor = new Frame("Armor", [], 23, 25, 23, 5);
            armor.SetVisible(boost.bind(SquadsDialog.SquadSelected, squadDialog, true));
            contents.AddComponent(armor);
            armor.AddComponent(new LiveButton(boost.bind(SquadsDialog.SelectedSquadArmor, squadDialog), boost.bind(SquadsDialog.SelectArmor, squadDialog), 1, 1, 21));
            //Button * 
            let reequip = new Button("Re-equip", boost.bind(SquadsDialog.Reequip, squadDialog), 23, 30, 10);
            reequip.SetVisible(boost.bind(SquadsDialog.SquadSelected, squadDialog, true));
            contents.AddComponent(reequip);
        }
        return squadDialog;
    }

    // static void DrawSquad(std.pair < std.string, boost.shared_ptr < Squad > > , int, int, int, int, bool, TCODConsole * );
    // void SquadsDialog.DrawSquad(std.pair < std.string, boost.shared_ptr < Squad > > squadi, int i, int x, int y, int width, bool selected, TCODConsole * the_console) {
    static DrawSquad(squadi, i, x, y, width, selected, the_console) {
        the_console.setBackgroundFlag(TCOD_BKGND_SET);
        the_console.setDefaultBackground(selected ? TCODColor.blue : TCODColor.black);
        the_console.print(x, y, "%s (%d/%d)", squadi.first.c_str(), squadi.second.MemberCount(),
            squadi.second.MemberLimit());
        the_console.setDefaultBackground(TCODColor.black);
    }

    // boost.shared_ptr < Squad > GetSquad(int);
    // boost.shared_ptr < Squad > SquadsDialog.GetSquad(int i) {
    GetSquad(i) {
        let it = Game.squadList.begin();
        if (i >= 0 && i < Game.squadList.size()) {
            return boost.next(it, i).second;
        }
        return null
    }
    RefreshMarkers() {
        for (let markeri = markers.begin(); markeri != markers.end();) {
            Map.RemoveMarker(markeri);
            markeri = markers.erase(markeri);
        }
        let squad = GetSquad(squadList.Selected());
        if (squad) {
            let orderIndex = 0;
            do {
                markers.push_back(Map.AddMarker(MapMarker(FLASHINGMARKER, 'X', squad.TargetCoordinate(orderIndex), -1, TCODColor.azure)));
                squad.GetOrder(orderIndex);
            } while (orderIndex != 0);
        }
    }

    constructor(ncontents, ntitle, nwidth, nheight) {
        super(ncontents, ntitle, nwidth, nheight);
    }

    // static void GetSquadTooltip(std.pair < std.string, boost.shared_ptr < Squad > > , Tooltip * );
    // void SquadsDialog.GetSquadTooltip(std.pair < std.string, boost.shared_ptr < Squad > > squadi, Tooltip * tooltip) {
    GetSquadTooltip(squadi, tooltip) {
        tooltip.AddEntry(TooltipEntry(squadi.first, TCODColor.white));
        tooltip.AddEntry(TooltipEntry((boost.format(" Priority: %d") % squadi.second.Priority()).str(), TCODColor.grey));

        if (squadi.second.GetGeneralOrder() != NOORDER) {
            let order;
            switch (squadi.second.GetGeneralOrder()) {
                case GUARD:
                    order = "Guard";
                    break;
                case PATROL:
                    order = "Patrol";
                    break;
                case FOLLOW:
                    order = "Follow";
                    break;
                case NOORDER:
                    //unreachable as we tested '!= NOORDER'
                    assert(false);
            }
            tooltip.AddEntry(TooltipEntry((boost.format(" Orders: %s") % order).str(), TCODColor.grey));
        }
        tooltip.AddEntry(TooltipEntry((boost.format(" Weapon: %s") % Item.ItemCategoryToString(squadi.second.Weapon())).str(), TCODColor.grey));
        tooltip.AddEntry(TooltipEntry((boost.format(" Armor: %s") % Item.ItemCategoryToString(squadi.second.Armor())).str(), TCODColor.grey));
    }

    SelectSquad(i) {
        if (i >= 0 && i < Game.squadList.size()) {
            rightFrame.SetTitle("Modify Squad");
            squadName = GetSquad(i).Name();
            squadPriority = GetSquad(i).Priority();
            squadMembers = GetSquad(i).MemberLimit();
            orders.SetTitle((boost.format("Orders for %s") % squadName).str());
        } else {
            rightFrame.SetTitle("New Squad");
            squadName = "";
            squadMembers = 1;
            squadPriority = 0;
        }
        RefreshMarkers();
    }
    SquadSelected(selected) {
        return (squadList.Selected() >= 0) == selected;
    }
    CreateSquad() {
        if (squadName.length() > 0) {
            Game.squadList.insert(squadName, new Squad(squadName, squadMembers, squadPriority));
            let squad = 0;
            for (let it = Game.squadList.begin(); it != Game.squadList.end(); ++it) {
                if (it.first == squadName) {
                    break;
                }
                ++squad;
            }
            squad = Math.min(squad, Game.squadList.size() - 1);
            squadList.Select(squad);
            SelectSquad(squad);
        }
    }
    ModifySquad() {
        let tempSquad = GetSquad(squadList.Selected());
        Game.squadList.erase(tempSquad.Name());
        tempSquad.Name(squadName);
        Game.squadList.insert(squadName, tempSquad);
        tempSquad.MemberLimit(squadMembers);
        tempSquad.Priority(squadPriority);

        //Reselect the squad, changing the name may change it's position in the list
        let squad = 0;
        for (let it = Game.squadList.begin(); it != Game.squadList.end(); ++it) {
            if (it.first == squadName) {
                break;
            }
            ++squad;
        }
        squad = Math.min(squad, Game.squadList.size() - 1);
        squadList.Select(squad);
        SelectSquad(squad);

    }
    DeleteSquad() {
        let squad = GetSquad(squadList.Selected());
        if (squad) {
            squad.RemoveAllMembers();
            Game.squadList.erase(squad.Name());
        }
    }
    SelectOrder(order) {
        let squad = GetSquad(squadList.Selected());
        if (squad) {
            squad.ClearOrders();
            squad.SetGeneralOrder(order);

            switch (order) {
                case GUARD:
                case PATROL:
                default:
                    UI.ChooseOrderTargetCoordinate(squad, order);
                    break;

                case FOLLOW:
                    UI.ChooseOrderTargetEntity(squad, FOLLOW);
                    break;
            }
            UI.HideMenu();
        }
    }

    OrderSelected(order) {
        let squad = GetSquad(squadList.Selected());
        return squad ? squad.GetGeneralOrder() == order : false;
    }
    SelectedSquadWeapon() {
        let weapon = GetSquad(squadList.Selected()).Weapon();
        return weapon >= 0 ? Item.Categories[weapon].name : "None";
    }
    SelectWeapon() {
        let weaponChoiceMenu = new Menu([], "Weapons");
        weaponChoiceMenu.AddChoice(MenuChoice("None", boost.bind(Squad.Weapon, GetSquad(squadList.Selected()), -1)));
        for (let i = 0; i < Item.Categories.size(); ++i) {
            if (Item.Categories[i].parent >= 0 && boost.iequals(Item.Categories[Item.Categories[i].parent].name, "Weapon")) {
                weaponChoiceMenu.AddChoice(MenuChoice(Item.Categories[i].name.c_str(), boost.bind(Squad.Weapon, GetSquad(squadList.Selected()), i)));
            }
        }
        weaponChoiceMenu.ShowModal();
    }
    Rearm() {
        GetSquad(squadList.Selected()).Rearm();
        Announce.AddMsg(GetSquad(squadList.Selected()).Name() + " rearming");
    }
    SelectedSquadArmor() {
        let armor = GetSquad(squadList.Selected()).Armor();
        return armor >= 0 ? Item.Categories[armor].name : "None";
    }
    SelectArmor() {
        let armorChoiceMenu = new Menu([], "Armor");
        armorChoiceMenu.AddChoice(MenuChoice("None", boost.bind(Squad.Armor, GetSquad(squadList.Selected()), -1)));
        for (let i = 0; i < Item.Categories.size(); ++i) {
            if (Item.Categories[i].parent >= 0 && boost.iequals(Item.Categories[Item.Categories[i].parent].name, "Armor")) {
                armorChoiceMenu.AddChoice(MenuChoice(Item.Categories[i].name.c_str(), boost.bind(Squad.Armor, GetSquad(squadList.Selected()), i)));
            }
        }
        armorChoiceMenu.ShowModal();
    }


    Reequip() {
        GetSquad(squadList.Selected()).Reequip();
        Announce.AddMsg(GetSquad(squadList.Selected()).Name() + " re-equipping armor");
    }
    Close() {
        UI.SetTextMode(false);
        for (let markeri = markers.begin(); markeri != markers.end();) {
            Map.RemoveMarker(markeri);
            markeri = markers.erase(markeri);
        }
    }
    Open() {
        RefreshMarkers();
    }
}
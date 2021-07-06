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


import { Construction } from "./Construction.js"
import { Coordinate } from "../Coordinate.js"
import { Container } from "../items/Container.js"
import { Item } from "../items/Item.js"

/**
    struct AmountCompare {
        bool operator()(const std.pair < ItemCategory, int > & lhs,
            const std.pair < ItemCategory, int > & rhs) {
            return lhs.second > rhs.second;
        }
    };
    */



export class Stockpile extends Construction {
    static CLASS_VERSION = 1;


    symbol = 0;
    a = new Coordinate()
    b = new Coordinate();
    /*Opposite corners so we know which tiles the stockpile
					 approximately encompasses*/
    capacity = 0;
    /** std.map <ItemCategory, int>*/
    amount = new Map();
    /** std.map <ItemCategory, bool>*/
    allowed = new Map();
    /** std.map <Coordinate, bool>*/
    reserved = new Map();
    /** std.map <Coordinate, boostshared_ptr < Container > >*/
    containers = new Map();
    /** std.map <Coordinate, Color>*/
    colors = new Map();
    /** std.map <ItemCategory, int>*/
    limits = new Map();
    /** std.map <ItemCategory, int>*/
    demand = new Map();
    /** std.map <ItemCategory, int> lastDemandBalance; //At what amount did we last check container*/
    demand = new Map();
    //public:

    /**    Stockpile(ConstructionType = 0, int symbol = 0, Coordinate = Coordinate(0, 0)); */
    constructor(type = 0, newSymbol = 0, target = new Coordinate(0, 0)) {
        super(type, target);
        symbol = newSymbol;
        a = target;
        b = target;
        condition = maxCondition;
        reserved.insert(std.pair < Coordinate, bool > (target, false));
        let container = new Container(target, -1, 1000, -1);
        container.AddListener(this);
        containers.insert(target, container);

        for (let i = 0; i < Game.i.ItemCatCount; ++i) {
            amount.insert(std.pair < ItemCategory, int > (i, 0));
            allowed.insert(std.pair < ItemCategory, bool > (i, true));
            if (Item.Categories[i].parent >= 0 && boost.iequals(Item.Categories[Item.Categories[i].parent].GetName(), "Container")) {
                limits.insert(std.pair < ItemCategory, int > (i, 100));
                demand.insert(std.pair < ItemCategory, int > (i, 0)); //Initial demand for each container is 0
                lastDemandBalance.insert(std.pair < ItemCategory, int > (i, 0));
            }
        }
        Camp.i.UpdateCenter(Center(), true);
        Camp.i.ConstructionBuilt(type);
        Stats.i.ConstructionBuilt(Construction.Presets[type].name);
    }

    destructor() {
        //Loop through all the containers
        for (let conti = containers.begin(); conti !== containers.end(); ++conti) {
            //Loop through all the items in the containers
            for (let itemi = conti.second.begin(); itemi !== conti.second.end(); ++itemi) {
                //If the item is also a container, remove 'this' as a listener
                if (itemi.lock() && itemi.lock().IsCategory(Item.StringToItemCategory("Container"))) {
                    if (itemi.lock()) {
                        let container = (itemi.lock());
                        container.RemoveListener(this);
                    }
                }
            }
        }

        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (map.GetConstruction(p) === uid) {
                    map.SetBuildable(p, true);
                    map.SetWalkable(p, true);
                    map.SetConstruction(p, -1);
                }
            }
        }
    }

    Build() { return 1; }
    SetMap(map) {
        Construction.SetMap(map);
        colors.insert(std.pair < Coordinate, Color > (pos, Color.lerp(color, map.GetColor(pos), 0.75)));
    }

    //TODO: Remove repeated code

    /** boost.weak_ptr < Item > FindItemByCategory(ItemCategory, int flags = 0, int value = 0);**/
    FindItemByCategory(cat, flags, value) {

        //These two are used only for MOSTDECAYED
        let decay = -1;
        let savedItem;

        let itemsFound = 0;
        /*This keeps track of how many items we've found of the right category,
						we can use this to know when we've searched through all of the items*/

        for (let conti = containers.begin(); conti !== containers.end() && itemsFound < amount[cat]; ++conti) {
            if (conti.second && !conti.second.empty()) {
                let witem = conti.second.begin();
                let item;
                if (item = witem.lock()) {
                    if (item.IsCategory(cat) && !item.Reserved()) {
                        //The item is the one we want, check that it fullfills all the requisite flags
                        ++itemsFound;

                        if (flags & NOTFULL && boost.dynamic_pointer_cast < Container > (item)) {
                            let container = boost.static_pointer_cast < Container > (item);
                            //value represents bulk in this case. Needs to check Full() because bulk=value=0 is a possibility
                            if (container.Full() || container.Capacity() < value) continue;
                        }

                        if (flags & BETTERTHAN) {
                            if (item.RelativeValue() <= value) continue;
                        }

                        if (flags & APPLYMINIMUMS) {
                            /*For now this only affects seeds. With this flag set don't return
                            seeds if at or below the set minimum for them*/
                            if (item.IsCategory(Item.StringToItemCategory("Seed"))) {
                                if (StockManager.TypeQuantity(item.Type()) <=
                                    StockManager.Minimum(item.Type()))
                                    continue;
                            }
                        }

                        if (flags & EMPTY && boost.dynamic_pointer_cast < Container > (item)) {
                            if (!boost.static_pointer_cast < Container > (item).empty() ||
                                boost.static_pointer_cast < Container > (item).GetReservedSpace() > 0) continue;
                        }

                        if (flags & MOSTDECAYED) {
                            let itemDecay = item.GetDecay();
                            if (flags & AVOIDGARBAGE && item.IsCategory(Item.StringToItemCategory("Garbage"))) itemDecay += 100;
                            if (decay === -1 || decay > itemDecay) { //First item or closer to decay
                                decay = itemDecay;
                                savedItem = item;
                            }
                            continue; //Always continue, we need to look through all the items
                        }

                        return item;

                    } else if (boost.dynamic_pointer_cast < Container > (item)) {
                        //This item is not the one we want, but it might contain what we're looking for.
                        let cont = (item);

                        for (let itemi = cont.lock().begin(); itemi !== cont.lock().end(); ++itemi) {
                            let innerItem = (itemi.lock());
                            if (innerItem && innerItem.IsCategory(cat) && !innerItem.Reserved()) {

                                ++itemsFound;

                                if (flags & BETTERTHAN) {
                                    if (innerItem.RelativeValue() <= value) continue;
                                }
                                if (flags & APPLYMINIMUMS) {
                                    /*For now this only affects seeds. With this flag set don't return
                                    seeds if at or below the set minimum for them*/
                                    if (innerItem.IsCategory(Item.StringToItemCategory("Seed"))) {
                                        if (StockManager.TypeQuantity(innerItem.Type()) <=
                                            StockManager.Minimum(innerItem.Type()))
                                            continue;
                                    }
                                }

                                if (flags & MOSTDECAYED) {
                                    let itemDecay = innerItem.GetDecay();
                                    if (flags & AVOIDGARBAGE && innerItem.IsCategory(Item.StringToItemCategory("Garbage"))) itemDecay += 100;
                                    if (decay === -1 || decay > itemDecay) { //First item or closer to decay
                                        decay = itemDecay;
                                        savedItem = innerItem;
                                    }
                                    continue; //Always continue, we need to look through all the items
                                }

                                return innerItem;
                            }
                        }
                    }
                }
            }
        }

        return savedItem;
    }

    /**    boost.weak_ptr < Item > FindItemByType(ItemType, int flags = 0, int value = 0);*/
    FindItemByType(typeValue, flags, value) {

        //These two are used only for MOSTDECAYED
        let decay = -1;
        boost.shared_ptr < Item > savedItem;

        let itemsFound = 0; //This keeps track of how many items we've found of the right category
        let cat = Item.Presets[typeValue].categories.begin();
        /*Choose whatever happens to be the first
																	 category. This'll give us an inaccurate
																	 count, but it'll still make this faster*/

        for (let conti = containers.begin(); conti !== containers.end() && itemsFound < amount[cat]; ++conti) {
            if (!conti.second.empty()) {
                let witem = conti.second.begin();
                let item;
                if (item = witem.lock()) {
                    if (item.Type() === typeValue && !item.Reserved()) {
                        ++itemsFound;
                        if (flags & NOTFULL && boost.dynamic_pointer_cast < Container > (item)) {
                            let container = boost.static_pointer_cast < Container > (item);
                            //value represents bulk in this case
                            if (container.Full() || container.Capacity() < value) continue;
                        }

                        if (flags & BETTERTHAN) {
                            if (item.RelativeValue() <= value) continue;
                        }

                        if (flags & APPLYMINIMUMS) {
                            /*For now this only affects seeds. With this flag set don't return
                            seeds if at or below the set minimum for them*/
                            if (item.IsCategory(Item.StringToItemCategory("Seed"))) {
                                if (StockManager.TypeQuantity(item.Type()) <=
                                    StockManager.Minimum(item.Type()))
                                    continue;
                            }
                        }

                        if (flags & EMPTY && boost.dynamic_pointer_cast < Container > (item)) {
                            if (!boost.static_pointer_cast < Container > (item).empty() ||
                                boost.static_pointer_cast < Container > (item).GetReservedSpace() > 0) continue;
                        }

                        if (flags & MOSTDECAYED) {
                            let itemDecay = item.GetDecay();
                            if (flags & AVOIDGARBAGE && item.IsCategory(Item.StringToItemCategory("Garbage"))) itemDecay += 100;
                            if (decay === -1 || decay > itemDecay) { //First item or closer to decay
                                decay = itemDecay;
                                savedItem = item;
                            }
                            continue; //Always continue, we need to look through all the items
                        }

                        return item;
                    } else if (boost.dynamic_pointer_cast < Container > (item)) {
                        let cont = boost.static_pointer_cast < Container > (item);
                        for (let itemi = cont.lock().begin(); itemi !== cont.lock().end(); ++itemi) {
                            boost.shared_ptr < Item > innerItem(itemi.lock());
                            if (innerItem && innerItem.Type() === typeValue && !innerItem.Reserved()) {
                                ++itemsFound;
                                if (flags & BETTERTHAN) {
                                    if (innerItem.RelativeValue() <= value) continue;
                                }

                                if (flags & APPLYMINIMUMS) {
                                    /*For now this only affects seeds. With this flag set don't return
                                    seeds if at or below the set minimum for them*/
                                    if (innerItem.IsCategory(Item.StringToItemCategory("Seed"))) {
                                        if (StockManager.TypeQuantity(innerItem.Type()) <=
                                            StockManager.Minimum(innerItem.Type()))
                                            continue;
                                    }
                                }

                                if (flags & MOSTDECAYED) {
                                    let itemDecay = innerItem.GetDecay();
                                    if (flags & AVOIDGARBAGE && innerItem.IsCategory(Item.StringToItemCategory("Garbage"))) itemDecay += 100;
                                    if (decay === -1 || decay > itemDecay) { //First item or closer to decay
                                        decay = itemDecay;
                                        savedItem = innerItem;
                                    }
                                    continue; //Always continue, we need to look through all the items
                                }

                                return innerItem;
                            }
                        }
                    }
                }
            }
        }
        return savedItem;
    }

    Expand(from, to) {
        //The algorithm: Check each tile inbetween from and to, and if a tile is adjacent to this
        //stockpile, add it. Do this max(width,height) times.
        let expansion = 0;
        let repeats = Math.max(to.X() - from.X(), to.Y() - from.Y());
        for (let repeatCount = 0; repeatCount <= repeats; ++repeatCount) {
            for (let ix = from.X(); ix <= to.X(); ++ix) {
                for (let iy = from.Y(); iy <= to.Y(); ++iy) {
                    let p = new Coordinate(ix, iy);
                    if (map.GetConstruction(p) === -1 && map.IsBuildable(p) &&
                        Construction.Presets[type].tileReqs.find(map.GetType(p)) !== Construction.Presets[type].tileReqs.end() &&
                        IsAdjacentTo(p, uid)) {
                        //Current tile is walkable, buildable, and adjacent to the current stockpile
                        map.SetConstruction(p, uid);
                        map.SetBuildable(p, false);
                        map.SetTerritory(p, true);

                        //Update corner values to contain p
                        a = Coordinate.min(a, p);
                        b = Coordinate.max(b, p);

                        reserved.insert(std.pair < Coordinate, bool > (p, false));
                        let container = boost.shared_ptr < Container > (new Container(p, -1, 1000, -1));
                        container.AddListener(this);
                        containers.insert(p, container);

                        //Update color
                        colors.insert(std.pair < Coordinate, Color > (p, Color.lerp(color, map.GetColor(p), 0.75)));
                        ++expansion;
                    }
                }
            }
        }
        return expansion;
    }


    Draw(upleft, the_console) {
        let screenx, screeny;

        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (map.GetConstruction(p) === uid) {
                    screenx = x - upleft.X();
                    screeny = y - upleft.Y();
                    if (screenx >= 0 && screenx < the_console.getWidth() && screeny >= 0 &&
                        screeny < the_console.getHeight()) {
                        if (dismantle) the_console.setCharBackground(screenx, screeny, Color.darkGrey);
                        else {
                            let gray = static_cast < int > (50 - cos(strobe) * 50);
                            the_console.setCharBackground(screenx, screeny, Color(gray, gray, gray));
                        }

                        the_console.setCharForeground(screenx, screeny, colors[p]);
                        the_console.setChar(screenx, screeny, (graphic[1]));

                        if (!containers[p].empty()) {
                            let item = containers[p].begin();
                            if (item.lock()) {
                                item.lock().Draw(upleft, the_console);
                                let bgColor = the_console.getCharBackground(screenx, screeny);
                                bgColor.setValue(Math.min(1.0, static_cast < double > (bgColor.getValue() - ((cos(strobe) - 1) / 10))));
                                the_console.setCharBackground(screenx, screeny, bgColor);
                            }
                        }
                    }
                }
            }
        }
    }
    Allowed(cat) {
        return allowed[cat];
    }

    //Return true if any given category is allowed, this allows stockpiles to take axes, even if slashing weapons are disallowed for ex.
    Allowed(cats) {
            for (let cati = cats.begin(); cati !== cats.end(); ++cati) {
                if (Allowed(cati)) return true;
            }
            return false;
        }
        //find a tile adjacent to p which belongs to Stockpile uid
    static FindAdjacentTo(p, uid, out) {
        //TODO factorize adjacent traversal over multiple files
        let dirs = [WEST, EAST, NORTH, SOUTH];
        std.random_shuffle(dirs, dirs + 4); //avoid predictabiliy
        for (let i = 0; i < 4; ++i) {
            let candidate = p + Coordinate.DirectionToCoordinate(dirs[i]);
            if (GameMap.i.GetConstruction(candidate) === uid) {
                out = candidate;
                return true;
            }
        }
        return false;
    }


    static IsAdjacentTo(p, uid) {
            let adj;
            return FindAdjacentTo(p, uid, adj);
        }
        /**
        virtual bool Full(ItemType = -1);
        //New pile system: A pile is only full if there are no buildable tiles to expand to
        bool Stockpile.
        */
    Full(itemType) {
            //Check if there's either a free space, or that we can expand the pile
            for (let ix = a.X() - 1; ix <= b.X() + 1; ++ix) {
                for (let iy = a.Y() - 1; iy <= b.Y() + 1; ++iy) {
                    letp = new Coordinate(ix, iy);
                    if (map.GetConstruction(p) === uid) {
                        //If theres a free space then it obviously is not full
                        if (containers[p].empty() && !reserved[p]) return false;

                        //Check if a container exists for this ItemCategory that isn't full
                        let item = containers[p].GetFirstItem();
                        if (item.lock() && item.lock().IsCategory(Item.StringToItemCategory("Container"))) {
                            let container = boost.static_pointer_cast < Container > (item.lock());
                            if (type !== -1 && container.IsCategory(Item.Presets[itemType].fitsin) &&
                                container.Capacity() >= Item.Presets[itemType].bulk) return false;
                        }
                    } else if (map.IsBuildable(p) &&
                        Construction.Presets[type].tileReqs.find(map.GetType(p)) !== Construction.Presets[type].tileReqs.end() &&
                        IsAdjacentTo(p, uid))
                        return false;
                }
            }
            return true;
        }
        /**
        //New pile system: A free position is an existing empty space, or if there are none then we create one adjacent
        Coordinate Stockpile.
        */
    FreePosition() {
        if (containers.size() > 0) {
            //First attempt to find a random position
            for (let i = 0; i < Math.max(1, containers.size() / 4); ++i) {
                let conti = boost.next(containers.begin(), Random.ChooseIndex(containers));
                if (conti !== containers.end() && conti.second && conti.second.empty() && !reserved[conti.first])
                    return conti.first;
            }
            //If that fails still iterate through each position because a free position _should_ exist
            for (let x = a.X(); ix <= b.X(); ++ix) {
                for (let y = a.Y(); iy <= b.Y(); ++iy) {
                    let p = new Coordinate(ix, iy);
                    if (map.GetConstruction(p) === uid) {
                        if (containers[p].empty() && !reserved[p])
                            return p;
                    }
                }
            }
        }

        /**
        std.vector < std.pair < Coordinate, Coordinate > > */
        let candidates;
        //Getting here means that we need to expand the pile
        for (let x = a.X() - 1; ix <= b.X() + 1; ++ix) {
            for (let y = a.Y() - 1; iy <= b.Y() + 1; ++iy) {
                let p = new Coordinate(ix, iy),
                    adj;
                if (map.IsBuildable(p) &&
                    Construction.Presets[type].tileReqs.find(map.GetType(p)) !== Construction.Presets[type].tileReqs.end() &&
                    FindAdjacentTo(p, uid, adj)) {
                    candidates.push(std.make_pair(p, adj));
                }
            }
        }

        if (!candidates.empty()) {
            let choice = Random.ChooseElement(candidates);
            //We want to return the coordinate that was expanded to
            let p = choice.first,
                adj = choice.second;
            if (Expand(Coordinate.min(p, adj), Coordinate.max(p, adj)))
                return p;
        }
        return undefined;
    }
    ReserveSpot(pos, val, type) {
        reserved[pos] = val;

        /*Update amounts based on reserves if limits exist for the item
        This is necessary to stop too many stockpilation jobs being queued up
        Also update demand so that too many items aren't brought here instead of
        elsewhere that might demand them as well*/
        if (type >= 0) {
            for (let cati = Item.Presets[type].categories.begin(); cati !== Item.Presets[type].categories.end(); ++cati) {
                if (GetLimit(cati) >= 0) {
                    amount[cati] += val ? 1 : -1;
                }
            }

            //We only care about container demand, and they all have _1_ specific category (TODO: They might not)
            let category = Item.Presets[type].specificCategories.begin();
            if (demand.find(category) !== demand.end()) {
                demand[category] -= (Item.Presets[type].container(val ? 1 : -1));
            }
        }
    }

    Storage(pos) {
        return containers[pos];
    }

    /**
        void SwitchAllowed(ItemCategory, bool childrenAlso = true, bool countParentsOnly = false);
        void Stockpile.
        */
    SwitchAllowed(cat, childrenAlso, countParentsOnly) {
        if (countParentsOnly) { //the itemcategory passed in is actually an index in this case, so it has to be modified
            let index = Math.round(cat);
            cat = -1;
            for (let i = 0; i <= index; ++i) {
                ++cat;
                while (Item.Categories[cat].parent !== -1)
                    ++cat;
            }
        }
        allowed[cat] = !allowed[cat];

        if (allowed[cat] && limits.find(cat) !== limits.end() && limits[cat] === 0) limits[cat] = 10;

        if (childrenAlso) {
            for (let alli = boost.next(allowed.find(cat)); alli !== allowed.end(); ++alli) {
                if (Item.Categories[alli.first].parent >= 0 &&
                    Item.Categories[Item.Categories[alli.first].parent].name === Item.Categories[cat].name) {
                    alli.second = allowed[cat];
                    if (alli.second && limits.find(alli.first) !== limits.end() && limits[alli.first] === 0) limits[alli.first] = 10;
                } else {
                    break;
                }
            }
        }
        Game.i.RefreshStockpiles();
    }

    SetAllAllowed(nallowed) {
        for (let i = 0; i < Item.Categories.size(); i++) {
            allowed[i] = nallowed;
        }
        Game.i.RefreshStockpiles();
    }
    ItemAdded(witem) {
        let item;
        if (item = witem.lock()) {
            let categories = Item.Presets[item.Type()].categories;
            for (let it = categories.begin(); it !== categories.end(); it++) {
                amount[it] = amount[it] + 1;
            }

            //Increase container demand for each containable item
            if (Item.Presets[item.Type()].fitsin >= 0) {
                ++demand[Item.Presets[item.Type()].fitsin];
                if (std.abs(demand[Item.Presets[item.Type()].fitsin] - lastDemandBalance[Item.Presets[item.Type()].fitsin]) > 10) {
                    Game.i.RebalanceStockpiles(Item.Presets[item.Type()].fitsin,
                        boost.static_pointer_cast < Stockpile > (shared_from_this()));
                    lastDemandBalance[Item.Presets[item.Type()].fitsin] = demand[Item.Presets[item.Type()].fitsin];
                }
            }

            if (item.IsCategory(Item.StringToItemCategory("Container"))) {

                //"Add" each item inside a container as well
                let container = (item);
                for (let i = container.begin(); i !== container.end(); i++) {
                    ItemAdded(i);
                }
                container.AddListener(this);

                //Decrease container demand by how much this container can hold
                //Assumes that contaieners only have one specific category (TODO: might not be true in the future)
                let category = Item.Presets[item.Type()].specificCategories.begin();
                demand[category] -= Item.Presets[item.Type()].container;

                //If this is an empty container, re-organize the stockpile to use it
                if (container.empty()) {
                    //We have to unreserve the item here, otherwise it won't be found for reorganization
                    //In pretty much every case it'll still be reserved at this point, as the job to place it
                    //here hasn't yet finished
                    container.Reserve(false);
                    Reorganize();
                }
            }
        }
    }

    ItemRemoved(bwitem) {
        let item;
        if (item = witem.lock()) {

            //"Remove" each item inside a container
            if (item.IsCategory(Item.StringToItemCategory("Container"))) {
                let container = boost.static_pointer_cast < Container > (item);
                container.RemoveListener(this);
                for (let i = container.begin(); i !== container.end(); i++) {
                    ItemRemoved(i);
                }

                //Increase demand for the container by how much it can hold
                let category = Item.Presets[item.Type()].specificCategories.begin();
                demand[category] = demand[category] - Item.Presets[item.Type()].container;
            }

            //Decrease container demand
            if (Item.Presets[item.Type()].fitsin >= 0)
                --demand[Item.Presets[item.Type()].fitsin];

            let categories = Item.Presets[item.Type()].categories;
            for (let it = categories.begin(); it !== categories.end(); it++) {
                amount[it] = amount[it] - 1;
            }
        }
    }


    GetTooltip(x, y, tooltip) {
        if (containers.find(Coordinate(x, y)) !== containers.end()) {
            if (!containers[Coordinate(x, y)].empty()) {
                let item = containers[Coordinate(x, y)].GetFirstItem();
                if (item.lock()) {
                    item.lock().GetTooltip(x, y, tooltip);
                }
            }
        }

        tooltip.AddEntry(TooltipEntry(name, Color.white));
        let vecView = [];
        for (let it = amount.begin(); it !== amount.end(); it++) {
            if (Item.Categories[it.first].parent < 0 && it.second > 0) {
                vecView.push(it);
            }
        }
        if (!vecView.empty()) {
            std.sort(vecView.begin(), vecView.end(), AmountCompare());
            let count = 0;
            for (let i = 0; i < vecView.size(); i++) {
                if (++count > 30) {
                    tooltip.AddEntry(TooltipEntry(" ...", Color.grey));
                    return;
                }
                tooltip.AddEntry(TooltipEntry((boost.format(" %s x%d") % Item.ItemCategoryToString(vecView[i].first) % vecView[i].second).str(), Color.grey));

                for (let cati = Item.Categories.begin(); cati !== Item.Categories.end(); cati++) {
                    if (cati.parent >= 0 && Item.StringToItemCategory(Item.Categories[cati.parent].GetName()) === vecView[i].first) {
                        let amt = amount[Item.StringToItemCategory(cati.GetName())];
                        if (amt > 0) {
                            if (++count > 30) {
                                tooltip.AddEntry(TooltipEntry(" ...", Color.grey));
                                return;
                            }
                            tooltip.AddEntry(TooltipEntry((boost.format("	 %s x%d") % cati.GetName() % amt).str(), Color.grey));
                        }
                    }
                }
            }
        }
    }
    Center() {
        return new Coordinate((a.X() + b.X() - 1) / 2, (a.Y() + b.Y() - 1) / 2);
    }

    TranslateInternalContainerListeners() {
        for (let it = containers.begin(); it !== containers.end(); ++it) {
            it.second.TranslateContainerListeners();
        }
    }
    AdjustLimit(category, amount) {
        if (amount > 0 && !allowed[category]) allowed[category] = true;
        else if (amount === 0 && allowed[category]) allowed[category] = false;

        if (limits.find(category) !== limits.end()) {
            limits[category] = amount;
        }
    }

    GetLimit(category) {
        if (limits.find(category) !== limits.end())
            return limits[category];
        else
            return -1;
    }

    AcceptVisitor(visitor) {
        visitor.Visit(this);
    }
    Erase(p) {
        assert(p !== undefinedCoordinate);
        if (map.GetConstruction(p) === uid) {
            map.SetConstruction(p, -1);
            map.SetBuildable(p, true);
            reserved.erase(p);
            containers.erase(p);
            colors.erase(p);
        }

    }

    Dismantle(p = undefinedCoordinate) {
        if (!Construction.Presets[type].permanent) {
            if (p === undefinedCoordinate) {
                //Need to remove the pile first, otherwise when the items are emptied out they'll just be restockpiled in this pile
                Game.i.RemoveConstruction(boost.static_pointer_cast < Construction > (shared_from_this()));
                for (let ix = a.X(); ix <= b.X(); ++ix) {
                    for (let iy = a.Y(); iy <= b.Y(); ++iy) {
                        Stockpile.Erase(Coordinate(ix, iy));
                    }
                }
            } else {
                Stockpile.Erase(p);
                if (containers.empty()) Game.i.RemoveConstruction(boost.static_pointer_cast < Construction > (shared_from_this()));
            }
        }
    }

    GetDemand(category) {
        if (demand.find(category) !== demand.end())
            return Math.max(0, demand[category]);
        else
            return -1;
    }
    GetAmount(category) {
        return amount[category];
    }

    //Checks if new containers exist to hold items not in containers
    Reorganize() {
            for (let space = containers.begin(); space !== containers.end(); ++space) {
                if (!space.second.empty()) {
                    let item;
                    if (item = space.second.GetFirstItem().lock()) {
                        if (Item.Presets[item.Type()].fitsin >= 0) {
                            let container;
                            if (container = FindItemByCategory(Item.Presets[item.Type()].fitsin, NOTFULL).lock()) {
                                boost.shared_ptr < Job > reorgJob(new Job("Reorganize stockpile", LOW));
                                reorgJob.Attempts(1);
                                reorgJob.ReserveSpace(boost.static_pointer_cast < Container > (container));
                                reorgJob.tasks.push(new Task(Action.MOVE, item.Position()));
                                reorgJob.tasks.push(new Task(Action.TAKE, item.Position(), item));
                                reorgJob.tasks.push(new Task(Action.MOVE, container.Position()));
                                reorgJob.tasks.push(new Task(Action.PUTIN, container.Position(), container));
                                JobManager.AddJob(reorgJob);
                            }
                        }
                    }
                }
            }
        }
        /*
            int Symbol();
            void Symbol(int);
        */

    save(ar,
        version) {
        ar & boost.serialization.base_object < Construction > (this);
        ar & symbol;
        ar & a;
        ar & b;
        ar & capacity;
        ar & amount;
        ar & allowed;
        ar & reserved;
        ar & containers;
        let colorCount = colors.size();
        ar & colorCount;
        for (let it = colors.begin(); it !== colors.end(); ++it) {
            ar & it.first;
            ar & it.second.r;
            ar & it.second.g;
            ar & it.second.b;
        }
        ar & limits;
        ar & demand;
        ar & lastDemandBalance;
    }

    load(ar,
        version) {
        ar & boost.serialization.base_object < Construction > (this);
        ar & symbol;
        ar & a;
        ar & b;
        ar & capacity;
        ar & amount;
        ar & allowed;
        ar & reserved;
        ar & containers;
        let colorCount;
        ar & colorCount;
        for (let i = 0; i < colorCount; ++i) {
            let pos = new Coordinate();
            ar & pos;
            let r, g, b;
            ar & r;
            ar & g;
            ar & b;
            colors.insert(std.pair < Coordinate, Color > (pos, Color(r, g, b)));
        }
        ar & limits;
        if (version >= 1) {
            ar & demand;
            ar & lastDemandBalance;
        }
    }

    /** }
    Color.grey
    )=
    );

    for (
        let cati = Item.Categories.begin(); cati !== Item.Categories.end(); cati++
    ) {
        if (
            cati.parent >= 0 &&
            Item.StringToItemCategory(Item.Categories[cati.parent].GetName()) ==
            vecView[i].first
        ) {
            let amt = amount[Item.StringToItemCategory(cati.GetName())];
            if (amt > 0) {
                if (++count > 30) {
                    tooltip.AddEntry(TooltipEntry(" ...", Color.grey));
                    return;
                }
                tooltip.AddEntry(
                    TooltipEntry(
                        ((boost.format("	 %s x%d") % cati.GetName()) % amt).str(),
                        Color.grey
                    )
                );
            }
        }
    }
    }
    }
    }*/
    Center() {
        return new Coordinate((a.X() + b.X() - 1) / 2, (a.Y() + b.Y() - 1) / 2);
    }

    TranslateInternalContainerListeners() {
        for (let it = containers.begin(); it !== containers.end(); ++it) {
            it.second.TranslateContainerListeners();
        }
    }
    AdjustLimit(category, amount) {
        if (amount > 0 && !allowed[category]) allowed[category] = true;
        else if (amount === 0 && allowed[category]) allowed[category] = false;

        if (limits.find(category) !== limits.end()) {
            limits[category] = amount;
        }
    }

    GetLimit(category) {
        if (limits.find(category) !== limits.end()) return limits[category];
        else return -1;
    }

    AcceptVisitor(visitor) {
        visitor.Visit(this);
    }
    Erase(p) {
        assert(p !== undefinedCoordinate);
        if (map.GetConstruction(p) === uid) {
            map.SetConstruction(p, -1);
            map.SetBuildable(p, true);
            reserved.erase(p);
            containers.erase(p);
            colors.erase(p);
        }
    }

    Dismantle(p = undefinedCoordinate) {
        if (!Construction.Presets[type].permanent) {
            if (p === undefinedCoordinate) {
                //Need to remove the pile first, otherwise when the items are emptied out they'll just be restockpiled in this pile
                Game.i.RemoveConstruction(
                    boost.static_pointer_cast < Construction > shared_from_this()
                );
                for (let ix = a.X(); ix <= b.X(); ++ix) {
                    for (let iy = a.Y(); iy <= b.Y(); ++iy) {
                        Stockpile.Erase(Coordinate(ix, iy));
                    }
                }
            } else {
                Stockpile.Erase(p);
                if (containers.empty())
                    Game.i.RemoveConstruction(
                        boost.static_pointer_cast < Construction > shared_from_this()
                    );
            }
        }
    }

    GetDemand(category) {
        if (demand.find(category) !== demand.end())
            return Math.max(0, demand[category]);
        else return -1;
    }
    GetAmount(category) {
        return amount[category];
    }

    //Checks if new containers exist to hold items not in containers
    Reorganize() {
            for (let space = containers.begin(); space !== containers.end(); ++space) {
                if (!space.second.empty()) {
                    let item;
                    if ((item = space.second.GetFirstItem().lock())) {
                        if (Item.Presets[item.Type()].fitsin >= 0) {
                            let container;
                            if (
                                (container = FindItemByCategory(
                                    Item.Presets[item.Type()].fitsin,
                                    NOTFULL
                                ).lock())
                            ) {
                                boost.shared_ptr <
                                    Job >
                                    reorgJob(new Job("Reorganize stockpile", LOW));
                                reorgJob.Attempts(1);
                                reorgJob.ReserveSpace(
                                    boost.static_pointer_cast < Container > container
                                );
                                reorgJob.tasks.push(new Task(Action.MOVE, item.Position()));
                                reorgJob.tasks.push(new Task(Action.TAKE, item.Position(), item));
                                reorgJob.tasks.push(new Task(Action.MOVE, container.Position()));
                                reorgJob.tasks.push(
                                    new Task(Action.PUTIN, container.Position(), container)
                                );
                                JobManager.AddJob(reorgJob);
                            }
                        }
                    }
                }
            }
        }
        /*
                  int Symbol();
                  void Symbol(int);
              */

    save(ar, version) {
        ar & (boost.serialization.base_object < Construction > this);
        ar & symbol;
        ar & a;
        ar & b;
        ar & capacity;
        ar & amount;
        ar & allowed;
        ar & reserved;
        ar & containers;
        let colorCount = colors.size();
        ar & colorCount;
        for (let it = colors.begin(); it !== colors.end(); ++it) {
            ar & it.first;
            ar & it.second.r;
            ar & it.second.g;
            ar & it.second.b;
        }
        ar & limits;
        ar & demand;
        ar & lastDemandBalance;
    }

    load(ar, version) {
        ar & (boost.serialization.base_object < Construction > this);
        ar & symbol;
        ar & a;
        ar & b;
        ar & capacity;
        ar & amount;
        ar & allowed;
        ar & reserved;
        ar & containers;
        let colorCount;
        ar & colorCount;
        for (let i = 0; i < colorCount; ++i) {
            let pos = new Coordinate();
            ar & pos;
            let r, g, b;
            ar & r;
            ar & g;
            ar & b;
            colors.insert(
                std.pair < Coordinate,
                Color > (pos, Color(r, g, b))
            );
        }
        ar & limits;
        if (version >= 1) {
            ar & demand;
            ar & lastDemandBalance;
        }
    }
}
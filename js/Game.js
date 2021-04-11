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



import { Color } from "./color/Color.js";
import { Config } from "./data/Config.js";
import { Coordinate } from "./Coordinate.js";
import { Events } from "./Events.js";
import {
    Season
} from "./Season.js";
import {
    TCODMapRenderer
} from "./TCODMapRenderer.js";

let loading = [
    "\\ Loading...",
    "| Loading...",
    "/ Loading...",
    "- Loading..."
];

let saving = [
    "\\ Saving...",
    "| Saving...",
    "/ Saving...",
    "- Saving..."
];

const loadingSize = loading.length;
const savingSize = saving.length;

class GameClass {
    static CLASS_VERSION() { return 1; }

    //boost.mutex 
    loadingScreenMutex;
    screenWidth = 0;
    screenHeight = 0;
    charWidth = 0;
    charHeight = 0;
    season = Season.EarlySpring;
    time = 0;
    age = 0;
    orcCount = 0;
    goblinCount = 0;
    peacefulFaunaCount = 0;
    paused = false;
    toMainMenu = false;
    running = false;
    gameOver = false;
    safeMonths = 3;
    events = new Events();
    camX = 180;
    camY = 180;
    /** @type {Console} */
    buffer = null;
    marks = new Array(12);
    the_console = null;
    /** @type {boost.shared_ptr<MapRenderer>} */
    renderer = null;
    // friend class ConfigListener;
    // friend void SettingsMenu();
    // friend class TCODMapRenderer;
    // friend class TilesetRenderer;
    // friend class NPCDialog;
    // friend void StartNewGame();

    // Game();
    // Season season;
    // int time;
    // int age;
    // int orcCount, goblinCount;
    // unsigned int peacefulFaunaCount;
    // bool paused;
    // int charWidth, charHeight;
    // bool toMainMenu, running;
    // int safeMonths;
    // bool refreshStockpiles;
    // static bool devMode;
    // Coordinate marks[12];

    // boost.shared_ptr < Events > events;

    // std.list < std.pair < int, boost.function < void() > > > delays;

    // boost.shared_ptr < MapRenderer > renderer;
    // bool gameOver;

    // std.map < int, boost.shared_ptr < Construction > > staticConstructionList;
    // std.map < int, boost.shared_ptr < Construction > > dynamicConstructionList;
    // std.map < int, boost.shared_ptr < NPC > > npcList;

    // static bool initializedOnce;

    //public extends 
    // static Game * Inst();
    // ~Game();
    // static bool LoadGame(const std.string & );
    // static bool SaveGame(const std.string & );
    // static void ToMainMenu(bool);
    // static bool ToMainMenu();
    // void Running(bool);
    // bool Running();
    // static void Reset();
    // static void DoNothing();
    // static void Exit(bool confirm = true);

    // Coordinate TileAt(int pixelX, int pixelY) const;
    Renderer() {
        return this.renderer;
    }

    // int ScreenWidth() const;
    // int ScreenHeight() const;
    // void LoadConfig(std.string);
    // void Init(bool firstTime);
    // void ResetRenderer();

    // static boost.mutex loadingScreenMutex;
    // static void ProgressScreen(boost.function < void(void) > , bool isLoading);
    LoadingScreen(fn) {
        this.ProgressScreen(fn, true);
    }
    SavingScreen(fn) {
        this.ProgressScreen(fn, false);
    }

    // static void ErrorScreen();
    // void GenerateMap(uint32_t seed = 0);

    // void Update();
    // float camX, camY;
    // void CenterOn(Coordinate target);
    // void MoveCam(float x, float y);
    // void SetMark(int);
    // void ReturnToMark(int);

    // void Pause();
    // bool Paused();

    // void GameOver();

    // int CharHeight() const;
    // int CharWidth() const;

    // TCODConsole * buffer;
    // void FlipBuffer();
    // void Draw(
    //     TCODConsole * the_console = Game.buffer, float focusX = Game.camX, float focusY = Game.camY,
    //     bool drawUI = true, int posX = 0, int posY = 0, int xSize = -1, int ySize = -1
    // );

    // static int DiceToInt(TCOD_dice_t);

    // static void Undesignate(Coordinate, Coordinate);
    // bool DevMode();
    // void EnableDevMode();

    /*      NPCS        NPCS        NPCS        */
    // int CreateNPC(Coordinate, NPCType);
    // void BumpEntity(int);
    // int DistanceNPCToCoordinate(int, Coordinate);
    // int OrcCount() const;
    // int GoblinCount() const;
    // void OrcCount(int);
    // void GoblinCount(int);
    // void RemoveNPC(boost.weak_ptr < NPC > );
    // int FindMilitaryRecruit();
    // std.map < std.string, boost.shared_ptr < Squad > > squadList;
    // std.list < boost.shared_ptr < Squad > > hostileSquadList;
    // void CreateSquad(std.string);
    // static void SetSquadTargetCoordinate(Order, Coordinate, boost.shared_ptr < Squad > , bool autoClose = true);
    // static void SetSquadTargetEntity(Order, Coordinate, boost.shared_ptr < Squad > );
    // NPCType GetRandomNPCTypeByTag(std.string tag);
    // std.vector < int > CreateNPCs(int, NPCType, Coordinate, Coordinate);
    // unsigned int PeacefulFaunaCount() const;
    // void PeacefulFaunaCount(int);
    // void Hungerize(Coordinate);
    // void Thirstify(Coordinate);
    // void Tire(Coordinate);
    // void Badsleepify(Coordinate);
    // void Diseasify(Coordinate);
    // boost.shared_ptr < NPC > GetNPC(int) const;

    /*      CONSTRUCTIONS       CONSTRUCTIONS       CONSTRUCTIONS       */
    // static bool CheckPlacement(Coordinate, Coordinate, std.set < TileType > = std.set < TileType > ());
    // static int PlaceConstruction(Coordinate, ConstructionType);
    // static void DismantleConstruction(Coordinate, Coordinate);
    // void RemoveConstruction(boost.weak_ptr < Construction > );
    // static int PlaceStockpile(Coordinate, Coordinate, ConstructionType, int);
    RefreshStockpiles() {
        refreshStockpiles = true;
    }

    // void RebalanceStockpiles(ItemCategory requiredCategory, boost.shared_ptr < Stockpile > excluded);
    // Coordinate FindClosestAdjacent(Coordinate, boost.weak_ptr < Entity > , int faction = -1);
    // static bool Adjacent(Coordinate, boost.weak_ptr < Entity > );
    // boost.weak_ptr < Construction > GetConstruction(int);
    // boost.weak_ptr < Construction > FindConstructionByTag(ConstructionTag, Coordinate closeTo = Coordinate(-1, -1));
    // boost.weak_ptr < Construction > GetRandomConstruction() const;
    // void Damage(Coordinate);
    // void UpdateFarmPlotSeedAllowances(ItemType);

    /*      ITEMS       ITEMS       ITEMS       */
    // int CreateItem(Coordinate, ItemType, bool stockpile = false,
    //     int ownerFaction = 0,
    //     std.vector < boost.weak_ptr < Item > > = std.vector < boost.weak_ptr < Item > > (),
    //     boost.shared_ptr < Container > = boost.shared_ptr < Container > ());
    // void RemoveItem(boost.weak_ptr < Item > );
    // boost.weak_ptr < Item > GetItem(int);
    // std.map < int, boost.shared_ptr < Item > > itemList;
    // void ItemContained(boost.weak_ptr < Item > , bool contained);
    // std.set < boost.weak_ptr < Item > > freeItems; //Free as in not contained
    // std.set < boost.weak_ptr < Item > > flyingItems; //These need to be updated
    // std.list < boost.weak_ptr < Item > > stoppedItems; //These need to be removed from flyingItems
    // static int ItemTypeCount;
    // static int ItemCatCount;
    // boost.shared_ptr < Job > StockpileItem(boost.weak_ptr < Item > , bool returnJob = false, bool disregardTerritory = false, bool reserveItem = true);
    // boost.weak_ptr < Item > FindItemByCategoryFromStockpiles(ItemCategory, Coordinate, int flags = 0, int value = 0);
    // boost.weak_ptr < Item > FindItemByTypeFromStockpiles(ItemType, Coordinate, int flags = 0, int value = 0);
    // void CreateItems(int, ItemType, Coordinate, Coordinate);
    // void TranslateContainerListeners();
    // void GatherItems(Coordinate a, Coordinate b);

    /*      NATURE      NATURE      NATURE      */
    // std.map < int, boost.shared_ptr < NatureObject > > natureList;
    // std.list < boost.weak_ptr < WaterNode > > waterList;
    // void CreateWater(Coordinate);
    // void CreateWater(Coordinate, int, int = 0);
    // void CreateWaterFromNode(boost.shared_ptr < WaterNode > );
    // void RemoveWater(Coordinate, bool removeFromList = true);
    // Coordinate FindWater(Coordinate);
    // Coordinate FindFilth(Coordinate);
    // static bool CheckTree(Coordinate, Coordinate);
    // static void FellTree(Coordinate, Coordinate);
    // static void DesignateTree(Coordinate, Coordinate);
    // void RemoveNatureObject(boost.weak_ptr < NatureObject > );
    // void RemoveNatureObject(Coordinate a, Coordinate b);
    // static void HarvestWildPlant(Coordinate, Coordinate);
    // static void DesignateBog(Coordinate, Coordinate);
    // static bool CheckTileType(TileType, Coordinate, Coordinate);
    // static void Dig(Coordinate, Coordinate);
    // static void FillDitch(Coordinate, Coordinate);
    // Coordinate FindClosestAdjacent(Coordinate, Coordinate, int faction = -1);
    // static bool Adjacent(Coordinate, Coordinate);
    // void CreateNatureObject(Coordinate, int surroundingNatureObjects);
    // void CreateNatureObject(Coordinate, std.string);
    // void CreateDitch(Coordinate);

    // Season CurrentSeason();
    // std.string SeasonToString(Season);
    // void SetSeason(Season);
    // void SpawnTillageJobs();
    // void DeTillFarmPlots();
    // void DecayItems();

    // std.list < boost.weak_ptr < FilthNode > > filthList;
    // void CreateFilth(Coordinate);
    // void CreateFilth(Coordinate, int);
    // void RemoveFilth(Coordinate);

    // std.list < boost.weak_ptr < BloodNode > > bloodList;
    // void CreateBlood(Coordinate);
    // void CreateBlood(Coordinate, int);

    // void TriggerAttack();
    // void TriggerMigration();

    // void AddDelay(int delay, boost.function < void() > );

    // std.list < boost.weak_ptr < FireNode > > fireList;
    // void CreateFire(Coordinate);
    // void CreateFire(Coordinate, int);
    // void StartFire(Coordinate);

    // boost.shared_ptr < Spell > CreateSpell(Coordinate, int type);
    // std.list < boost.shared_ptr < Spell > > spellList;

    // int GetAge();

    // void DisplayStats();
    // void ProvideMap();



    static ItemTypeCount = 0;
    static ItemCatCount = 0;

    static initializedOnce = false;
    static instance = 0;

    static devMode = false;

    constructor() {
        for (let i = 0; i < 12; i++) {
            this.marks[i] = Coordinate.undefinedCoordinate;
        }
    }

    destructor() {
        if (this.buffer) {
            delete this.buffer;
        }
    }


    //Checks whether all the tiles under the rectangle (target is the up-left corner) are buildable
    CheckPlacement(target, size, tileReqs) {
        for (let x = target.X(); x < target.X() + size.X(); ++x) {
            for (let y = target.Y(); y < target.Y() + size.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (!Map.IsInside(p) || !Map.IsBuildable(p) || (!tileReqs.empty() && tileReqs.find(Map.GetType(p)) === tileReqs.end()))
                    return false;
            }
        }
        return true;
    }

    PlaceConstruction(target, construct) {
        //Check if the required materials exist before creating the build job
        let componentList;
        for (let mati = Construction.Presets[construct].materials.begin(); mati !== Construction.Presets[construct].materials.end(); ++mati) {
            let material = Game.FindItemByCategoryFromStockpiles(mati, target, EMPTY);
            let item;
            if (item = material.lock()) {
                item.Reserve(true);
                componentList.push_back(item);
            } else {
                for (let compi = componentList.begin(); compi !== componentList.end(); ++compi) {
                    compi.lock().Reserve(false);
                }
                componentList.clear();
                Announce.AddMsg((boost.format("Cancelled %s: insufficient [%s] in stockpiles") % Construction.Presets[construct].name % Item.ItemCategoryToString(mati)).str(), Color.red);
                return -1;
            }
        }

        if (Construction.AllowedAmount[construct] >= 0) {
            if (Construction.AllowedAmount[construct] === 0) {
                Announce.AddMsg(
                    "Cannot build another " +
                    Construction.Presets[construct].name +
                    "!",
                    Color.red
                );
                return -1;
            }
            --Construction.AllowedAmount[construct];
        }

        for (let compi = componentList.begin(); compi !== componentList.end(); ++compi) {
            compi.lock().Reserve(false);
        }
        componentList.clear();

        boost.shared_ptr < Construction > newCons;
        if (Construction.Presets[construct].tags[DOOR]) {
            newCons = boost.shared_ptr < Construction > (new Door(construct, target));
        } else if (Construction.Presets[construct].tags[SPAWNINGPOOL]) {
            newCons = boost.shared_ptr < Construction > (new SpawningPool(construct, target));
        } else if (Construction.Presets[construct].tags[TRAP]) {
            newCons = boost.shared_ptr < Construction > (new Trap(construct, target));
            Faction.factions[PLAYERFACTION].TrapSet(target, true);
        } else {
            newCons = boost.shared_ptr < Construction > (new Construction(construct, target));
        }
        if (Construction.Presets[construct].dynamic) {
            Game.dynamicConstructionList.insert((newCons.Uid(), newCons));
        } else {
            Game.staticConstructionList.insert((newCons.Uid(), newCons));
        }
        newCons.SetMap(Map);
        let blueprint = Construction.Blueprint(construct);
        for (let x = target.X(); x < target.X() + blueprint.X(); ++x) {
            for (let y = target.Y(); y < target.Y() + blueprint.Y(); ++y) {
                let p = new Coordinate(x, y);
                Map.SetBuildable(p, false);
                Map.SetConstruction(p, newCons.Uid());
                if (!Construction.Presets[construct].tags[TRAP]) Map.SetTerritory(p, true);
            }
        }

        boost.shared_ptr < Job > buildJob(new Job("Build " + Construction.Presets[construct].name, MED, 0, false));
        buildJob.DisregardTerritory();

        for (let materialIter = newCons.MaterialList().begin(); materialIter !== newCons.MaterialList().end(); ++materialIter) {
            boost.shared_ptr < Job > pickupJob(new Job("Pickup " + Item.ItemCategoryToString(materialIter) + " for " + Construction.Presets[construct].name, MED, 0, true));
            pickupJob.Parent(buildJob);
            pickupJob.DisregardTerritory();
            buildJob.PreReqs().push_back(pickupJob);

            pickupJob.tasks.push_back(Task(FIND, target, null, materialIter, EMPTY));
            pickupJob.tasks.push_back(Task(MOVE));
            pickupJob.tasks.push_back(Task(TAKE));
            pickupJob.tasks.push_back(Task(MOVE, newCons.Storage().lock().Position(), newCons));
            pickupJob.tasks.push_back(Task(PUTIN, newCons.Storage().lock().Position(), newCons.Storage()));
            JobManager.AddJob(pickupJob);
        }

        buildJob.tasks.push_back(Task(MOVEADJACENT, newCons.Position(), newCons));
        buildJob.tasks.push_back(Task(BUILD, newCons.Position(), newCons));
        buildJob.ConnectToEntity(newCons);

        JobManager.AddJob(buildJob);

        return newCons.Uid();
    }

    PlaceStockpile(a, b, stockpile, symbol) {
        //Placing a stockpile isn't as straightforward as just building one in each tile
        //We want to create 1 stockpile, at a, and then expand it from a to b.
        //Using the stockpile expansion function ensures that it only expands into valid tiles

        //Find a tile from a to b that is buildable
        startContinuePlaceStockpile: do {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                for (let x = a.X(); x <= b.X(); ++x) {
                    let p = new Coordinate(x, y);
                    if (Map.IsBuildable(p)) {
                        a = p;
                        // goto ContinuePlaceStockpile;
                        break startContinuePlaceStockpile;
                    }
                }
            }
            return -1; //No buildable tiles
        } while (false);
        // ContinuePlaceStockpile: 
        // boost.shared_ptr < Stockpile > 
        newSp = ((Construction.Presets[stockpile].tags[FARMPLOT]) ? new FarmPlot(stockpile, symbol, a) : new Stockpile(stockpile, symbol, a));
        newSp.SetMap(Map);
        Map.SetBuildable(a, false);
        Map.SetConstruction(a, newSp.Uid());
        Map.SetTerritory(a, true);
        newSp.Expand(a, b);
        if (Construction.Presets[stockpile].dynamic) {
            Game.dynamicConstructionList.insert((newSp.Uid(), (newSp)));
        } else {
            Game.staticConstructionList.insert((newSp.Uid(), (newSp)));
        }

        Game.RefreshStockpiles();

        Script.Event.BuildingCreated(newSp, a.X(), a.Y());

        //Spawning a BUILD job is not required because stockpiles are created "built"
        return newSp.Uid();
    }

    //Returns undefined if not found
    FindClosestAdjacent(pos, ent, faction) {
        let closest = Coordinate.undefinedCoordinate;
        let leastDistance = Number.MAX_SAFE_INTEGER;
        if (ent.lock()) {
            if ((ent.lock())) {
                let construct = (boost.static_pointer_cast < Construction > (ent.lock()));
                //note on weird (origin,extent) coordinates: we want the *outer* bordure of (position,blueprint)
                let origin = construct.Position() - 1,
                    extent = Construction.Blueprint(construct.Type()) + 2;
                for (let ix = origin.X(); ix < (origin + extent).X(); ++ix) {
                    for (let iy = origin.Y(); iy < (origin + extent).Y(); ++iy) {
                        let p = new Coordinate(ix, iy);
                        if (p.onExtentEdges(origin, extent) && Map.IsWalkable(p)) {
                            let distance = Distance(pos, p);
                            if (faction >= 0 && Map.IsDangerous(p, faction)) distance += 100;
                            if (distance < leastDistance) {
                                closest = p;
                                leastDistance = distance;
                            }
                        }
                    }
                }
            } else {
                return FindClosestAdjacent(pos, ent.lock().Position(), faction);
            }
        }
        return closest;
    }

    //Returns true/false depending on if the given position is adjacent to the entity
    //Takes into consideration if the entity is a construction, and thus may be larger than just one tile
    Adjacent(pos, ent) {
        if (ent.lock()) {
            if (boost.dynamic_pointer_cast < Construction > (ent.lock())) {
                boost.shared_ptr < Construction > construct(boost.static_pointer_cast < Construction > (ent.lock()));
                for (let ix = construct.X() - 1; ix <= construct.X() + Construction.Blueprint(construct.Type()).X(); ++ix) {
                    for (let iy = construct.Y() - 1; iy <= construct.Y() + Construction.Blueprint(construct.Type()).Y(); ++iy) {
                        if (pos.X() === ix && pos.Y() === iy) {
                            return true;
                        }
                    }
                }
                return false;
            } else {
                for (let ix = ent.lock().X() - 1; ix <= ent.lock().X() + 1; ++ix) {
                    for (let iy = ent.lock().Y() - 1; iy <= ent.lock().Y() + 1; ++iy) {
                        if (pos.X() === ix && pos.Y() === iy) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }
        return false;
    }

    CreateNPC(target, type) {

        if (!Map.IsWalkable(target)) {
            for (let tries = 0; tries < 20; ++tries) {
                let candidate = Random.ChooseInRadius(target, 1 + tries / 3);
                if (Map.IsWalkable(candidate)) {
                    target = candidate;
                }
            }
            //TODO find a walkwable target even if those tries fail
            assert(Map.IsWalkable(target));
        }

        //boost.shared_ptr < NPC >
        let npc = (new NPC(target));
        npc.SetMap(Map);
        npc.type = type;
        npc.SetFaction(NPC.Presets[type].faction);
        npc.InitializeAIFunctions();
        npc.expert = NPC.Presets[type].expert;
        npc.color(NPC.Presets[type].color);
        npc.graphic(NPC.Presets[type].graphic);

        if (NPC.Presets[type].generateName) {
            npc.name = TCODNamegen.generate((NPC.Presets[type].name.c_str()));
        } else npc.name = NPC.Presets[type].name;

        npc.needsNutrition = NPC.Presets[type].needsNutrition;
        npc.needsSleep = NPC.Presets[type].needsSleep;
        npc.health = NPC.Presets[type].health;
        npc.maxHealth = NPC.Presets[type].health;
        for (let i = 0; i < STAT_COUNT; ++i) {
            npc.baseStats[i] = NPC.Presets[type].stats[i] + Random.Sign(NPC.Presets[type].stats[i] * (Random.Generate(0, 10) / 100));
        }
        for (let i = 0; i < RES_COUNT; ++i) {
            npc.baseResistances[i] = NPC.Presets[type].resistances[i] + Random.Sign(NPC.Presets[type].resistances[i] * (Random.Generate(0, 10) / 100));
        }

        npc.attacks = NPC.Presets[type].attacks;
        for (let attacki = NPC.Presets[type].attacks.begin(); attacki !== NPC.Presets[type].attacks.end(); ++attacki) {
            if (attacki.IsProjectileMagic()) {
                npc.hasMagicRangedAttacks = true;
                break;
            }
        }

        if (boost.iequals(NPC.NPCTypeToString(type), "orc")) {
            ++orcCount;
            npc.AddTrait(FRESH);
        } else if (boost.iequals(NPC.NPCTypeToString(type), "goblin")) {
            ++goblinCount;
            if (Random.Generate(2) === 0) npc.AddTrait(CHICKENHEART);
        } else if (NPC.Presets[type].tags.find("localwildlife") !== NPC.Presets[type].tags.end()) ++peacefulFaunaCount;

        if (NPC.Presets[type].tags.find("flying") !== NPC.Presets[type].tags.end()) {
            npc.AddEffect(FLYING);
        }

        npc.coward = (NPC.Presets[type].tags.find("coward") !== NPC.Presets[type].tags.end() ||
            npc.factionPtr.IsCoward());

        npc.aggressive = npc.factionPtr.IsAggressive();

        if (NPC.Presets[type].tags.find("hashands") !== NPC.Presets[type].tags.end()) {
            npc.hasHands = true;
        }

        if (NPC.Presets[type].tags.find("tunneler") !== NPC.Presets[type].tags.end()) {
            npc.isTunneler = true;
        }

        for (let equipIndex = 0; equipIndex < NPC.Presets[type].possibleEquipment.size(); ++equipIndex) {
            let itemType = Random.ChooseElement(NPC.Presets[type].possibleEquipment[equipIndex]);
            if (itemType > 0 && itemType < static_cast < int > (Item.Presets.size())) {
                //std.set < ItemCategory > 
                let categories = Item.Presets[itemType].categories;
                if (categories.find(Item.StringToItemCategory("weapon")) !== categories.end() &&
                    !npc.Wielding().lock()) {
                    let itemUid = CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.inventory);
                    //boost.shared_ptr < Item > 
                    let item = itemList[itemUid];
                    npc.mainHand = item;
                } else if (categories.find(Item.StringToItemCategory("armor")) !== categories.end() &&
                    !npc.Wearing().lock()) {
                    let itemUid = CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.inventory);
                    //boost.shared_ptr < Item > 
                    let item = itemList[itemUid];
                    npc.armor = item;
                } else if (categories.find(Item.StringToItemCategory("quiver")) !== categories.end() &&
                    !npc.quiver.lock()) {
                    let itemUid = CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.inventory);
                    // boost.shared_ptr < Item > 
                    let item = itemList[itemUid];
                    npc.quiver = boost.static_pointer_cast < Container > (item); //Quivers = containers
                } else if (categories.find(Item.StringToItemCategory("ammunition")) !== categories.end() &&
                    npc.quiver.lock() && npc.quiver.lock().empty()) {
                    for (let i = 0; i < 20 && !npc.quiver.lock().Full(); ++i) {
                        CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.quiver.lock());
                    }
                } else {
                    let itemUid = CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.inventory);
                    itemUid;
                }
            }
        }

        npcList.insert((npc.Uid(), npc));
        npc.factionPtr.AddMember(npc);

        return npc.Uid();
    }

    OrcCount(add) {
        if (Number.isFinite(add))
            orcCount += add;
        return orcCount;
    }
    GoblinCount(add) {
        if (Number.isFinite(add))
            goblinCount += add;
        return goblinCount;
    }

    //Moves the entity to a valid walkable tile
    BumpEntity(uid) {
        // boost.shared_ptr < Entity > 
        let entity;

        // std.map < int, boost.shared_ptr < NPC > > .iterator 
        let npc = npcList.find(uid);
        if (npc !== npcList.end()) {
            entity = npc.second;
        } else {
            // std.map < int, boost.shared_ptr < Item > > .iterator 
            let item = itemList.find(uid);
            if (item !== itemList.end()) {
                entity = item.second;
            }
        }

        if (entity) {
            if (!Map.IsWalkable(entity.Position())) {
                for (let radius = 1; radius < 10; ++radius) {
                    for (let ix = entity.Position().X() - radius; ix <= entity.Position().X() + radius; ++ix) {
                        for (let iy = entity.Position().Y() - radius; iy <= entity.Position().Y() + radius; ++iy) {
                            let p = new Coordinate(ix, iy);
                            if (Map.IsWalkable(p)) {
                                entity.Position(p);
                                return;
                            }
                        }
                    }
                }
            }
        }
        if /* if(def */ (DEBUG) {} else {
            std.cout << "\nTried to bump nonexistant entity.";
        }
    } /*#endif*/


    DoNothing() {}

    Exit(confirm) {
        //boost.function<void()> exitFunc = boost.bind(&Game.Running, Game, false);
        // boost.function < void() > 
        let exitFunc = boost.bind(exit, 0);

        if (confirm) {
            MessageBox.ShowMessageBox("Really exit?", exitFunc, "Yes", null, "No");
        } else {
            exitFunc();
        }
    }

    ScreenWidth() {
        return this.screenWidth;
    }
    ScreenHeight() {
        return this.screenHeight;
    }


    DrawProgressScreen(x, y, spin, isLoading) {
        // boost.lock_guard < boost.mutex > 
        // let lock = (this.loadingScreenMutex);

        // SDL_PumpEvents();

        let loadingMsg = (isLoading ? loading : saving)[spin % (isLoading ? loadingSize : savingSize)];

        // this.the_console.setDefaultForeground(Color.white);
        // this.the_console.setDefaultBackground(Color.black);
        // this.the_console.setAlignment(TCOD_CENTER); //TODO
        this.buffer.clear();
        this.buffer.draw(Math.round(x), Math.round(y), loadingMsg, Color.white, Color.black);
        // this.buffer.flush();
    }



    ProgressScreen(blockingCall, isLoading) {
        // this runs blocking call in a separate thread while spinning on the main one
        // so that the process doesn't appear to be dead
        //
        // thread safety notice: blockingCall MUST NOT access TCODConsole.root without
        // locking Game.loadingScreenMutex first!
        //
        // XXX heavily experimental
        //boost.promise < void >
        // let promise;

        //boost.unique_future < void >
        // let future = (promise.get_future());

        // make copies before launching the thread
        let x = Game.screenWidth / 2;
        let y = Game.screenHeight / 2;

        this.DrawProgressScreen(x, y, 0, isLoading);

        // //TODO put in a worker?
        // try {
        //     blockingCall();
        //     promise.set_value();
        // } catch (e) {
        //     promise.set_exception(boost.copy_exception(e));
        // }

        let spin = 0;
        setInterval(function() {
            this.DrawProgressScreen(x, y, ++spin, isLoading);
        }.bind(this), 500);
        return new Promise(() => true).then(blockingCall);
        // do {
        //     this.DrawProgressScreen(x, y, ++spin, isLoading);
        // } while (!future.timed_wait(boost.posix_time.millisec(500)));

        // if (future.has_exception()) {
        //     future.get();
        // }
    }

    ErrorScreen() {
        boost.lock_guard < boost.mutex > lock(loadingScreenMutex);

        let game = Game;
        TCODConsole.root.setDefaultForeground(Color.white);
        TCODConsole.root.setDefaultBackground(Color.black);
        TCODConsole.root.setAlignment(TCOD_CENTER);
        TCODConsole.root.clear();
        TCODConsole.root.print(
            game.screenWidth / 2, game.screenHeight / 2,
            "A critical error occurred, refer to the logfile for more information."
        );
        TCODConsole.root.print(game.screenWidth / 2, game.screenHeight / 2 + 1, "Press any key to exit the game.");
        TCODConsole.root.flush();
        TCODConsole.waitForKeypress(true);
        exit(255);
    }

    Init(firstTime) {
        let width = Config.GetCVar('int', "resolutionX");
        let height = Config.GetCVar('int', "resolutionY");
        let fullscreen = Config.GetCVar('bool', "fullscreen");

        if (width <= 0 || height <= 0) {
            if (fullscreen) {
                // TCODSystem.getCurrentResolution(width, height);
                // debugger;
                width = document.width;
                height = document.height;
            } else {
                width = 640;
                height = 480;
            }
        }

        // TCODSystem.getCharSize(charWidth, charHeight);//TODO fix this
        this.charWidth = 8;
        this.charHeight = 8;
        this.screenWidth = width / this.charWidth;
        this.screenHeight = height / this.charHeight;

        // srand(std.time(0)); TODO seed random generator....I thought it was already seeded in Rand.init..???

        //Enabling TCOD_RENDERER_GLSL can cause GCamp to crash on exit, apparently it's because of an ATI driver issue.
        //TCOD_renderer_t 
        // let renderer_type = (Config.GetCVar("renderer"));//TODO

        // TCODMouse.showCursor(true);
        //	TCODConsole.setKeyboardRepeat(500, 10);

        this.buffer = new ROT.Display({ width: this.screenWidth, height: this.screenHeight });
        if (firstTime) {
            // TCODConsole.initRoot(screenWidth, screenHeight, "Goblin Camp", fullscreen, renderer_type);
            document.body.appendChild(this.buffer.getContainer());
            document.title = "Goblin Camp";
        }
        this.ResetRenderer();

        this.events = (new Events(Map));

        this.season = Season.LateWinter;
        this.camX = 180;
        this.camY = 180;
    }

    ResetRenderer() {
        // For now just recreate the whole renderer
        let width, height;
        // TCODSystem.getCurrentResolution(width, height);
        width = document.body.clientWidth;
        height = document.body.clientHeight;

        if (this.renderer && "reset" in this.renderer)
            this.renderer.reset();

        if (Config.GetCVar("bool", "useTileset")) {
            let tilesetName = Config.GetStringCVar("tileset");
            if (tilesetName.length === 0) tilesetName = "default";

            let tilesetRenderer = this.CreateTilesetRenderer(width, height, buffer, tilesetName);

            if (tilesetRenderer) {
                this.renderer = tilesetRenderer;
            } else {
                this.renderer = new TCODMapRenderer(this.buffer);
            }
        } else {
            this.renderer = new TCODMapRenderer(this.buffer);
        }

        // this.buffer.setDirty(0, 0, this.buffer.getOptions().width, this.buffer.getOptions().height);
        this.buffer.clear();
        if (this.running) {
            this.renderer.PreparePrefabs();
        }
        this.renderer.SetTranslucentUI(Config.GetCVar("bool", "translucentUI"));
    }

    RemoveConstruction(cons) {
        let construct;
        if (construct = cons.lock()) {
            if (Construction.Presets[construct.type].dynamic) {
                Game.dynamicConstructionList.erase(construct.Uid());
            } else {
                Game.staticConstructionList.erase(construct.Uid());
            }

            Script.Event.BuildingDestroyed(cons, construct.X(), construct.Y());
        }
    }

    DismantleConstruction(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                let construction = Map.GetConstruction(p);
                if (construction >= 0) {
                    if (instance.GetConstruction(construction).lock()) {
                        instance.GetConstruction(construction).lock().Dismantle(p);
                    } else {
                        Map.SetConstruction(p, -1);
                    }
                }
            }
        }
    }

    GetConstruction(uid) {
        if (staticConstructionList.find(uid) !== staticConstructionList.end())
            return staticConstructionList[uid];
        else if (dynamicConstructionList.find(uid) !== dynamicConstructionList.end())
            return dynamicConstructionList[uid];
        return null;
    }

    CreateItem(pos, type, store, ownerFaction, comps, container) {
        if (type >= 0 && type < (Item.Presets.size())) {
            // boost.shared_ptr < Item > 
            let newItem;
            if (Item.Presets[type].organic) {
                boost.shared_ptr < OrganicItem > orgItem;

                if (boost.iequals(Item.ItemTypeToString(type), "water"))
                    orgItem.reset(new WaterItem(pos, type));
                else
                    orgItem.reset(new OrganicItem(pos, type));

                newItem = boost.static_pointer_cast < Item > (orgItem);
                orgItem.Nutrition(Item.Presets[type].nutrition);
                orgItem.Growth(Item.Presets[type].growth);
                orgItem.SetFaction(ownerFaction);
            } else if (Item.Presets[type].container > 0) {
                newItem.reset((new Container(pos, type, Item.Presets[type].container, ownerFaction, comps)));
            } else {
                newItem.reset(new Item(pos, type, ownerFaction, comps));
            }
            newItem.SetMap(Map);
            if (!container) {
                if (newItem !== 0) { // No null pointers in freeItems please..
                    freeItems.insert(newItem);
                    Map.ItemList(newItem.Position()).insert(newItem.Uid());
                } else {
                    return -1;
                }
            } else {
                if (newItem !== 0) { // No null pointers in the container...
                    container.AddItem(newItem);
                } else {
                    return -1;
                }
            }

            if (newItem !== 0) { // No null pointers in itemList... I'm being overly cautious here.
                itemList.insert((newItem.Uid(), newItem));
            } else {
                return -1;
            }

            if (store) StockpileItem(newItem, false, true);

            Script.Event.ItemCreated(newItem, pos.X(), pos.Y());

            if /* if(def */ (DEBUG) {
                std.cout << newItem.name << "(" << newItem.Uid() << ") created\n";
            } /*#endif*/

            return newItem.Uid();
        }
        return -1;
    }

    RemoveItem(witem) {
        let item;
        if (item = witem.lock()) {
            Map.ItemList(item.Position()).erase(item.uid);
            if (freeItems.find(witem) !== freeItems.end()) freeItems.erase(witem);
            let container;
            if (container = boost.static_pointer_cast < Container > (item.container.lock())) {
                if (container) {
                    container.RemoveItem(witem);
                }
            }
            itemList.erase(item.uid);
        }
    }

    GetItem(uid) {
        if (itemList.find(uid) !== itemList.end()) return itemList[uid];
        return null;
    }

    ItemContained(item, con) {
        if (!con) {
            freeItems.insert(item);
            Map.ItemList(item.lock().Position()).insert(item.lock().Uid());
        } else {
            freeItems.erase(item);
            Map.ItemList(item.lock().Position()).erase(item.lock().Uid());
        }
    }

    CreateWater(pos, amount = 10, time) {
        //If there is filth here mix it with the water
        // boost.shared_ptr < FilthNode >
        let filth = Map.GetFilth(pos).lock();

        // boost.weak_ptr < WaterNode > 
        let water = (Map.GetWater(pos));
        if (!water.lock()) {
            boost.shared_ptr < WaterNode > newWater(new WaterNode(pos, amount, time));
            waterList.push_back(boost.weak_ptr < WaterNode > (newWater));
            Map.SetWater(pos, newWater);
            if (filth) newWater.AddFilth(filth.Depth());
        } else {
            water.lock().Depth(water.lock().Depth() + amount);
            if (filth) water.lock().AddFilth(filth.Depth());
        }

        if (filth) RemoveFilth(pos);
    }

    CreateWaterFromNode(water) {
        if (water) {
            // boost.shared_ptr < FilthNode > 
            let filth = Map.GetFilth(water.Position()).lock();
            // boost.weak_ptr < WaterNode > 
            let existingWater = (Map.GetWater(water.Position()));
            if (!existingWater.lock()) {
                waterList.push_back(water);
                Map.SetWater(water.Position(), water);
                if (filth) water.AddFilth(filth.Depth());
            } else {
                let originalWater = existingWater.lock();
                originalWater.Depth(water.Depth());
                originalWater.AddFilth(water.GetFilth());
                if (filth) originalWater.AddFilth(filth.Depth());
            }
            if (filth) RemoveFilth(filth.Position());
        }
    }

    DistanceNPCToCoordinate(uid, pos) {
        return Distance(npcList[uid].Position(), pos);
    }

    // TODO this currently checks every stockpile.  We could maintain some data structure that allowed us to check the closest stockpile(s)
    // first.
    FindItemByCategoryFromStockpiles(category, target, flags, value) {
        let nearestDistance = Number.MAX_SAFE_INTEGER;
        // boost.weak_ptr < Item > 
        let nearest = null; // boost.weak_ptr < Item > ();
        for (let consIter = staticConstructionList.begin(); consIter !== staticConstructionList.end(); ++consIter) {
            if (consIter.second.stockpile && !consIter.second.farmplot) {
                boost.weak_ptr < Item > item(boost.static_pointer_cast < Stockpile > (consIter.second).FindItemByCategory(category, flags, value));
                if (item.lock() && !item.lock().Reserved()) {
                    let distance = (flags & MOSTDECAYED ? item.lock().GetDecay() : Distance(item.lock().Position(), target));
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearest = item;
                    }
                }
            }
        }
        return nearest;
    }

    // TODO this currently checks every stockpile.  We could maintain some data structure that allowed us to check the closest stockpile(s)
    // first.
    FindItemByTypeFromStockpiles(type, target, flags, value) {
        let nearestDistance = Number.MAX_SAFE_INTEGER;
        //boost.weak_ptr < Item >
        let nearest = null; // boost.weak_ptr < Item > ();
        for (let consIter = staticConstructionList.begin(); consIter !== staticConstructionList.end(); ++consIter) {
            if (consIter.second.stockpile && !consIter.second.farmplot) {
                boost.weak_ptr < Item > item(boost.static_pointer_cast < Stockpile > (consIter.second).FindItemByType(type, flags, value));
                if (item.lock() && !item.lock().Reserved()) {
                    let distance = (flags & MOSTDECAYED ? item.lock().GetDecay() : Distance(item.lock().Position(), target));
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearest = item;
                    }
                }
            }
        }
        return nearest;
    }

    // Spawns items distributed randomly within the rectangle defined by corner1 & corner2
    CreateItems(quantity, type, corner1, corner2) {
        let low = Coordinate.min(corner1, corner2);
        let high = Coordinate.max(corner1, corner2);
        for (let items = 0, count = 0; items < quantity && count < quantity * 10; ++count) {
            let p = Random.ChooseInRectangle(low, high);
            if (Map.IsWalkable(p)) {
                Game.CreateItem(p, type, true);
                ++items;
            }
        }
    }

    FindFilth(pos) {
        if (filthList.size() === 0) return undefined;

        //First check the vicinity of the given position
        if (pos.X() >= 0) {
            for (let i = 0; i < 10; ++i) {
                let candidate = Random.ChooseInRadius(pos, 5);
                // boost.shared_ptr < FilthNode > 
                let filth = Map.GetFilth(candidate).lock();
                if (filth && filth.Depth() > 0 && Map.IsWalkable(candidate))
                    return candidate;
            }
        }

        //Then around the camp center (a pretty good place to find filth most of the time)
        for (let i = 0; i < 10; ++i) {
            let candidate = Random.ChooseInRadius(Camp.Center(), 5);
            // boost.shared_ptr < FilthNode > 
            let filth = Map.GetFilth(candidate).lock();
            if (filth && filth.Depth() > 0 && Map.IsWalkable(candidate))
                return candidate;
        }

        //If we still haven't found filth just choose the closest filth out of 30 at random
        // std.vector < boost.weak_ptr < FilthNode > >
        let filthArray = (filthList.begin(), filthList.end());
        let closest = Coordinate.undefinedCoordinate;
        let closest_distance = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < Math.min(static_cast < size_t > (30), filthArray.size()); ++i) {
            // boost.weak_ptr < FilthNode > 
            let filth = Random.ChooseElement(filthArray);
            // boost.shared_ptr < FilthNode >
            let candidate = filth.lock();
            if (candidate) {
                let distance = Distance(pos, candidate.Position());
                if (candidate.Depth() > 0 && Map.IsWalkable(candidate.Position()) && distance < closest_distance) {
                    closest = candidate.Position();
                    closest_distance = distance;
                }
            }
        }
        return closest;
    }

    //Findwater returns the coordinates to the closest Water* that has sufficient depth and is coastal
    FindWater(pos) {
        let closest = Coordinate.undefinedCoordinate;
        let closestDistance = Number.MAX_SAFE_INTEGER;
        for (let wati = waterList.begin(); wati !== waterList.end(); ++wati) {
            let water;
            if (water = wati.lock()) {
                if (water.IsCoastal() && water.Depth() > DRINKABLE_WATER_DEPTH) {
                    let waterDistance = Distance(water.Position(), pos);
                    //Favor water inside territory
                    if (Map.IsTerritory(water.Position())) waterDistance /= 4;
                    if (waterDistance < closestDistance) {
                        closest = water.Position();
                        closestDistance = waterDistance;
                    }
                }
            }
        }
        return closest;
    }

    Update() {
        ++time;

        if (time >= MONTH_LENGTH) {
            time -= MONTH_LENGTH; // Decrement time now to avoid autosaving issues.
            Stats.AddPoints(10);

            if (safeMonths > 0) --safeMonths;

            for (let cons = staticConstructionList.begin(); cons !== staticConstructionList.end(); ++cons) {
                cons.second.SpawnRepairJob();
            }
            for (let cons = dynamicConstructionList.begin(); cons !== dynamicConstructionList.end(); ++cons) {
                cons.second.SpawnRepairJob();
            }

            if (season < LateWinter) season = (Season)(season + 1);
            else season = EarlySpring;

            switch (season) {
                case EarlySpring:
                    Announce.AddMsg("Spring has begun");
                    ++age;
                    if (Config.GetCVar("bool", "autosave")) {
                        let saveName = "autosave" + std.string(age % 2 ? "1" : "2");
                        if (Data.SaveGame(saveName, false))
                            Announce.AddMsg("Autosaved");
                        else
                            Announce.AddMsg("Failed to autosave! Refer to the logfile", Color.red);
                    }
                case Spring:
                case LateSpring:
                    SpawnTillageJobs();
                case Summer:
                case LateSummer:
                case Fall:
                case LateFall:
                case Winter:
                    DecayItems();
                    break;

                case LateWinter:
                    break;

                case EarlySummer:
                    Announce.AddMsg("Summer has begun");
                    DecayItems();
                    break;

                case EarlyFall:
                    Announce.AddMsg("Fall has begun");
                    DecayItems();
                    break;

                case EarlyWinter:
                    Announce.AddMsg("Winter has begun");
                    DeTillFarmPlots();
                    break;

                default:
                    break;
            }
        }

        //This actually only updates every 50th waternode. This is due to 2 things: updating one water tile actually also
        //updates all its neighbours. Also, by updating only every 50th one, the load on the cpu is less, but you need to
        //remember that Update gets called 25 times a second, and given the nature of rand() this means that each waternode
        //will be updated once every 2 seconds. It turns out that from the player's viewpoint this is just fine

        // nextWati removed because list<> complained about invalidated iterators -pl
        for (let watIt = waterList.begin(); watIt !== waterList.end();) {
            let water;
            if (water = watIt.lock()) {
                if (Random.Generate(49) === 0 && water.Update()) {
                    RemoveWater(water.Position(), false);
                    watIt = waterList.erase(watIt);
                } else {
                    ++watIt;
                }
            } else {
                watIt = waterList.erase(watIt);
            }
        }

        //Updating the last 10 waternodes each time means that recently created water moves faster.
        //This has the effect of making water rush to new places such as a moat very quickly, which is the
        //expected behaviour of water.
        if (waterList.size() > 0) {
            //We have to use two iterators, because wati may be invalidated if the water evaporates and is removed
            // std.list < boost.weak_ptr < WaterNode > > .iterator 
            let wati = waterList.end();
            // std.list < boost.weak_ptr < WaterNode > > .iterator 
            let nextwati = --wati;
            while (std.distance(wati, waterList.end()) < 10) {
                --nextwati;
                if (wati === waterList.end()) break;
                if (wati.lock()) wati.lock().Update();
                wati = nextwati;
            }
        }

        // std.list < boost.weak_ptr < NPC > > 
        let npcsWaitingForRemoval;
        for (let npci = npcList.begin(); npci !== npcList.end(); ++npci) {
            npci.second.Update();
            if (!npci.second.Dead()) npci.second.Think();
            if (npci.second.Dead() || npci.second.Escaped()) npcsWaitingForRemoval.push_back(npci.second);
        }
        JobManager.AssignJobs();

        for (let remNpci = npcsWaitingForRemoval.begin(); remNpci !== npcsWaitingForRemoval.end(); ++remNpci) {
            RemoveNPC(remNpci);
        }

        for (let consi = dynamicConstructionList.begin(); consi !== dynamicConstructionList.end(); ++consi) {
            consi.second.Update();
        }

        for (let itemi = stoppedItems.begin(); itemi !== stoppedItems.end();) {
            flyingItems.erase(itemi);
            let item;
            if (item = itemi.lock()) {
                if (item.condition === 0) { //The impact has destroyed the item
                    RemoveItem(item);
                }
            }
            itemi = stoppedItems.erase(itemi);
        }

        for (let itemi = flyingItems.begin(); itemi !== flyingItems.end(); ++itemi) {
            let item;
            if (item = itemi.lock()) item.UpdateVelocity();
        }

        /*Constantly checking our free item list for items that can be stockpiled is overkill, so it's done once every
        5 seconds, on average, or immediately if a new stockpile is built or a stockpile's allowed items are changed.
        To further reduce load when very many free items exist, only a quarter of them will be checked*/
        if (Random.Generate(UPDATES_PER_SECOND * 5 - 1) === 0 || refreshStockpiles) {
            refreshStockpiles = false;
            if (freeItems.size() < 100) {
                for (let itemi = freeItems.begin(); itemi !== freeItems.end(); ++itemi) {
                    let item;
                    if (item = itemi.lock()) {
                        if (!item.Reserved() && item.GetFaction() === PLAYERFACTION && item.GetVelocity() === 0)
                            StockpileItem(item);
                    }
                }
            } else {
                for (let i = 0; i < Math.max(static_cast < size_t > (100), freeItems.size() / 4); ++i) {
                    //std.set < boost.weak_ptr < Item > > .iterator 
                    let itemi = boost.next(freeItems.begin(), Random.ChooseIndex(freeItems));
                    let item;
                    if (item = itemi.lock()) {
                        if (!item.Reserved() && item.GetFaction() === PLAYERFACTION && item.GetVelocity() === 0)
                            StockpileItem(item);
                    }
                }
            }
        }

        //Squads needen't update their member rosters ALL THE TIME
        if (time % (UPDATES_PER_SECOND * 1) === 0) {
            for (let squadi = squadList.begin(); squadi !== squadList.end(); ++squadi) {
                squadi.second.UpdateMembers();
            }
        }

        if (time % (UPDATES_PER_SECOND * 1) === 0) StockManager.Update();

        if (time % (UPDATES_PER_SECOND * 1) === 0) JobManager.Update();

        events.Update(safeMonths > 0);

        Map.Update();

        if (time % (UPDATES_PER_SECOND * 1) === 0) Camp.Update();

        for (let delit = delays.begin(); delit !== delays.end();) {
            if (--delit.first <= 0) {
                try {
                    delit.second();
                } catch (e) {
                    Script.LogException();
                }
                delit = delays.erase(delit);
            } else ++delit;
        }

        if (!gameOver && orcCount === 0 && goblinCount === 0) {
            gameOver = true;
            //Game over, display stats
            DisplayStats();
            MessageBox.ShowMessageBox("Do you wish to keep watching?", null, "Keep watching", boost.bind(Game.GameOver, Game), "Quit");
        }

        for (let fireit = fireList.begin(); fireit !== fireList.end();) {
            let fire;
            if (fire = fireit.lock()) {
                if (Random.GenerateBool()) fire.Update();
                if (fire.GetHeat() <= 0) {
                    Map.SetFire(fire.Position(), null);
                    fireit = fireList.erase(fireit);
                } else {
                    ++fireit;
                }
            } else {
                fireit = fireList.erase(fireit);
            }
        }

        for (let spellit = spellList.begin(); spellit !== spellList.end();) {
            if ((spellit).IsDead()) {
                spellit = spellList.erase(spellit);
            } else {
                (spellit).UpdateVelocity();
                ++spellit;
            }
        }

        for (let i = 1; i < Faction.factions.size(); ++i) {
            Faction.factions[i].Update();
        }
    }

    StockpileItem(witem, returnJob, disregardTerritory, reserveItem) {
        let item;
        if (item = witem.lock()) {
            if ((!reserveItem || !item.Reserved()) && item.GetFaction() === PLAYERFACTION) {
                // boost.shared_ptr < Stockpile > 
                let nearest = null; //boost.shared_ptr < Stockpile > ();
                //first = primary distance, second = secondary
                let nearestDistance = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
                let itemType = item.Type();
                let useDemand = false;

                /* If this is a container and it contains items, then stockpile it based on the items inside
                instead of the container's type */
                // boost.shared_ptr < Container > 
                let containerItem = boost.dynamic_pointer_cast < Container > (item);
                if (containerItem && !containerItem.empty()) {
                    let innerItem;
                    if (innerItem = containerItem.GetFirstItem().lock()) {
                        itemType = innerItem.Type();
                    }
                } else if (containerItem) useDemand = true; //Empty containers are stored based on demand

                for (let stocki = staticConstructionList.begin(); stocki !== staticConstructionList.end(); ++stocki) {
                    if (stocki.second.stockpile) {
                        boost.shared_ptr < Stockpile > sp(boost.static_pointer_cast < Stockpile > (stocki.second));
                        if (sp.Allowed(Item.Presets[itemType].specificCategories) && !sp.Full(itemType)) {

                            //Found a stockpile that both allows the item, and has space
                            //Assuming that containers only have one specific category
                            // ItemCategory category 
                            let category = Item.Presets[item.Type()].specificCategories.begin();
                            let distance = useDemand ?
                                (Number.MAX_SAFE_INTEGER - 2) - sp.GetDemand(category) :
                                Distance(sp.Center(), item.Position());

                            if (distance < nearestDistance.first) {
                                nearestDistance.first = distance;
                                nearest = sp;
                                if (useDemand) nearestDistance.second = Distance(sp.Center(), item.Position());
                            } else if (useDemand && distance === nearestDistance.first) {
                                let realDistance = Distance(sp.Center(), item.Position());
                                if (nearestDistance.second > realDistance) {
                                    nearestDistance.first = distance;
                                    nearest = sp;
                                    nearestDistance.second = realDistance;
                                }
                            }
                        }
                    }
                }

                if (nearest) {
                    let priority;
                    if (item.IsCategory(Item.StringToItemCategory("Food"))) priority = HIGH;
                    else {
                        let stockDeficit = StockManager.TypeQuantity(itemType) / StockManager.Minimum(itemType);
                        if (stockDeficit >= 1.0) priority = LOW;
                        else if (stockDeficit > 0.25) priority = MED;
                        else priority = HIGH;
                    }

                    // boost.shared_ptr < Job > 
                    let stockJob = (new Job("Store " + Item.ItemTypeToString(item.Type()) + " in stockpile", priority));
                    stockJob.Attempts(1);
                    stockJob.ConnectToEntity(nearest);
                    // Coordinate 
                    let target = new Coordinate(-1, -1);
                    // boost.weak_ptr < Item > 
                    let container;

                    //Check if the item can be contained, and if so if any containers are in the stockpile
                    if (Item.Presets[item.Type()].fitsin >= 0) {
                        container = nearest.FindItemByCategory(Item.Presets[item.Type()].fitsin, NOTFULL, item.GetBulk());
                        if (container.lock()) {
                            target = container.lock().Position();
                            stockJob.ReserveSpace(boost.static_pointer_cast < Container > (container.lock()), item.GetBulk());
                        }
                    }

                    if (target.X() === -1) target = nearest.FreePosition();

                    if (target.X() !== -1) {
                        stockJob.ReserveSpot(nearest, target, item.Type());
                        if (reserveItem) stockJob.ReserveEntity(item);
                        stockJob.tasks.push_back(Task(MOVE, item.Position()));
                        stockJob.tasks.push_back(Task(TAKE, item.Position(), item));
                        stockJob.tasks.push_back(Task(MOVE, target));
                        if (!container.lock())
                            stockJob.tasks.push_back(Task(PUTIN, target, nearest.Storage(target)));
                        else
                            stockJob.tasks.push_back(Task(PUTIN, target, container));

                        if (disregardTerritory) stockJob.DisregardTerritory();

                        if (!returnJob) JobManager.AddJob(stockJob);
                        else return stockJob;
                    }
                }
            }
        }
        return null; //boost.shared_ptr < Job > ();
    }

    TileAt(pixelX, pixelY) {
        return renderer.TileAt(pixelX, pixelY, camX, camY);
    }

    // namespace {
    //     template < typename MapT >
    InternalDrawMapItems(name, map, upleft, buffer) {
            for (let it = map.begin(); it !== map.end();) {
                let ptr = it.second;

                if (ptr.get() !== null) {
                    ptr.Draw(upleft, buffer);
                    ++it;
                } else {
                    if /* if(def */ (DEBUG) {
                        std.cout << "!!! null POINTER !!! " << name << " ; id " << it.first << std.endl;
                    } /*#endif*/
                    let tmp = it;
                    ++it;
                    map.erase(tmp);
                }
            }
        }
        // }

    Draw(the_console, focusX, focusY, drawUI, posX, posY, sizeX, sizeY) {
        the_console.setBackgroundFlag(TCOD_BKGND_SET);
        if (sizeX === -1) {
            sizeX = the_console.getWidth();
        }
        if (sizeY === -1) {
            sizeY = the_console.getHeight();
        }
        let charX, charY;
        TCODSystem.getCharSize(charX, charY);
        renderer.DrawMap(Map, focusX, focusY, posX * charX, posY * charY, sizeX * charX, sizeY * charY);

        if (drawUI) {
            UI.Draw(the_console);
        }
    }

    FlipBuffer() {
        TCODConsole.blit(this.buffer, 0, 0, this.screenWidth, this.screenHeight, TCODConsole.root, 0, 0);
        TCODConsole.root.flush();
    }

    CurrentSeason() {
        return season;
    }

    SpawnTillageJobs() {
        for (let consi = dynamicConstructionList.begin(); consi !== dynamicConstructionList.end(); ++consi) {
            if (consi.second.farmplot) {
                boost.shared_ptr < Job > tillJob(new Job("Till farmplot"));
                tillJob.tasks.push_back(Task(MOVE, consi.second.Position()));
                tillJob.tasks.push_back(Task(USE, consi.second.Position(), consi.second));
                JobManager.AddJob(tillJob);
            }
        }
    }

    DeTillFarmPlots() {
        for (let consi = dynamicConstructionList.begin(); consi !== dynamicConstructionList.end(); ++consi) {
            if (consi.second.farmplot) {
                (consi.second).tilled = false;
            }
        }
    }

    //First generates a heightmap, then translates that into the corresponding tiles
    //Third places plantlife according to heightmap, and some wildlife as well
    GenerateMap(seed) {
        let random = new Random.Generator(seed);

        let map = Map;
        map.heightMap.clear();

        let riverStartLeft = random.GenerateBool();
        let riverEndRight = random.GenerateBool();

        let px = Array(4);
        let py = Array(4);

        do {
            if (riverStartLeft) {
                px[0] = 0;
                py[0] = random.Generate(map.Height() - 1);
            } else {
                px[0] = random.Generate(map.Width() - 1);
                py[0] = 0;
            }

            px[1] = 10 + random.Generate(map.Width() - 20);
            py[1] = 10 + random.Generate(map.Height() - 20);
            px[2] = 10 + random.Generate(map.Width() - 20);
            py[2] = 10 + random.Generate(map.Height() - 20);

            if (riverEndRight) {
                px[3] = map.Width() - 1;
                py[3] = random.Generate(map.Height() - 1);
            } else {
                px[3] = random.Generate(map.Width() - 1);
                py[3] = map.Height() - 1;
            }
            //This conditional ensures that the river's beginning and end are at least 100 units apart
        } while (std.sqrt(std.pow(px[0] - px[3], 2) + std.pow(py[0] - py[3], 2)) < 100);

        let depth = Config.GetCVar("riverDepth");
        let width = Config.GetCVar("riverWidth");
        map.heightMap.digBezier(px, py, width, -depth, width, -depth);

        let hills = 0;
        //infinityCheck is just there to make sure our while loop doesn't become an infinite one
        //in case no suitable hill sites are found
        let infinityCheck = 0;
        while (hills < map.Width() / 66 && infinityCheck < 1000) {
            let candidate = Random.ChooseInExtent(map.Extent());
            let riverDistance = 70;

            //We draw four lines from our potential hill site and measure the least distance to a river
            let dirs = [
                WEST,
                EAST,
                NORTH,
                SOUTH
            ];
            for (let i = 0; i < 4; ++i) {
                let distance = 70;
                let line = candidate.plus(Coordinate.DirectionToCoordinate(dirs[i])).timesScalar(distance);
                for (TCODLine.init(line.X(), line.Y(), candidate.X(), candidate.Y()); !TCODLine.step(line.Xptr(), line.Yptr()); --distance) {
                    if (map.IsInside(line) && map.heightMap.getValue(line.X(), line.Y()) < map.GetWaterlevel())
                        if (distance < riverDistance)
                            riverDistance = distance;
                }
            }

            if (riverDistance > 35) {
                let centers = [
                    candidate,
                    random.ChooseInRadius(candidate, 7),
                    random.ChooseInRadius(candidate, 7)
                ];
                let heights = [
                    35,
                    25,
                    25
                ];
                for (let i = 0; i < 3; ++i) {
                    let height = random.Generate(15, heights[i]);
                    let radius = random.Generate(1, 3);
                    map.heightMap.addHill(static_cast < float > (centers[i].X()), static_cast < float > (centers[i].Y()), static_cast < float > (height), static_cast < float > (radius));
                }
                ++hills;
            }

            ++infinityCheck;
        }

        {
            // std.auto_ptr < TCODRandom > 
            let tcodRandom = std.auto_ptr < TCODRandom > (new TCODRandom(random.GetSeed()));
            map.heightMap.rainErosion(map.Width() * map.Height() * 5, 0.005, 0.30, tcodRandom.get());
        }

        //This is a simple kernel transformation that does some horizontal smoothing (lifted straight from the libtcod docs)
        let dx = [-1,
            1,
            0
        ];
        let dy = [
            0,
            0,
            0
        ];
        let weight = [
            0.33,
            0.33,
            0.33
        ];
        map.heightMap.kernelTransform(3, dx, dy, weight, 0.0, 1.0);


        //Now take the heightmap values and translate them into tiles
        for (let x = 0; x < map.Width(); ++x) {
            for (let y = 0; y < map.Height(); ++y) {
                let p = new Coordinate(x, y);
                let height = map.heightMap.getValue(x, y);
                if (height < map.GetWaterlevel()) {
                    let tileChosen = false;
                    for (let ix = x - 3; ix <= x + 3; ++ix) {
                        let ip = new Coordinate(ix, y);
                        if (map.IsInside(ip) && map.heightMap.getValue(ix, y) >= map.GetWaterlevel()) {
                            map.ResetType(p, TILEDITCH);
                            tileChosen = true;
                            break;
                        }
                    }
                    if (!tileChosen) {
                        for (let iy = y - 3; iy <= y + 3; ++iy) {
                            let ip = new Coordinate(x, iy);
                            if (map.IsInside(ip) && map.heightMap.getValue(x, iy) >= map.GetWaterlevel()) {
                                map.ResetType(p, TILEDITCH);
                                tileChosen = true;
                                break;
                            }
                        }
                    }
                    if (!tileChosen) map.ResetType(p, TILERIVERBED);
                    CreateWater(p, RIVERDEPTH);
                } else if (height < 4.5) {
                    map.ResetType(p, TILEGRASS);
                } else {
                    map.ResetType(p, TILEROCK);
                }
            }
        }

        //Create a bog
        infinityCheck = 0;
        while (infinityCheck < 1000) {
            let candidate = random.ChooseInRectangle(zero + 30, map.Extent() - 30);
            let riverDistance = 70;
            let dirs = [
                WEST,
                EAST,
                NORTH,
                SOUTH
            ];
            for (let i = 0; i < 4; ++i) {
                let distance = 70;
                let line = candidate + Coordinate.DirectionToCoordinate(dirs[i]) * distance;
                for (TCODLine.init(line.X(), line.Y(), candidate.X(), candidate.Y()); !TCODLine.step(line.Xptr(), line.Yptr()); --distance) {
                    if (map.IsInside(line) && map.heightMap.getValue(line.X(), line.Y()) < map.GetWaterlevel())
                        if (distance < riverDistance)
                            riverDistance = distance;
                }
            }
            if (riverDistance > 30) {
                let lowOffset = random.Generate(-5, 5);
                let highOffset = random.Generate(-5, 5);
                for (let xOffset = -25; xOffset < 25; ++xOffset) {
                    let range = int(std.sqrt((double)(25 * 25 - xOffset * xOffset)));
                    lowOffset = Math.min(Math.max(random.Generate(-1, 1) + lowOffset, -5), 5);
                    highOffset = Math.min(Math.max(random.Generate(-1, 1) + highOffset, -5), 5);
                    for (let yOffset = -range - lowOffset; yOffset < range + highOffset; ++yOffset) {
                        map.ResetType(candidate + Coordinate(xOffset, yOffset), TILEBOG);
                    }
                }
                break; //Only generate one bog
            }
            ++infinityCheck;
        }

        for (let x = 0; x < map.Width(); ++x) {
            for (let y = 0; y < map.Height(); ++y) {
                map.Naturify(Coordinate(x, y));
            }
        }

        map.RandomizeWind();

        map.CalculateFlow(px, py);
        map.UpdateCache();
    }

    //This is intentional, otherwise designating where to cut down trees would always show red unless you were over a tree
    CheckTree() {
        return true;
    }

    FellTree(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let natUid = Map.GetNatureObject(Coordinate(x, y));
                if (natUid >= 0) {
                    // boost.shared_ptr < NatureObject > 
                    let natObj = Game.natureList[natUid];
                    if (natObj && natObj.Tree() && !natObj.Marked()) {
                        natObj.Mark();
                        boost.shared_ptr < Job > fellJob(new Job("Fell tree", MED, 0, true));
                        fellJob.Attempts(50);
                        fellJob.ConnectToEntity(natObj);
                        fellJob.DisregardTerritory();
                        fellJob.SetRequiredTool(Item.StringToItemCategory("Axe"));
                        fellJob.tasks.push_back(Task(MOVEADJACENT, natObj.Position(), natObj));
                        fellJob.tasks.push_back(Task(FELL, natObj.Position(), natObj));
                        JobManager.AddJob(fellJob);
                    }
                }
            }
        }
    }

    DesignateTree(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let natUid = Map.GetNatureObject(Coordinate(x, y));
                if (natUid >= 0) {
                    // boost.shared_ptr < NatureObject > 
                    let natObj = Game.natureList[natUid];
                    if (natObj && natObj.Tree() && !natObj.Marked()) {
                        //TODO: Implement proper map marker system and change this to use that
                        natObj.Mark();
                        StockManager.UpdateTreeDesignations(natObj, true);
                    }
                }
            }
        }
    }

    HarvestWildPlant(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let natUid = Map.GetNatureObject(Coordinate(x, y));
                if (natUid >= 0) {
                    // boost.shared_ptr < NatureObject > 
                    let natObj = Game.natureList[natUid];
                    if (natObj && natObj.Harvestable() && !natObj.Marked()) {
                        natObj.Mark();
                        boost.shared_ptr < Job > harvestJob(new Job("Harvest wild plant"));
                        harvestJob.ConnectToEntity(natObj);
                        harvestJob.DisregardTerritory();
                        harvestJob.tasks.push_back(Task(MOVEADJACENT, natObj.Position(), natObj));
                        harvestJob.tasks.push_back(Task(HARVESTWILDPLANT, natObj.Position(), natObj));
                        if (NatureObject.Presets[natObj.Type()].components.size() > 0)
                            harvestJob.tasks.push_back(Task(STOCKPILEITEM));
                        JobManager.AddJob(harvestJob);
                    }
                }
            }
        }
    }


    RemoveNatureObject(natObj) {
        if (natObj.lock()) {
            Map.SetNatureObject(natObj.lock().Position(), -1);
            natureList.erase(natObj.lock().Uid());
        }
    }

    CheckTileType(type, target, size) {
        for (let x = target.X(); x < target.X() + size.X(); ++x) {
            for (let y = target.Y(); y < target.Y() + size.Y(); ++y) {
                if (Map.GetType(Coordinate(x, y)) === type) return true;
            }
        }
        return false;
    }

    DesignateBog(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (Map.GetType(p) === TILEBOG) {
                    StockManager.UpdateBogDesignations(p, true);
                    Map.Mark(p);
                }
            }
        }
    }

    Undesignate(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                let natUid = Map.GetNatureObject(p);
                if (natUid >= 0) {
                    // boost.weak_ptr < NatureObject > 
                    let natObj = Game.natureList[natUid];
                    if (natObj.lock() && natObj.lock().Tree() && natObj.lock().Marked()) {
                        //TODO: Implement proper map marker system and change this to use that
                        natObj.lock().Unmark();
                        StockManager.UpdateTreeDesignations(natObj, false);
                        // Might be designated as "Fell Trees" with jobs pending.
                        JobManager.RemoveJob(FELL, p);
                    }
                    // Need to be able to undesignate harvesting wild plants too.
                    if (natObj.lock() && natObj.lock().Harvestable() && natObj.lock().Marked()) {
                        natObj.lock().Unmark();
                        JobManager.RemoveJob(HARVESTWILDPLANT, p);
                    }
                }

                if (Map.GetType(p) === TILEBOG) {
                    StockManager.UpdateBogDesignations(p, false);
                    Map.Unmark(p);
                }
                if (Map.GroundMarked(p)) {
                    JobManager.RemoveJob(DIG, p); //A dig job may exist for this tile
                    Camp.RemoveWaterZone(p, p); //May be marked for water
                }
            }
        }
    }

    SeasonToString(season) {
        switch (season) {
            case EarlySpring:
                return "Early Spring";
            case Spring:
                return "Spring";
            case LateSpring:
                return "Late Spring";
            case EarlySummer:
                return "Early Summer";
            case Summer:
                return "Summer";
            case LateSummer:
                return "Late Summer";
            case EarlyFall:
                return "Early Fall";
            case Fall:
                return "Fall";
            case LateFall:
                return "Late Fall";
            case EarlyWinter:
                return "Early Winter";
            case Winter:
                return "Winter";
            case LateWinter:
                return "Late Winter";
            default:
                return "???";
        }
    }

    DecayItems() {
        let eraseList = [];
        let creationList = [];
        for (let itemit = itemList.begin(); itemit !== itemList.end();) {

            if (itemit.second === 0) { // Now, how did we get a null pointer in here..
                itemit = itemList.erase(itemit); // Get it out of the list!
                if (itemit === itemList.end()) break;
            }

            if (itemit.second.decayCounter > 0) {
                if (--itemit.second.decayCounter === 0) {
                    for (let decaylisti = Item.Presets[itemit.second.type].decayList.begin(); decaylisti !== Item.Presets[itemit.second.type].decayList.end(); ++decaylisti) {
                        creationList.push_back(std.pair < ItemType, Coordinate > (decaylisti, itemit.second.Position()));
                    }
                    eraseList.push_back(itemit.first);
                }
            }
            ++itemit;
        }

        for (let delit = eraseList.begin(); delit !== eraseList.end(); ++delit) {
            RemoveItem(GetItem(delit));
        }

        for (let crit = creationList.begin(); crit !== creationList.end(); ++crit) {
            if (crit.first >= 0) {
                CreateItem(crit.second, crit.first, false);
            } else {
                CreateFilth(crit.second);
            }
        }

        for (let bli = bloodList.begin(); bli !== bloodList.end();) {
            let blood;
            if (blood = bli.lock()) {
                blood.Depth(blood.Depth() - 50);
                if (blood.Depth() <= 0) {
                    Map.SetBlood(blood.Position(), null);
                    bli = bloodList.erase(bli);
                } else ++bli;
            } else {
                bli = bloodList.erase(bli);
            }
        }
    }

    CreateFilth(pos, amount = 1) {
        Stats.FilthCreated(amount);
        if (Map.IsInside(pos)) {
            let loops = -1;
            while (amount > 0 && loops < 1000) {
                ++loops;
                // boost.shared_ptr < WaterNode > 
                let water = Map.GetWater(pos).lock();

                if (water) { //If water exists here just add the filth there, no need for filthnodes
                    water.AddFilth(amount);
                    return;
                }

                // boost.weak_ptr < FilthNode > 
                let filth = (Map.GetFilth(pos));
                if (!filth.lock()) { //No existing filth node so create one
                    // boost.shared_ptr < FilthNode > 
                    let newFilth = (new FilthNode(pos, Math.min(5, amount)));
                    amount -= 5;
                    filthList.push_back(boost.weak_ptr < FilthNode > (newFilth));
                    Map.SetFilth(pos, newFilth);
                } else {
                    let originalDepth = filth.lock().Depth();
                    filth.lock().Depth(Math.min(5, filth.lock().Depth() + amount));
                    amount -= (5 - originalDepth);
                }
                //If theres still remaining filth, it'll spill over according to flow
                //TODO factorize with Coordinate abstractions
                if (amount > 0) {
                    let flowTo = pos;
                    let diff = Math.max(1, loops / 100);
                    switch (Map.GetFlow(pos)) {
                        case NORTH:
                            flowTo.Y(flowTo.Y() - diff);
                            flowTo.X(flowTo.X() + Random.Generate(-diff, diff));
                            break;

                        case NORTHEAST:
                            if (Random.GenerateBool()) {
                                flowTo.Y(flowTo.Y() - diff);
                                flowTo.X(flowTo.X() + Random.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.Generate(-diff, 0));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case NORTHWEST:
                            if (Random.GenerateBool()) {
                                flowTo.Y(flowTo.Y() - diff);
                                flowTo.X(flowTo.X() - Random.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.Generate(-diff, 0));
                                flowTo.X(flowTo.X() - diff);
                            }
                            break;

                        case SOUTH:
                            flowTo.Y(flowTo.Y() + diff);
                            flowTo.X(flowTo.X() + Random.Generate(-diff, diff));
                            break;

                        case SOUTHEAST:
                            if (Random.GenerateBool()) {
                                flowTo.Y(flowTo.Y() + diff);
                                flowTo.X(flowTo.X() + Random.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.Generate(0, diff));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case SOUTHWEST:
                            if (Random.GenerateBool()) {
                                flowTo.Y(flowTo.Y() + diff);
                                flowTo.X(flowTo.X() + Random.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.Generate(0, diff));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case WEST:
                            flowTo.Y(flowTo.Y() + Random.Generate(-diff, diff));
                            flowTo.X(flowTo.X() - diff);
                            break;

                        case EAST:
                            flowTo.Y(flowTo.Y() + Random.Generate(-diff, diff));
                            flowTo.X(flowTo.X() + diff);
                            break;

                        default:
                            break;
                    }

                    while (flowTo === pos) {
                        flowTo = Coordinate(pos.X() + Random.Generate(-diff, diff), pos.Y() + Random.Generate(-diff, diff));
                    }
                    pos = flowTo;

                    //If the filth flows off-map just stop creating more
                    if (!Map.IsInside(flowTo)) {
                        Stats.FilthFlowsOffEdge(amount);
                        return;
                    }
                }
            }
        }
    }

    CreateBlood(pos, amount = 100) {
        if (Map.IsInside(pos)) {
            let loops = -1;
            while (amount > 0 && loops < 1000) {
                ++loops;

                boost.weak_ptr < BloodNode > blood(Map.GetBlood(pos));
                if (!blood.lock()) { //No existing BloodNode so create one
                    boost.shared_ptr < BloodNode > newBlood(new BloodNode(pos, Math.min(255, amount)));
                    amount -= 255;
                    bloodList.push_back(boost.weak_ptr < BloodNode > (newBlood));
                    Map.SetBlood(pos, newBlood);
                } else {
                    let originalDepth = blood.lock().Depth();
                    blood.lock().Depth(Math.min(255, blood.lock().Depth() + amount));
                    amount -= (255 - originalDepth);
                }
                //If theres still remaining blood, it'll spill over according to flow
                //TODO factorize with Coordinate abstractions
                if (amount > 0) {
                    let flowTo = pos;
                    let diff = Math.max(1, loops / 100);
                    switch (Map.GetFlow(pos)) {
                        case NORTH:
                            flowTo.Y(flowTo.Y() - diff);
                            flowTo.X(flowTo.X() + Random.Generate(-diff, diff));
                            break;

                        case NORTHEAST:
                            if (Random.GenerateBool()) {
                                flowTo.Y(flowTo.Y() - diff);
                                flowTo.X(flowTo.X() + Random.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.Generate(-diff, 0));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case NORTHWEST:
                            if (Random.GenerateBool()) {
                                flowTo.Y(flowTo.Y() - diff);
                                flowTo.X(flowTo.X() - Random.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.Generate(-diff, 0));
                                flowTo.X(flowTo.X() - diff);
                            }
                            break;

                        case SOUTH:
                            flowTo.Y(flowTo.Y() + diff);
                            flowTo.X(flowTo.X() + Random.Generate(-diff, diff));
                            break;

                        case SOUTHEAST:
                            if (Random.GenerateBool()) {
                                flowTo.Y(flowTo.Y() + diff);
                                flowTo.X(flowTo.X() + Random.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.Generate(0, diff));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case SOUTHWEST:
                            if (Random.GenerateBool()) {
                                flowTo.Y(flowTo.Y() + diff);
                                flowTo.X(flowTo.X() + Random.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.Generate(0, diff));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case WEST:
                            flowTo.Y(flowTo.Y() + Random.Generate(-diff, diff));
                            flowTo.X(flowTo.X() - diff);
                            break;

                        case EAST:
                            flowTo.Y(flowTo.Y() + Random.Generate(-diff, diff));
                            flowTo.X(flowTo.X() + diff);
                            break;

                        default:
                            break;
                    }

                    while (flowTo === pos) {
                        flowTo = Coordinate(pos.X() + Random.Generate(-diff, diff), pos.Y() + Random.Generate(-diff, diff));
                    }
                    pos = flowTo;

                    //If the blood flows off-map just stop creating more
                    if (!Map.IsInside(flowTo)) {
                        return;
                    }
                }
            }
        }

    }

    Pause() {
        paused = !paused;
    }

    Paused() {
        return paused;
    }

    CharHeight() {
        return charHeight;
    }
    CharWidth() {
        return charWidth;
    }

    RemoveNPC(wnpc) {
        let npc;
        if (npc = wnpc.lock()) {
            npcList.erase(npc.uid);
            let faction = npc.GetFaction();
            if (faction >= 0 && faction < (Faction.factions.size()))
                Faction.factions[faction].RemoveMember(npc);
        }
    }

    FindMilitaryRecruit() {
        // Holder for orc with most/full health
        // boost.shared_ptr < NPC > 
        let strongest;
        for (let npci = npcList.begin(); npci != npcList.end(); ++npci) {
            if (npci.second.type == NPC.StringToNPCType("orc") && npci.second.faction == PLAYERFACTION) {
                // Find the orc with the most/full health to prevent near-dead orcs from getting put in the squad
                if (!npci.second.squad.lock() && (!strongest || npci.second.health > strongest.health)) {
                    strongest = (npci).second;
                }
            }
        }
        if (strongest) return strongest.uid;
        return -1;
    }

    CreateSquad(name) {
        squadList.insert((name, (new Squad(name))));
    }

    SetSquadTargetCoordinate(order, target, squad, autoClose) {
        squad.AddOrder(order);
        squad.AddTargetCoordinate(target);
        if (autoClose) UI.CloseMenu();
        Announce.AddMsg((boost.format("[%1%] guarding position (%2%,%3%)") % squad.Name() % target.X() % target.Y()).str(), Color.white, target);
        Map.AddMarker(MapMarker(FLASHINGMARKER, 'X', target, UPDATES_PER_SECOND * 5, Color.azure));
    }
    SetSquadTargetEntity(order, target, squad) {
        if (Map.IsInside(target)) {
            // std.set < int > * 
            let npcList = Map.NPCList(target);
            if (!npcList.empty()) {
                squad.AddOrder(order);
                squad.AddTargetEntity(Game.npcList[npcList.begin()]);
                UI.CloseMenu();
                Announce.AddMsg((boost.format("[%1%] following %2%") % squad.Name() % Game.npcList[npcList.begin()].Name()).str(), Color.white, target);
            }
        }
    }

    // Spawns NPCs distributed randomly within the rectangle defined by corner1 & corner2
    CreateNPCs(quantity, type, corner1, corner2) {
        let low = Coordinate.min(corner1, corner2);
        let high = Coordinate.max(corner1, corner2);
        // std.vector < int > 
        let uids = [];
        for (let npcs = 0; npcs < quantity; ++npcs)
            uids.push_back(Game.CreateNPC(Random.ChooseInRectangle(low, high), type));
        return uids;
    }

    DiceToInt(dice) {
        return Random.Dice(dice).Roll();
    }

    ToMainMenu(value) {
        Game.toMainMenu = value;
    }
    ToMainMenu() {
        return Game.toMainMenu;
    }

    Running(value) {
        running = value;
    }
    Running() {
        return running;
    }

    FindConstructionByTag(tag, closeTo) {

        let distance = -1;
        // boost.weak_ptr < Construction >
        let foundConstruct;

        for (let stati = staticConstructionList.begin(); stati != staticConstructionList.end(); ++stati) {
            if (!stati.second.Reserved() && stati.second.HasTag(tag)) {
                if (closeTo.X() == -1)
                    return stati.second;
                else {
                    if (distance == -1 || Distance(closeTo, stati.second.Position()) < distance) {
                        distance = Distance(closeTo, stati.second.Position());
                        foundConstruct = stati.second;
                        if (distance < 5) return foundConstruct;
                    }
                }
            }
        }

        if (foundConstruct.lock()) return foundConstruct;

        for (let dynai = dynamicConstructionList.begin(); dynai != dynamicConstructionList.end(); ++dynai) {
            if (!dynai.second.Reserved() && dynai.second.HasTag(tag)) {
                if (closeTo.X() == -1)
                    return dynai.second;
                else {
                    if (distance == -1 || Distance(closeTo, dynai.second.Position()) < distance) {
                        distance = Distance(closeTo, dynai.second.Position());
                        foundConstruct = dynai.second;
                        if (distance < 5) return foundConstruct;
                    }
                }
            }
        }

        return foundConstruct;
    }

    Reset() {
        //TODO: ugly
        instance.npcList.clear();
        instance.natureList.clear(); //Ice decays into ice objects and water, so clear this before items and water
        instance.itemList.clear(); //Destroy current items, that way ~Construction() won't have items to try and stockpile

        while (!instance.staticConstructionList.empty()) {
            instance.staticConstructionList.erase(instance.staticConstructionList.begin());
        }
        while (!instance.dynamicConstructionList.empty()) {
            instance.dynamicConstructionList.erase(instance.dynamicConstructionList.begin());
        }

        Map.Reset();
        JobManager.Reset();
        StockManager.Reset();
        Announce.Reset();
        Camp.Reset();
        for (let i = 0; i < Faction.factions.size(); ++i) {
            Faction.factions[i].Reset();
        }
        Stats.Reset();

        delete StockManagerDialog.stocksDialog;
        StockManagerDialog.stocksDialog = 0;

        delete Menu.mainMenu;
        Menu.mainMenu = 0;

        delete Menu.territoryMenu;
        Menu.territoryMenu = 0;

        UI.Reset();

    }

    GetRandomNPCTypeByTag(tag) {
        // std.vector < NPCType > 
        let npcList;
        for (let i = 0; i < NPC.Presets.size(); ++i) {
            if (NPC.Presets[i].tags.find(boost.to_lower_copy(tag)) != NPC.Presets[i].tags.end()) {
                npcList.push_back(i);
            }
        }
        if (npcList.size() > 0)
            return Random.ChooseElement(npcList);
        return -1;
    }

    CenterOn(target) {
        camX = target.X() + 0.5;
        camY = target.Y() + 0.5;
    }

    MoveCam(x, y) {
        camX = Math.min(Math.max(x * renderer.ScrollRate() + camX, 0.0), Map.Width() + 1.0);
        camY = Math.min(Math.max(y * renderer.ScrollRate() + camY, 0.0), Map.Height() + 1.0);
    }

    SetMark(i) {
        marks[i] = Coordinate(FloorToInt.convert(camX), FloorToInt.convert(camY));
        Announce.AddMsg("Mark set");
    }

    ReturnToMark(i) {
        camX = marks[i].X() + 0.5;
        camY = marks[i].Y() + 0.5;
    }

    TranslateContainerListeners() {
        for (let it = itemList.begin(); it != itemList.end(); ++it) {
            if (boost.dynamic_pointer_cast < Container > (it.second)) {
                boost.static_pointer_cast < Container > (it.second).TranslateContainerListeners();
            }
        }
        for (let it = staticConstructionList.begin(); it != staticConstructionList.end(); ++it) {
            if (boost.dynamic_pointer_cast < Stockpile > (it.second)) {
                boost.static_pointer_cast < Stockpile > (it.second).TranslateInternalContainerListeners();
            }
        }
        for (let it = dynamicConstructionList.begin(); it != dynamicConstructionList.end(); ++it) {
            if (boost.dynamic_pointer_cast < Stockpile > (it.second)) {
                boost.static_pointer_cast < Stockpile > (it.second).TranslateInternalContainerListeners();
            }
        }
    }

    PeacefulFaunaCount() {
        return peacefulFaunaCount;
    }
    PeacefulFaunaCount(add) {
        peacefulFaunaCount += add;
    }

    DevMode() {
        return devMode;
    }
    EnableDevMode() {
        devMode = true;
    }

    Dig(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                /*TODO: Relying on GroundMarked() is iffy, it doesn't necessarily mean that that
                spot is reserved for digging. */
                let p = new Coordinate(x, y);
                std.set < TileType > allowedTypes;
                allowedTypes.insert(TILEGRASS);
                allowedTypes.insert(TILEMUD);
                allowedTypes.insert(TILEBOG);
                allowedTypes.insert(TILESNOW);
                if (CheckPlacement(p, Coordinate(1, 1), allowedTypes) && !Map.GroundMarked(p) && !Map.IsLow(p)) {
                    boost.shared_ptr < Job > digJob(new Job("Dig"));
                    digJob.SetRequiredTool(Item.StringToItemCategory("Shovel"));
                    digJob.MarkGround(p);
                    digJob.Attempts(50);
                    digJob.DisregardTerritory();
                    digJob.tasks.push_back(Task(MOVEADJACENT, p));
                    digJob.tasks.push_back(Task(DIG, p));
                    JobManager.AddJob(digJob);
                }
            }
        }
    }

    FindClosestAdjacent(from, target, faction) {
        let closest = Coordinate(-9999, -9999);
        let leastDistance = Number.MAX_SAFE_INTEGER;
        for (let ix = target.X() - 1; ix <= target.X() + 1; ++ix) {
            for (let iy = target.Y() - 1; iy <= target.Y() + 1; ++iy) {
                let p = new Coordinate(ix, iy);
                if (p.onRectangleEdges(target - 1, target + 1) && Map.IsWalkable(p)) {
                    let distance = Distance(from, p);
                    if (faction >= 0 && Map.IsDangerous(p, faction)) distance += 100;
                    if (distance < leastDistance) {
                        closest = p;
                        leastDistance = distance;
                    }
                }
            }
        }
        return closest;
    }

    Adjacent(a, b) {
        return (Math.abs(a.X() - b.X()) < 2 && Math.abs(a.Y() - b.Y()) < 2);
    }

    CreateNatureObject(pos, surroundingNatureObjects) {
        if (Map.IsWalkable(pos) && (Map.GetType(pos) == TILEGRASS || Map.GetType(pos) == TILESNOW) && Random.Generate(4) < 2) {
            // std.priority_queue < std.pair < int, int > > 
            let natureObjectQueue = [];
            let height = Map.heightMap.getValue(pos.X(), pos.Y());

            //Populate the priority queue with all possible plants and give each one a random
            //value based on their rarity
            let evil = Map.GetCorruption(pos) >= 100;
            for (let i = 0; i < NatureObject.Presets.size(); ++i) {
                if (NatureObject.Presets[i].minHeight <= height &&
                    NatureObject.Presets[i].maxHeight >= height &&
                    NatureObject.Presets[i].evil == evil &&
                    (NatureObject.Presets[i].tree == (surroundingNatureObjects < 4) || evil))
                    natureObjectQueue.push(std.make_pair(Random.Generate(NatureObject.Presets[i].rarity - 1) + Random.Generate(2), i));
            }

            if (natureObjectQueue.empty()) return;
            let chosen = natureObjectQueue.top().second;
            let rarity = NatureObject.Presets[chosen].rarity;
            if (Math.abs(height - NatureObject.Presets[chosen].minHeight) <= 0.01 ||
                Math.abs(height - NatureObject.Presets[chosen].maxHeight) <= 0.5) rarity = rarity - rarity / 5;
            if (Math.abs(height - NatureObject.Presets[chosen].minHeight) <= 0.005 ||
                Math.abs(height - NatureObject.Presets[chosen].maxHeight) <= 0.05) rarity /= 2;

            if (Random.Generate(50) < rarity) {
                for (let clus = 0; clus < NatureObject.Presets[chosen].cluster; ++clus) {
                    let a = Map.Shrink(Random.ChooseInRadius(pos, clus));
                    if (Map.IsWalkable(a) && (Map.GetType(a) == TILEGRASS || Map.GetType(a) == TILESNOW) &&
                        Map.GetNatureObject(a) < 0 && Map.GetConstruction(a) < 0) {
                        // boost.shared_ptr < NatureObject > 
                        let natObj = (new NatureObject(a, chosen));
                        natureList.insert((natObj.Uid(), natObj));
                        Map.SetNatureObject(a, natObj.Uid());
                        Map.SetWalkable(a, NatureObject.Presets[natObj.Type()].walkable);
                        Map.SetBuildable(a, false);
                        Map.SetBlocksLight(a, !NatureObject.Presets[natObj.Type()].walkable);
                    }
                }
            }
        }
    }

    CreateNatureObject(pos, name) {
        let natureObjectIndex = 0;
        for (let preseti = NatureObject.Presets.begin(); preseti != NatureObject.Presets.end();
            ++preseti) {
            if (boost.iequals(preseti.name, name)) break;
            ++natureObjectIndex;
        }

        if (natureObjectIndex < NatureObject.Presets.size() &&
            boost.iequals(NatureObject.Presets[natureObjectIndex].name, name)) {
            if (Map.IsInside(pos) && Map.GetNatureObject(pos) < 0 && Map.GetConstruction(pos) < 0) {
                boost.shared_ptr < NatureObject > natObj;
                if (boost.iequals(NatureObject.Presets[natureObjectIndex].name, "Ice"))
                    natObj.reset(new Ice(pos, natureObjectIndex));
                else
                    natObj.reset(new NatureObject(pos, natureObjectIndex));
                natureList.insert((natObj.Uid(), natObj));
                Map.SetNatureObject(pos, natObj.Uid());
                Map.SetWalkable(pos, NatureObject.Presets[natObj.Type()].walkable);
                Map.SetBuildable(pos, false);
                Map.SetBlocksLight(pos, !NatureObject.Presets[natObj.Type()].walkable);
            }
        }
    }

    RemoveNatureObject(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                let uid = Map.GetNatureObject(p);
                if (uid >= 0) {
                    Map.SetNatureObject(p, -1);
                    natureList.erase(uid);
                }
            }
        }
    }

    TriggerAttack() {
        events.SpawnHostileMonsters();
    }
    TriggerMigration() {
        events.SpawnMigratingAnimals();
    }

    GatherItems(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (Map.IsInside(p)) {
                    for (let itemuid = Map.ItemList(p).begin(); itemuid != Map.ItemList(p).end(); ++itemuid) {
                        StockpileItem(GetItem(itemuid), false, true);
                    }
                }
            }
        }
    }

    RemoveFilth(pos) {
        // boost.shared_ptr < FilthNode > 
        let filth = Map.GetFilth(pos).lock();
        if (filth) {
            for (let filthi = filthList.begin(); filthi != filthList.end(); ++filthi) {
                if (filthi.lock() == filth) {
                    filthList.erase(filthi);
                    break;
                }
            }
            Map.SetFilth(pos, null); //boost.shared_ptr < FilthNode > ());
        }
    }

    RemoveWater(pos, removeFromList) {
        // boost.shared_ptr < WaterNode > 
        let water = Map.GetWater(pos).lock();
        if (water) {
            if (removeFromList) {
                for (let wateri = waterList.begin(); wateri != waterList.end(); ++wateri) {
                    if (wateri.lock() == water) {
                        waterList.erase(wateri);
                        break;
                    }
                }
            }
            let filth = water.GetFilth();
            Map.SetWater(pos, null); //boost.shared_ptr < WaterNode > ());
            if (filth > 0) CreateFilth(pos, filth);
        }
    }

    Damage(pos) {
        let attack = new Attack();
        attack.Type(DAMAGE_MAGIC);
        let dice = new Dice();
        dice.nb_rolls = 10;
        dice.nb_faces = 10;
        dice.addsub = 1000;
        attack.AddDamage(dice);

        // boost.shared_ptr < Construction > 
        let construction = GetConstruction(Map.GetConstruction(pos)).lock();
        if (construction) {
            construction.Damage(attack);
        }
        for (let npcuid = Map.NPCList(pos).begin(); npcuid != Map.NPCList(pos).end(); ++npcuid) {
            boost.shared_ptr < NPC > npc;
            if (npcList.find(npcuid) != npcList.end()) npc = npcList[npcuid];
            if (npc) npc.Damage(attack);
        }
    }

    AddDelay(delay, callback) {
        delays.push_back((delay, callback));
    }

    GameOver() {
        running = false;
    }

    CreateFire(pos) {
        CreateFire(pos, 10);
    }

    CreateFire(pos, temperature) {
        if (fireList.empty()) {
            Announce.AddMsg("Fire!", Color.red, pos);
            if (Config.GetCVar("bool", "pauseOnDanger"))
                Game.AddDelay(UPDATES_PER_SECOND, boost.bind(Game.Pause, Game));
        }

        // boost.weak_ptr < FireNode > 
        let fire = (Map.GetFire(pos));
        if (!fire.lock()) { //No existing firenode
            // boost.shared_ptr < FireNode > 
            let newFire = (new FireNode(pos, temperature));
            fireList.push_back(boost.weak_ptr < FireNode > (newFire));
            Map.SetFire(pos, newFire);
        } else {
            // boost.shared_ptr < FireNode > 
            let existingFire = fire.lock();
            if (existingFire) existingFire.AddHeat(temperature);
        }
    }

    CreateSpell(pos, type) {
        // boost.shared_ptr < Spell >
        let newSpell = (new Spell(pos, type));
        spellList.push_back(newSpell);
        return newSpell;
    }

    CreateDitch(pos) {
        RemoveNatureObject(pos, pos);
        Map.SetLow(pos, true);
        Map.ChangeType(pos, TILEDITCH);
    }

    StartFire(pos) {
        // boost.shared_ptr < Job >
        let fireJob = (new Job("Start a fire", HIGH, 0, false));
        fireJob.Attempts(2);
        fireJob.DisregardTerritory();
        fireJob.tasks.push_back(Task(MOVEADJACENT, pos));
        fireJob.tasks.push_back(Task(STARTFIRE, pos));
        fireJob.AddMapMarker(MapMarker(FLASHINGMARKER, 'F', pos, -1, Color.red));
        JobManager.AddJob(fireJob);
    }

    GetAge() {
        return age;
    }

    UpdateFarmPlotSeedAllowances(type) {
        for (let cati = Item.Presets[type].categories.begin(); cati != Item.Presets[type].categories.end();
            ++cati) {
            if (boost.iequals(Item.Categories[cati].name, "seed")) {
                for (let dynamicConsi = dynamicConstructionList.begin(); dynamicConsi != dynamicConstructionList.end(); ++dynamicConsi) {
                    if (dynamicConsi.second.HasTag(FARMPLOT)) {
                        boost.static_pointer_cast < FarmPlot > (dynamicConsi.second).AllowedSeeds().insert((type, false));
                    }
                }
            }
        }
    }

    //TODO factorize all that NPC stuff
    Hungerize(pos) {
        if (Map.IsInside(pos)) {
            for (let npci = Map.NPCList(pos).begin(); npci != Map.NPCList(pos).end(); ++npci) {
                boost.shared_ptr < NPC > npc;
                if (npcList.find(npci) != npcList.end()) npc = npcList[npci];
                if (npc) {
                    npc.hunger = 50000;
                }
            }
        }
    }

    Tire(pos) {
        if (Map.IsInside(pos)) {
            for (let npci = Map.NPCList(pos).begin(); npci != Map.NPCList(pos).end(); ++npci) {
                boost.shared_ptr < NPC > npc;
                if (npcList.find(npci) != npcList.end()) npc = npcList[npci];
                if (npc) {
                    npc.weariness = (int)(WEARY_THRESHOLD - 1);
                }
            }
        }
    }

    Thirstify(pos) {
        if (Map.IsInside(pos)) {
            for (let npci = Map.NPCList(pos).begin(); npci != Map.NPCList(pos).end(); ++npci) {
                // boost.shared_ptr < NPC >
                let npc;
                if (npcList.find(npci) != npcList.end()) npc = npcList[npci];
                if (npc) {
                    npc.thirst = THIRST_THRESHOLD + 500;
                }
            }
        }
    }
    Badsleepify(pos) {
        if (Map.IsInside(pos)) {
            for (let npci = Map.NPCList(pos).begin(); npci != Map.NPCList(pos).end(); ++npci) {
                boost.shared_ptr < NPC > npc;
                if (npcList.find(npci) != npcList.end()) npc = npcList[npci];
                if (npc) {
                    npc.AddEffect(BADSLEEP);
                }
            }
        }
    }

    Diseasify(pos) {
        if (Map.IsInside(pos)) {
            for (let npci = Map.NPCList(pos).begin(); npci != Map.NPCList(pos).end(); ++npci) {
                // boost.shared_ptr < NPC > 
                let npc;
                if (npcList.find(npci) != npcList.end()) npc = npcList[npci];
                if (npc) {
                    npc.AddEffect(COLLYWOBBLES);
                }
            }
        }
    }

    FillDitch(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (Map.IsInside(p)) {
                    if (Map.GetType(p) == TILEDITCH) {
                        boost.shared_ptr < Job > ditchFillJob(new Job("Fill ditch"));
                        ditchFillJob.DisregardTerritory();
                        ditchFillJob.Attempts(2);
                        ditchFillJob.SetRequiredTool(Item.StringToItemCategory("shovel"));
                        ditchFillJob.MarkGround(p);
                        ditchFillJob.tasks.push_back(Task(FIND, p, null, Item.StringToItemCategory("earth")));
                        ditchFillJob.tasks.push_back(Task(MOVE));
                        ditchFillJob.tasks.push_back(Task(TAKE));
                        ditchFillJob.tasks.push_back(Task(FORGET));
                        ditchFillJob.tasks.push_back(Task(MOVEADJACENT, p));
                        ditchFillJob.tasks.push_back(Task(FILLDITCH, p));
                        JobManager.AddJob(ditchFillJob);
                    }
                }
            }
        }
    }

    SetSeason(newSeason) {
        season = newSeason;
    }

    GetNPC(uid) {
        let npci = npcList.find(uid);
        if (npci != npcList.end()) {
            return npci.second;
        }
        return null; // boost.shared_ptr < NPC > ();
    }

    GetRandomConstruction() {
        if (dynamicConstructionList.empty() ||
            (Random.GenerateBool() && !staticConstructionList.empty())) {
            let index = Random.Generate(staticConstructionList.size() - 1);
            for (let consi = staticConstructionList.begin(); consi != staticConstructionList.end(); ++consi) {
                if (index-- == 0) return consi.second;
            }
        } else if (!dynamicConstructionList.empty()) {
            let index = Random.Generate(dynamicConstructionList.size() - 1);
            for (let consi = dynamicConstructionList.begin(); consi != dynamicConstructionList.end(); ++consi) {
                if (index-- == 0) return consi.second;
            }
        }
        return null; // boost.weak_ptr < Construction > ();
    }


    DrawText(text, count, x, y, width, selected, the_console) {
        the_console.print(x, y, (boost.format("%s : %d") % text.first % text.second).str().c_str());
    }
    DrawDeathText(text, count, x, y, width, selected, the_console) {
        the_console.print(x, y, (boost.format("%d : %s") % text.second % text.first).str().c_str());
    }


    DisplayStats() {
        // UIContainer * 
        let contents = new UIContainer([], 0, 0, 77, 39);
        // Dialog * 
        let statDialog = new Dialog(contents, "Statistics", 77, 41);

        // Label * 
        let points = new Label((boost.format("Points: %d") % Stats.GetPoints()).str(), 1, 2, TCOD_LEFT);
        contents.AddComponent(points);

        // Frame * 
        let filthFrame = new Frame("Filth", [], 1, 4, 25, 4);
        filthFrame.AddComponent(new Label((boost.format("created: %d") % Stats.GetFilthCreated()).str(), 1, 1, TCOD_LEFT));
        filthFrame.AddComponent(new Label((boost.format("off-map: %d") % Stats.GetFilthFlownOff()).str(), 1, 2, TCOD_LEFT));
        contents.AddComponent(filthFrame);

        // Label * 
        let burntItems = new Label((boost.format("Burnt items: %d") % Stats.GetItemsBurned()).str(), 1, 9, TCOD_LEFT);
        contents.AddComponent(burntItems);

        // Frame * 
        let productionFrame = new Frame("Production", [], 26, 1, 25, 34);
        productionFrame.AddComponent(new Label((boost.format("items: %d") % Stats.GetItemsBuilt()).str(), 1, 1, TCOD_LEFT));
        productionFrame.AddComponent(new ScrollPanel(1, 2, 23, 15,
            new UIList(Stats.itemsBuilt, 0, 0, 24, Stats.itemsBuilt.size(),
                boost.bind(DrawText, _1, _2, _3, _4, _5, _6, _7), 0, false, 0)));
        productionFrame.AddComponent(new Label((boost.format("constructions: %d") % Stats.GetConstructionsBuilt()).str(), 1, 17, TCOD_LEFT));
        productionFrame.AddComponent(new ScrollPanel(1, 18, 23, 15,
            new UIList(Stats.constructionsBuilt, 0, 0, 24, Stats.constructionsBuilt.size(),
                boost.bind(DrawText, _1, _2, _3, _4, _5, _6, _7), 0, false, 0)));
        contents.AddComponent(productionFrame);

        // Frame * 
        let deathFrame = new Frame("Deaths", [], 51, 1, 25, 34);
        deathFrame.AddComponent(new ScrollPanel(1, 1, 23, 32,
            new UIList(Stats.deaths, 0, 0, 24, Stats.deaths.size(),
                boost.bind(DrawDeathText, _1, _2, _3, _4, _5, _6, _7), 0, false, 0)));
        contents.AddComponent(deathFrame);

        // Button *
        let okButton = new Button("OK", null, 33, 37, 10, 'o', true);
        contents.AddComponent(okButton);

        statDialog.ShowModal();
    }

    //Check each stockpile for empty not-needed containers, and see if some other pile needs them
    RebalanceStockpiles(requiredCategory, excluded) {
        for (let stocki = staticConstructionList.begin(); stocki != staticConstructionList.end(); ++stocki) {
            if (stocki.second.stockpile) {
                // boost.shared_ptr < Stockpile > 
                let sp = (boost.static_pointer_cast < Stockpile > (stocki.second));
                if (sp != excluded && sp.GetAmount(requiredCategory) > sp.GetDemand(requiredCategory)) {
                    // boost.shared_ptr < Item >
                    let surplus = sp.FindItemByCategory(requiredCategory, EMPTY).lock();
                    if (surplus) {
                        // boost.shared_ptr < Job > 
                        let stockpileJob = StockpileItem(surplus, true);
                        if (stockpileJob && stockpileJob.ConnectedEntity().lock() != sp)
                            JobManager.AddJob(stockpileJob);
                    }
                }
            }
        }
    }

    ProvideMap() {
        for (let itemIterator = itemList.begin(); itemIterator != itemList.end(); ++itemIterator) {
            itemIterator.second.SetMap(Map);
        }
        for (let npcIterator = npcList.begin(); npcIterator != npcList.end(); ++npcIterator) {
            npcIterator.second.SetMap(Map);
        }
        for (let consIterator = staticConstructionList.begin(); consIterator != staticConstructionList.end(); ++consIterator) {
            consIterator.second.SetMap(Map);
        }
        for (let consIterator = dynamicConstructionList.begin(); consIterator != dynamicConstructionList.end(); ++consIterator) {
            consIterator.second.SetMap(Map);
        }
    }

    save(ar,
        version) {
        ar.register_type(Container);
        ar.register_type(Item);
        ar.register_type(Entity);
        ar.register_type(OrganicItem);
        ar.register_type(FarmPlot);
        ar.register_type(Door);
        ar.register_type(SpawningPool);
        ar.register_type(Trap);
        ar.register_type(Ice);
        ar.register_type(Stats);
        ar.register_type(WaterItem);
        ar & season;
        ar & time;
        ar & orcCount;
        ar & goblinCount;
        ar & peacefulFaunaCount;
        ar & safeMonths;
        ar & marks;
        ar & camX;
        ar & camY;
        ar & Faction.factions;
        ar & npcList;
        ar & squadList;
        ar & hostileSquadList;
        ar & staticConstructionList;
        ar & dynamicConstructionList;
        ar & itemList;
        ar & freeItems;
        ar & flyingItems;
        ar & stoppedItems;
        ar & natureList;
        ar & waterList;
        ar & filthList;
        ar & bloodList;
        ar & fireList;
        ar & spellList;
        ar & age;
        ar & Stats.instance;
    }

    load(ar, version) {
        ar.register_type(Container);
        ar.register_type(Item);
        ar.register_type(Entity);
        ar.register_type(OrganicItem);
        ar.register_type(FarmPlot);
        ar.register_type(Door);
        ar.register_type(SpawningPool);
        ar.register_type(Trap);
        if (version >= 1) {
            ar.register_type(Ice);
            ar.register_type(Stats);
            ar.register_type(WaterItem);
        }
        ar & season;
        ar & time;
        ar & orcCount;
        ar & goblinCount;
        ar & peacefulFaunaCount;
        ar & safeMonths;
        ar & marks;
        ar & camX;
        ar & camY;

        //Save games may not have all of the current factions saved, which is why we need to store
        //a list of current factions here, and make sure they all exist after loading
        {
            std.list < std.string > factionNames;
            for (let i = 0; i < Faction.factions.size(); ++i) {
                factionNames.push_back(Faction.FactionTypeToString(i));
            }
            if (version < 1) {
                /* Earlier versions didn't use factions for more than storing trap data, 
                			   so transfer that and use the new defaults otherwise */
                // std.vector < boost.shared_ptr < Faction > > 
                let oldFactionData = [];
                ar & oldFactionData;
                oldFactionData[0].TransferTrapInfo(Faction.factions[PLAYERFACTION]);
            } else {
                ar & Faction.factions;
                Faction.InitAfterLoad(); //Initialize names and default friends, before loading npcs
            }
            for (let factionName = factionNames.begin(); factionName != factionNames.end(); ++factionName) {
                Faction.StringToFactionType(factionName);
            }
        }

        ar & npcList;

        Faction.TranslateMembers(); //Translate uid's into pointers, do this after loading npcs

        ar & squadList;
        ar & hostileSquadList;
        ar & staticConstructionList;
        ar & dynamicConstructionList;
        ar & itemList;
        ar & freeItems;
        ar & flyingItems;
        ar & stoppedItems;
        ar & natureList;
        ar & waterList;
        ar & filthList;
        ar & bloodList;
        ar & fireList;
        ar & spellList;
        ar & age;
        if (version >= 1) {
            ar & Stats.instance;
        }
    }
    static Reset() {
        let instance = new GameClass();
        instance.Init(!GameClass.initializedOnce);
        GameClass.initializedOnce = true;

        return instance;
    }
}

export let Game = GameClass.Reset();
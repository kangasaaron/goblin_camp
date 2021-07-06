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

import { Serializable } from "./data/Serialization.js";
import { Singletonify } from "./cplusplus/Singleton.js";
import { Season } from "./Season.js";
import { Events } from "./Events.js";
// import { Action } from "./Action.js";
// import { Announce } from "./Announce.js";
// import { Attack } from "./Attack.js";
// import { BloodNode } from "./BloodNode.js";
// import { Button } from "./UI/Button.js";
// import { Camp } from "./Camp.js";
// import { TCODColor, TCOD_alignment_t, TCOD_bkgnd_flag_t } from "../fakeTCOD/libtcod.js";
// import { Config } from "./data/Config.js";
// import { Container } from "./Container.js";
// // import { Console } from "./other/Console.js";
// import { Constants } from "./Constants.js";
// import { Construction } from "./Construction.js";
// import { ConstructionTag } from "./ConstructionTag.js";
// import { Coordinate } from "./Coordinate.js";
// import { DamageType } from "./DamageType.js";
// import { Data } from "./data/Data.js";
// import { Dialog } from "./UI/Dialog.js";
// import { Direction } from "./Direction.js";
// import { Door } from "./Door.js";
// import { Entity } from "./Entity.js";
// import { Faction } from "./Faction.js";
// import { FarmPlot } from "./FarmPlot.js";
// import { FilthNode } from "./FilthNode.js";
// import { FireNode } from "./FireNode.js";
// import { Frame } from "./UI/Frame.js";
// import { GameMap } from "./GameMap.js";
// import { Globals } from "./Globals.js";
// import { Ice } from "./Ice.js";
// import { Item } from "./Item.js";
// import { Job } from "./Job.js";
// import { JobManager } from "./JobManager.js";
// import { JobPriority } from "./JobPriority.js";
// import { Label } from "./UI/Label.js";
// import { MapMarker } from "./MapMarker.js";
// import { MarkerType } from "./MarkerType.js";
// import { MessageBox } from "./UI/MessageBox.js";
// import { Menu } from "./UI/Menu.js";
// import { NatureObject } from "./NatureObject.js";
// import { NPC } from "./NPC.js";
// import { OrganicItem } from "./OrganicItem.js";
// import { Random } from "./Random.js";
// import { Resistance } from "./Resistance.js";
// import { Script } from "./scripting/Script.js";
// import { ScrollPanel } from "./UI/ScrollPanel.js";
// import { SpawningPool } from "./SpawningPool.js";
// import { Spell } from "./Spell.js";
// import { Squad } from "./Squad.js";
// import { Stats } from "./Stats.js";
// import { StatusEffectType } from "./StatusEffectType.js";
// import { StockManager } from "./StockManager.js";
// import { StockManagerDialog } from "./UI/StockManagerDialog.js";
// import { Stockpile } from "./Stockpile.js";
// import { Task } from "./Task.js";
// import { TileType } from "./TileType.js";
// import { Trait } from "./Trait.js";
// import { Trap } from "./Trap.js";
// import { UI } from "./UI/UI.js";
// import { UIContainer } from "./UI/UIContainer.js";
// import { UIList } from "./UI/UIList.js";
// import { TCODMapRenderer } from "./TCODMapRenderer.js";
// import { WaterItem } from "./WaterItem.js";
// import { WaterNode } from "./WaterNode.js";

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

let iequals = function iequals(s1,s2){
    return String(s1).toLowerCase() === String(s2).toLowerCase();
}
// let format = function format(...args){

// }

export class Game extends Serializable{
    static CLASS_VERSION() { return 1; }

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
    // int this.orcCount, this.goblinCount;
    // unsigned int peacefulFaunaCount;
    // bool paused;
    // int charWidth, charHeight;
    // bool toMainMenu, running;
    // int safeMonths;
    // bool refreshStockpiles;
    // static bool devMode;

    // boost.shared_ptr < Events > events;

    // std.list < std.pair < int, boost.function < void() > > > delays;

    // boost.shared_ptr < MapRenderer > renderer;
    // bool gameOver;

    // std.map < int, boost.shared_ptr < NPC > > this.npcMap;

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
    //     TCODConsole * the_console = Game.i.buffer, float focusX = Game.i.camX, float focusY = Game.i.camY,
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
    // std.map < std.string, boost.shared_ptr < Squad > > squadMap;
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
        this.refreshStockpiles = true;
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
    // std.map < int, boost.shared_ptr < Item > > this.itemMap;
    // void ItemContained(boost.weak_ptr < Item > , bool contained);
    // std.set < boost.weak_ptr < Item > > freeItemsSet; //Free as in not contained
    // std.set < boost.weak_ptr < Item > > flyingItemsSet; //These need to be updated
    // std.list < boost.weak_ptr < Item > > stoppedItems; //These need to be removed from flyingItemsSet
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

    // std.list < boost.weak_ptr < FilthNode > > filthNodes;
    // void CreateFilth(Coordinate);
    // void CreateFilth(Coordinate, int);
    // void RemoveFilth(Coordinate);

    // std.list < boost.weak_ptr < BloodNode > > bloodNodes;
    // void CreateBlood(Coordinate);
    // void CreateBlood(Coordinate, int);

    // void TriggerAttack();
    // void TriggerMigration();

    // void AddDelay(int delay, boost.function < void() > );

    // std.list < boost.weak_ptr < FireNode > > fireNodes;
    // void CreateFire(Coordinate);
    // void CreateFire(Coordinate, int);
    // void StartFire(Coordinate);

    // boost.shared_ptr < Spell > CreateSpell(Coordinate, int type);
    // std.list < boost.shared_ptr < Spell > > spells;

    // int GetAge();

    // void DisplayStats();
    // void ProvideMap();



    constructor() {
        if (Game._instance) return Game._instance;
        super();

        //boost.mutex 
        this.loadingScreenMutex;
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.charWidth = 0;
        this.charHeight = 0;
        this.season = Season.EarlySpring;
        this.time = 0;
        this.age = 0;
        this.orcCount = 0;
        this.goblinCount = 0;
        this.peacefulFaunaCount = 0;
        this.paused = false;
        this.toMainMenu = false;
        this.running = false;
        this.gameOver = false;
        this.safeMonths = 3;
        this.events = new Events();
        this.camX = 180;
        this.camY = 180;
        /** @type {Console} */
        this.buffer = null;
        /** @type {Coordinate[]}*/
        this.marks = new Array(12);
        this.the_console = null;
        /** @type {boost.shared_ptr<MapRenderer>} */
        this.renderer = null;
        this.staticConstructionMap = new Map();
        this.dynamicConstructionMap = new Map();

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
                if (!GameMap.i.IsInside(p) || !GameMap.i.IsBuildable(p) || (!tileReqs.empty() && tileReqs.find(GameMap.i.GetType(p)) === tileReqs.end()))
                    return false;
            }
        }
        return true;
    }

    PlaceConstruction(target, construct) {
        //Check if the required materials exist before creating the build job
        let componentList;
        for (let mati = Construction.Presets[construct].materials.begin(); mati !== Construction.Presets[construct].materials.end(); ++mati) {
            let material = this.FindItemByCategoryFromStockpiles(mati, target, Constants.EMPTY);
            let item= material.lock();
            if (item ) {
                item.Reserve(true);
                componentList.push(item);
            } else {
                for (let compi = componentList.begin(); compi !== componentList.end(); ++compi) {
                    compi.lock().Reserve(false);
                }
                componentList.clear();
                Announce.i.AddMsg((`Cancelled ${Construction.Presets[construct].name}: insufficient [${Item.ItemCategoryToString(mati)}] in stockpiles`), TCODColor.red);
                return -1;
            }
        }

        if (Construction.AllowedAmount[construct] >= 0) {
            if (Construction.AllowedAmount[construct] === 0) {
                Announce.i.AddMsg(
                    "Cannot build another " +
                    Construction.Presets[construct].name +
                    "!",
                    TCODColor.red
                );
                return -1;
            }
            --Construction.AllowedAmount[construct];
        }

        for (let compi = componentList.begin(); compi !== componentList.end(); ++compi) {
            compi.lock().Reserve(false);
        }
        componentList.clear();

        let newCons;
        if (Construction.Presets[construct].tags[ConstructionTag.DOOR]) {
            newCons = new Door(construct, target);
        } else if (Construction.Presets[construct].tags[ConstructionTag.SPAWNINGPOOL]) {
            newCons = new SpawningPool(construct, target);
        } else if (Construction.Presets[construct].tags[ConstructionTag.TRAP]) {
            newCons = new Trap(construct, target);
            Faction.factions[Constants.PLAYERFACTION].TrapSet(target, true);
        } else {
            newCons = new Construction(construct, target);
        }
        if (Construction.Presets[construct].dynamic) {
            this.dynamicConstructionMap.insert((newCons.Uid(), newCons));
        } else {
            this.staticConstructionMap.insert((newCons.Uid(), newCons));
        }
        newCons.SetMap(GameMap.i);
        let blueprint = Construction.Blueprint(construct);
        for (let x = target.X(); x < target.X() + blueprint.X(); ++x) {
            for (let y = target.Y(); y < target.Y() + blueprint.Y(); ++y) {
                let p = new Coordinate(x, y);
                GameMap.i.SetBuildable(p, false);
                GameMap.i.SetConstruction(p, newCons.Uid());
                if (!Construction.Presets[construct].tags[ConstructionTag.TRAP]) GameMap.i.SetTerritory(p, true);
            }
        }

        let buildJob = (new Job("Build " + Construction.Presets[construct].name, JobPriority.MED, 0, false));
        buildJob.DisregardTerritory();

        for (let materialIter = newCons.MaterialList().begin(); materialIter !== newCons.MaterialList().end(); ++materialIter) {
            let pickupJob = (new Job("Pickup " + Item.ItemCategoryToString(materialIter) + " for " + Construction.Presets[construct].name, JobPriority.MED, 0, true));
            pickupJob.Parent(buildJob);
            pickupJob.DisregardTerritory();
            buildJob.PreReqs().push(pickupJob);

            pickupJob.tasks.push(new Task(Action.FIND, target, null, materialIter, Constants.EMPTY));
            pickupJob.tasks.push(new Task(Action.MOVE));
            pickupJob.tasks.push(new Task(Action.TAKE));
            pickupJob.tasks.push(new Task(Action.MOVE, newCons.Storage().lock().Position(), newCons));
            pickupJob.tasks.push(new Task(Action.PUTIN, newCons.Storage().lock().Position(), newCons.Storage()));
            JobManager.AddJob(pickupJob);
        }

        buildJob.tasks.push(new Task(Action.MOVEADJACENT, newCons.Position(), newCons));
        buildJob.tasks.push(new Task(Action.BUILD, newCons.Position(), newCons));
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
                    if (GameMap.i.IsBuildable(p)) {
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
        let newSp = ((Construction.Presets[stockpile].tags[ConstructionTag.FARMPLOT]) ? new FarmPlot(stockpile, symbol, a) : new Stockpile(stockpile, symbol, a));
        newSp.SetMap(GameMap.i);
        GameMap.i.SetBuildable(a, false);
        GameMap.i.SetConstruction(a, newSp.Uid());
        GameMap.i.SetTerritory(a, true);
        newSp.Expand(a, b);
        if (Construction.Presets[stockpile].dynamic) {
            this.dynamicConstructionMap.insert((newSp.Uid(), (newSp)));
        } else {
            this.staticConstructionMap.insert((newSp.Uid(), (newSp)));
        }

        this.RefreshStockpiles();

        Script.i.Event.BuildingCreated(newSp, a.X(), a.Y());

        //Spawning a BUILD job is not required because stockpiles are created "built"
        return newSp.Uid();
    }

    FindClosestAdjacent(...args){
        if(args.length === 3){
            if(args[1] instanceof Entity)
                return this.FindClosestAdjacent_coordinate_entity_factionNum(args[0],args[1],args[2]);
            else if(args[1] instanceof Coordinate)                
                return this.FindClosestAdjacent_coordinate_coordinate_factionNum(args[0],args[1],args[2]);
        }
    }

    FindClosestAdjacent_coordinate_coordinate_factionNum(from, target, faction) {
        let closest = Coordinate(-9999, -9999);
        let leastDistance = Number.MAX_SAFE_INTEGER;
        for (let ix = target.X() - 1; ix <= target.X() + 1; ++ix) {
            for (let iy = target.Y() - 1; iy <= target.Y() + 1; ++iy) {
                let p = new Coordinate(ix, iy);
                if (p.onRectangleEdges(target - 1, target + 1) && GameMap.i.IsWalkable(p)) {
                    let distance = Coordinate.Distance(from, p);
                    if (faction >= 0 && GameMap.i.IsDangerous(p, faction)) distance += 100;
                    if (distance < leastDistance) {
                        closest = p;
                        leastDistance = distance;
                    }
                }
            }
        }
        return closest;
    }

    //Returns undefined if not found
    FindClosestAdjacent_coordinate_entity_factionNum(pos, ent, faction) {
        let closest = Coordinate.undefinedCoordinate;
        let leastDistance = Number.MAX_SAFE_INTEGER;
        if (ent.lock()) {
            if ((ent.lock())) {
                let construct = ent.lock();
                //note on weird (origin,extent) coordinates: we want the *outer* bordure of (position,blueprint)
                let origin = construct.Position() - 1,
                    extent = Construction.Blueprint(construct.Type()) + 2;
                for (let ix = origin.X(); ix < (origin + extent).X(); ++ix) {
                    for (let iy = origin.Y(); iy < (origin + extent).Y(); ++iy) {
                        let p = new Coordinate(ix, iy);
                        if (p.onExtentEdges(origin, extent) && GameMap.i.IsWalkable(p)) {
                            let distance = Coordinate.Distance(pos, p);
                            if (faction >= 0 && GameMap.i.IsDangerous(p, faction)) distance += 100;
                            if (distance < leastDistance) {
                                closest = p;
                                leastDistance = distance;
                            }
                        }
                    }
                }
            } else {
                return this.FindClosestAdjacent(pos, ent.lock().Position(), faction);
            }
        }
        return closest;
    }

    Adjacent(...args){
        if(args[1] instanceof Entity)
            return this.Adjacent_coordinate_entity(args[0],args[1]);
        else            
            return this.Adjacent_coordinate_coordinate(args[0],args[1]);
    }

    Adjacent_coordinate_coordinate(a, b) {
        return (Math.abs(a.X() - b.X()) < 2 && Math.abs(a.Y() - b.Y()) < 2);
    }

    //Returns true/false depending on if the given position is adjacent to the entity
    //Takes into consideration if the entity is a construction, and thus may be larger than just one tile
    Adjacent_coordinate_entity(pos, ent) {
        if (ent.lock()) {
            if (ent.lock()) {
                let construct = ent.lock();
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

        if (!GameMap.i.IsWalkable(target)) {
            for (let tries = 0; tries < 20; ++tries) {
                let candidate = Random.ChooseInRadius(target, 1 + tries / 3);
                if (GameMap.i.IsWalkable(candidate)) {
                    target = candidate;
                }
            }
            //TODO find a walkwable target even if those tries fail
            assert(GameMap.i.IsWalkable(target));
        }

        //boost.shared_ptr < NPC >
        let npc = (new NPC(target));
        npc.SetMap(GameMap.i);
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
        for (let i = 0; i < StatusEffectType.STAT_COUNT; ++i) {
            npc.baseStats[i] = NPC.Presets[type].stats[i] + Random.Sign(NPC.Presets[type].stats[i] * (Random.i.Generate(0, 10) / 100));
        }
        for (let i = 0; i < Resistance.RES_COUNT; ++i) {
            npc.baseResistances[i] = NPC.Presets[type].resistances[i] + Random.Sign(NPC.Presets[type].resistances[i] * (Random.i.Generate(0, 10) / 100));
        }

        npc.attacks = NPC.Presets[type].attacks;
        for (let attacki = NPC.Presets[type].attacks.begin(); attacki !== NPC.Presets[type].attacks.end(); ++attacki) {
            if (attacki.IsProjectileMagic()) {
                npc.hasMagicRangedAttacks = true;
                break;
            }
        }

        if (NPC.NPCTypeToString(type).toLowerCase() === "orc") {
            ++this.orcCount;
            npc.AddTrait(Trait.FRESH);
        } else if (NPC.NPCTypeToString(type).toLowerCase === "goblin") {
            ++this.goblinCount;
            if (Random.i.Generate(2) === 0) npc.AddTrait(Trait.CHICKENHEART);
        } else if (NPC.Presets[type].tags.find("localwildlife") !== NPC.Presets[type].tags.end()) ++this.peacefulFaunaCount;

        if (NPC.Presets[type].tags.find("flying") !== NPC.Presets[type].tags.end()) {
            npc.AddEffect(StatusEffectType.FLYING);
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
            if (itemType > 0 && itemType < (Item.Presets.size())) {
                //std.set < ItemCategory > 
                let categories = Item.Presets[itemType].categories;
                if (categories.find(Item.StringToItemCategory("weapon")) !== categories.end() &&
                    !npc.Wielding().lock()) {
                    let itemUid = this.CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.inventory);
                    //boost.shared_ptr < Item > 
                    let item = this.itemMap[itemUid];
                    npc.mainHand = item;
                } else if (categories.find(Item.StringToItemCategory("armor")) !== categories.end() &&
                    !npc.Wearing().lock()) {
                    let itemUid = this.CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.inventory);
                    //boost.shared_ptr < Item > 
                    let item = this.itemMap[itemUid];
                    npc.armor = item;
                } else if (categories.find(Item.StringToItemCategory("quiver")) !== categories.end() &&
                    !npc.quiver.lock()) {
                    let itemUid = this.CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.inventory);
                    // boost.shared_ptr < Item > 
                    let item = this.itemMap[itemUid];
                    npc.quiver = (item); //Quivers = containers
                } else if (categories.find(Item.StringToItemCategory("ammunition")) !== categories.end() &&
                    npc.quiver.lock() && npc.quiver.lock().empty()) {
                    for (let i = 0; i < 20 && !npc.quiver.lock().Full(); ++i) {
                        this.CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.quiver.lock());
                    }
                } else {
                    let itemUid = this.CreateItem(npc.Position(), itemType, false, npc.GetFaction(), [], npc.inventory);
                    itemUid;
                }
            }
        }

        this.npcMap.insert((npc.Uid(), npc));
        npc.factionPtr.AddMember(npc);

        return npc.Uid();
    }

    OrcCount(add) {
        if (Number.isFinite(add))
            this.orcCount += add;
        return this.orcCount;
    }
    GoblinCount(add) {
        if (Number.isFinite(add))
            this.goblinCount += add;
        return this.goblinCount;
    }

    //Moves the entity to a valid walkable tile
    BumpEntity(uid) {
        // boost.shared_ptr < Entity > 
        let entity;

        // std.map < int, boost.shared_ptr < NPC > > .iterator 
        let npc = this.npcMap.find(uid);
        if (npc !== this.npcMap.end()) {
            entity = npc.second;
        } else {
            // std.map < int, boost.shared_ptr < Item > > .iterator 
            let item = this.itemMap.find(uid);
            if (item !== this.itemMap.end()) {
                entity = item.second;
            }
        }

        if (entity) {
            if (!GameMap.i.IsWalkable(entity.Position())) {
                for (let radius = 1; radius < 10; ++radius) {
                    for (let ix = entity.Position().X() - radius; ix <= entity.Position().X() + radius; ++ix) {
                        for (let iy = entity.Position().Y() - radius; iy <= entity.Position().Y() + radius; ++iy) {
                            let p = new Coordinate(ix, iy);
                            if (GameMap.i.IsWalkable(p)) {
                                entity.Position(p);
                                return;
                            }
                        }
                    }
                }
            }
        }
        if(Globals.DEBUG)  {
            console.log("Tried to bump nonexistant entity.");
        }
    } /*#endif*/


    DoNothing() { }

    Exit(confirm) {
        //boost.function<void()> exitFunc = boost.bind(&Game.i.Running, Game, false);
        // boost.function < void() > 
        let exitFunc =  () => {
            this.Running(false);
            this.GCamp.exit();
        };

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

        this.buffer.setDefaultForeground(TCODColor.white);
        this.buffer.setDefaultBackground(TCODColor.black);
        this.buffer.setAlignment(TCOD_alignment_t.TCOD_CENTER);
        // this.the_console.setDefaultForeground(TCODColor.white);
        // this.the_console.setDefaultBackground(TCODColor.black);
        // this.the_console.setAlignment(TCOD_alignment_t.TCOD_CENTER); //TODO
        this.buffer.clear();
        this.buffer.print(x, y, loadingMsg);
        // this.buffer.flush();
    }



    ProgressScreen(blockingCall, isLoading) {
        // this runs blocking call in a separate thread while spinning on the main one
        // so that the process doesn't appear to be dead
        //
        // thread safety notice: blockingCall MUST NOT access TCODConsole.root without
        // locking Game.i.loadingScreenMutex first!
        //
        // XXX heavily experimental
        //boost.promise < void >
        // let promise;

        //boost.unique_future < void >
        // let future = (promise.get_future());

        // make copies before launching the thread
        let x = this.screenWidth / 2;
        let y = this.screenHeight / 2;

        this.DrawProgressScreen(x, y, 0, isLoading);

        // //TODO put in a worker?
        // try {
        //     blockingCall();
        //     promise.set_value();
        // } catch (e) {
        //     promise.set_exception(boost.copy_exception(e));
        // }

        let me = this;
        let intervalID = 0
        let spin = 0;
        intervalID = setInterval(() => me.DrawProgressScreen(x, y, ++spin, isLoading), 500);
        return new Promise(function (resolve, reject) {
            blockingCall();
            clearInterval(intervalID);
            resolve();
        });
        // do {
        //     this.DrawProgressScreen(x, y, ++spin, isLoading);
        // } while (!future.timed_wait(boost.posix_time.millisec(500)));

        // if (future.has_exception()) {
        //     future.get();
        // }
    }

    ErrorScreen() {
        let lock = this.loadingScreenMutex;

        TCODConsole.root.setDefaultForeground(TCODColor.white);
        TCODConsole.root.setDefaultBackground(TCODColor.black);
        TCODConsole.root.setAlignment(TCOD_alignment_t.TCOD_CENTER);
        TCODConsole.root.clear();
        TCODConsole.root.print(
            this.screenWidth / 2, this.screenHeight / 2,
            "A critical error occurred, refer to the logfile for more information."
        );
        TCODConsole.root.print(this.screenWidth / 2, this.screenHeight / 2 + 1, "Press any key to exit the game.");
        TCODConsole.root.flush();
        TCODConsole.waitForKeypress(true).then(() => this.GCamp.exit(255));
    }

    Init(firstTime) {
        let width = Config.i.GetCVar('int', "resolutionX");
        let height = Config.i.GetCVar('int', "resolutionY");
        let fullscreen = Config.i.GetCVar('bool', "fullscreen");

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

        // srand(std.time(0));// TODO seed random generator....I thought it was already seeded in Rand.init..???
        srand(Date.now());

        //Enabling TCOD_RENDERER_GLSL can cause GCamp to crash on exit, apparently it's because of an ATI driver issue.
        //TCOD_renderer_t 
        let renderer_type = (Config.i.GetCVar("renderer"));//TODO

        TCODMouse.showCursor(true);
        TCODConsole.setKeyboardRepeat(500, 10);


        if (firstTime) {
            // this.buffer = new Console(this.screenWidth, this.screenHeight, "Goblin Camp", fullscreen);
            // this.buffer = new ROT.Display({ width: this.screenWidth, height: this.screenHeight });
            TCODConsole.initRoot(this.screenWidth, this.screenHeight, "Goblin Camp", fullscreen, renderer_type);
        }
        this.ResetRenderer();

        this.events = (new Events(GameMap.i));

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

        if (Config.i.GetCVar("bool", "useTileset")) {
            let tilesetName = Config.i.GetStringCVar("tileset");
            if (tilesetName.length === 0) tilesetName = "default";

            let tilesetRenderer = this.CreateTilesetRenderer(width, height, this.buffer, tilesetName);

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
        this.renderer.SetTranslucentUI(Config.i.GetCVar("bool", "translucentUI"));
    }

    RemoveConstruction(cons) {
        let construct = cons.lock();
        if (construct) {
            if (Construction.Presets[construct.type].dynamic) {
                this.dynamicConstructionMap.erase(construct.Uid());
            } else {
                this.staticConstructionMap.erase(construct.Uid());
            }

            Script.i.Event.BuildingDestroyed(cons, construct.X(), construct.Y());
        }
    }

    DismantleConstruction(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                let construction = GameMap.i.GetConstruction(p);
                if (construction >= 0) {
                    if (this.GetConstruction(construction).lock()) {
                        this.GetConstruction(construction).lock().Dismantle(p);
                    } else {
                        GameMap.i.SetConstruction(p, -1);
                    }
                }
            }
        }
    }

    GetConstruction(uid) {
        if (this.staticConstructionMap.find(uid) !== this.staticConstructionMap.end())
            return this.staticConstructionMap[uid];
        else if (this.dynamicConstructionMap.find(uid) !== this.dynamicConstructionMap.end())
            return this.dynamicConstructionMap[uid];
        return null;
    }

    CreateItem(pos, type, store, ownerFaction, comps, container) {
        if (type >= 0 && type < (Item.Presets.size())) {
            // boost.shared_ptr < Item > 
            let newItem;
            if (Item.Presets[type].organic) {
                let orgItem;

                if (Item.ItemTypeToString(type).toLowerCase() === "water")
                    orgItem.reset(new WaterItem(pos, type));
                else
                    orgItem.reset(new OrganicItem(pos, type));

                newItem = orgItem;
                orgItem.Nutrition(Item.Presets[type].nutrition);
                orgItem.Growth(Item.Presets[type].growth);
                orgItem.SetFaction(ownerFaction);
            } else if (Item.Presets[type].container > 0) {
                newItem.reset((new Container(pos, type, Item.Presets[type].container, ownerFaction, comps)));
            } else {
                newItem.reset(new Item(pos, type, ownerFaction, comps));
            }
            newItem.SetMap(GameMap.i);
            if (!container) {
                if (newItem !== 0) { // No null pointers in freeItemsSet please..
                    this.freeItemsSet.insert(newItem);
                    GameMap.i.ItemList(newItem.Position()).insert(newItem.Uid());
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

            if (newItem !== 0) { // No null pointers in this.itemMap... I'm being overly cautious here.
                this.itemMap.insert((newItem.Uid(), newItem));
            } else {
                return -1;
            }

            if (store) 
                this.StockpileItem(newItem, false, true);

            Script.i.Event.ItemCreated(newItem, pos.X(), pos.Y());

            if  (Globals.DEBUG) {
                console.log(newItem.name , "(" , newItem.Uid() , ") created\n");
            } 

            return newItem.Uid();
        }
        return -1;
    }

    RemoveItem(witem) {
        let item = witem.lock();
        if (item) {
            GameMap.i.ItemList(item.Position()).erase(item.uid);
            if (this.freeItemsSet.find(witem) !== this.freeItemsSet.end()) this.freeItemsSet.erase(witem);
            let container = item.container.lock();
            if (container) {
                if (container) {
                    container.RemoveItem(witem);
                }
            }
            this.itemMap.erase(item.uid);
        }
    }

    GetItem(uid) {
        if (this.itemMap.find(uid) !== this.itemMap.end()) return this.itemMap[uid];
        return null;
    }

    ItemContained(item, con) {
        if (!con) {
            this.freeItemsSet.insert(item);
            GameMap.i.ItemList(item.lock().Position()).insert(item.lock().Uid());
        } else {
            this.freeItemsSet.erase(item);
            GameMap.i.ItemList(item.lock().Position()).erase(item.lock().Uid());
        }
    }

    CreateWater(pos, amount = 10, time) {
        //If there is filth here mix it with the water
        // boost.shared_ptr < FilthNode >
        let filth = GameMap.i.GetFilth(pos).lock();

        // boost.weak_ptr < WaterNode > 
        let water = (GameMap.i.GetWater(pos));
        if (!water.lock()) {
            let newWater = new WaterNode(pos, amount, time);
            this.waterList.push(newWater);
            GameMap.i.SetWater(pos, newWater);
            if (filth) newWater.AddFilth(filth.Depth());
        } else {
            water.lock().Depth(water.lock().Depth() + amount);
            if (filth) water.lock().AddFilth(filth.Depth());
        }

        if (filth) 
            this.RemoveFilth(pos);
    }

    CreateWaterFromNode(water) {
        if (water) {
            // boost.shared_ptr < FilthNode > 
            let filth = GameMap.i.GetFilth(water.Position()).lock();
            // boost.weak_ptr < WaterNode > 
            let existingWater = (GameMap.i.GetWater(water.Position()));
            if (!existingWater.lock()) {
                this.waterList.push(water);
                GameMap.i.SetWater(water.Position(), water);
                if (filth)  
                    water.AddFilth(filth.Depth());
            } else {
                let originalWater = existingWater.lock();
                originalWater.Depth(water.Depth());
                originalWater.AddFilth(water.GetFilth());
                if (filth) originalWater.AddFilth(filth.Depth());
            }
            if (filth) 
                this.RemoveFilth(filth.Position());
        }
    }

    DistanceNPCToCoordinate(uid, pos) {
        return Coordinate.Distance(this.npcMap[uid].Position(), pos);
    }

    // TODO this currently checks every stockpile.  We could maintain some data structure that allowed us to check the closest stockpile(s)
    // first.
    FindItemByCategoryFromStockpiles(category, target, flags, value) {
        let nearestDistance = Number.MAX_SAFE_INTEGER;
        
        let nearest = null; 
        for (let consIter = this.staticConstructionMap.begin(); consIter !== this.staticConstructionMap.end(); ++consIter) {
            if (consIter.second.stockpile && !consIter.second.farmplot) {
                let item = ((consIter.second).FindItemByCategory(category, flags, value));
                if (item.lock() && !item.lock().Reserved()) {
                    let distance = (flags & Constants.MOSTDECAYED ? item.lock().GetDecay() : Coordinate.Distance(item.lock().Position(), target));
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
        for (let consIter = this.staticConstructionMap.begin(); consIter !== this.staticConstructionMap.end(); ++consIter) {
            if (consIter.second.stockpile && !consIter.second.farmplot) {
                let item = ((consIter.second).FindItemByType(type, flags, value));
                if (item.lock() && !item.lock().Reserved()) {
                    let distance = (flags & Constants.MOSTDECAYED ? item.lock().GetDecay() : Coordinate.Distance(item.lock().Position(), target));
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
            if (GameMap.i.IsWalkable(p)) {
                this.CreateItem(p, type, true);
                ++items;
            }
        }
    }

    FindFilth(pos) {
        if (this.filthNodes.size() === 0) return undefined;

        //First check the vicinity of the given position
        if (pos.X() >= 0) {
            for (let i = 0; i < 10; ++i) {
                let candidate = Random.ChooseInRadius(pos, 5);
                // boost.shared_ptr < FilthNode > 
                let filth = GameMap.i.GetFilth(candidate).lock();
                if (filth && filth.Depth() > 0 && GameMap.i.IsWalkable(candidate))
                    return candidate;
            }
        }

        //Then around the camp center (a pretty good place to find filth most of the time)
        for (let i = 0; i < 10; ++i) {
            let candidate = Random.ChooseInRadius(Camp.i.Center(), 5);
            // boost.shared_ptr < FilthNode > 
            let filth = GameMap.i.GetFilth(candidate).lock();
            if (filth && filth.Depth() > 0 && GameMap.i.IsWalkable(candidate))
                return candidate;
        }

        //If we still haven't found filth just choose the closest filth out of 30 at random
        // std.vector < boost.weak_ptr < FilthNode > >
        let filthArray = (this.filthNodes.begin(), this.filthNodes.end());
        let closest = Coordinate.undefinedCoordinate;
        let closest_distance = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < Math.min(30, filthArray.size()); ++i) {
            // boost.weak_ptr < FilthNode > 
            let filth = Random.i.ChooseElement(filthArray);
            // boost.shared_ptr < FilthNode >
            let candidate = filth.lock();
            if (candidate) {
                let distance = Coordinate.Distance(pos, candidate.Position());
                if (candidate.Depth() > 0 && GameMap.i.IsWalkable(candidate.Position()) && distance < closest_distance) {
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
        for (let wati = this.waterList.begin(); wati !== this.waterList.end(); ++wati) {
            let water = wati.lock();
            if (water) {
                if (water.IsCoastal() && water.Depth() > Constants.DRINKABLE_WATER_DEPTH) {
                    let waterDistance = Coordinate.Distance(water.Position(), pos);
                    //Favor water inside territory
                    if (GameMap.i.IsTerritory(water.Position())) waterDistance /= 4;
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
        ++this.time;

        if (this.time >= Constants.MONTH_LENGTH) {
            this.time -= Constants.MONTH_LENGTH; // Decrement time now to avoid autosaving issues.
            Stats.i.AddPoints(10);

            if (this.safeMonths > 0) --this.safeMonths;

            for (let cons = this.staticConstructionMap.begin(); cons !== this.staticConstructionMap.end(); ++cons) {
                cons.second.SpawnRepairJob();
            }
            for (let cons = this.dynamicConstructionMap.begin(); cons !== this.dynamicConstructionMap.end(); ++cons) {
                cons.second.SpawnRepairJob();
            }

            if (this.season < Season.LateWinter) 
                this.season = (this.season + 1);
            else 
                this.season = Season.EarlySpring;

            switch (this.season) {
                case Season.EarlySpring:
                    Announce.i.AddMsg("Spring has begun");
                    ++this.age;
                    if (Config.i.GetCVar("bool", "autosave")) {
                        let saveName = "autosave" + String(this.age % 2 ? "1" : "2");
                        if (Data.i.SaveGame(saveName, false))
                            Announce.i.AddMsg("Autosaved");
                        else
                            Announce.i.AddMsg("Failed to autosave! Refer to the logfile", TCODColor.red);
                    }
                case Season.Spring:
                case Season.LateSpring:
                    this.this.SpawnTillageJobs();
                case Season.Summer:
                case Season.LateSummer:
                case Season.Fall:
                case Season.LateFall:
                case Season.Winter:
                    this.DecayItems();
                    break;

                case Season.LateWinter:
                    break;

                case Season.EarlySummer:
                    Announce.i.AddMsg("Summer has begun");
                    this.DecayItems();
                    break;

                case Season.EarlyFall:
                    Announce.i.AddMsg("Fall has begun");
                    this.DecayItems();
                    break;

                case Season.EarlyWinter:
                    Announce.i.AddMsg("Winter has begun");
                    this.DeTillFarmPlots();
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
        for (let watIt = 0; watIt < this.waterList.length; watIt++) {
            let water = this.waterList[0].lock();
            if (water) {
                if (Random.i.Generate(49) === 0 && water.Update()) {
                    this.RemoveWater(water.Position(), false);
                    watIt = this.waterList.split(watIt,1);
                } else {
                    ++watIt;
                }
            } else {
                watIt = this.waterList.splice(watIt,1);
            }
        }

        //Updating the last 10 waternodes each time means that recently created water moves faster.
        //This has the effect of making water rush to new places such as a moat very quickly, which is the
        //expected behaviour of water.
        if (this.waterList.length > 0) {
            //We have to use two iterators, because wati may be invalidated if the water evaporates and is removed
            // std.list < boost.weak_ptr < WaterNode > > .iterator 
            let wati = this.waterList.length;
            // std.list < boost.weak_ptr < WaterNode > > .iterator 
            let nextwati = --wati;
            while ((this.waterList.length - wati) < 10) {
                --nextwati;
                if (wati === this.waterList.length) break;
                if (wati[0].lock()) 
                    wati[0].lock().Update();
                wati = nextwati;
            }
        }

        // std.list < boost.weak_ptr < NPC > > 
        let npcsWaitingForRemoval;
        for (let npci = this.npcMap.begin(); npci !== this.npcMap.end(); ++npci) {
            npci.second.Update();
            if (!npci.second.Dead()) npci.second.Think();
            if (npci.second.Dead() || npci.second.Escaped()) npcsWaitingForRemoval.push(npci.second);
        }
        JobManager.AssignJobs();

        for (let remNpci = npcsWaitingForRemoval.begin(); remNpci !== npcsWaitingForRemoval.end(); ++remNpci) {
            this.RemoveNPC(remNpci);
        }

        for (let consi = this.dynamicConstructionMap.begin(); consi !== this.dynamicConstructionMap.end(); ++consi) {
            consi.second.Update();
        }

        for (let itemi = this.stoppedItems.begin(); itemi !== this.stoppedItems.end();) {
            this.flyingItemsSet.erase(itemi);
            let item = itemi.lock();
            if (item) {
                if (item.condition === 0) { //The impact has destroyed the item
                    this.RemoveItem(item);
                }
            }
            itemi = this.stoppedItems.erase(itemi);
        }

        for (let itemi = this.flyingItemsSet.begin(); itemi !== this.flyingItemsSet.end(); ++itemi) {
            let item = itemi.lock();
            if (item) item.UpdateVelocity();
        }

        /*Constantly checking our free item list for items that can be stockpiled is overkill, so it's done once every
        5 seconds, on average, or immediately if a new stockpile is built or a stockpile's allowed items are changed.
        To further reduce load when very many free items exist, only a quarter of them will be checked*/
        if (Random.i.Generate(Constants.UPDATES_PER_SECOND * 5 - 1) === 0 || this.refreshStockpiles) {
            this.refreshStockpiles = false;
            if (this.freeItemsSet.size < 100) {
                for (let itemi of this.freeItemsSet.values()) {
                    let item = itemi.lock();
                    if (item) {
                        if (!item.Reserved() && item.GetFaction() === Constants.PLAYERFACTION && item.GetVelocity() === 0)
                            this.StockpileItem(item);
                    }
                }
            } else {
                for (let i = 0; i < Math.max(100, this.freeItemsSet.size / 4); ++i) {
                    //std.set < boost.weak_ptr < Item > > .iterator 
                    let itemi = Random.i.ChooseIndex(this.freeItemsSet.values());
                    let item = itemi.lock();
                    if (item) {
                        if (!item.Reserved() && item.GetFaction() === Constants.PLAYERFACTION && item.GetVelocity() === 0)
                            this.StockpileItem(item);
                    }
                }
            }
        }

        //Squads needen't update their member rosters ALL THE TIME
        if (this.time % (Constants.UPDATES_PER_SECOND * 1) === 0) {
            for (let squadi = this.squadMap.begin(); squadi !== this.squadMap.end(); ++squadi) {
                squadi.second.UpdateMembers();
            }
        }

        if (this.time % (Constants.UPDATES_PER_SECOND * 1) === 0) StockManager.Update();

        if (this.time % (Constants.UPDATES_PER_SECOND * 1) === 0) JobManager.Update();

        this.events.Update(this.safeMonths > 0);

        GameMap.i.Update();

        if (this.time % (Constants.UPDATES_PER_SECOND * 1) === 0) Camp.i.Update();

        for (let delit = this.delays.begin(); delit !== this.delays.end();) {
            if (--delit.first <= 0) {
                try {
                    delit.second();
                } catch (e) {
                    Script.LogException();
                }
                delit = this.delays.erase(delit);
            } else ++delit;
        }

        if (!this.gameOver && this.orcCount === 0 && this.goblinCount === 0) {
            this.gameOver = true;
            //Game over, display stats
            this.DisplayStats();
            MessageBox.ShowMessageBox("Do you wish to keep watching?", null, "Keep watching", () => this.GameOver(), "Quit");
        }

        for (let fireit = this.fireNodes.begin(); fireit !== this.fireNodes.end();) {
            let fire = fireit.lock();
            if (fire) {
                if (Random.i.GenerateBool()) fire.Update();
                if (fire.GetHeat() <= 0) {
                    GameMap.i.SetFire(fire.Position(), null);
                    fireit = this.fireNodes.erase(fireit);
                } else {
                    ++fireit;
                }
            } else {
                fireit = this.fireNodes.erase(fireit);
            }
        }

        for (let spellit = this.spells.begin(); spellit !== this.spells.end();) {
            if ((spellit).IsDead()) {
                spellit = this.spells.erase(spellit);
            } else {
                (spellit).UpdateVelocity();
                ++spellit;
            }
        }

        for (let i = 1; i < Faction.factions.length; ++i) {
            Faction.factions[i].Update();
        }
    }

    StockpileItem(witem, returnJob, disregardTerritory, reserveItem) {
        let item = witem.lock();
        if (item) {
            if ((!reserveItem || !item.Reserved()) && item.GetFaction() === Constants.PLAYERFACTION) {
                // boost.shared_ptr < Stockpile > 
                let nearest = null; //boost.shared_ptr < Stockpile > ();
                //first = primary distance, second = secondary
                let nearestDistance = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
                let itemType = item.Type();
                let useDemand = false;

                /* If this is a container and it contains items, then stockpile it based on the items inside
                instead of the container's type */
                // boost.shared_ptr < Container > 
                let containerItem = item;
                if (containerItem && !containerItem.empty()) {
                    let innerItem = containerItem.GetFirstItem().lock();
                    if (innerItem) {
                        itemType = innerItem.Type();
                    }
                } else if (containerItem) useDemand = true; //Empty containers are stored based on demand

                for (let stocki = this.staticConstructionMap.begin(); stocki !== this.staticConstructionMap.end(); ++stocki) {
                    if (stocki.second.stockpile) {
                        let sp = stocki.second;
                        if (sp.Allowed(Item.Presets[itemType].specificCategories) && !sp.Full(itemType)) {

                            //Found a stockpile that both allows the item, and has space
                            //Assuming that containers only have one specific category
                            // ItemCategory category 
                            let category = Item.Presets[item.Type()].specificCategories.begin();
                            let distance = useDemand ?
                                (Number.MAX_SAFE_INTEGER - 2) - sp.GetDemand(category) :
                                Coordinate.Distance(sp.Center(), item.Position());

                            if (distance < nearestDistance.first) {
                                nearestDistance.first = distance;
                                nearest = sp;
                                if (useDemand) nearestDistance.second = Coordinate.Distance(sp.Center(), item.Position());
                            } else if (useDemand && distance === nearestDistance.first) {
                                let realDistance = Coordinate.Distance(sp.Center(), item.Position());
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
                    if (item.IsCategory(Item.StringToItemCategory("Food"))) priority = JobPriority.HIGH;
                    else {
                        let stockDeficit = StockManager.TypeQuantity(itemType) / StockManager.Minimum(itemType);
                        if (stockDeficit >= 1.0) priority = JobPriority.LOW;
                        else if (stockDeficit > 0.25) priority = JobPriority.MED;
                        else priority = JobPriority.HIGH;
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
                        container = nearest.FindItemByCategory(Item.Presets[item.Type()].fitsin, Constants.NOTFULL, item.GetBulk());
                        if (container.lock()) {
                            target = container.lock().Position();
                            stockJob.ReserveSpace( (container.lock()), item.GetBulk());
                        }
                    }

                    if (target.X() === -1) target = nearest.FreePosition();

                    if (target.X() !== -1) {
                        stockJob.ReserveSpot(nearest, target, item.Type());
                        if (reserveItem) stockJob.ReserveEntity(item);
                        stockJob.tasks.push(new Task(Action.MOVE, item.Position()));
                        stockJob.tasks.push(new Task(Action.TAKE, item.Position(), item));
                        stockJob.tasks.push(new Task(Action.MOVE, target));
                        if (!container.lock())
                            stockJob.tasks.push(new Task(Action.PUTIN, target, nearest.Storage(target)));
                        else
                            stockJob.tasks.push(new Task(Action.PUTIN, target, container));

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
        return this.renderer.TileAt(pixelX, pixelY, this.camX, this.camY);
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
                if (Globals.DEBUG) {
                    console.log( "!!! null POINTER !!! " , name , " ; id " , it.first );
                } 
                let tmp = it;
                ++it;
                map.erase(tmp);
            }
        }
    }
    // }

    Draw(the_console, focusX, focusY, drawUI, posX, posY, sizeX, sizeY) {
        the_console.setBackgroundFlag(TCOD_bkgnd_flag_t.TCOD_BKGND_SET);
        if (sizeX === -1) {
            sizeX = the_console.getWidth();
        }
        if (sizeY === -1) {
            sizeY = the_console.getHeight();
        }
        let charX, charY;
        TCODSystem.getCharSize(charX, charY);
        this.renderer.DrawMap(GameMap.i, focusX, focusY, posX * charX, posY * charY, sizeX * charX, sizeY * charY);

        if (drawUI) {
            UI.i.Draw(the_console);
        }
    }

    FlipBuffer() {
        TCODConsole.blit(this.buffer, 0, 0, this.screenWidth, this.screenHeight, TCODConsole.root, 0, 0);
        TCODConsole.root.flush();
    }

    CurrentSeason() {
        return this.season;
    }

    SpawnTillageJobs() {
        for (let consi = this.dynamicConstructionMap.begin(); consi !== this.dynamicConstructionMap.end(); ++consi) {
            if (consi.second.farmplot) {
                let tillJob = (new Job("Till farmplot"));
                tillJob.tasks.push(new Task(Action.MOVE, consi.second.Position()));
                tillJob.tasks.push(new Task(Action.USE, consi.second.Position(), consi.second));
                JobManager.AddJob(tillJob);
            }
        }
    }

    DeTillFarmPlots() {
        for (let consi = this.dynamicConstructionMap.begin(); consi !== this.dynamicConstructionMap.end(); ++consi) {
            if (consi.second.farmplot) {
                (consi.second).tilled = false;
            }
        }
    }

    //First generates a heightmap, then translates that into the corresponding tiles
    //Third places plantlife according to heightmap, and some wildlife as well
    GenerateMap(seed) {
        let random = new Random.Generator(seed);

        let map = GameMap.i;
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
        } while (Math.sqrt(Math.pow(px[0] - px[3], 2) + Math.pow(py[0] - py[3], 2)) < 100);

        let depth = Config.i.GetCVar("riverDepth");
        let width = Config.i.GetCVar("riverWidth");
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
                Direction.WEST,
                Direction.EAST,
                Direction.NORTH,
                Direction.SOUTH
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
                    map.heightMap.addHill(centers[i].X(),centers[i].Y(), (height), (radius));
                }
                ++hills;
            }

            ++infinityCheck;
        }

        {
            // std.auto_ptr < TCODRandom > 
            let tcodRandom = new TCODRandom(random.GetSeed());
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
                            map.ResetType(p, TileType.TILEDITCH);
                            tileChosen = true;
                            break;
                        }
                    }
                    if (!tileChosen) {
                        for (let iy = y - 3; iy <= y + 3; ++iy) {
                            let ip = new Coordinate(x, iy);
                            if (map.IsInside(ip) && map.heightMap.getValue(x, iy) >= map.GetWaterlevel()) {
                                map.ResetType(p, TileType.TILEDITCH);
                                tileChosen = true;
                                break;
                            }
                        }
                    }
                    if (!tileChosen) 
                        map.ResetType(p, TileType.TILERIVERBED);
                    this.CreateWater(p, Constants.RIVERDEPTH);
                } else if (height < 4.5) {
                    map.ResetType(p, TileType.TILEGRASS);
                } else {
                    map.ResetType(p, TileType.TILEROCK);
                }
            }
        }

        //Create a bog
        infinityCheck = 0;
        while (infinityCheck < 1000) {
            let candidate = random.ChooseInRectangle(Coordinate.zeroCoordinate + 30, map.Extent() - 30);
            let riverDistance = 70;
            let dirs = [
                Direction.WEST,
                Direction.EAST,
                Direction.NORTH,
                Direction.SOUTH
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
                    let range = Math.floor(Math.sqrt()(25 * 25 - xOffset * xOffset));
                    lowOffset = Math.min(Math.max(random.Generate(-1, 1) + lowOffset, -5), 5);
                    highOffset = Math.min(Math.max(random.Generate(-1, 1) + highOffset, -5), 5);
                    for (let yOffset = -range - lowOffset; yOffset < range + highOffset; ++yOffset) {
                        map.ResetType(candidate + Coordinate(xOffset, yOffset), TileType.TILEBOG);
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
                let natUid = GameMap.i.GetNatureObject(Coordinate(x, y));
                if (natUid >= 0) {
                    // boost.shared_ptr < NatureObject > 
                    let natObj = this.natureList[natUid];
                    if (natObj && natObj.Tree() && !natObj.Marked()) {
                        natObj.Mark();
                        let fellJob = (new Job("Fell tree", JobPriority.MED, 0, true));
                        fellJob.Attempts(50);
                        fellJob.ConnectToEntity(natObj);
                        fellJob.DisregardTerritory();
                        fellJob.SetRequiredTool(Item.StringToItemCategory("Axe"));
                        fellJob.tasks.push(new Task(Action.MOVEADJACENT, natObj.Position(), natObj));
                        fellJob.tasks.push(new Task(Action.FELL, natObj.Position(), natObj));
                        JobManager.AddJob(fellJob);
                    }
                }
            }
        }
    }

    DesignateTree(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let natUid = GameMap.i.GetNatureObject(Coordinate(x, y));
                if (natUid >= 0) {
                    // boost.shared_ptr < NatureObject > 
                    let natObj = this.natureList[natUid];
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
                let natUid = GameMap.i.GetNatureObject(Coordinate(x, y));
                if (natUid >= 0) {
                    // boost.shared_ptr < NatureObject > 
                    let natObj = this.natureList[natUid];
                    if (natObj && natObj.Harvestable() && !natObj.Marked()) {
                        natObj.Mark();
                        let harvestJob = new Job("Harvest wild plant");
                        harvestJob.ConnectToEntity(natObj);
                        harvestJob.DisregardTerritory();
                        harvestJob.tasks.push(new Task(Action.MOVEADJACENT, natObj.Position(), natObj));
                        harvestJob.tasks.push(new Task(Action.HARVESTWILDPLANT, natObj.Position(), natObj));
                        if (NatureObject.Presets[natObj.Type()].components.size() > 0)
                            harvestJob.tasks.push(new Task(Action.STOCKPILEITEM));
                        JobManager.AddJob(harvestJob);
                    }
                }
            }
        }
    }

    RemoveNatureObject(...args){
        if(args.length === 2)
            return this.RemoveNatureObject_coordinate_coordinate(args[0],args[1]);
        else
            return this.RemoveNatureObject_natureobject(args[0]);
    }

    RemoveNatureObject_coordinate_coordinate(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                let uid = GameMap.i.GetNatureObject(p);
                if (uid >= 0) {
                    GameMap.i.SetNatureObject(p, -1);
                    this.natureList.erase(uid);
                }
            }
        }
    }

    RemoveNatureObject_natureobject(natObj) {
        if (natObj.lock()) {
            GameMap.i.SetNatureObject(natObj.lock().Position(), -1);
            this.natureList.erase(natObj.lock().Uid());
        }
    }

    CheckTileType(type, target, size) {
        for (let x = target.X(); x < target.X() + size.X(); ++x) {
            for (let y = target.Y(); y < target.Y() + size.Y(); ++y) {
                if (GameMap.i.GetType(Coordinate(x, y)) === type) return true;
            }
        }
        return false;
    }

    DesignateBog(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (GameMap.i.GetType(p) === TileType.TILEBOG) {
                    StockManager.i.UpdateBogDesignations(p, true);
                    GameMap.i.Mark(p);
                }
            }
        }
    }

    Undesignate(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                let natUid = GameMap.i.GetNatureObject(p);
                if (natUid >= 0) {
                    // boost.weak_ptr < NatureObject > 
                    let natObj = this.natureList[natUid];
                    if (natObj.lock() && natObj.lock().Tree() && natObj.lock().Marked()) {
                        //TODO: Implement proper map marker system and change this to use that
                        natObj.lock().Unmark();
                        StockManager.UpdateTreeDesignations(natObj, false);
                        // Might be designated as "Fell Trees" with jobs pending.
                        JobManager.RemoveJob(Action.FELL, p);
                    }
                    // Need to be able to undesignate harvesting wild plants too.
                    if (natObj.lock() && natObj.lock().Harvestable() && natObj.lock().Marked()) {
                        natObj.lock().Unmark();
                        JobManager.RemoveJob(Action.HARVESTWILDPLANT, p);
                    }
                }

                if (GameMap.i.GetType(p) === TileType.TILEBOG) {
                    StockManager.UpdateBogDesignations(p, false);
                    GameMap.i.Unmark(p);
                }
                if (GameMap.i.GroundMarked(p)) {
                    JobManager.RemoveJob(Action.DIG, p); //A dig job may exist for this tile
                    Camp.i.RemoveWaterZone(p, p); //May be marked for water
                }
            }
        }
    }

    SeasonToString(season) {
        switch (season) {
            case Season.EarlySpring:
                return "Early Spring";
            case Season.Spring:
                return "Spring";
            case Season.LateSpring:
                return "Late Spring";
            case Season.EarlySummer:
                return "Early Summer";
            case Season.Summer:
                return "Summer";
            case Season.LateSummer:
                return "Late Summer";
            case Season.EarlyFall:
                return "Early Fall";
            case Season.Fall:
                return "Fall";
            case Season.LateFall:
                return "Late Fall";
            case Season.EarlyWinter:
                return "Early Winter";
            case Season.Winter:
                return "Winter";
            case Season.LateWinter:
                return "Late Winter";
            default:
                return "???";
        }
    }

    DecayItems() {
        let eraseList = [];
        let creationList = [];
        for (let itemit = this.itemMap.begin(); itemit !== this.itemMap.end();) {

            if (itemit.second === 0) { // Now, how did we get a null pointer in here..
                itemit = this.itemMap.erase(itemit); // Get it out of the list!
                if (itemit === this.itemMap.end()) break;
            }

            if (itemit.second.decayCounter > 0) {
                if (--itemit.second.decayCounter === 0) {
                    for (let decaylisti = Item.Presets[itemit.second.type].decayList.begin(); decaylisti !== Item.Presets[itemit.second.type].decayList.end(); ++decaylisti) {
                        creationList.push(decaylisti, itemit.second.Position());
                    }
                    eraseList.push(itemit.first);
                }
            }
            ++itemit;
        }

        for (let delit = eraseList.begin(); delit !== eraseList.end(); ++delit) {
            this.RemoveItem(this.GetItem(delit));
        }

        for (let crit = creationList.begin(); crit !== creationList.end(); ++crit) {
            if (crit.first >= 0) {
                this.CreateItem(crit.second, crit.first, false);
            } else {
                this.CreateFilth(crit.second);
            }
        }

        for (let bli = this.bloodNodes.begin(); bli !== this.bloodNodes.end();) {
            let blood = bli.lock();
            if (blood) {
                blood.Depth(blood.Depth() - 50);
                if (blood.Depth() <= 0) {
                    GameMap.i.SetBlood(blood.Position(), null);
                    bli = this.bloodNodes.erase(bli);
                } else ++bli;
            } else {
                bli = this.bloodNodes.erase(bli);
            }
        }
    }

    CreateFilth(pos, amount = 1) {
        Stats.i.FilthCreated(amount);
        if (GameMap.i.IsInside(pos)) {
            let loops = -1;
            while (amount > 0 && loops < 1000) {
                ++loops;
                // boost.shared_ptr < WaterNode > 
                let water = GameMap.i.GetWater(pos).lock();

                if (water) { //If water exists here just add the filth there, no need for filthnodes
                    water.AddFilth(amount);
                    return;
                }

                // boost.weak_ptr < FilthNode > 
                let filth = (GameMap.i.GetFilth(pos));
                if (!filth.lock()) { //No existing filth node so create one
                    // boost.shared_ptr < FilthNode > 
                    let newFilth = (new FilthNode(pos, Math.min(5, amount)));
                    amount -= 5;
                    this.filthNodes.push(newFilth);
                    GameMap.i.SetFilth(pos, newFilth);
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
                    switch (GameMap.i.GetFlow(pos)) {
                        case Direction.NORTH:
                            flowTo.Y(flowTo.Y() - diff);
                            flowTo.X(flowTo.X() + Random.i.Generate(-diff, diff));
                            break;

                        case Direction.NORTHEAST:
                            if (Random.i.GenerateBool()) {
                                flowTo.Y(flowTo.Y() - diff);
                                flowTo.X(flowTo.X() + Random.i.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.i.Generate(-diff, 0));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case Direction.NORTHWEST:
                            if (Random.i.GenerateBool()) {
                                flowTo.Y(flowTo.Y() - diff);
                                flowTo.X(flowTo.X() - Random.i.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.i.Generate(-diff, 0));
                                flowTo.X(flowTo.X() - diff);
                            }
                            break;

                        case Direction.SOUTH:
                            flowTo.Y(flowTo.Y() + diff);
                            flowTo.X(flowTo.X() + Random.i.Generate(-diff, diff));
                            break;

                        case Direction.SOUTHEAST:
                            if (Random.i.GenerateBool()) {
                                flowTo.Y(flowTo.Y() + diff);
                                flowTo.X(flowTo.X() + Random.i.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.i.Generate(0, diff));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case Direction.SOUTHWEST:
                            if (Random.i.GenerateBool()) {
                                flowTo.Y(flowTo.Y() + diff);
                                flowTo.X(flowTo.X() + Random.i.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.i.Generate(0, diff));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case Direction.WEST:
                            flowTo.Y(flowTo.Y() + Random.i.Generate(-diff, diff));
                            flowTo.X(flowTo.X() - diff);
                            break;

                        case Direction.EAST:
                            flowTo.Y(flowTo.Y() + Random.i.Generate(-diff, diff));
                            flowTo.X(flowTo.X() + diff);
                            break;

                        default:
                            break;
                    }

                    while (flowTo === pos) {
                        flowTo = Coordinate(pos.X() + Random.i.Generate(-diff, diff), pos.Y() + Random.i.Generate(-diff, diff));
                    }
                    pos = flowTo;

                    //If the filth flows off-map just stop creating more
                    if (!GameMap.i.IsInside(flowTo)) {
                        Stats.FilthFlowsOffEdge(amount);
                        return;
                    }
                }
            }
        }
    }

    CreateBlood(pos, amount = 100) {
        if (GameMap.i.IsInside(pos)) {
            let loops = -1;
            while (amount > 0 && loops < 1000) {
                ++loops;

                let blood = (GameMap.i.GetBlood(pos));
                if (!blood.lock()) { //No existing BloodNode so create one
                    let newBlood = (new BloodNode(pos, Math.min(255, amount)));
                    amount -= 255;
                    this.bloodNodes.push(newBlood);
                    GameMap.i.SetBlood(pos, newBlood);
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
                    switch (GameMap.i.GetFlow(pos)) {
                        case Direction.NORTH:
                            flowTo.Y(flowTo.Y() - diff);
                            flowTo.X(flowTo.X() + Random.i.Generate(-diff, diff));
                            break;

                        case Direction.NORTHEAST:
                            if (Random.i.GenerateBool()) {
                                flowTo.Y(flowTo.Y() - diff);
                                flowTo.X(flowTo.X() + Random.i.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.i.Generate(-diff, 0));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case Direction.NORTHWEST:
                            if (Random.i.GenerateBool()) {
                                flowTo.Y(flowTo.Y() - diff);
                                flowTo.X(flowTo.X() - Random.i.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.i.Generate(-diff, 0));
                                flowTo.X(flowTo.X() - diff);
                            }
                            break;

                        case Direction.SOUTH:
                            flowTo.Y(flowTo.Y() + diff);
                            flowTo.X(flowTo.X() + Random.i.Generate(-diff, diff));
                            break;

                        case Direction.SOUTHEAST:
                            if (Random.i.GenerateBool()) {
                                flowTo.Y(flowTo.Y() + diff);
                                flowTo.X(flowTo.X() + Random.i.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.i.Generate(0, diff));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case Direction.SOUTHWEST:
                            if (Random.i.GenerateBool()) {
                                flowTo.Y(flowTo.Y() + diff);
                                flowTo.X(flowTo.X() + Random.i.Generate(0, diff));
                            } else {
                                flowTo.Y(flowTo.Y() + Random.i.Generate(0, diff));
                                flowTo.X(flowTo.X() + diff);
                            }
                            break;

                        case Direction.WEST:
                            flowTo.Y(flowTo.Y() + Random.i.Generate(-diff, diff));
                            flowTo.X(flowTo.X() - diff);
                            break;

                        case Direction.EAST:
                            flowTo.Y(flowTo.Y() + Random.i.Generate(-diff, diff));
                            flowTo.X(flowTo.X() + diff);
                            break;

                        default:
                            break;
                    }

                    while (flowTo === pos) {
                        flowTo = new Coordinate(pos.X() + Random.i.Generate(-diff, diff), pos.Y() + Random.i.Generate(-diff, diff));
                    }
                    pos = flowTo;

                    //If the blood flows off-map just stop creating more
                    if (!GameMap.i.IsInside(flowTo)) {
                        return;
                    }
                }
            }
        }

    }

    Pause() {
        this.paused = !this.paused;
    }

    Paused() {
        return this.paused;
    }

    CharHeight() {
        return this.charHeight;
    }
    CharWidth() {
        return this.charWidth;
    }

    RemoveNPC(wnpc) {
        let npc = wnpc.lock();
        if (npc) {
            this.npcMap.erase(npc.uid);
            let faction = npc.GetFaction();
            if (faction >= 0 && faction < (Faction.factions.length))
                Faction.factions[faction].RemoveMember(npc);
        }
    }

    FindMilitaryRecruit() {
        // Holder for orc with most/full health
        // boost.shared_ptr < NPC > 
        let strongest;
        for (let npci = this.npcMap.begin(); npci !== this.npcMap.end(); ++npci) {
            if (npci.second.type === NPC.StringToNPCType("orc") && npci.second.faction === Constants.PLAYERFACTION) {
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
        this.squadMap.insert((name, (new Squad(name))));
    }

    SetSquadTargetCoordinate(order, target, squad, autoClose) {
        squad.AddOrder(order);
        squad.AddTargetCoordinate(target);
        if (autoClose) 
            UI.i.CloseMenu();
        Announce.i.AddMsg(`[${squad.Name()}] guarding position (${target.X()},${target.Y()})`, TCODColor.white, target);
        GameMap.i.AddMarker(new MapMarker(MarkerType.FLASHINGMARKER, 'X', target,Constants.UPDATES_PER_SECOND * 5, TCODColor.azure));
    }
    SetSquadTargetEntity(order, target, squad) {
        if (GameMap.i.IsInside(target)) {
            let list = GameMap.i.NPCList(target);
            if (!list.empty()) {
                squad.AddOrder(order);
                squad.AddTargetEntity(list[list.begin()]);
                UI.i.CloseMenu();
                Announce.i.AddMsg(`[${squad.Name()}%] following ${list[list.begin()].Name()}`, TCODColor.white, target);
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
            uids.push(this.CreateNPC(Random.ChooseInRectangle(low, high), type));
        return uids;
    }

    DiceToInt(dice) {
        return Random.Dice(dice).Roll();
    }

    ToMainMenu(value) {
        if(value !== undefined)
            this.toMainMenu = value;
        return this.toMainMenu;
    }

    Running(value) {
        if(value !== undefined)
            this.running = value;
        return this.running;
    }

    FindConstructionByTag(tag, closeTo) {

        let distance = -1;
        // boost.weak_ptr < Construction >
        let foundConstruct;

        for (let stati = this.staticConstructionMap.begin(); stati !== this.staticConstructionMap.end(); ++stati) {
            if (!stati.second.Reserved() && stati.second.HasTag(tag)) {
                if (closeTo.X() === -1)
                    return stati.second;
                else {
                    if (distance === -1 || Coordinate.Distance(closeTo, stati.second.Position()) < distance) {
                        distance = Coordinate.Distance(closeTo, stati.second.Position());
                        foundConstruct = stati.second;
                        if (distance < 5) return foundConstruct;
                    }
                }
            }
        }

        if (foundConstruct.lock()) return foundConstruct;

        for (let dynai = this.dynamicConstructionMap.begin(); dynai !== this.dynamicConstructionMap.end(); ++dynai) {
            if (!dynai.second.Reserved() && dynai.second.HasTag(tag)) {
                if (closeTo.X() === -1)
                    return dynai.second;
                else {
                    if (distance === -1 || Coordinate.Distance(closeTo, dynai.second.Position()) < distance) {
                        distance = Coordinate.Distance(closeTo, dynai.second.Position());
                        foundConstruct = dynai.second;
                        if (distance < 5) 
                            return foundConstruct;
                    }
                }
            }
        }

        return foundConstruct;
    }

    Reset() {
        //TODO: ugly
        this.npcMap = [];
        this.natureList = []; //Ice decays into ice objects and water, so clear this before items and water
        this.itemMap = []; //Destroy current items, that way ~Construction() won't have items to try and stockpile

        this.staticConstructionMap.clear();
        this.dynamicConstructionMap.clear();

        GameMap.i.Reset();
        JobManager.i.Reset();
        StockManager.i.Reset();
        Announce.i.Reset();
        Camp.i.Reset();
        for (let i = 0; i < Faction.factions.length; ++i) {
            Faction.factions[i].Reset();
        }
        Stats.i.Reset();

        delete StockManagerDialog.i.stocksDialog;
        StockManagerDialog.i.stocksDialog = 0;

        delete Menu.i.mainMenu;
        Menu.i.mainMenu = 0;

        delete Menu.i.territoryMenu;
        Menu.i.territoryMenu = 0;

        UI.i.Reset();

    }

    GetRandomNPCTypeByTag(tag) {
        // std.vector < NPCType >
        let foundList = []; 
        for (let i = 0; i < NPC.Presets.size(); ++i) {
            if (NPC.Presets[i].tags.find(tag.toLowerCase() !== NPC.Presets[i].tags.end())) {
                foundList.push(i);
            }
        }
        if (foundList.size() > 0)
            return Random.ChooseElement(foundList);
        return -1;
    }

    CenterOn(target) {
        this.camY = target.Y() + 0.5;
        this.camX = target.X() + 0.5;
    }

    MoveCam(x, y) {
        this.camX = Math.min(Math.max(x * this.renderer.ScrollRate() + this.camX, 0.0), GameMap.i.Width() + 1.0);
        this.camY = Math.min(Math.max(y * this.renderer.ScrollRate() + this.camY, 0.0), GameMap.i.Height() + 1.0);
    }

    SetMark(i) {
        this.marks[i] = new Coordinate(Math.floor(this.camX), Math.floor(this.camY));
        Announce.i.AddMsg("Mark set");
    }

    ReturnToMark(i) {
        this.camX = this.marks[i].X() + 0.5;
        this.camY = this.marks[i].Y() + 0.5;
    }

    TranslateContainerListeners() {
        for (let it = this.itemMap.begin(); it !== this.itemMap.end(); ++it) {
            if (it.second) {
                (it.second).TranslateContainerListeners();
            }
        }
        for (let it = this.staticConstructionMap.begin(); it !== this.staticConstructionMap.end(); ++it) {
            if (it.second) {
                (it.second).TranslateInternalContainerListeners();
            }
        }
        for (let it = this.dynamicConstructionMap.begin(); it !== this.dynamicConstructionMap.end(); ++it) {
            if (it.second) {
                (it.second).TranslateInternalContainerListeners();
            }
        }
    }

    PeacefulFaunaCount(add) {
        if(Number.isFinite(add))
            this.peacefulFaunaCount += add;
        return this.peacefulFaunaCount;
    }

    DevMode() {
        return this.devMode;
    }
    EnableDevMode() {
        this.devMode = true;
    }

    Dig(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                /*TODO: Relying on GroundMarked() is iffy, it doesn't necessarily mean that that
                spot is reserved for digging. */
                let p = new Coordinate(x, y);
                let allowedTypes = new Set();
                allowedTypes.insert(TileType.TILEGRASS);
                allowedTypes.insert(TileType.TILEMUD);
                allowedTypes.insert(TileType.TILEBOG);
                allowedTypes.insert(TileType.TILESNOW);
                if (this.CheckPlacement(p, new Coordinate(1, 1), allowedTypes) && !GameMap.i.GroundMarked(p) && !GameMap.i.IsLow(p)) {
                    let digJob = (new Job("Dig"));
                    digJob.SetRequiredTool(Item.StringToItemCategory("Shovel"));
                    digJob.MarkGround(p);
                    digJob.Attempts(50);
                    digJob.DisregardTerritory();
                    digJob.tasks.push(new Task(Action.MOVEADJACENT, p));
                    digJob.tasks.push(new Task(Action.DIG, p));
                    JobManager.AddJob(digJob);
                }
            }
        }
    }

    CreateNatureObject_coordinate_int(pos, surroundingNatureObjects) {
        if (GameMap.i.IsWalkable(pos) && (GameMap.i.GetType(pos) === TileType.TILEGRASS || GameMap.i.GetType(pos) === TileType.TILESNOW) && Random.i.Generate(4) < 2) {
            // std.priority_queue < std.pair < int, int > > 
            let natureObjectQueue = [];
            let height = GameMap.i.heightMap.getValue(pos.X(), pos.Y());

            //Populate the priority queue with all possible plants and give each one a random
            //value based on their rarity
            let evil = GameMap.i.GetCorruption(pos) >= 100;
            for (let i = 0; i < NatureObject.Presets.size(); ++i) {
                if (NatureObject.Presets[i].minHeight <= height &&
                    NatureObject.Presets[i].maxHeight >= height &&
                    NatureObject.Presets[i].evil === evil &&
                    (NatureObject.Presets[i].tree === (surroundingNatureObjects < 4) || evil))
                    natureObjectQueue.push([Random.i.Generate(NatureObject.Presets[i].rarity - 1) + Random.i.Generate(2), i]);
            }

            if (natureObjectQueue.empty()) return;
            let chosen = natureObjectQueue.top().second;
            let rarity = NatureObject.Presets[chosen].rarity;
            if (Math.abs(height - NatureObject.Presets[chosen].minHeight) <= 0.01 ||
                Math.abs(height - NatureObject.Presets[chosen].maxHeight) <= 0.5) rarity = rarity - rarity / 5;
            if (Math.abs(height - NatureObject.Presets[chosen].minHeight) <= 0.005 ||
                Math.abs(height - NatureObject.Presets[chosen].maxHeight) <= 0.05) rarity /= 2;

            if (Random.i.Generate(50) < rarity) {
                for (let clus = 0; clus < NatureObject.Presets[chosen].cluster; ++clus) {
                    let a = GameMap.i.Shrink(Random.ChooseInRadius(pos, clus));
                    if (GameMap.i.IsWalkable(a) && (GameMap.i.GetType(a) === TileType.TILEGRASS || GameMap.i.GetType(a) === TileType.TILESNOW) &&
                        GameMap.i.GetNatureObject(a) < 0 && GameMap.i.GetConstruction(a) < 0) {
                        // boost.shared_ptr < NatureObject > 
                        let natObj = (new NatureObject(a, chosen));
                        this.natureList.insert((natObj.Uid(), natObj));
                        GameMap.i.SetNatureObject(a, natObj.Uid());
                        GameMap.i.SetWalkable(a, NatureObject.Presets[natObj.Type()].walkable);
                        GameMap.i.SetBuildable(a, false);
                        GameMap.i.SetBlocksLight(a, !NatureObject.Presets[natObj.Type()].walkable);
                    }
                }
            }
        }
    }
    CreateNatureObject(...args){
        if(typeof args[1] === "string")
            this.CreateNatureObject_coordinate_string(args[0],args[1]);
        else
            this.CreateNatureObject_coordinate_int(args[0],args[1]);
    }
    CreateNatureObject_coordinate_string(pos, name) {
        let natureObjectIndex = 0;
        for (let preseti = NatureObject.Presets.begin(); preseti !== NatureObject.Presets.end();
            ++preseti) {
            if (preseti.name.toLowerCase() === name.toLowerCase()) break;
            ++natureObjectIndex;
        }

        if (natureObjectIndex < NatureObject.Presets.size() &&
            iequals(NatureObject.Presets[natureObjectIndex].name, name)) {
            if (GameMap.i.IsInside(pos) && GameMap.i.GetNatureObject(pos) < 0 && GameMap.i.GetConstruction(pos) < 0) {
                let natObj;
                if (iequals(NatureObject.Presets[natureObjectIndex].name, "Ice"))
                    natObj.reset(new Ice(pos, natureObjectIndex));
                else
                    natObj.reset(new NatureObject(pos, natureObjectIndex));
                this.natureList.insert((natObj.Uid(), natObj));
                GameMap.i.SetNatureObject(pos, natObj.Uid());
                GameMap.i.SetWalkable(pos, NatureObject.Presets[natObj.Type()].walkable);
                GameMap.i.SetBuildable(pos, false);
                GameMap.i.SetBlocksLight(pos, !NatureObject.Presets[natObj.Type()].walkable);
            }
        }
    }


    TriggerAttack() {
        this.events.SpawnHostileMonsters();
    }
    TriggerMigration() {
        this.events.SpawnMigratingAnimals();
    }

    GatherItems(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (GameMap.i.IsInside(p)) {
                    for (let itemuid = GameMap.i.ItemList(p).begin(); itemuid !== GameMap.i.ItemList(p).end(); ++itemuid) {
                        this.StockpileItem(this.GetItem(itemuid), false, true);
                    }
                }
            }
        }
    }

    RemoveFilth(pos) {
        // boost.shared_ptr < FilthNode > 
        let filth = GameMap.i.GetFilth(pos).lock();
        if (filth) {
            for (let filthi = this.filthNodes.begin(); filthi !== this.filthNodes.end(); ++filthi) {
                if (filthi.lock() === filth) {
                    this.filthNodes.erase(filthi);
                    break;
                }
            }
            GameMap.i.SetFilth(pos, null); //boost.shared_ptr < FilthNode > ());
        }
    }

    RemoveWater(pos, removeFromList) {
        // boost.shared_ptr < WaterNode > 
        let water = GameMap.i.GetWater(pos).lock();
        if (water) {
            if (removeFromList) {
                for (let wateri = this.waterList.begin(); wateri !== this.waterList.end(); ++wateri) {
                    if (wateri.lock() === water) {
                        this.waterList.erase(wateri);
                        break;
                    }
                }
            }
            let filth = water.GetFilth();
            GameMap.i.SetWater(pos, null); //boost.shared_ptr < WaterNode > ());
            if (filth > 0) 
                this.CreateFilth(pos, filth);
        }
    }

    Damage(pos) {
        let attack = new Attack();
        attack.Type(DamageType.DAMAGE_MAGIC);
        let dice = new Random.Dice();
        dice.nb_rolls = 10;
        dice.nb_faces = 10;
        dice.addsub = 1000;
        attack.AddDamage(dice);

        // boost.shared_ptr < Construction > 
        let construction = this.GetConstruction(GameMap.i.GetConstruction(pos)).lock();
        if (construction) {
            construction.Damage(attack);
        }
        for (let npcuid = GameMap.i.NPCList(pos).begin(); npcuid !== GameMap.i.NPCList(pos).end(); ++npcuid) {
            let npc;
            if (this.npcMap.find(npcuid) !== this.npcMap.end()) npc = this.npcMap[npcuid];
            if (npc) npc.Damage(attack);
        }
    }

    AddDelay(delay, callback) {
        this.delays.push((delay, callback));
    }

    GameOver() {
        this.running = false;
    }


    CreateFire(pos, temperature = 10) {
        if (this.fireNodes.empty()) {
            Announce.i.AddMsg("Fire!", TCODColor.red, pos);
            if (Config.i.GetCVar("bool", "pauseOnDanger"))
                this.AddDelay(Constants.UPDATES_PER_SECOND, () => this.Pause);
        }

        // boost.weak_ptr < FireNode > 
        let fire = (GameMap.i.GetFire(pos));
        if (!fire.lock()) { //No existing firenode
            // boost.shared_ptr < FireNode > 
            let newFire = (new FireNode(pos, temperature));
            this.fireNodes.push(newFire);
            GameMap.i.SetFire(pos, newFire);
        } else {
            // boost.shared_ptr < FireNode > 
            let existingFire = fire.lock();
            if (existingFire) existingFire.AddHeat(temperature);
        }
    }

    CreateSpell(pos, type) {
        // boost.shared_ptr < Spell >
        let newSpell = (new Spell(pos, type));
        this.spells.push(newSpell);
        return newSpell;
    }

    CreateDitch(pos) {
        this.RemoveNatureObject(pos, pos);
        GameMap.i.SetLow(pos, true);
        GameMap.i.ChangeType(pos, TileType.TILEDITCH);
    }

    StartFire(pos) {
        // boost.shared_ptr < Job >
        let fireJob = (new Job("Start a fire", JobPriority.HIGH, 0, false));
        fireJob.Attempts(2);
        fireJob.DisregardTerritory();
        fireJob.tasks.push(new Task(Action.MOVEADJACENT, pos));
        fireJob.tasks.push(new Task(Action.STARTFIRE, pos));
        fireJob.AddMapMarker(new MapMarker(MarkerType.FLASHINGMARKER, 'F', pos, -1, TCODColor.red));
        JobManager.AddJob(fireJob);
    }

    GetAge() {
        return this.age;
    }

    UpdateFarmPlotSeedAllowances(type) {
        for (let cati = Item.Presets[type].categories.begin(); cati !== Item.Presets[type].categories.end();
            ++cati) {
            if (Item.Categories[cati].name.toLowerCase() === "seed") {
                for (let dynamicConsi = this.dynamicConstructionMap.begin(); dynamicConsi !== this.dynamicConstructionMap.end(); ++dynamicConsi) {
                    if (dynamicConsi.second.HasTag(ConstructionTag.FARMPLOT)) {
                        (dynamicConsi.second).AllowedSeeds().insert((type, false));
                    }
                }
            }
        }
    }

    //TODO factorize all that NPC stuff
    Hungerize(pos) {
        if (GameMap.i.IsInside(pos)) {
            for (let npci = GameMap.i.NPCList(pos).begin(); npci !== GameMap.i.NPCList(pos).end(); ++npci) {
                let npc;
                if (this.npcMap.find(npci) !== this.npcMap.end()) npc = this.npcMap[npci];
                if (npc) {
                    npc.hunger = 50000;
                }
            }
        }
    }

    Tire(pos) {
        if (GameMap.i.IsInside(pos)) {
            for (let npci = GameMap.i.NPCList(pos).begin(); npci !== GameMap.i.NPCList(pos).end(); ++npci) {
                let npc;
                if (this.npcMap.find(npci) !== this.npcMap.end()) npc = this.npcMap[npci];
                if (npc) {
                    npc.weariness = (Constants.WEARY_THRESHOLD - 1);
                }
            }
        }
    }

    Thirstify(pos) {
        if (GameMap.i.IsInside(pos)) {
            for (let npci = GameMap.i.NPCList(pos).begin(); npci !== GameMap.i.NPCList(pos).end(); ++npci) {
                // boost.shared_ptr < NPC >
                let npc;
                if (this.npcMap.find(npci) !== this.npcMap.end()) npc = this.npcMap[npci];
                if (npc) {
                    npc.thirst = Constants.THIRST_THRESHOLD + 500;
                }
            }
        }
    }
    Badsleepify(pos) {
        if (GameMap.i.IsInside(pos)) {
            for (let npci = GameMap.i.NPCList(pos).begin(); npci !== GameMap.i.NPCList(pos).end(); ++npci) {
                let npc;
                if (this.npcMap.find(npci) !== this.npcMap.end()) 
                    npc = this.npcMap[npci];
                if (npc) {
                    npc.AddEffect(StatusEffectType.BADSLEEP);
                }
            }
        }
    }

    Diseasify(pos) {
        if (GameMap.i.IsInside(pos)) {
            for (let npci = GameMap.i.NPCList(pos).begin(); npci !== GameMap.i.NPCList(pos).end(); ++npci) {
                // boost.shared_ptr < NPC > 
                let npc;
                if (this.npcMap.find(npci) !== this.npcMap.end()) npc = this.npcMap[npci];
                if (npc) {
                    npc.AddEffect(StatusEffectType.COLLYWOBBLES);
                }
            }
        }
    }

    FillDitch(a, b) {
        for (let x = a.X(); x <= b.X(); ++x) {
            for (let y = a.Y(); y <= b.Y(); ++y) {
                let p = new Coordinate(x, y);
                if (GameMap.i.IsInside(p)) {
                    if (GameMap.i.GetType(p) === TileType.TILEDITCH) {
                        let ditchFillJob = (new Job("Fill ditch"));
                        ditchFillJob.DisregardTerritory();
                        ditchFillJob.Attempts(2);
                        ditchFillJob.SetRequiredTool(Item.StringToItemCategory("shovel"));
                        ditchFillJob.MarkGround(p);
                        ditchFillJob.tasks.push(new Task(Action.FIND, p, null, Item.StringToItemCategory("earth")));
                        ditchFillJob.tasks.push(new Task(Action.MOVE));
                        ditchFillJob.tasks.push(new Task(Action.TAKE));
                        ditchFillJob.tasks.push(new Task(Action.FORGET));
                        ditchFillJob.tasks.push(new Task(Action.MOVEADJACENT, p));
                        ditchFillJob.tasks.push(new Task(Action.FILLDITCH, p));
                        JobManager.AddJob(ditchFillJob);
                    }
                }
            }
        }
    }

    SetSeason(newSeason) {
        this.season = newSeason;
    }

    GetNPC(uid) {
        let npci = this.npcMap.find(uid);
        if (npci !== this.npcMap.end()) {
            return npci.second;
        }
        return null; // boost.shared_ptr < NPC > ();
    }

    GetRandomConstruction() {
        if (this.dynamicConstructionMap.empty() ||
            (Random.i.GenerateBool() && !this.staticConstructionMap.empty())) {
            let index = Random.i.Generate(this.staticConstructionMap.size() - 1);
            for (let consi = this.staticConstructionMap.begin(); consi !== this.staticConstructionMap.end(); ++consi) {
                if (index-- === 0) return consi.second;
            }
        } else if (!this.dynamicConstructionMap.empty()) {
            let index = Random.i.Generate(this.dynamicConstructionMap.size() - 1);
            for (let consi = this.dynamicConstructionMap.begin(); consi !== this.dynamicConstructionMap.end(); ++consi) {
                if (index-- === 0) return consi.second;
            }
        }
        return null; // boost.weak_ptr < Construction > ();
    }


    DrawText(text, count, x, y, width, selected, the_console) {
        the_console.print(x, y, `${text.first} : ${text.second}`);
    }
    DrawDeathText(text, count, x, y, width, selected, the_console) {
        the_console.print(x, y, `${text.second} : ${text.first}`);
    }


    DisplayStats() {
        // UIContainer * 
        let contents = new UIContainer([], 0, 0, 77, 39);
        // Dialog * 
        let statDialog = new Dialog(contents, "Statistics", 77, 41);

        // Label * 
        let points = new Label(`Points: ${Stats.i.GetPoints()}`, 1, 2, (TCOD_alignment_t.TCOD_LEFT));
        contents.AddComponent(points);

        // Frame * 
        let filthFrame = new Frame("Filth", [], 1, 4, 25, 4);
        filthFrame.AddComponent(new Label(`created: ${Stats.i.GetFilthCreated()}`, 1, 1, (TCOD_alignment_t.TCOD_LEFT)));
        filthFrame.AddComponent(new Label(`off-map: ${Stats.i.GetFilthFlownOff()}`, 1, 2, (TCOD_alignment_t.TCOD_LEFT)));
        contents.AddComponent(filthFrame);

        // Label * 
        let burntItems = new Label(`Burnt items: ${Stats.i.GetItemsBurned()}`, 1, 9, (TCOD_alignment_t.TCOD_LEFT));
        contents.AddComponent(burntItems);

        // Frame * 
        let productionFrame = new Frame("Production", [], 26, 1, 25, 34);
        productionFrame.AddComponent(new Label(`items: ${Stats.i.GetItemsBuilt()}`, 1, 1, (TCOD_alignment_t.TCOD_LEFT)));
        productionFrame.AddComponent(new ScrollPanel(1, 2, 23, 15,
            new UIList(Stats.i.itemsBuilt, 0, 0, 24, Stats.i.itemsBuilt.size(),
                (...args) => this.DrawText(args[1],args[2],args[3],args[4],args[5],args[6],args[7]), 0, false, 0)));
        productionFrame.AddComponent(new Label(`constructions: ${Stats.i.GetConstructionsBuilt()}`, 1, 17, (TCOD_alignment_t.TCOD_LEFT)));
        productionFrame.AddComponent(new ScrollPanel(1, 18, 23, 15,
            new UIList(Stats.i.constructionsBuilt, 0, 0, 24, Stats.i.constructionsBuilt.size(),
                (...args) => this.DrawText(args[1],args[2],args[3],args[4],args[5],args[6],args[7]), 0, false, 0)));
        contents.AddComponent(productionFrame);

        // Frame * 
        let deathFrame = new Frame("Deaths", [], 51, 1, 25, 34);
        deathFrame.AddComponent(new ScrollPanel(1, 1, 23, 32,
            new UIList(Stats.deaths, 0, 0, 24, Stats.deaths.size(),
                (...args) => this.DrawDeathText(args[1],args[2],args[3],args[4],args[5],args[6],args[7]), 0, false, 0)));
        contents.AddComponent(deathFrame);

        // Button *
        let okButton = new Button("OK", null, 33, 37, 10, 'o', true);
        contents.AddComponent(okButton);

        statDialog.ShowModal();
    }

    //Check each stockpile for empty not-needed containers, and see if some other pile needs them
    RebalanceStockpiles(requiredCategory, excluded) {
        for (let stocki = this.staticConstructionMap.begin(); stocki !== this.staticConstructionMap.end(); ++stocki) {
            if (stocki.second.stockpile) {
                // boost.shared_ptr < Stockpile > 
                let sp = stocki.second;
                if (sp !== excluded && sp.GetAmount(requiredCategory) > sp.GetDemand(requiredCategory)) {
                    // boost.shared_ptr < Item >
                    let surplus = sp.FindItemByCategory(requiredCategory, Constants.EMPTY).lock();
                    if (surplus) {
                        // boost.shared_ptr < Job > 
                        let stockpileJob = this.StockpileItem(surplus, true);
                        if (stockpileJob && stockpileJob.ConnectedEntity().lock() !== sp)
                            JobManager.AddJob(stockpileJob);
                    }
                }
            }
        }
    }

    ProvideMap() {
        for (let itemIterator = this.itemMap.begin(); itemIterator !== this.itemMap.end(); ++itemIterator) {
            itemIterator.second.SetMap(GameMap.i);
        }
        for (let npcIterator = this.npcMap.begin(); npcIterator !== this.npcMap.end(); ++npcIterator) {
            npcIterator.second.SetMap(GameMap.i);
        }
        for (let consIterator = this.staticConstructionMap.begin(); consIterator !== this.staticConstructionMap.end(); ++consIterator) {
            consIterator.second.SetMap(GameMap.i);
        }
        for (let consIterator = this.dynamicConstructionMap.begin(); consIterator !== this.dynamicConstructionMap.end(); ++consIterator) {
            consIterator.second.SetMap(GameMap.i);
        }
    }

    save(ar, version) {
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
        ar & this.season;
        ar & this.time;
        ar & this.orcCount;
        ar & this.goblinCount;
        ar & this.peacefulFaunaCount;
        ar & this.safeMonths;
        ar & this.marks;
        ar & this.camX;
        ar & this.camY;
        ar & Faction.factions;
        ar & this.npcMap;
        ar & this.squadMap;
        ar & this.hostileSquadList;
        ar & this.staticConstructionMap;
        ar & this.dynamicConstructionMap;
        ar & this.itemMap;
        ar & this.freeItemsSet;
        ar & this.flyingItemsSet;
        ar & this.stoppedItems;
        ar & this.natureList;
        ar & this.waterList;
        ar & this.filthNodes;
        ar & this.bloodNodes;
        ar & this.fireNodes;
        ar & this.spells;
        ar & this.age;
        ar & Stats.i;
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
        ar & this.season;
        ar & this.time;
        ar & this.orcCount;
        ar & this.goblinCount;
        ar & this.peacefulFaunaCount;
        ar & this.safeMonths;
        ar & this.marks;
        ar & this.camX;
        ar & this.camY;

        //Save games may not have all of the current factions saved, which is why we need to store
        //a list of current factions here, and make sure they all exist after loading
    
        let factionNames = [];
        for (let i = 0; i < Faction.factions.length; ++i) {
            factionNames.push(Faction.FactionTypeToString(i));
        }
        if (version < 1) {
            /* Earlier versions didn't use factions for more than storing trap data, 
                            so transfer that and use the new defaults otherwise */
            // std.vector < boost.shared_ptr < Faction > > 
            let oldFactionData = [];
            ar & oldFactionData;
            oldFactionData[0].TransferTrapInfo(Faction.factions[Constants.PLAYERFACTION]);
        } else {
            ar & Faction.factions;
            Faction.InitAfterLoad(); //Initialize names and default friends, before loading npcs
        }
        for (let factionName = factionNames.begin(); factionName !== factionNames.end(); ++factionName) {
            Faction.StringToFactionType(factionName);
        }
    

        ar & this.npcMap;

        Faction.TranslateMembers(); //Translate uid's into pointers, do this after loading npcs

        ar & this.squadMap;
        ar & this.hostileSquadList;
        ar & this.staticConstructionMap;
        ar & this.dynamicConstructionMap;
        ar & this.itemMap;
        ar & this.freeItemsSet;
        ar & this.flyingItemsSet;
        ar & this.stoppedItems;
        ar & this.natureList;
        ar & this.waterList;
        ar & this.filthNodes;
        ar & this.bloodNodes;
        ar & this.fireNodes;
        ar & this.spells;
        ar & this.age;
        if (version >= 1) {
            ar & Stats.i;
        }
    }
    static reset() {
        this.instance.Init(!this.initializedOnce);
        this.initializedOnce = true;
    }
}

Singletonify(Game);
Game.ItemTypeCount = 0;
Game.ItemCatCount = 0;
Game.initializedOnce = false;
Game.devMode = false;
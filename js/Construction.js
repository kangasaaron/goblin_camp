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
    Coordinate
} from "./Coordinate.js";
import {
    ConstructionListener
} from "./ConstructionListener.js";
import {
    ConstructionPreset
} from "./ConstructionPreset.js";
import {
    ConstructionTag
} from "./ConstructionTag.js";
import {
    ConstructionType
} from "./ConstructionType.js";
import {
    BuildResult
} from "./BuildResult.js";
import {
    Color
} from "./libtcod.js";
import {
    ItemCategory
} from "./ItemCategory.js";
import {
    ItemPreset
} from "./ItemPreset.js";
import {
    ItemType
} from "./ItemType.js";
import {
    Job
} from "./Job.js";
import {
    Container
} from "./Container.js";
import {
    Entity
} from "./Entity.js";

/**
 * @augments{Entity}
 */
export class Construction extends Entity {
    static CLASS_VERSION = 0;

    /**
     * @type{Array<ConstructionType>}
     */
    static AllowedAmount = [];
    /**
     * @type{Array<ConstructionPreset>}
     */
    static Presets = [];
    /**
     * set of category names (strings)
     * @type {Set<string>}
     */
    static Categories = new Set();
    /**
     * Map with preset names for keys (strings) and ConstructionTypes for values
     * @type{Map<string,ConstructionType>}
     */
    static constructionNames = new Map();

    built = false;
    dismantle = false;
    farmplot = false;
    flammable = false;
    producer = false;
    stockpile = false;
    walkable = false;
    condition = 0;
    maxCondition = 0;
    progress = 0;
    smoke = 0;
    time = 0;
    /**
     * @type{ConstructionType} (a typedef'd int)
     */
    type = 0;
    color = Color.white;
    /**
     * @type{Array<number>}
     */
    graphic = [];
    /**
     * @type{Array<ItemCategory>}
     */
    materials = [];
    /**
     * @type{Array<ItemType>}
     */
    products = [];
    /**
     * @type{Array<ItemType>}
     */
    jobList = [];
    /**
     * @type {Container}
     */
    container = null;
    /**
     * @type {Container}
     */
    materialsUsed = null;
    /**
     * @type{Job} weak pointer to a repairJob
     */
    repairJob = null;
    map = null; // pointer to the map;
    /**
     * @type{ConstructionPreset}
     */
    preset = null;
    /**
     * 
     * @param {ConstructionType} construct 
     * @returns {Coordinate}
     */
    static Blueprint(construct) {
            return this.Presets[construct].blueprint;
        }
        /**
         * 
         * @param {ConstructionType} construct 
         * @returns {Coordinate}
         */
    static ProductionSpot(construct) {
        return this.Presets[construct].productionSpot;
    }
    static ResolveProducts() {
            for (let itemPreset of Item.Presets) {
                if (ItemPreset.constructedInRaw == "") continue;
                let conPreset = Construction.Presets.find(function(preset) {
                    return preset.name == itemPreset.constructedInRaw;
                });
                if (conPreset) {
                    conPreset.producer = conPreset.tags[ConstructionTag.WORKSHOP] = true;
                    conPreset.products.push(Item.StringToItemType(itemPreset.name));
                    itemPreset.constructionInRaw = "";
                } else {
                    console.log("Item " + itemPreset.name + " refers to nonexistant construction " + itemPreset.constructedInRaw + ".");
                }
            }
        }
        /**
         * 
         * @param {string} nm - name of the Construction Preset
         * @returns {ConstructionType} the Construction type for the preset
         */
    static StringToConstructionType(nm) {
            nm = nm.toUpperCase();
            if (!this.constructionNames.has(nm)) {
                return -1;
            }
            return this.constructionNames.get(nm);
        }
        /**
         * 
         * @param {ConstructionType} type 
         * @returns {string} name of the Construction Preset
         */
    static ConstructionTypeToString(type) {
        return this.Presets[type].name;
    }
    static LoadPresets(filename) {
        let listener = new ConstructionListener(this, filename);
        return listener.fetch();
    }

    //note: optional constructors do not make sense, but they are
    //required by the Boost.serialization library. More precisely, it
    //would be possible to define {save,load}_construct_data method,
    //but I'm unsure how to do it without incurring a version change.
    //TODO investigate
    /**
     * 
     * @param {ConstructionType} vtype 
     * @param {Coordinate} target 
     */
    constructor(vtype = new ConstructionType(0), target = Coordinate.zero) {
        super();
        this.type = vtype;
        this.preset = Construction.Presets[this.type];
        this.container = new Container(this.preset.productionSpot + target, -1, 1000, -1);
        this.materialsUsed = new Container(this.preset.productionSpot + target, -1, 1000, -1);

        this.pos = target;
        this.graphic = preset.graphic;
        this.maxCondition = preset.maxCondition;
        this.materials = preset.materials;
        this.name = preset.name;
        this.walkable = preset.walkable;
        this.producer = preset.producer;
        this.products = preset.products;
        this.stockpile = preset.tags[ConstructionTag.STOCKPILE];
        this.farmplot = preset.tags[ConstructionTag.FARMPLOT];
        this.condition = 0 - this.maxCondition;
        if (!preset.color.equals(Color.black))
            color = preset.color;
    }
    destructor() {
        let end = this.pos.plus(Construction.Blueprint(this.type));
        for (let ix = pos.X(); ix < end.X(); ++ix) {
            for (let iy = pos.Y(); iy < end.Y(); ++iy) {
                let p = new Coordinate(ix, iy);
                this.map.SetBuildable(p, true);
                this.map.SetWalkable(p, true);
                this.map.SetConstruction(p, -1);
                this.map.SetBlocksLight(p, false);
                this.map.SetBlocksWater(p, false);
            }
        }

        for (let itemi of this.materialsUsed.GetItems()) {
            if (itemi.lock()) {
                itemi.lock().SetFaction(PLAYERFACTION); //Return item to player faction
                itemi.lock().PutInContainer([]); //Set container to none
            }
        }
        while (!this.materialsUsed.empty()) {
            this.materialsUsed.RemoveItem(this.materialsUsed.GetFirstItem());
        }

        if (this.producer)
            StockManager.UpdateWorkshops(null, false);

        if (this.preset.tags[ConstructionTag.WALL]) {
            this.UpdateWallGraphic();
        } else if (this.preset.tags[ConstructionTag.DOOR]) {
            this.UpdateWallGraphic(true, false);
        }

        if (Construction.AllowedAmount[this.type] >= 0) {
            ++Construction.AllowedAmount[this.type];
        }

        if (this.built) {
            if (!this.HasTag(this.CENTERSCAMP))
                Camp.UpdateCenter(this.Center(), false);
            else
                Camp.UnlockCenter();
        }
    }

    /**
     * 
     * @returns {boolean} whether a production job was spawned or not
     */
    SpawnProductionJob() {
        //Only spawn a job if the construction isn't already reserved
        if (this.reserved) {
            if (DEBUG)
                console.log("Couldn't spawn a production job at ", this.name, ": Reserved");
            return false;
        }
        //First check that the requisite items actually exist
        let componentList;
        for (let compi = 0; compi < Item.Components(this.jobList[0]).length; ++compi) {
            let item = Game.FindItemByCategoryFromStockpiles(Item.Components(jobList[0], compi), this.Center(), APPLYMINIMUMS);
            if (item.lock()) {
                componentList.push(item);
                item.lock().Reserve(true);
            } else {
                //Not all items available, cancel job and unreserve the reserved items.
                for (let resi of componentList) {
                    resi.lock().Reserve(false);
                }
                this.jobList.shift();
                if (DEBUG)
                    console.log("Couldn't spawn production job at ", this.name, ": components missing");
                return false;
            }
        }

        //Unreserve the items now, because the individual jobs will reserve them for themselves
        for (let resi of componentList) {
            resi.lock().Reserve(false);
        }


        let newProductionJob = new Job("Produce " + Item.ItemTypeToString(this.jobList[0]), JobPriority.MED, 0, false);
        newProductionJob.ConnectToEntity(this);
        newProductionJob.ReserveEntity(this);

        for (let compi = 0; compi < Item.Components(this.jobList[0]).length; ++compi) {
            let newPickupJob = new Job("Pickup " + Item.ItemCategoryToString(Item.Components(this.jobList[0], compi)) + " for " + Construction.Presets[this.Type()].name);
            newPickupJob.tasks.push(new Task(TaskType.FIND, this.Center(), null, Item.Components(this.jobList[0], compi), APPLYMINIMUMS | EMPTY));
            newPickupJob.tasks.push(new Task(TaskType.MOVE));
            newPickupJob.tasks.push(new Task(TaskType.TAKE));
            newPickupJob.tasks.push(new Task(TaskType.MOVE, container.Position(), container));
            newPickupJob.tasks.push(new Task(TaskType.PUTIN, container.Position(), container));

            newProductionJob.PreReqs().push(newPickupJob);
            newPickupJob.Parent(newProductionJob);

            JobManager.AddJob(newPickupJob);
        }
        newProductionJob.tasks.push(new Task(TaskType.MOVE, this.Position() + Construction.ProductionSpot(type)));
        newProductionJob.tasks.push(new Task(TaskType.USE, this.Position() + Construction.ProductionSpot(type), this));
        JobManager.AddJob(newProductionJob);
        return true;
    }
    SetMap(map) {
        this.map = map;
    }
    Condition(value) {
        if (Number.isFinite(value))
            this.condition = value;
        return this.condition;
    }
    GetMaxCondition() {
        return this.maxCondition;
    }
    GetGraphicsHint() {
        return this.preset.graphicsHint;
    }
    Type() {
        return this.type;
    }
    MaterialList() {
        return this.materials;
    }
    Producer() {
        return this.producer;
    }
    Products(index) {
        if (Number.isFinite(index) && index < this.products.length)
            return this.products[index];
        return this.products;
    }
    JobList(index) {
        if (Number.isFinite(index) && index < this.jobList.length)
            return this.jobList[index];
        return this.jobList;
    }
    HasTag(tag) {
        return this.preset.tags[tag];
    }
    GetContextMenu() {
        return ConstructionDialog.ConstructionInfoDialog(this);
    }
    DismantlingOrdered() {
        return this.dismantle;
    }
    Built() {
        return this.built;
    }
    AcceptVisitor(visitor) {
        visitor.Visit(this);
    }
    IsFlammable() {
        return this.flammable;
    }
    GetMoveSpeedModifier() {
        return this.preset.moveSpeedModifier;
    }
    CanStrobe() {
        return true;
    }
    Center() {
        let width = this.graphic[0];
        let height = (this.graphic.length - 1) / width;
        return this.pos.plus(new Coordinate(width, height) - 1).dividedByScalar(2);
    }
    Storage() {
        if (this.condition > 0) return this.container;
        else return this.materialsUsed;
    }
    CheckMaterialsPresent() {
        if (this.materials.length != this.materialsUsed.size()) {
            return false;
        }
        return true;
    }
    Repair() {
        if (this.condition < this.maxCondition) ++this.condition;
        return this.condition < this.maxCondition ? 1 : 100;
    }
    AddJob(item) {
        if (this.dismantle) return;
        if (DEBUG) {
            console.log("Produce " + Item.ItemTypeToString(item) + " at " + this.name);
        }
        this.jobList.push(item);
        if (this.jobList.size() == 1) {
            this.SpawnProductionJob();
        }
    }
    Dismantle(coord) {
        if (this.preset.permanent || this.dismantle)
            return;
        this.dismantle = true;
        if (this.producer) {
            this.jobList = [];
        }

        if (this.built) {
            this.dismantleJob = new Job(`Dismantle ${this.name}`, JobPriority.HIGH, 0, false);
            dismantleJob.ConnectToEntity(this);
            dismantleJob.Attempts(3);
            dismantleJob.tasks.push(new Task(TaskType.MOVEADJACENT, this.Position(), this));
            dismantleJob.tasks.push(new Task(TaskType.DISMANTLE, this.Position(), this));
            JobManager.AddJob(dismantleJob);
        } else {
            Game.RemoveConstruction(this);
        }
    }

    Draw(upleft, the_console) {
        let screenx = this.pos.minus(upleft).X(),
            screeny = this.pos.minus(upleft).Y(),
            ychange = 0,
            width = this.graphic[0],
            height = (this.graphic.length - 1) / width;

        if (!(screenx + width - 1 >= 0 && screenx < the_console.getWidth() && screeny + height - 1 >= 0 && screeny < the_console.getHeight()))
            return;

        for (let i = 1; i < this.graphic.length; ++i) {
            if (screenx + i - 1 >= 0 && screeny >= 0 && screenx + i - 1 < the_console.getWidth() && screeny < the_console.getHeight()) {
                if (dismantle) the_console.setCharBackground(screenx + i - 1, screeny, Color.darkGrey);
                else the_console.setCharBackground(screenx + i - 1, screeny, new Color(Math.round(50 - Math.cos(strobe) * 50), Math.round(50 - Math.cos(strobe) * 50), Math.round(50 - cos(strobe) * 50)));

                the_console.setCharForeground(screenx + i - 1, screeny, color);
                if (condition > i * -10) the_console.setChar(screenx + i - 1, screeny, (this.graphic[i]));
                else the_console.setChar(screenx + i - 1, screeny, TCOD_CHAR_BLOCK2);
            }
            ++ychange;
            if (ychange == width) {
                ++screeny;
                screenx -= width;
                ychange = 0;
            }
        }
    }
    CancelJob(index = 0) {
        this.smoke = 0;
        if (index == 0 && index < this.jobList.length) {
            let remove = this.jobList.shift();
            remove.destructor();
            //Empty container in case some pickup jobs got done
            while (!this.container.empty()) {
                let item = this.container.GetFirstItem();
                this.container.RemoveItem(item);
                if (item.lock())
                    item.lock().PutInContainer();
            }
            while (!this.jobList.empty() && !this.reserved && !this.SpawnProductionJob());
        } else if (index > 0 && index < this.jobList.length) {
            let remove = this.jobList.splice(index, 1);
            remove.forEach(r => r.destructor());
        } else if (this.condition <= 0) {
            Game.RemoveConstruction(this);
        } else if (this.dismantle) this.dismantle = false; //Stop trying to dismantle
    }
    Explode() {
        for (let itemi of this.materialsUsed.GetItems()) {
            let item;
            if (item = itemi.lock()) {
                item.PutInContainer(null); //Set container to none
                let randomTarget = Random.ChooseInRadius(this.Position(), 5);
                item.CalculateFlightPath(randomTarget, 50, this.GetHeight());
                if (item.Type() != Item.StringToItemType("debris"))
                    item.SetFaction(PLAYERFACTION); //Return item to player faction
            }
        }
        while (!this.materialsUsed.empty()) {
            this.materialsUsed.RemoveItem(this.materialsUsed.GetFirstItem());
        }
    }
    SpawnRepairJob() {
        if (!(this.built && this.condition < this.maxCondition && !this.repairJob.lock())) return;

        let cat = Random.ChooseIndex(this.preset.materials)
        let repairItem = Game.FindItemByCategoryFromStockpiles(cat, this.Position()).lock();
        if (!repairItem) return;

        let repJob = new Job("Repair " + this.name);
        repJob.ReserveEntity(repairItem);
        repJob.tasks.push(new Task(TaskType.MOVE, repairItem.Position()));
        repJob.tasks.push(new Task(TaskType.TAKE, repairItem.Position(), repairItem));
        repJob.tasks.push(new Task(TaskType.MOVEADJACENT, this.Position(), this));
        repJob.tasks.push(new Task(TaskType.REPAIR, this.Position(), this));
        repairJob = repJob;
        JobManager.AddJob(repJob);
    }
    BurnToTheGround() {
        for (let itemi of this.materialsUsed.GetItems()) {
            let item;
            if (item = itemi.lock()) {
                item.PutInContainer(null); //Set container to none
                let randomTarget = Random.ChooseInRadius(this.Position(), 2);
                item.Position(randomTarget);
                if (item.Type() != Item.StringToItemType("debris"))
                    item.SetFaction(PLAYERFACTION); //Return item to player faction
                Game.CreateFire(randomTarget);
            }
        }
        while (!this.materialsUsed.empty()) {
            this.materialsUsed.RemoveItem(this.materialsUsed.GetFirstItem());
        }
    }
    Damage(attack) {
        let damageModifier = 1.0;

        switch (attack.Type()) {
            case DamageType.DAMAGE_SLASH:
                damageModifier = 0.5;
                break;

            case DamageType.DAMAGE_PIERCE:
                damageModifier = 0.25;
                break;

            case DamageType.DAMAGE_BLUNT:
            case DamageType.DAMAGE_MAGIC:
            case DamageType.DAMAGE_FIRE:
            case DamageType.DAMAGE_COLD:
                damageModifier = 1.0;
                break;

            case DamageType.DAMAGE_POISON:
                damageModifier = 0.1;
                break;

            default:
                damageModifier = 1.0;
                break;
        }

        let damage = (Game.DiceToInt(attack.Amount()) * damageModifier);
        this.condition -= damage;

        if (attack.Type() == DamageType.DAMAGE_FIRE && Random.Generate(5) == 0) {
            Game.CreateFire(this.Center());
        }

        if (this.condition <= 0) {
            if (attack.Type() != DamageType.DAMAGE_FIRE)
                this.Explode();
            else
                this.BurnToTheGround();
            Game.RemoveConstruction(this);
        }
    }
    UpdateWallGraphic(recurse = true, updateSelf = true) {
        let dirs = [
                Direction.WEST,
                Direction.EAST,
                Direction.NORTH,
                Direction.SOUTH
            ],
            posDir = new Array(4),
            consId = new Array(4).fill(0),
            wod = new Array(4).fill(false);


        for (i = 0; i < 4; ++i) {
            posDir[i] = this.pos.plus(Coordinate.DirectionToCoordinate(dirs[i]));
            consId[i] = this.map.GetConstruction(posDir[i]);
            wod[i] = false;
            if (consId[i] <= -1) continue;

            let cons = Game.GetConstruction(consId[i]).lock();
            if (cons && cons.Condition() > 0 && !cons.dismantle &&
                (Construction.Presets[cons.Type()].tags[ConstructionTag.WALL] || Construction.Presets[cons.Type()].tags[ConstructionTag.DOOR])) {
                wod[i] = true;
            }
        }

        if (updateSelf && this.preset.tags[ConstructionTag.WALL]) {
            let w = wod[0],
                e = wod[1],
                n = wod[2],
                s = wod[3];
            if (n && s && e && w) this.graphic[1] = 197;
            else if (n && s && e) this.graphic[1] = 195;
            else if (n && s && w) this.graphic[1] = 180;
            else if (n && e && w) this.graphic[1] = 193;
            else if (s && e && w) this.graphic[1] = 194;
            else if (n && s) this.graphic[1] = 179;
            else if (e && w) this.graphic[1] = 196;
            else if (n && e) this.graphic[1] = 192;
            else if (n && w) this.graphic[1] = 217;
            else if (s && e) this.graphic[1] = 218;
            else if (s && w) this.graphic[1] = 191;
            else if (e || w) this.graphic[1] = 196;
            else if (n || s) this.graphic[1] = 179;
            else this.graphic[1] = 197;
        }

        if (recurse) {
            for (let i = 0; i < 4; ++i) {
                if (wod[i])
                    Game.GetConstruction(consId[i]).lock().UpdateWallGraphic(false);
            }
        }
    }
    UpdateSpawnCreatures() {
        if (Random.Generate(this.preset.spawnFrequency - 1) != 0) return;
        let monsterType = Game.GetRandomNPCTypeByTag(this.preset.spawnCreaturesTag);
        let friendly = NPC.Presets[monsterType].tags.has("friendly");
        let announceColor = friendly ? Color.green : Color.red;

        if (!friendly && Config.GetCVar("pauseOnDanger"))
            Game.AddDelay(UPDATES_PER_SECOND, Game.Pause.bind(Game));

        let amount = Game.DiceToInt(NPC.Presets[monsterType].group);
        if (amount == 1) {
            Announce.AddMsg("A " + NPC.NPCTypeToString(monsterType) + " emerges from the " + this.name + "!", announceColor, this.Position());
        } else {
            Announce.AddMsg(NPC.Presets[monsterType].plural + " emerge from the " + this.name + "!", announceColor, this.Position());
        }
        for (let i = 0; i < amount; ++i) {
            Game.CreateNPC(this.Position() + this.ProductionSpot(this.type), monsterType);
        }

    }
    UpdatePassiveStatusEffects() {
        let npc = Game.GetNPC(this.map.NPCList(this.pos)[0])
        if (npc.HasEffect(StatusEffect.FLYING))
            return;
        for (let i = 0; i < this.preset.passiveStatusEffects.length; ++i) {
            npc.AddEffect(this.preset.passiveStatusEffects[i]);
        }

    }
    Update() {
        if (this.preset.spawnCreaturesTag != "" && this.condition > 0)
            this.UpdateSpawnCreatures();
        if (this.preset.passiveStatusEffects.length && this.map.NPCList(this.pos).length)
            this.UpdatePassiveStatusEffects();
    }
    Build() {
        ++this.condition;
        if (this.condition <= 0) return this.condition;

        //Check that all the required materials are inside the building
        //It only checks that the amount of materials equals whats expected, but not what those materials are
        //Theoretically it'd be possible to build a construction out of the wrong materials, but this should
        //be impossible in practice.
        if (this.materials.length != this.materialsUsed.size())
            return BuildResult.BUILD_NOMATERIAL;

        let flame = 0;
        let itemsToRemove;
        for (let itemi of this.materialsUsed.GetItems()) {
            this.color = Color.lerp(this.color, itemi.lock().Color(), 0.75);
            itemi.lock().SetFaction(-1); //Remove from player faction so it doesn't show up in stocks
            itemi.lock().IsFlammable() ? ++this.flame : --this.flame;
            if (Random.Generate(9) < 8) { //80% of materials can't be recovered
                itemsToRemove.this(itemi);
            }
        }

        if (flame > 0)
            this.flammable = true;

        for (let itemi of itemsToRemove) {
            this.materialsUsed.RemoveItem(itemi);
            Game.RemoveItem(itemi);
            Game.CreateItem(this.materialsUsed.Position(), Item.StringToItemType("debris"), false, -1,
                null, this.materialsUsed);
        }

        //TODO: constructions should have the option of having both walkable and unwalkable tiles
        this.condition = this.maxCondition;
        let end = this.pos.addScalarToThis(Construction.Blueprint(type).X());
        for (let ix = pos.X(); ix < end.X(); ++ix) {
            for (let iy = pos.Y(); iy < end.Y(); ++iy) {
                let p = new Coordinate(ix, iy);
                this.map.SetWalkable(p, walkable);
                this.map.SetBlocksWater(p, !walkable);
                this.map.SetBlocksLight(p, this.preset.blocksLight);
            }
        }

        if (this.preset.tags[ConstructionTag.WALL]) {
            this.UpdateWallGraphic();
        } else if (this.preset.tags[ConstructionTag.DOOR]) {
            this.UpdateWallGraphic(true, false);
        }
        if (this.producer) {
            StockManager.UpdateWorkshops(this, true);
            for (let prod = 0; prod < this.preset.products.length; ++prod) {
                StockManager.UpdateQuantity(this.preset.products[prod], 0);
            }
        }
        this.built = true;
        if (!this.HasTag(ConstructionTag.CENTERSCAMP))
            Camp.UpdateCenter(this.Center(), true);
        else
            Camp.LockCenter(this.Center());
        Camp.ConstructionBuilt(this.type);
        Stats.ConstructionBuilt(this.preset.name);

        Script.Event.BuildingCreated(this, pos.X(), pos.Y());

        return this.condition;
    }
    GenerateSmoke() {

        if (this.smoke == 0) {
            this.smoke = 1;
            for (let itemi of this.container) {
                if (itemi.lock().IsCategory(Item.StringToItemCategory("Fuel"))) {
                    this.smoke = 2;
                    break;
                }
            }
            if (Item.Presets[this.jobList[0]].categories.has(Item.StringToItemCategory("charcoal")))
                this.smoke = 2;
        }

        if (!(this.smoke == 2 && !this.preset.chimney.equals(Coordinate.undefinedCoordinate))) return;

        if (Random.Generate(9) != 0) return;

        let smoke = Game.CreateSpell(this.Position() + this.preset.chimney, Spell.StringToSpellType("smoke"));
        let direction;
        let wind = map.GetWindDirection();
        if (wind == Direction.NORTH || wind == Direction.NORTHEAST || wind == Direction.NORTHWEST)
            direction.Y(Random.Generate(25, 75));
        if (wind == Direction.SOUTH || wind == Direction.SOUTHEAST || wind == Direction.SOUTHWEST)
            direction.Y(Random.Generate(-75, -25));
        if (wind == Direction.EAST || wind == Direction.NORTHEAST || wind == Direction.SOUTHEAST)
            direction.X(Random.Generate(-75, -25));
        if (wind == Direction.WEST || wind == Direction.SOUTHWEST || wind == Direction.NORTHWEST)
            direction.X(Random.Generate(25, 75));
        direction += Random.ChooseInRadius(3);
        smoke.CalculateFlightPath(this.Position() + this.preset.chimney.plus(direction), 5, 1);
        if (Random.Generate(50000) != 0) return;

        let spark = Game.CreateSpell(pos, Spell.StringToSpellType("spark"));
        let distance = Random.Generate(0, 15);
        if (distance < 12) {
            distance = 1;
        } else if (distance < 14) {
            distance = 2;
        } else {
            distance = 3;
        }
        direction = new Coordinate(0, 0);
        if (wind == Direction.NORTH || wind == Direction.NORTHEAST || wind == Direction.NORTHWEST)
            direction.Y(distance);
        if (wind == Direction.SOUTH || wind == Direction.SOUTHEAST || wind == Direction.SOUTHWEST)
            direction.Y(-distance);
        if (wind == Direction.EAST || wind == Direction.NORTHEAST || wind == Direction.SOUTHEAST)
            direction.X(-distance);
        if (wind == Direction.WEST || wind == Direction.SOUTHWEST || wind == Direction.NORTHWEST)
            direction.X(distance);
        if (Random.Generate(9) < 8)
            direction += Random.ChooseInRadius(1);
        else
            direction += Random.ChooseInRadius(3);
        spark.CalculateFlightPath(this.pos.plus(direction), 50, 1);
    }
    complete() {
        let allComponentsFound = true;

        for (let compi = 0; compi < Item.Components(this.jobList[0]).size(); ++compi) {
            allComponentsFound = false;
            for (let itemi of this.container.GetItems()) {
                if (itemi.lock().IsCategory(Item.Components(this.jobList[0], compi))) {
                    allComponentsFound = true;
                    break;
                }
            }
        }
        if (!allComponentsFound)
            return -1;

        let components = [];
        let itemContainer;

        for (let compi = 0; compi < Item.Components(this.jobList[0]).size(); ++compi) {
            for (let itemi of this.container.GetItems()) {
                if (!(itemi.lock().IsCategory(Item.Components(this.jobList[0], compi))))
                    continue;
                if (itemi.lock().IsCategory(Item.Presets[this.jobList[0]].containIn)) {
                    //This component is the container our product should be placed in
                    itemContainer = itemi.lock();
                } else {
                    //Just a component of the product
                    components.push(itemi);
                }
                this.container.RemoveItem(itemi);
                break;

            }
        }

        //Create the "fruit" of the components. Basically fruits have their seeds as their fruits,
        //this makes berries give their seeds when made into wine, for example.
        for (let i = 0; i < components.length; ++i) {
            if (components[i].lock()) {
                for (let fruiti of Item.Presets[components[i].lock().Type()].fruits) {
                    Game.CreateItem(this.Position(), fruiti, true);
                }
            }
        }

        //Create the items
        if (itemContainer)
            itemContainer.PutInContainer();

        for (let i = 0; i < Item.Presets[this.jobList[0]].multiplier; ++i) {
            if (itemContainer)
                Game.CreateItem(this.Position() + this.preset.productionSpot, this.jobList[0], false, 0, components, itemContainer);
            else
                Game.CreateItem(this.Position() + this.preset.productionSpot, this.jobList[0], true, 0, components);
            Stats.ItemBuilt(Item.Presets[this.jobList[0]].name);
        }

        //Destroy the components
        for (let i = 0; i < components.length; ++i) {
            if (components[i].lock()) {
                Game.RemoveItem(components[i]);
            }
        }

        progress = 0;
        //~Job removes the job from the jobList
        return 100;
    }
    Use() {
        if (this.jobList.length <= 0) return -1;

        ++this.progress;

        this.GenerateSmoke();

        if (progress >= 100) {
            this.complete();
        }
        return progress;

    }
    serialize(ar, version) {
        let result = super.serialize(ar, version);
        result.condition = this.condition;
        result.maxCondition = this.maxCondition;
        result.graphic = this.graphic;
        result.color = ar.serialize(this.color);
        result.constructionType = Construction.ConstructionTypeToString(this.type);
        result.walkable = this.walkable;
        result.materials = ar.serialize(this.materials);
        result.producer = this.producer;
        result.products = ar.serialize(this.products);
        result.jobList = ar.serialize(this.jobList);
        result.progress = this.progress;
        result.container = ar.serialize(this.container);
        result.materialsUsed = ar.serialize(this.materialsUsed);
        result.stockpile = this.stockpile;
        result.farmplot = this.farmplot;
        result.dismantle = this.dismantle;
        result.time = this.time;
        result.AllowedAmount = Construction.AllowedAmount[this.type];
        result.built = this.built;
        result.flammable = this.flammable;
        result.repairJob = ar.serialize(this.repairJob);
        return result;
    }
    static deserialize(data, version, deserializer) {
        let failedToFindType = false;
        let typeName = data.constructionType;
        let type = Construction.StringToConstructionType(typeName);
        if (type == -1) {
            type = Construction.StringToConstructionType("Saw pit");
            failedToFindType = true;
        }
        let entityResult = Entity.deserialize(data, version, deserializer);
        let result = Object.assign(
            new Construction(type, entityResult.pos),
            entityResult);
        result.condition = data.condition;
        result.maxCondition = data.maxCondition;
        result.graphic = data.graphic;
        result.color = deserializer.deserialize(data.color);
        walkable = data.walkable
        result.materials = deserializer.deserialize(data.materials);
        result.producer = data.producer;
        result.products = deserializer.deserialize(data.products);
        result.jobList = deserializer.deserialize(data.jobList);
        result.progress = data.progress;
        result.container = deserializer.deserialize(data.container);
        result.materialsUsed = deserializer.deserialize(data.materialsUsed);
        result.stockpile = data.stockpile;
        result.farmplot = data.farmplot;
        result.dismantle = data.dismantle;
        result.time = data.time;
        Construction.AllowedAmount[this.type] == data.AllowedAmount;
        result.built = data.built;
        result.flammable = data.flammable;
        if (failedToFindType)
            result.flammable = true; //So you can burn these constructions
        result.repairJob = deserializer.deserialize(repairJob);
        return result;
    }
}
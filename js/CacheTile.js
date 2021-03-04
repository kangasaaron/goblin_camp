export class CacheTile {
    walkable = true;
    moveCost = 1;
    construction = false;
    door = false;
    trap = false;
    bridge = false;
    moveSpeedModifier = 0;
    waterDepth = 0;
    npcCount = 0;
    fire = false;
    x = 0;
    y = 0;

    assign(that) {
        if (that instanceof CacheTile)
            return this.assignCacheTile(that);
        else if (that instanceof Tile)
            return this.assignTile(that);
        return this;
    }
    assignCacheTile(that) {
        this.walkable = that.walkable;
        this.moveCost = that.moveCost;
        this.construction = that.construction;
        this.door = that.door;
        this.trap = that.trap;
        this.bridge = that.bridge;
        this.moveSpeedModifier = that.moveSpeedModifier;
        this.waterDepth = that.waterDepth;
        this.npcCount = that.npcCount;
        this.fire = that.fire;
        this.x = that.x;
        this.y = that.y;
    }

    assignTile(that) {
        this.walkable = that.walkable;
        this.moveCost = that.moveCost;
        let construct = Game.GetConstruction(that.construction).lock();
        if (construct) {
            this.construction = true;
            this.door = construct.HasTag(DOOR);
            this.trap = construct.HasTag(TRAP);
            this.bridge = construct.HasTag(BRIDGE);
            this.moveSpeedModifier = construct.GetMoveSpeedModifier();
        } else {
            this.construction = false;
            this.door = false;
            this.trap = false;
            this.bridge = false;
            this.moveSpeedModifier = 0;
        }

        if (that.water)
            this.waterDepth = that.water.Depth();
        else
            this.waterDepth = 0;

        this.npcCount = that.npcList.length;
        this.fire = !(!(that.fire));

        return this;
    }
    GetMoveCost(...args) {
        if (args.length === 0) {
            return this.GetMoveCostNoArgs();
        }
        return this.GetMoveCostOneArg(args[0]);
    }
    GetMoveCostNoArgs() {
        if (!this.walkable) return 0;
        let cost = this.moveCost;

        if (this.fire) this.cost += 500; //Walking through fire... not such a good idea.

        //If a construction exists here take it into consideration
        if (this.bridge) {
            cost -= (this.moveCost - 1); //Disregard terrain in case of a bridge
        }
        cost += this.moveSpeedModifier;

        if (!this.bridge) { //If no built bridge here take water depth into account
            cost += Math.min(20, this.waterDepth);
        }

        return cost;
    }
    GetMoveCostOneArg(ptr) {
        let cost = this.GetMoveCostNoArgs();
        if (cost >= 100) return cost; //If we're over 100 then it's clear enough that walking here is not a good choice

        let npc = ptr;
        if (!npc) return cost;

        if (this.door && !npc.HasHands()) {
            cost += 50;
        }
        if (this.trap) {
            cost = Faction.factions[npc.GetFaction()].IsTrapVisible(Coordinate(x, y)) ?
                100 : 1;
        }

        //cost == 0 normally means unwalkable, but tunnellers can, surprise surprise, tunnel through
        if (cost == 0 && this.construction && npc.IsTunneler()) cost = 50;

        return cost;
    }
}
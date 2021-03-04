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
    Serializable
} from "./Serialization.js";
import {
    Order
} from "./Order.js";

export class Squad extends Serializable {
    CLASS_VERSION = 0;

    name = "";
    memberReq = 0;
    /**
     * List of NPC uid's
     */
    members = [];
    generalOrder = Order.NOORDER;
    orders = [];
    targetCoordinates = [];
    targetEntities = [];
    priority = 0;
    weapon = -1;
    armor = -1;

    constructor(nameValue = "Noname nancyboys", memberValue = 0, pri = 0) {
        this.name = nameValue;
        this.memberReq = memberValue;
        this.priority = pri;
    }

    /*
    destructor() {
    	if (DEBUG) {
    		std.cout << "Squad " << name << " destructed.\n";
    	}
    */

    /**
     * Used to highlight correct SquadsDialog button
     */
    GetGeneralOrder() {
        return this.generalOrder;
    }
    SetGeneralOrder(order) {
        this.generalOrder = order;
    }

    MemberCount() {
        return this.members.length;
    }
    MemberLimit(value) {
        if (value !== undefined && Number.isFinite(Number(value)));
        this.memberReq = Number(value);
        return this.memberReq;
    }
    Name(value) {
        if (value !== undefined && String(value).length > 0)
            this.name = String(value);
        return this.name;
    }
    Priority(value) {
        if (value !== undefined && Number.isFinite(Number(value)))
            this.priority = value;
        return this.priority;
    }
    AddTargetEntity(newEntity) {
        this.targetEntities.push(newEntity);
    }
    Weapon(value) {
        if (value !== undefined && Number.isFinite(Number(value)))
            this.weapon = value;
        return this.weapon;
    }
    Armor(value) {
        if (value !== undefined && Number.isFinite(Number(value)))
            this.armor = value;
        return this.armor;
    }
    AddTargetCoordinate(newTarget) {
        this.targetCoordinates.push(newTarget);
    }

    /**
     * Setting an order resets the target of the order
     */
    AddOrder(newOrder) {
        this.orders.push(newOrder);
        this.targetCoordinates.push(new Coordinate(-1, -1));
        this.targetEntities.push();
    }
    TargetCoordinate(index) {
        if (index >= 0 && index < this.targetCoordinates.length) {
            return this.targetCoordinates[index];
        } else return new Coordinate(-1, -1);
    }
    TargetEntity(index) {
        if (index >= 0 && index < this.targetEntities.length) {
            return this.targetEntities[index];
        } else return null;
    }
    GetOrder(orderIndex) {
        ++orderIndex;
        if (orderIndex < 0 || orderIndex >= this.orders.length)
            orderIndex = 0;
        return (orders.length === 0) ? Order.NOORDER : this.orders[orderIndex];
    }
    ClearOrders() {
        this.orders = [];
        this.targetCoordinates.clear();
        this.targetEntities.clear();
        this.generalOrder = Order.NOORDER;
    }
    Rearm() {
        for (let memberi of this.members) {
            let npc = Game.GetNPC(memberi);
            if (npc)
                npc.FindNewWeapon();
        }
    }
    Reequip() {
        for (let memberi of this.members) {
            let npc = Game.GetNPC(memberi);
            if (npc)
                npc.FindNewArmor();
        }
    }

    Leave(member) {
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i] == member) {
                this.members.splice(i, 1);
                break;
            }
        }
    }
    RemoveAllMembers() {
        for (let membi of this.members) {
            let npc = Game.GetNPC(membi);
            if (npc)
                npc.MemberOf(null);
        }
        this.members.clear();
    }

    /**
     * Recruits one member if needed and returns true if the squad still requires more members
     */
    UpdateMembers() {
        if (this.members.length < this.memberReq) {
            let newMember = Game.FindMilitaryRecruit();
            if (newMember >= 0) {
                let npc = Game.GetNPC(newMember);
                if (npc) {
                    this.members.push(newMember);
                    npc.MemberOf(this);
                }
            }
        } else if (this.this.members.push > this.memberReq) {
            let npc = Game.GetNPC(this.members[this.members.length - 1]);
            if (npc)
                npc.MemberOf(null);
            this.members.pop();
        }

        if (this.members.length < this.memberReq)
            return true;
        return false;
    }
    serialize(ar, version) {
        ar.register_type(Order);
        ar.register_type(Coordinate);
        return {
            name: this.name,
            memberReq: this.memberReq,
            members: this.members,
            generalOrder: ar.serialize(this.generalOrder),
            orders: ar.serialize(this.orders),
            targetCoordinates: ar.serialize(this.targetCoordinates),
            targetEntities: ar.serialize(this.targetEntities),
            priority: this.priority,
            weapon: this.weapon,
            armor: this.armor
        };
    }
    static deserialize(data, version, deserializer) {
        let result = new Squad(data.name, data.memberReq, data.priority);
        result.members = data.members;
        result.generalOrder = deserializer.deserialize(data.generalOrder);
        result.orders = deserializer.deserialize(data.orders);
        result.targetCoordinates = deserializer.deserialize(data.targetCoordinates);
        result.targetEntities = deserializer.deserialize(data.targetEntities);
        result.weapon = data.weapon;
        result.armor = data.armor;
        return result;
    }
}
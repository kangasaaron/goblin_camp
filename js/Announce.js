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


const ANNOUNCE_MAX_LENGTH = 71;
const ANNOUNCE_HEIGHT = 10;

import {
    Constants
} from "./Constants.js";
import {
    Coordinate
} from "./Coordinate.js";
import {
    AnnounceMessage
} from "./AnnounceMessage.js";
import {
    Color
} from "./color/Color.js";

export class Announce {
    static instance;
    messageQueue = [];
    history = [];
    timer = 0;
    length = 0;
    height = 0;
    top = 0;
    static getInstance() {
        if (this.instance)
            return this.instance;
        return this.Reset();
    }
    static Reset() {
        this.instance = null;
        this.instance = new Announce();
        return this.instance;
    }
    constructor() {
        if (Announce.instance) return Announce.instance;

        return this;
    }

    AnnounceAmount() {
        return this.history.length + this.messageQueue.length;
    }

    CurrentCoordinate() {
        return this.messageQueue[0].target;
    }
    AnnouncementClicked(arg) {
        if (arg && arg instanceof AnnounceMessage) {
            if (arg.target.X() > -1 && arg.target.Y() > -1) {
                Game.CenterOn(arg.target);
            }
        }
        if (Number.isFinite(arg)) {
            if (arg >= 0 && arg < this.history.length) {
                this.AnnouncementClicked(this.history[i]);
            }
        }
    }
    EmptyMessageQueue() {
        while (this.messageQueue.length) {
            this.history.unshift(messageQueue[0]);
            if (history.length > 1000) {
                history.pop();
            }
            this.messageQueue.shift();
        }
        this.length = 0;
    }
    AddMsg(msg, color = Color.white, coordinate = Coordinate.undefinedCoordinate) {
        msg = msg.substr(0, ANNOUNCE_MAX_LENGTH);
        if (this.messageQueue.length && this.messageQueue[this.messageQueue.length - 1].msg == msg && this.messageQueue[this.messageQueue.length - 1].target == coordinate) {
            this.this.messageQueue[this.messageQueue.length - 1].counter++;
            if (this.messageQueue.length == 1) this.timer = 0;
        } else {
            this.messageQueue.push(new AnnounceMessage(msg, color, coordinate));
            if (this.messageQueue.length <= ANNOUNCE_HEIGHT) {
                if (msg.length > this.length) this.length = msg.length;
                this.height = this.messageQueue.length;
            }
        }
    }
    Update(...args) {
        if (args.length == 0)
            this.UpdateNoArgs();
        else
            this.UpdateWithArgs(...args);
    }

    UpdateNoArgs() {
        if (this.messageQueue.length == 0) {
            this.timer = 0;
            return;
        }
        ++this.timer;
        if (this.timer <= 0.5 * Constants.UPDATES_PER_SECOND)
            return;
        if (this.messageQueue.length <= ANNOUNCE_HEIGHT) {
            this.timer = 0;
            return;
        }

        this.history.push(this.messageQueue[0]);
        if (this.history.length > 1000) {
            this.history.shift();
        }
        this.messageQueue.shift();
        this.length = 0;
        for (let msgi of this.messageQueue) {
            if (msgi.msg.length > this.length)
                this.length = msgi.msg.length;
        }

        this.timer = 0;
    }

    UpdateWithArgs(x, y, clicked) {
        if (x < this.length + 6 && y >= this.top) {
            if (clicked && y > this.top && (y - this.top - 1) >= 0 && (y - this.top - 1) < this.messageQueue.length) {
                this.AnnouncementClicked(this.messageQueue[y - this.top - 1]);
            }
            return MenuResult.MENUHIT;
        }
        return MenuResult.NOMENUHIT;
    }
    Draw(...args) {
        if (args.length == 1)
            this.DrawWithOneArg(...args);
        else
            this.DrawWithFourArgs(...args);
    }
    DrawWithOneArg(the_console) {
        the_console.setAlignment(Alignment.LEFT);

        this.top = the_console.getHeight() - 1 - this.height;
        if (this.height <= 0) return;
        if (this.height >= the_console.getHeight() - 1) return;

        the_console.hline(0, this.top, this.length + 6);
        the_console.putChar(this.length + 5, this.top, TCOD_CHAR_NE, TCOD_BKGND_SET);
        the_console.vline(this.length + 5, this.top + 1, this.height);
        the_console.rect(0, this.top + 1, this.length + 5, this.height, true);

        for (let i = Math.min(this.messageQueue.length - 1, this.height - 1); i >= 0; --i) {
            let msg = this.messageQueue[i];
            the_console.setDefaultForeground(msg.color);
            the_console.print(0, the_console.getHeight() - (this.height - i), msg.toString());
        }
    }
    DrawWithFourArgs(pos, from, amount, the_console) {
        let count = 0;
        for (let i = this.messageQueue.length - 1; i >= 0; --i) {
            let ani = this.messageQueue[i];
            if (count++ >= from) {
                the_console.print(pos.X(), pos.Y() + count - from, (ani).toString());
                if (count - from + 1 == amount) return;
            }
        }
        for (let i = this.history.length - 1; i >= 0; --i) {
            let ani = this.history[i];
            if (count++ >= from) {
                the_console.print(pos.X(), pos.Y() + count - from, (ani).toString());
                if (count - from + 1 == amount) return;
            }
        }
    }
}

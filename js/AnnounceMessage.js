import {
    Color
} from "./other/Color.js";

export class AnnounceMessage {
    result = "";
    msg = "";
    counter = 1;
    color = new Color();
    target = new Coordinate();
    constructor(nmsg, col = Color.white, pos = Coordinate(-1, -1)) {
        this.msg = nmsg;
        this.color = col;
        this.target = pos;
    }
    toString() {
        this.result = this.msg;
        if (this.counter > 1) {
            this.result += ` x${this.counter}`;
        }
        if (this.target.X() > -1 && this.target.Y() > -1) {
            this.result += ` ${TCOD_CHAR_ARROW_E}`;
        }
        return this.result;
    }
}
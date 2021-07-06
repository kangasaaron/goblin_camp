import {
    TCODColor
} from "../../fakeTCOD/libtcod.js";
import {
    Coordinate
} from "../Coordinate.js";

export class AnnounceMessage {
    result = "";
    msg = "";
    counter = 1;
    color = new TCODColor();
    target = new Coordinate();
    constructor(nmsg, col = TCODColor.white, pos = Coordinate(-1, -1)) {
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

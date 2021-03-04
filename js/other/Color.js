export class Color extends Array {
    static CLASS_VERSION = 0;
    constructor(r = 0, g = 0, b = 0) {
        super(3);
        this.r = r;
        this.g = g;
        this.b = b;
    }
    get r() {
        return this[0];
    }
    set r(value) {
        this[0] = Math.round(value);
    }
    get g() {
        return this[1];
    }
    set g(value) {
        this[1] = Math.round(value);
    }
    get b() {
        return this[2];
    }
    set b(value) {
        this[2] = Math.round(value);
    }
    clone() {
        return Color.deserialize(this);
    }
    hashCode() {
        return `Color${this[0].toString(16)}${this[1].toString(16)}${this[2].toString(16)}`
    }
    serialize() {
        return {
            r: this[0],
            g: this[1],
            b: this[2]
        };
    }
    static deserialize(data) {
        return new Color(data.r, data.g, data.b);
    }
    static get white() {
        return white;
    }
    static get black() {
        return black;
    }
    static get yellow() {
        return yellow;
    }
    static get cyan() {
        return cyan;
    }
    static get lightGreen() {
        return lightGreen;
    }
    static get pink() {
        return pink;
    }
}
const white = Object.freeze(new Color(255, 255, 255));
const black = Object.freeze(new Color());
const yellow = Object.freeze(new Color(255, 255, 0));
const cyan = Object.freeze(new Color(0, 255, 255));
const lightGreen = Object.freeze(new Color(0, 255, 0));
const pink = Object.freeze(new Color(255, 220, 220)); //???
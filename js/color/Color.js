import { Serializable } from "../data/Serialization.js";
import { color } from "./d3_index.js";

export class Color extends Serializable {
    static CLASS_VERSION = 0;
    constructor(r = 0, g = 0, b = 0, opacity = 1) {
        super();
        if (typeof r === "string")
            this._storage = color(r);
        else
            this._storage = color(`rgba(${r},${g},${b},${opacity})`);
        Object.freeze(this);
    }
    get r() {
        return this._storage.r;
    }
    get g() {
        return this._storage.g;
    }
    get b() {
        return this._storage.b;
    }
    get opacity() {
        return this._storage.opacity;
    }
    equals(that) {
        return this.r == that.r &&
            this.g == that.g &&
            this.b == that.b &&
            this.opacity == that.opacity;
    }
    isNotEqualTo(that) {
        return !this.equals(that);
    }
    serialize(ar, version) {
        return {
            r: this.r,
            g: this.g,
            b: this.b,
            opacity: this.opacity
        };
    }
    static deserialize(data, version, deserializer) {
        return new Color(data.r, data.g, data.b, data.opacity);
    }
}
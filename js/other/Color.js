import "./d3.js";

export class Color extends d3.color {
    clone() {
        return Color.deserialize(this);
    }
    hashCode() {
        return `Color${this.toString()}`;
    }
    serialize() {
        return {
            r: this.r,
            g: this.g,
            b: this.b,
            opacity: this.opacity
        };
    }
    static deserialize(data) {
        return new Color(data.r, data.g, data.b, data.opacity);
    }
}
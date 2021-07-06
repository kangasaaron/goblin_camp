export class ItemCat {
    constructor(name, flammable = false, parent = null) {
        /** @type {String} */
        this.name = name;
        /** @type {Boolean} */
        this.flammable = flammable;
        /** @type {ItemCat} */
        this.parent = parent;
    }
    GetName() {
        return this.name;
    }
    equals(that) {
        return (this.flammable === that.flammable &&
            this.name === that.name &&
            this.parent === that.parent);
    }
    isNotEqualTo(that) {
        return !(this.equals(that));
    }
    static deserialize(data) {
        return new ItemCat(data.category_type, data.flammable || false, data.parent || null);
    }
}
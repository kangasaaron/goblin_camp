export class ItemCat {
    flammable = false;
    name = "Category schmategory";
    parent = null;
    constructor(name, flammable = false, parent = null) {
        this.name = name;
        this.flammable = flammable
        this.parent = parent
    }
    GetName() {
        return this.name;
    }
    equals(that) {
        return (this.flammable == that.flammable &&
            this.name == that.name &&
            this.parent == that.parent);
    }
    isNotEqualTo(that) {
        return !(this.equals(that));
    }
    static deserialize(data) {
        return new ItemCat(data.category_type, data.flammable || false, data.parent || null);
    }
}
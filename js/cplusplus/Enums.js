/**
 * @class
 * @extends {number}
 */
export class Enum extends Number {
    constructor(value, name, ordinal) {
        super(value);
        this.name = name;
        this.value = value;
        this.description = Object.getPrototypeOf(this).constructor.name + "." + name;
        this.ordinal = ordinal;
        Object.defineProperty(this, "name", {
            writeable: false,
            configurable: false,
            enumerable: false,
            value: this.name,
        });
        Object.defineProperty(this, "value", {
            writeable: false,
            configurable: false,
            enumerable: false,
            value: this.value,
        });
        Object.defineProperty(this, "description", {
            writeable: false,
            configurable: false,
            enumerable: false,
            value: this.description,
        });
        Object.defineProperty(this, "ordinal", {
            writeable: false,
            configurable: false,
            enumerable: false,
            value: this.ordinal,
        });
    }
    hashCode() {
        return this.ordinal;
    }
    equals(that) {
        return this.valueOf() === that.valueOf();
    }

    [Symbol.toPrimitive](hint) {
        if (hint === "number") return this.value;
        else if (hint === "string") return super.toString(10);
        return this.value;
    }
    serialize() {
        return {
            name: this.description,
            value: this.value,
        };
    }
    get enumName() {
        return Object.getPrototypeOf(this).constructor.name;
    }
    static deserialize(data) {
        return this.findByValue(data.value);
    }
    static findByValue(value) {
        return this.values.find((en) => en.value === value);
    }
    static[Symbol.iterator]() {
        return this.values();
    }
    static keys() { return this.ks; }
    static values() { return this.vals; }
    static entries() { return this.entrs; }
    static enumify(freeze = true) {
        let nextValue = 0,
            ordinal = -1,
            usedValues = [],
            ks = [],
            vals = [],
            entrs = [];
        for (let name of Object.keys(this)) {
            let value = this[name];
            ordinal++;
            if (Number.isFinite(value)) nextValue = value;
            while (
                value === null ||
                value === undefined ||
                usedValues.includes(value)
            ) {
                value = nextValue;
                nextValue++;
            }

            let enumValue = new this(value, name, ordinal);
            Object.defineProperty(this, name, {
                writeable: false,
                configurable: false,
                enumerable: true,
                value: enumValue,
            });

            ks.push(name);
            vals.push(enumValue);
            entrs.push([name, value]);
            if (freeze) Object.freeze(enumValue);
        }

        Object.defineProperty(this, "ks", {
            writeable: freeze,
            configurable: freeze,
            enumerable: false,
            value: ks,
        });

        Object.defineProperty(this, "vals", {
            writeable: freeze,
            configurable: freeze,
            enumerable: false,
            value: vals,
        });

        Object.defineProperty(this, entrs, {
            writeable: freeze,
            configurable: freeze,
            enumerable: false,
            value: entrs,
        });
        if (freeze) {
            Object.freeze(this.ks);
            Object.freeze(this.vals);
            Object.freeze(this.entrs);
            Object.freeze(this);
        }
    }
}
Enum.vals = [];
Enum.ks = [];
Enum.entrs = [];

export function Enumify(obj){
    let return_enum = class extends Enum{};
    for(let key of Object.keys(obj)){
        return_enum[key] = obj[key]
    }
    return_enum.enumify();
    return return_enum;
}
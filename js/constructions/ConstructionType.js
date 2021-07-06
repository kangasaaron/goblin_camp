
export class ConstructionType extends Number {
    constructor(value) {
        super(value)
        this.v = value
    }

    [Symbol.toPrimitive](hint) {
        return this.v
    }
}

export class SpritePtr {
    ptr = null;
    constructor(sprite) {
        if (typeof sprite !== "undefined")
            this.ptr = sprite;
    }
    get() {
        return this.ptr.get();
    }
    Exists() {
        return !(!(this.ptr));
    }
    Draw(...args) {
        if (this.ptr)
            this.ptr.Draw(...args);
    }
    IsConnectionMap() {
        return this.ptr && this.ptr.IsConnectionMap();
    }
    IsTwoLayeredConnectionMap() {
        return this.ptr && this.ptr.IsTwoLayeredConnectionMap();
    }
    sAnimated() {
        return this.ptr && this.ptr.IsAnimated();
    }
}
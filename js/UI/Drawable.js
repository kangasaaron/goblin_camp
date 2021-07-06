import {
    MenuResult
} from "./MenuResult.js";

export class Drawable {
    constructor(x, y, nwidth, nheight) {
        this._x = x;
        this._y = y;
        this.width = nwidth;
        this.height = nheight;
        this.visible = 0;
        this.getTooltip = null;
    }
    Update(x, y, clicked, key) {
        return (x >= this._x && x < this._x + this.height && y >= this._y && y < this._y + this.height) ? MenuResult.MENUHIT : MenuResult.NOMENUHIT;
    }
    Height() {
        return this.height;
    }
    Visible() {
        return this.visible;
    }
    SetVisible(nvisible) {
        this.visible = nvisible;
    }
    GetTooltip(x, y, tooltip) {
        if (this.getTooltip)
            return this.getTooltip(x, y, tooltip);
    }
    SetTooltip(ntooltip) {
        this.getTooltip = ntooltip;
    }
}

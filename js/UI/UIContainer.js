import {
    Drawable
} from "./Drawable.js";
import {
    MenuResult
} from "./MenuResult.js";

export class UIContainer extends Drawable {
    components = [];

    AddComponent(component) {
        this.components.push(component);
    }

    Draw(x, y, the_console) {
        for (let component of this.components.filter(component => component.Visible())) {
            component.Draw(x + this._x, y + this._y, the_console);
        }
    }
    Update(x, y, clicked, key) {
        for (let component of this.components.filter(component => component.Visible())) {
            let result = component.Update(x - this._x, y - this._y, clicked, key);
            if (!(result & MenuResult.NOMENUHIT)) {
                return result;
            }
        }

        if (x >= this._x && x < this._x + this.width && y >= this._y && y < this._y + this.height) {
            return MenuResult.MENUHIT;
        }

        return MenuResult.NOMENUHIT;
    }

    GetTooltip(x, y, tooltip) {
        super.GetTooltip(x, y, tooltip);
        for (let component of this.components.filter(component => component.Visible())) {
            component.GetTooltip(x - this._x, y - this._y, tooltip);
        }
    }
}
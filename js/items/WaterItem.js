import { Game } from "./Game.js";
import { OrganicItem } from "./OrganicItem.js";

export class WaterItem extends OrganicItem {
    static CLASS_VERSION = 0;
    PutInContainer(con = null) {
        this.container = con;
        this.attemptedStore = false;

        Game.i.ItemContained(this, !!this.container.lock());

        if (!this.container.lock() && !this.reserved) {
            //WaterItems transform into an actual waternode if not contained
            Game.i.CreateWater(this.Position(), 1);
            Game.i.RemoveItem(this);
        }
    }
}

import {BlendMode} from "../BlendMode.js";
import {Color, TCOD_chars_t} from "../libtcod.js";
import {Item} from "../Item.js";
import {MenuResult} from "./MenuResult.js";
import {Scrollable} from "./Scrollable.js";

export class ProductList extends Scrollable {
    construct = null;
    height = 0;
    productPlacement = [];
    constructor(nconstruct) {
        super();
        this.construct = nconstruct;
    }

    Draw(x, _y, scroll, width, _height, the_console) {
        let cons = this.construct.lock();
        if (cons) {
            let y = 0;
            for (let prodi = 0; prodi < cons.Products().length && y < scroll + _height; ++prodi) {
                if (y >= scroll) {
                    the_console.setDefaultForeground(Color.white);
                    the_console.print(x, _y + y - scroll, "%s x%d", Item.ItemTypeToString(cons.Products(prodi)), Item.Presets[cons.Products(prodi)].multiplier);
                }
                ++y;
                for (let compi = 0; compi < Item.Components(cons.Products(prodi)).length && y < scroll + _height; ++compi) {
                    if (y >= scroll) {
                        the_console.setDefaultForeground(Color.white);
                        the_console.putChar(x + 1, _y + y - scroll, compi + 1 < Item.Components(cons.Products(prodi)).length ? TCOD_chars_t.TCOD_CHAR_TEEE : TCOD_chars_t.TCOD_CHAR_SW, TCOD_bkgnd_flag_t.TCOD_BKGND_SET);
                        the_console.setDefaultForeground(Color.grey);
                        the_console.print(x + 2, _y + y - scroll, Item.ItemCategoryToString(Item.Components(cons.Products(prodi), compi)));
                    }
                    ++y;
                }
                ++y;
            }
        }
        the_console.setDefaultForeground(Color.white);
    }

    TotalHeight() {
        return this.height;
    }

    Update(x, y, clicked, key) {
        for (let i = 0; i < this.productPlacement.length; ++i) {
            if (y === this.productPlacement[i]) {
                if (clicked && this.construct.lock()) {
                    this.construct.lock().AddJob(this.construct.lock().Products(i));
                }
                return MenuResult.MENUHIT;
            }
        }
        return MenuResult.NOMENUHIT;
    }
}
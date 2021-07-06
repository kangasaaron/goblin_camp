import {Game} from "../Game.js";

export class MenuChoice {
    constructor(ntext = "", cb = () => Game.i.DoNothing(), nenabled = true, ntooltip = "") {
        this.label = ntext;
        this.callback = cb;
        this.enabled = nenabled;
        this.tooltip = ntooltip;
    }
}
export class MenuChoice {
    label = "";
    callback = null;
    enabled = false;
    tooltip = "";

    constructor(ntext = "", cb = Game.DoNothing.bind(), nenabled = true, ntooltip = "") {
        this.label = ntext;
        this.callback = cb;
        this.enabled = nenabled;
        this.tooltip = ntooltip;
    }
};
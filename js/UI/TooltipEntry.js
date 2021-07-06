
export class TooltipEntry {
    constructor(ntext, ncolor) {
        /** @type {String} */
        this.text = ntext;
        /** @type {TCODColor} */
        this.color = ncolor.clone();
    }
}
import {
    Color
} from "../color/Color.js";

export class TooltipEntry {
    text = "";
    color = new Color();
    constructor(ntext, ncolor) {
        this.text = ntext;
        this.color = ncolor.clone();
    }
}
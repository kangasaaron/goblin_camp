
import { BlendMode } from "./BlendMode.js";
import { Alignment } from "./Alignment.js";
import { Color } from "../color/Color.js";
import { Chars } from "./Chars.js";

class Tile {
    char = " ";
    fg = Color.white;
    bg = Color.black;
    flag = 0;
    x = 0;
    y = 0;
    element;
    constructor(x, y, element, char = " ", fg, bg, flag) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.fg = fg;
        this.bg = bg;
        this.flag = flag;
        this.element = element;
        this.dirty = true;
    }
    render() {
        if (this.dirty === false) return;
        this.element.innerHTML = this.char;
        this.element.style.backgroundColor = this.bg;
        this.element.style.color = this.fg;
        this.dirty = false;
    }
    setChar(c) {
        if (c == " ") c = "&nbsp;"
        if (this.char === c) return;
        this.char = c;
        this.dirty = true;
    }
    setBackground(color) {
        if (this.bg === color.toString()) return;
        this.bg = color.toString();
        this.dirty = true;
    }
    setForeground(color) {
        if (this.fg === color.toString()) return;
        this.fg = color.toString();
        this.dirty = true;
    }
}

export class Console {
    foreground = Color.white;
    background = Color.black;
    alignment = Alignment.CENTER;
    constructor(w, h, title, fullscreen) {
        this.charGrid = [];
        this.width = w;
        this.height = h;
        let styleElement = document.createElement('style');
        styleElement.innerHTML = `
.c_table {
    font-family: ui-sans-serif,sans-serif;
    font-size: smaller
}
.c_row {
    width: ${this.width}em;
    height: 1em
}
.c_cell {
    height: 1em; 
    width: 1em;
    cursor: default;
    text-align: center;
}`;

        let tableElement = document.createElement("table");
        tableElement.cellPadding = 0;
        tableElement.cellSpacing = 0;
        tableElement.className = "c_table";
        for (let j = 0; j < h; j++) {
            let rowElement = document.createElement("tr");
            rowElement.className = `c_row`;
            rowElement.id = `c_${j}`;
            for (let i = 0; i < w; i++) {
                let cellElement = document.createElement("td");
                cellElement.className = `c_cell`;
                cellElement.id = `c_${i}_${j}`;
                rowElement.appendChild(cellElement);
            }
            tableElement.appendChild(rowElement);
        }
        this.setWindowTitle(title);
        document.body.append(styleElement);
        document.body.append(tableElement);

        for (let i = 0; i < w; i++) {
            this.charGrid[i] = [];
            for (let j = 0; j < h; j++) {
                this.charGrid[i][j] = new Tile(i, j, document.getElementById(`c_${i}_${j}`));
            }
        }
        this.clear();
        window.setInterval(this.flush.bind(this), 200)
    }
    flush() {
        for (let row of this.charGrid) {
            for (let column of row) {
                column.render();
            }
        }
    }
    clear() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.setCharBackground(i, j, this.background, BlendMode.BKGND_SET);
                this.setCharForeground(i, j, this.foreground);
                this.setChar(i, j, " ");
            }
        }
    }
    setCharBackground(x, y, color, flag) {
        //TODO implement the flag param
        x = Math.round(x);
        y = Math.round(y);
        this.charGrid[x][y].setBackground(color);
    }
    setCharForeground(x, y, color) {
        x = Math.round(x);
        y = Math.round(y);
        this.charGrid[x][y].setForeground(color);
    }
    setChar(x, y, c) {
        x = Math.round(x);
        y = Math.round(y);
        this.charGrid[x][y].setChar(c);
    }
    setBackgroundFlag(f) {
        this.backgroundFlag = f;
    }
    putCharEx(x, y, c, f, fg, bg) {
        this.setChar(x, y, c);
        this.setCharForeground(x, y, fg);
        this.setCharBackground(x, y, bg, f)
    }
    putChar(x, y, char = "", flag = BlendMode.BKGND_DEFAULT) {
        this.putCharEx(x, y, char, flag, this.foreground, this.background);
    }
    setDefaultForeground(f) {
        this.foreground = f;
    }
    setDefaultBackground(b) {
        this.background = b;
    }
    setAlignment(a) {
        this.alignment = a;
    }
    hLine(x, y, l, flag) {
        for (let i = x; i < x + l; i++) {
            this.putChar(i, y, Chars.light_horizontal, flag)
        }
    }
    vLine(x, y, l, flag) {
        for (let j = y; j < y + l; j++) {
            this.putChar(x, j, Chars.light_vertical, flag)
        }
    }
    rect(x, y, w, h, clear, flag) {
        for (let i = x; i < x + w; i++) {
            for (let j = y; j < y + h; j++) {
                this.setCharBackground(i, j, " ");
            }
        }
    }
    printFrame(x, y, w, h, clear, flag, text = "") {
        this.rect(x, y, w, h, flag);
        this.hLine(x + 1, y, w - 1, flag);
        this.hLine(x + 1, y + h, w - 1, flag);
        this.vLine(x, y + 1, h - 1, flag);
        this.vLine(x + w, y + 1, h - 1, flag);
        this.putChar(x, y, Chars.light_down_and_right, flag);
        this.putChar(x + w, y, Chars.light_down_and_left, flag);
        this.putChar(x, y + h, Chars.light_up_and_right, flag);
        this.putChar(x + w, y + h, Chars.light_up_and_left, flag);
        this.print(x, y, text);
    }
    print(x, y, text = "") {
        if (!text || !text.length) return;
        // TODO worry about text alignment here
        for (let i = 0, il = text.length; i < il; i++) {
            this.putChar(x + i, y, text.charAt(i));
        }
    }
    setWindowTitle(title) {
        document.title = title;
    }
}

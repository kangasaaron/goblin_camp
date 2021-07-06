import {
    Drawable
} from "./Drawable.js";

export class Panel extends Drawable {
    constructor(nwidth, nheight) {
        super(0, 0, nwidth, nheight);
    }

    selected(newSel) { }
    Open() { }
    Close() {
        UI.SetTextMode(false);
    }

    ShowModal() {
        let background = new TCODConsole(Game.i.ScreenWidth(), Game.i.ScreenHeight());
        TCODConsole.blit(TCODConsole.root, 0, 0, Game.i.ScreenWidth(), Game.i.ScreenHeight(),
            background, 0, 0);

        let _x = (Game.i.ScreenWidth() - width) / 2;
        let _y = (Game.i.ScreenHeight() - height) / 2;
        let key;
        let mouse;
        let event;

        TCODMouse.showCursor(true);
        while (this.PanelLoop(_x, _y, event, mouse, key)) {
            ;
        }
    }
    PanelLoop(_x, _y, event, mouse, key) {
        TCODConsole.root.clear();
        TCODConsole.root.setDefaultForeground(Color.white);
        TCODConsole.root.setDefaultBackground(Color.black);
        TCODConsole.blit(background, 0, 0, Game.i.ScreenWidth(), Game.i.ScreenHeight(),
            TCODConsole.root, 0, 0, 0.7, 1.0);

        this.Draw(_x, _y, TCODConsole.root);
        TCODConsole.root.flush();

        event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

        if (event & TCOD_EVENT_ANY) {
            mouse = TCODMouse.getStatus();

            let result = this.Update(mouse.cx, mouse.cy, mouse.lbutton_pressed !== 0, key);
            if ((result & MenuResult.DISMISS) || key.vk === TCODK_ESCAPE) {
                delete this;
                return false;
            }
        }
        return true;
    }
}

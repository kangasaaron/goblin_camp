import {
    Drawable
} from "./Drawable";

export class Panel extends Drawable {
    constructor(nwidth, nheight) {
        super(0, 0, nwidth, nheight);
    }

    selected(newSel) {}
    Open() {}
    Close() {
        UI.Inst().SetTextMode(false);
    }

    ShowModal() {
        let background = new TCODConsole(Game.Inst().ScreenWidth(), Game.Inst().ScreenHeight());
        TCODConsole.blit(TCODConsole.root, 0, 0, Game.Inst().ScreenWidth(), Game.Inst().ScreenHeight(),
            background, 0, 0);

        let _x = (Game.Inst().ScreenWidth() - width) / 2;
        let _y = (Game.Inst().ScreenHeight() - height) / 2;
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
        TCODConsole.root.setDefaultForeground(TCODColor.white);
        TCODConsole.root.setDefaultBackground(TCODColor.black);
        TCODConsole.blit(background, 0, 0, Game.Inst().ScreenWidth(), Game.Inst().ScreenHeight(),
            TCODConsole.root, 0, 0, 0.7, 1.0);

        this.Draw(_x, _y, TCODConsole.root);
        TCODConsole.root.flush();

        event = TCODSystem.checkForEvent(TCOD_EVENT_ANY, key, mouse);

        if (event & TCOD_EVENT_ANY) {
            mouse = TCODMouse.getStatus();

            let result = this.Update(mouse.cx, mouse.cy, mouse.lbutton_pressed != 0, key);
            if ((result & MenuResult.DISMISS) || key.vk == TCODK_ESCAPE) {
                delete this;
                return false;
            }
        }
        return true;
    }
}
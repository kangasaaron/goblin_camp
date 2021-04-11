import {
    Enum
} from "./other/Enums.js";

export class UIState extends Enum {
    static UINORMAL; // No selection highlights
    static UIPLACEMENT;
    static UIABPLACEMENT;
    static UIRECTPLACEMENT;
    static UICOUNT;
};
UIState.enumify();
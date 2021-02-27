import {
    defineEnum
} from "./other/Enums.js";

export const UIState = defineEnum("UIState", [
    'UINORMAL', // No selection highlights
    'UIPLACEMENT',
    'UIABPLACEMENT',
    'UIRECTPLACEMENT',
    'UICOUNT'
]);
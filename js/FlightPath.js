import {
    Coordinate
} from "./Coordinate.js";

export class FlightPath {
    coord = new Coordinate();
    height = -1;
    constructor(c) {
        this.coord = c;
    }
}
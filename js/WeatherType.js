import {
    Enum
} from "./other/Enums.js";

export class WeatherType extends Enum {
    static NORMALWEATHER;
    static RAIN;
}
WeatherType.enumify();

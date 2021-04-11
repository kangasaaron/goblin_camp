import {
    Enum
} from "./other/enums.js";

export class WeatherType extends Enum {
    static NORMALWEATHER;
    static RAIN;
}
WeatherType.enumify();
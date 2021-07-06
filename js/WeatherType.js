import {
    Enum
} from "./cplusplus/Enums.js";

export class WeatherType extends Enum {
    static NORMALWEATHER;
    static RAIN;
}
WeatherType.enumify();

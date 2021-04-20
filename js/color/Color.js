import { Serializable } from "../data/Serialization.js";
import { color } from "./d3_index.js";

export class Color extends Serializable {
    static CLASS_VERSION = 0;
    constructor(r = 0, g = 0, b = 0, opacity = 1) {
        super();
        if (typeof r === "string")
            this._storage = color(r);
        else
            this._storage = color(`rgba(${r},${g},${b},${opacity})`);
        Object.freeze(this);
    }
    toString() {
        return this._storage.toString();
    }
    get r() {
        return this._storage.r;
    }
    get g() {
        return this._storage.g;
    }
    get b() {
        return this._storage.b;
    }
    get opacity() {
        return this._storage.opacity;
    }
    equals(that) {
        return this.r == that.r &&
            this.g == that.g &&
            this.b == that.b &&
            this.opacity == that.opacity;
    }
    isNotEqualTo(that) {
        return !this.equals(that);
    }
    serialize(ar, version) {
        return {
            r: this.r,
            g: this.g,
            b: this.b,
            opacity: this.opacity
        };
    }
    static deserialize(data, version, deserializer) {
        return new Color(data.r, data.g, data.b, data.opacity);
    }



    static get black() { return new Color(0, 0, 0) };
    static get darkest_grey() { return new Color(31, 31, 31) };
    static get darker_grey() { return new Color(63, 63, 63) };
    static get dark_grey() { return new Color(95, 95, 95) };
    static get grey() { return new Color(127, 127, 127) };
    static get light_grey() { return new Color(159, 159, 159) };
    static get lighter_grey() { return new Color(191, 191, 191) };
    static get lightest_grey() { return new Color(223, 223, 223) };
    static get white() { return new Color(255, 255, 255) };

    static get darkest_sepia() { return new Color(31, 24, 15) };
    static get darker_sepia() { return new Color(63, 50, 31) };
    static get dark_sepia() { return new Color(94, 75, 47) };
    static get sepia() { return new Color(127, 101, 63) };
    static get light_sepia() { return new Color(158, 134, 100) };
    static get lighter_sepia() { return new Color(191, 171, 143) };
    static get lightest_sepia() { return new Color(222, 211, 195) };

    /* desaturated */
    static get desaturated_red() { return new Color(127, 63, 63) };
    static get desaturated_flame() { return new Color(127, 79, 63) };
    static get desaturated_orange() { return new Color(127, 95, 63) };
    static get desaturated_amber() { return new Color(127, 111, 63) };
    static get desaturated_yellow() { return new Color(127, 127, 63) };
    static get desaturated_lime() { return new Color(111, 127, 63) };
    static get desaturated_chartreuse() { return new Color(95, 127, 63) };
    static get desaturated_green() { return new Color(63, 127, 63) };
    static get desaturated_sea() { return new Color(63, 127, 95) };
    static get desaturated_turquoise() { return new Color(63, 127, 111) };
    static get desaturated_cyan() { return new Color(63, 127, 127) };
    static get desaturated_sky() { return new Color(63, 111, 127) };
    static get desaturated_azure() { return new Color(63, 95, 127) };
    static get desaturated_blue() { return new Color(63, 63, 127) };
    static get desaturated_han() { return new Color(79, 63, 127) };
    static get desaturated_violet() { return new Color(95, 63, 127) };
    static get desaturated_purple() { return new Color(111, 63, 127) };
    static get desaturated_fuchsia() { return new Color(127, 63, 127) };
    static get desaturated_magenta() { return new Color(127, 63, 111) };
    static get desaturated_pink() { return new Color(127, 63, 95) };
    static get desaturated_crimson() { return new Color(127, 63, 79) };

    /* lightest */
    static get lightest_red() { return new Color(255, 191, 191) };
    static get lightest_flame() { return new Color(255, 207, 191) };
    static get lightest_orange() { return new Color(255, 223, 191) };
    static get lightest_amber() { return new Color(255, 239, 191) };
    static get lightest_yellow() { return new Color(255, 255, 191) };
    static get lightest_lime() { return new Color(239, 255, 191) };
    static get lightest_chartreuse() { return new Color(223, 255, 191) };
    static get lightest_green() { return new Color(191, 255, 191) };
    static get lightest_sea() { return new Color(191, 255, 223) };
    static get lightest_turquoise() { return new Color(191, 255, 239) };
    static get lightest_cyan() { return new Color(191, 255, 255) };
    static get lightest_sky() { return new Color(191, 239, 255) };
    static get lightest_azure() { return new Color(191, 223, 255) };
    static get lightest_blue() { return new Color(191, 191, 255) };
    static get lightest_han() { return new Color(207, 191, 255) };
    static get lightest_violet() { return new Color(223, 191, 255) };
    static get lightest_purple() { return new Color(239, 191, 255) };
    static get lightest_fuchsia() { return new Color(255, 191, 255) };
    static get lightest_magenta() { return new Color(255, 191, 239) };
    static get lightest_pink() { return new Color(255, 191, 223) };
    static get lightest_crimson() { return new Color(255, 191, 207) };

    /* lighter */
    static get lighter_red() { return new Color(255, 127, 127) };
    static get lighter_flame() { return new Color(255, 159, 127) };
    static get lighter_orange() { return new Color(255, 191, 127) };
    static get lighter_amber() { return new Color(255, 223, 127) };
    static get lighter_yellow() { return new Color(255, 255, 127) };
    static get lighter_lime() { return new Color(223, 255, 127) };
    static get lighter_chartreuse() { return new Color(191, 255, 127) };
    static get lighter_green() { return new Color(127, 255, 127) };
    static get lighter_sea() { return new Color(127, 255, 191) };
    static get lighter_turquoise() { return new Color(127, 255, 223) };
    static get lighter_cyan() { return new Color(127, 255, 255) };
    static get lighter_sky() { return new Color(127, 223, 255) };
    static get lighter_azure() { return new Color(127, 191, 255) };
    static get lighter_blue() { return new Color(127, 127, 255) };
    static get lighter_han() { return new Color(159, 127, 255) };
    static get lighter_violet() { return new Color(191, 127, 255) };
    static get lighter_purple() { return new Color(223, 127, 255) };
    static get lighter_fuchsia() { return new Color(255, 127, 255) };
    static get lighter_magenta() { return new Color(255, 127, 223) };
    static get lighter_pink() { return new Color(255, 127, 191) };
    static get lighter_crimson() { return new Color(255, 127, 159) };

    /* light */
    static get light_red() { return new Color(255, 63, 63) };
    static get light_flame() { return new Color(255, 111, 63) };
    static get light_orange() { return new Color(255, 159, 63) };
    static get light_amber() { return new Color(255, 207, 63) };
    static get light_yellow() { return new Color(255, 255, 63) };
    static get light_lime() { return new Color(207, 255, 63) };
    static get light_chartreuse() { return new Color(159, 255, 63) };
    static get light_green() { return new Color(63, 255, 63) };
    static get light_sea() { return new Color(63, 255, 159) };
    static get light_turquoise() { return new Color(63, 255, 207) };
    static get light_cyan() { return new Color(63, 255, 255) };
    static get light_sky() { return new Color(63, 207, 255) };
    static get light_azure() { return new Color(63, 159, 255) };
    static get light_blue() { return new Color(63, 63, 255) };
    static get light_han() { return new Color(111, 63, 255) };
    static get light_violet() { return new Color(159, 63, 255) };
    static get light_purple() { return new Color(207, 63, 255) };
    static get light_fuchsia() { return new Color(255, 63, 255) };
    static get light_magenta() { return new Color(255, 63, 207) };
    static get light_pink() { return new Color(255, 63, 159) };
    static get light_crimson() { return new Color(255, 63, 111) };

    /* normal */
    static get red() { return new Color(255, 0, 0) };
    static get flame() { return new Color(255, 63, 0) };
    static get orange() { return new Color(255, 127, 0) };
    static get amber() { return new Color(255, 191, 0) };
    static get yellow() { return new Color(255, 255, 0) };
    static get lime() { return new Color(191, 255, 0) };
    static get chartreuse() { return new Color(127, 255, 0) };
    static get green() { return new Color(0, 255, 0) };
    static get sea() { return new Color(0, 255, 127) };
    static get turquoise() { return new Color(0, 255, 191) };
    static get cyan() { return new Color(0, 255, 255) };
    static get sky() { return new Color(0, 191, 255) };
    static get azure() { return new Color(0, 127, 255) };
    static get blue() { return new Color(0, 0, 255) };
    static get han() { return new Color(63, 0, 255) };
    static get violet() { return new Color(127, 0, 255) };
    static get purple() { return new Color(191, 0, 255) };
    static get fuchsia() { return new Color(255, 0, 255) };
    static get magenta() { return new Color(255, 0, 191) };
    static get pink() { return new Color(255, 0, 127) };
    static get crimson() { return new Color(255, 0, 63) };

    /* dark */
    static get dark_red() { return new Color(191, 0, 0) };
    static get dark_flame() { return new Color(191, 47, 0) };
    static get dark_orange() { return new Color(191, 95, 0) };
    static get dark_amber() { return new Color(191, 143, 0) };
    static get dark_yellow() { return new Color(191, 191, 0) };
    static get dark_lime() { return new Color(143, 191, 0) };
    static get dark_chartreuse() { return new Color(95, 191, 0) };
    static get dark_green() { return new Color(0, 191, 0) };
    static get dark_sea() { return new Color(0, 191, 95) };
    static get dark_turquoise() { return new Color(0, 191, 143) };
    static get dark_cyan() { return new Color(0, 191, 191) };
    static get dark_sky() { return new Color(0, 143, 191) };
    static get dark_azure() { return new Color(0, 95, 191) };
    static get dark_blue() { return new Color(0, 0, 191) };
    static get dark_han() { return new Color(47, 0, 191) };
    static get dark_violet() { return new Color(95, 0, 191) };
    static get dark_purple() { return new Color(143, 0, 191) };
    static get dark_fuchsia() { return new Color(191, 0, 191) };
    static get dark_magenta() { return new Color(191, 0, 143) };
    static get dark_pink() { return new Color(191, 0, 95) };
    static get dark_crimson() { return new Color(191, 0, 47) };

    /* darker */
    static get darker_red() { return new Color(127, 0, 0) };
    static get darker_flame() { return new Color(127, 31, 0) };
    static get darker_orange() { return new Color(127, 63, 0) };
    static get darker_amber() { return new Color(127, 95, 0) };
    static get darker_yellow() { return new Color(127, 127, 0) };
    static get darker_lime() { return new Color(95, 127, 0) };
    static get darker_chartreuse() { return new Color(63, 127, 0) };
    static get darker_green() { return new Color(0, 127, 0) };
    static get darker_sea() { return new Color(0, 127, 63) };
    static get darker_turquoise() { return new Color(0, 127, 95) };
    static get darker_cyan() { return new Color(0, 127, 127) };
    static get darker_sky() { return new Color(0, 95, 127) };
    static get darker_azure() { return new Color(0, 63, 127) };
    static get darker_blue() { return new Color(0, 0, 127) };
    static get darker_han() { return new Color(31, 0, 127) };
    static get darker_violet() { return new Color(63, 0, 127) };
    static get darker_purple() { return new Color(95, 0, 127) };
    static get darker_fuchsia() { return new Color(127, 0, 127) };
    static get darker_magenta() { return new Color(127, 0, 95) };
    static get darker_pink() { return new Color(127, 0, 63) };
    static get darker_crimson() { return new Color(127, 0, 31) };

    /* darkest */
    static get darkest_red() { return new Color(63, 0, 0) };
    static get darkest_flame() { return new Color(63, 15, 0) };
    static get darkest_orange() { return new Color(63, 31, 0) };
    static get darkest_amber() { return new Color(63, 47, 0) };
    static get darkest_yellow() { return new Color(63, 63, 0) };
    static get darkest_lime() { return new Color(47, 63, 0) };
    static get darkest_chartreuse() { return new Color(31, 63, 0) };
    static get darkest_green() { return new Color(0, 63, 0) };
    static get darkest_sea() { return new Color(0, 63, 31) };
    static get darkest_turquoise() { return new Color(0, 63, 47) };
    static get darkest_cyan() { return new Color(0, 63, 63) };
    static get darkest_sky() { return new Color(0, 47, 63) };
    static get darkest_azure() { return new Color(0, 31, 63) };
    static get darkest_blue() { return new Color(0, 0, 63) };
    static get darkest_han() { return new Color(15, 0, 63) };
    static get darkest_violet() { return new Color(31, 0, 63) };
    static get darkest_purple() { return new Color(47, 0, 63) };
    static get darkest_fuchsia() { return new Color(63, 0, 63) };
    static get darkest_magenta() { return new Color(63, 0, 47) };
    static get darkest_pink() { return new Color(63, 0, 31) };
    static get darkest_crimson() { return new Color(63, 0, 15) };

    /* metallic */
    static get brass() { return new Color(191, 151, 96) };
    static get copper() { return new Color(197, 136, 124) };
    static get gold() { return new Color(229, 191, 0) };
    static get silver() { return new Color(203, 203, 203) };

    /* miscellaneous */
    static get celadon() { return new Color(172, 255, 175) };
    static get peach() { return new Color(255, 159, 127) };
}

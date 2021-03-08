/* BSD 3-Clause License
 *
 * Copyright © 2008-2021, Jice and the libtcod contributors.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
import {
    TCODColor,
    TCOD_DESATURATED_RED,
    TCOD_LIGHTEST_RED,
    TCOD_LIGHTER_RED,
    TCOD_LIGHT_RED,
    TCOD_RED,
    TCOD_DARK_RED,
    TCOD_DARKER_RED,
    TCOD_DARKEST_RED,
    TCOD_DESATURATED_FLAME,
    TCOD_LIGHTEST_FLAME,
    TCOD_LIGHTER_FLAME,
    TCOD_LIGHT_FLAME,
    TCOD_FLAME,
    TCOD_DARK_FLAME,
    TCOD_DARKER_FLAME,
    TCOD_DARKEST_FLAME,
    TCOD_DESATURATED_ORANGE,
    TCOD_LIGHTEST_ORANGE,
    TCOD_LIGHTER_ORANGE,
    TCOD_LIGHT_ORANGE,
    TCOD_ORANGE,
    TCOD_DARK_ORANGE,
    TCOD_DARKER_ORANGE,
    TCOD_DARKEST_ORANGE,
    TCOD_DESATURATED_AMBER,
    TCOD_LIGHTEST_AMBER,
    TCOD_LIGHTER_AMBER,
    TCOD_LIGHT_AMBER,
    TCOD_AMBER,
    TCOD_DARK_AMBER,
    TCOD_DARKER_AMBER,
    TCOD_DARKEST_AMBER,
    TCOD_DESATURATED_YELLOW,
    TCOD_LIGHTEST_YELLOW,
    TCOD_LIGHTER_YELLOW,
    TCOD_LIGHT_YELLOW,
    TCOD_YELLOW,
    TCOD_DARK_YELLOW,
    TCOD_DARKER_YELLOW,
    TCOD_DARKEST_YELLOW,
    TCOD_DESATURATED_LIME,
    TCOD_LIGHTEST_LIME,
    TCOD_LIGHTER_LIME,
    TCOD_LIGHT_LIME,
    TCOD_LIME,
    TCOD_DARK_LIME,
    TCOD_DARKER_LIME,
    TCOD_DARKEST_LIME,
    TCOD_DESATURATED_CHARTREUSE,
    TCOD_LIGHTEST_CHARTREUSE,
    TCOD_LIGHTER_CHARTREUSE,
    TCOD_LIGHT_CHARTREUSE,
    TCOD_CHARTREUSE,
    TCOD_DARK_CHARTREUSE,
    TCOD_DARKER_CHARTREUSE,
    TCOD_DARKEST_CHARTREUSE,
    TCOD_DESATURATED_GREEN,
    TCOD_LIGHTEST_GREEN,
    TCOD_LIGHTER_GREEN,
    TCOD_LIGHT_GREEN,
    TCOD_GREEN,
    TCOD_DARK_GREEN,
    TCOD_DARKER_GREEN,
    TCOD_DARKEST_GREEN,
    TCOD_DESATURATED_SEA,
    TCOD_LIGHTEST_SEA,
    TCOD_LIGHTER_SEA,
    TCOD_LIGHT_SEA,
    TCOD_SEA,
    TCOD_DARK_SEA,
    TCOD_DARKER_SEA,
    TCOD_DARKEST_SEA,
    TCOD_DESATURATED_TURQUOISE,
    TCOD_LIGHTEST_TURQUOISE,
    TCOD_LIGHTER_TURQUOISE,
    TCOD_LIGHT_TURQUOISE,
    TCOD_TURQUOISE,
    TCOD_DARK_TURQUOISE,
    TCOD_DARKER_TURQUOISE,
    TCOD_DARKEST_TURQUOISE,
    TCOD_DESATURATED_CYAN,
    TCOD_LIGHTEST_CYAN,
    TCOD_LIGHTER_CYAN,
    TCOD_LIGHT_CYAN,
    TCOD_CYAN,
    TCOD_DARK_CYAN,
    TCOD_DARKER_CYAN,
    TCOD_DARKEST_CYAN,
    TCOD_DESATURATED_SKY,
    TCOD_LIGHTEST_SKY,
    TCOD_LIGHTER_SKY,
    TCOD_LIGHT_SKY,
    TCOD_SKY,
    TCOD_DARK_SKY,
    TCOD_DARKER_SKY,
    TCOD_DARKEST_SKY,
    TCOD_DESATURATED_AZURE,
    TCOD_LIGHTEST_AZURE,
    TCOD_LIGHTER_AZURE,
    TCOD_LIGHT_AZURE,
    TCOD_AZURE,
    TCOD_DARK_AZURE,
    TCOD_DARKER_AZURE,
    TCOD_DARKEST_AZURE,
    TCOD_DESATURATED_BLUE,
    TCOD_LIGHTEST_BLUE,
    TCOD_LIGHTER_BLUE,
    TCOD_LIGHT_BLUE,
    TCOD_BLUE,
    TCOD_DARK_BLUE,
    TCOD_DARKER_BLUE,
    TCOD_DARKEST_BLUE,
    TCOD_DESATURATED_HAN,
    TCOD_LIGHTEST_HAN,
    TCOD_LIGHTER_HAN,
    TCOD_LIGHT_HAN,
    TCOD_HAN,
    TCOD_DARK_HAN,
    TCOD_DARKER_HAN,
    TCOD_DARKEST_HAN,
    TCOD_DESATURATED_VIOLET,
    TCOD_LIGHTEST_VIOLET,
    TCOD_LIGHTER_VIOLET,
    TCOD_LIGHT_VIOLET,
    TCOD_VIOLET,
    TCOD_DARK_VIOLET,
    TCOD_DARKER_VIOLET,
    TCOD_DARKEST_VIOLET,
    TCOD_DESATURATED_PURPLE,
    TCOD_LIGHTEST_PURPLE,
    TCOD_LIGHTER_PURPLE,
    TCOD_LIGHT_PURPLE,
    TCOD_PURPLE,
    TCOD_DARK_PURPLE,
    TCOD_DARKER_PURPLE,
    TCOD_DARKEST_PURPLE,
    TCOD_DESATURATED_FUCHSIA,
    TCOD_LIGHTEST_FUCHSIA,
    TCOD_LIGHTER_FUCHSIA,
    TCOD_LIGHT_FUCHSIA,
    TCOD_FUCHSIA,
    TCOD_DARK_FUCHSIA,
    TCOD_DARKER_FUCHSIA,
    TCOD_DARKEST_FUCHSIA,
    TCOD_DESATURATED_MAGENTA,
    TCOD_LIGHTEST_MAGENTA,
    TCOD_LIGHTER_MAGENTA,
    TCOD_LIGHT_MAGENTA,
    TCOD_MAGENTA,
    TCOD_DARK_MAGENTA,
    TCOD_DARKER_MAGENTA,
    TCOD_DARKEST_MAGENTA,
    TCOD_DESATURATED_PINK,
    TCOD_LIGHTEST_PINK,
    TCOD_LIGHTER_PINK,
    TCOD_LIGHT_PINK,
    TCOD_PINK,
    TCOD_DARK_PINK,
    TCOD_DARKER_PINK,
    TCOD_DARKEST_PINK,
    TCOD_DESATURATED_CRIMSON,
    TCOD_LIGHTEST_CRIMSON,
    TCOD_LIGHTER_CRIMSON,
    TCOD_LIGHT_CRIMSON,
    TCOD_CRIMSON,
    TCOD_DARK_CRIMSON,
    TCOD_DARKER_CRIMSON,
    TCOD_DARKEST_CRIMSON,
    TCOD_BLACK,
    TCOD_DARKEST_GREY,
    TCOD_DARKER_GREY,
    TCOD_DARK_GREY,
    TCOD_GREY,
    TCOD_LIGHT_GREY,
    TCOD_LIGHTER_GREY,
    TCOD_LIGHTEST_GREY,
    TCOD_WHITE,
    TCOD_DARKEST_SEPIA,
    TCOD_DARKER_SEPIA,
    TCOD_DARK_SEPIA,
    TCOD_SEPIA,
    TCOD_LIGHT_SEPIA,
    TCOD_LIGHTER_SEPIA,
    TCOD_LIGHTEST_SEPIA,
    TCOD_BRASS,
    TCOD_COPPER,
    TCOD_GOLD,
    TCOD_SILVER,
    TCOD_CELADON,
    TCOD_PEACH,
    TCOD_color_set_HSV,
    TCOD_color_set_hue,
    TCOD_color_set_saturation,
    TCOD_color_set_value,
    TCOD_color_get_HSV,
    TCOD_color_get_hue,
    TCOD_color_get_saturation,
    TCOD_color_get_value,
    TCOD_color_shift_hue,
    TCOD_color_scale_HSV
} from "./tcod_color_hpp.js"

// grey levels
export const black = TCOD_BLACK;
export const darkestGrey = TCOD_DARKEST_GREY;
export const darkerGrey = TCOD_DARKER_GREY;
export const darkGrey = TCOD_DARK_GREY;
export const grey = TCOD_GREY;
export const lightGrey = TCOD_LIGHT_GREY;
export const lighterGrey = TCOD_LIGHTER_GREY;
export const lightestGrey = TCOD_LIGHTEST_GREY;
export const white = TCOD_WHITE;

// sepia
export const darkestSepia = TCOD_DARKEST_SEPIA;
export const darkerSepia = TCOD_DARKER_SEPIA;
export const darkSepia = TCOD_DARK_SEPIA;
export const sepia = TCOD_SEPIA;
export const lightSepia = TCOD_LIGHT_SEPIA;
export const lighterSepia = TCOD_LIGHTER_SEPIA;
export const lightestSepia = TCOD_LIGHTEST_SEPIA;

// standard colors
export const red = TCOD_RED;
export const flame = TCOD_FLAME;
export const orange = TCOD_ORANGE;
export const amber = TCOD_AMBER;
export const yellow = TCOD_YELLOW;
export const lime = TCOD_LIME;
export const chartreuse = TCOD_CHARTREUSE;
export const green = TCOD_GREEN;
export const sea = TCOD_SEA;
export const turquoise = TCOD_TURQUOISE;
export const cyan = TCOD_CYAN;
export const sky = TCOD_SKY;
export const azure = TCOD_AZURE;
export const blue = TCOD_BLUE;
export const han = TCOD_HAN;
export const violet = TCOD_VIOLET;
export const purple = TCOD_PURPLE;
export const fuchsia = TCOD_FUCHSIA;
export const magenta = TCOD_MAGENTA;
export const pink = TCOD_PINK;
export const crimson = TCOD_CRIMSON;

// dark colors
export const darkRed = TCOD_DARK_RED;
export const darkFlame = TCOD_DARK_FLAME;
export const darkOrange = TCOD_DARK_ORANGE;
export const darkAmber = TCOD_DARK_AMBER;
export const darkYellow = TCOD_DARK_YELLOW;
export const darkLime = TCOD_DARK_LIME;
export const darkChartreuse = TCOD_DARK_CHARTREUSE;
export const darkGreen = TCOD_DARK_GREEN;
export const darkSea = TCOD_DARK_SEA;
export const darkTurquoise = TCOD_DARK_TURQUOISE;
export const darkCyan = TCOD_DARK_CYAN;
export const darkSky = TCOD_DARK_SKY;
export const darkAzure = TCOD_DARK_AZURE;
export const darkBlue = TCOD_DARK_BLUE;
export const darkHan = TCOD_DARK_HAN;
export const darkViolet = TCOD_DARK_VIOLET;
export const darkPurple = TCOD_DARK_PURPLE;
export const darkFuchsia = TCOD_DARK_FUCHSIA;
export const darkMagenta = TCOD_DARK_MAGENTA;
export const darkPink = TCOD_DARK_PINK;
export const darkCrimson = TCOD_DARK_CRIMSON;

// darker colors
export const darkerRed = TCOD_DARKER_RED;
export const darkerFlame = TCOD_DARKER_FLAME;
export const darkerOrange = TCOD_DARKER_ORANGE;
export const darkerAmber = TCOD_DARKER_AMBER;
export const darkerYellow = TCOD_DARKER_YELLOW;
export const darkerLime = TCOD_DARKER_LIME;
export const darkerChartreuse = TCOD_DARKER_CHARTREUSE;
export const darkerGreen = TCOD_DARKER_GREEN;
export const darkerSea = TCOD_DARKER_SEA;
export const darkerTurquoise = TCOD_DARKER_TURQUOISE;
export const darkerCyan = TCOD_DARKER_CYAN;
export const darkerSky = TCOD_DARKER_SKY;
export const darkerAzure = TCOD_DARKER_AZURE;
export const darkerBlue = TCOD_DARKER_BLUE;
export const darkerHan = TCOD_DARKER_HAN;
export const darkerViolet = TCOD_DARKER_VIOLET;
export const darkerPurple = TCOD_DARKER_PURPLE;
export const darkerFuchsia = TCOD_DARKER_FUCHSIA;
export const darkerMagenta = TCOD_DARKER_MAGENTA;
export const darkerPink = TCOD_DARKER_PINK;
export const darkerCrimson = TCOD_DARKER_CRIMSON;

// darkest colors
export const darkestRed = TCOD_DARKEST_RED;
export const darkestFlame = TCOD_DARKEST_FLAME;
export const darkestOrange = TCOD_DARKEST_ORANGE;
export const darkestAmber = TCOD_DARKEST_AMBER;
export const darkestYellow = TCOD_DARKEST_YELLOW;
export const darkestLime = TCOD_DARKEST_LIME;
export const darkestChartreuse = TCOD_DARKEST_CHARTREUSE;
export const darkestGreen = TCOD_DARKEST_GREEN;
export const darkestSea = TCOD_DARKEST_SEA;
export const darkestTurquoise = TCOD_DARKEST_TURQUOISE;
export const darkestCyan = TCOD_DARKEST_CYAN;
export const darkestSky = TCOD_DARKEST_SKY;
export const darkestAzure = TCOD_DARKEST_AZURE;
export const darkestBlue = TCOD_DARKEST_BLUE;
export const darkestHan = TCOD_DARKEST_HAN;
export const darkestViolet = TCOD_DARKEST_VIOLET;
export const darkestPurple = TCOD_DARKEST_PURPLE;
export const darkestFuchsia = TCOD_DARKEST_FUCHSIA;
export const darkestMagenta = TCOD_DARKEST_MAGENTA;
export const darkestPink = TCOD_DARKEST_PINK;
export const darkestCrimson = TCOD_DARKEST_CRIMSON;

// light colors
export const lightRed = TCOD_LIGHT_RED;
export const lightFlame = TCOD_LIGHT_FLAME;
export const lightOrange = TCOD_LIGHT_ORANGE;
export const lightAmber = TCOD_LIGHT_AMBER;
export const lightYellow = TCOD_LIGHT_YELLOW;
export const lightLime = TCOD_LIGHT_LIME;
export const lightChartreuse = TCOD_LIGHT_CHARTREUSE;
export const lightGreen = TCOD_LIGHT_GREEN;
export const lightSea = TCOD_LIGHT_SEA;
export const lightTurquoise = TCOD_LIGHT_TURQUOISE;
export const lightCyan = TCOD_LIGHT_CYAN;
export const lightSky = TCOD_LIGHT_SKY;
export const lightAzure = TCOD_LIGHT_AZURE;
export const lightBlue = TCOD_LIGHT_BLUE;
export const lightHan = TCOD_LIGHT_HAN;
export const lightViolet = TCOD_LIGHT_VIOLET;
export const lightPurple = TCOD_LIGHT_PURPLE;
export const lightFuchsia = TCOD_LIGHT_FUCHSIA;
export const lightMagenta = TCOD_LIGHT_MAGENTA;
export const lightPink = TCOD_LIGHT_PINK;
export const lightCrimson = TCOD_LIGHT_CRIMSON;

// lighter colors
export const lighterRed = TCOD_LIGHTER_RED;
export const lighterFlame = TCOD_LIGHTER_FLAME;
export const lighterOrange = TCOD_LIGHTER_ORANGE;
export const lighterAmber = TCOD_LIGHTER_AMBER;
export const lighterYellow = TCOD_LIGHTER_YELLOW;
export const lighterLime = TCOD_LIGHTER_LIME;
export const lighterChartreuse = TCOD_LIGHTER_CHARTREUSE;
export const lighterGreen = TCOD_LIGHTER_GREEN;
export const lighterSea = TCOD_LIGHTER_SEA;
export const lighterTurquoise = TCOD_LIGHTER_TURQUOISE;
export const lighterCyan = TCOD_LIGHTER_CYAN;
export const lighterSky = TCOD_LIGHTER_SKY;
export const lighterAzure = TCOD_LIGHTER_AZURE;
export const lighterBlue = TCOD_LIGHTER_BLUE;
export const lighterHan = TCOD_LIGHTER_HAN;
export const lighterViolet = TCOD_LIGHTER_VIOLET;
export const lighterPurple = TCOD_LIGHTER_PURPLE;
export const lighterFuchsia = TCOD_LIGHTER_FUCHSIA;
export const lighterMagenta = TCOD_LIGHTER_MAGENTA;
export const lighterPink = TCOD_LIGHTER_PINK;
export const lighterCrimson = TCOD_LIGHTER_CRIMSON;

// lightest colors
export const lightestRed = TCOD_LIGHTEST_RED;
export const lightestFlame = TCOD_LIGHTEST_FLAME;
export const lightestOrange = TCOD_LIGHTEST_ORANGE;
export const lightestAmber = TCOD_LIGHTEST_AMBER;
export const lightestYellow = TCOD_LIGHTEST_YELLOW;
export const lightestLime = TCOD_LIGHTEST_LIME;
export const lightestChartreuse = TCOD_LIGHTEST_CHARTREUSE;
export const lightestGreen = TCOD_LIGHTEST_GREEN;
export const lightestSea = TCOD_LIGHTEST_SEA;
export const lightestTurquoise = TCOD_LIGHTEST_TURQUOISE;
export const lightestCyan = TCOD_LIGHTEST_CYAN;
export const lightestSky = TCOD_LIGHTEST_SKY;
export const lightestAzure = TCOD_LIGHTEST_AZURE;
export const lightestBlue = TCOD_LIGHTEST_BLUE;
export const lightestHan = TCOD_LIGHTEST_HAN;
export const lightestViolet = TCOD_LIGHTEST_VIOLET;
export const lightestPurple = TCOD_LIGHTEST_PURPLE;
export const lightestFuchsia = TCOD_LIGHTEST_FUCHSIA;
export const lightestMagenta = TCOD_LIGHTEST_MAGENTA;
export const lightestPink = TCOD_LIGHTEST_PINK;
export const lightestCrimson = TCOD_LIGHTEST_CRIMSON;

// desaturated colors
export const desaturatedRed = TCOD_DESATURATED_RED;
export const desaturatedFlame = TCOD_DESATURATED_FLAME;
export const desaturatedOrange = TCOD_DESATURATED_ORANGE;
export const desaturatedAmber = TCOD_DESATURATED_AMBER;
export const desaturatedYellow = TCOD_DESATURATED_YELLOW;
export const desaturatedLime = TCOD_DESATURATED_LIME;
export const desaturatedChartreuse = TCOD_DESATURATED_CHARTREUSE;
export const desaturatedGreen = TCOD_DESATURATED_GREEN;
export const desaturatedSea = TCOD_DESATURATED_SEA;
export const desaturatedTurquoise = TCOD_DESATURATED_TURQUOISE;
export const desaturatedCyan = TCOD_DESATURATED_CYAN;
export const desaturatedSky = TCOD_DESATURATED_SKY;
export const desaturatedAzure = TCOD_DESATURATED_AZURE;
export const desaturatedBlue = TCOD_DESATURATED_BLUE;
export const desaturatedHan = TCOD_DESATURATED_HAN;
export const desaturatedViolet = TCOD_DESATURATED_VIOLET;
export const desaturatedPurple = TCOD_DESATURATED_PURPLE;
export const desaturatedFuchsia = TCOD_DESATURATED_FUCHSIA;
export const desaturatedMagenta = TCOD_DESATURATED_MAGENTA;
export const desaturatedPink = TCOD_DESATURATED_PINK;
export const desaturatedCrimson = TCOD_DESATURATED_CRIMSON;

// special
export const brass = TCOD_BRASS;
export const copper = TCOD_COPPER;
export const gold = TCOD_GOLD;
export const silver = TCOD_SILVER;

// miscellaneous
export const celadon = TCOD_CELADON;
export const peach = TCOD_PEACH;

// color array
export const colors = [
    [
        new TCODColor(...TCOD_DESATURATED_RED),
        new TCODColor(...TCOD_LIGHTEST_RED),
        new TCODColor(...TCOD_LIGHTER_RED),
        new TCODColor(...TCOD_LIGHT_RED),
        new TCODColor(...TCOD_RED),
        new TCODColor(...TCOD_DARK_RED),
        new TCODColor(...TCOD_DARKER_RED),
        new TCODColor(...TCOD_DARKEST_RED)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_FLAME),
        new TCODColor(...TCOD_LIGHTEST_FLAME),
        new TCODColor(...TCOD_LIGHTER_FLAME),
        new TCODColor(...TCOD_LIGHT_FLAME),
        new TCODColor(...TCOD_FLAME),
        new TCODColor(...TCOD_DARK_FLAME),
        new TCODColor(...TCOD_DARKER_FLAME),
        new TCODColor(...TCOD_DARKEST_FLAME)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_ORANGE),
        new TCODColor(...TCOD_LIGHTEST_ORANGE),
        new TCODColor(...TCOD_LIGHTER_ORANGE),
        new TCODColor(...TCOD_LIGHT_ORANGE),
        new TCODColor(...TCOD_ORANGE),
        new TCODColor(...TCOD_DARK_ORANGE),
        new TCODColor(...TCOD_DARKER_ORANGE),
        new TCODColor(...TCOD_DARKEST_ORANGE)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_AMBER),
        new TCODColor(...TCOD_LIGHTEST_AMBER),
        new TCODColor(...TCOD_LIGHTER_AMBER),
        new TCODColor(...TCOD_LIGHT_AMBER),
        new TCODColor(...TCOD_AMBER),
        new TCODColor(...TCOD_DARK_AMBER),
        new TCODColor(...TCOD_DARKER_AMBER),
        new TCODColor(...TCOD_DARKEST_AMBER)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_YELLOW),
        new TCODColor(...TCOD_LIGHTEST_YELLOW),
        new TCODColor(...TCOD_LIGHTER_YELLOW),
        new TCODColor(...TCOD_LIGHT_YELLOW),
        new TCODColor(...TCOD_YELLOW),
        new TCODColor(...TCOD_DARK_YELLOW),
        new TCODColor(...TCOD_DARKER_YELLOW),
        new TCODColor(...TCOD_DARKEST_YELLOW)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_LIME),
        new TCODColor(...TCOD_LIGHTEST_LIME),
        new TCODColor(...TCOD_LIGHTER_LIME),
        new TCODColor(...TCOD_LIGHT_LIME),
        new TCODColor(...TCOD_LIME),
        new TCODColor(...TCOD_DARK_LIME),
        new TCODColor(...TCOD_DARKER_LIME),
        new TCODColor(...TCOD_DARKEST_LIME)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_CHARTREUSE),
        new TCODColor(...TCOD_LIGHTEST_CHARTREUSE),
        new TCODColor(...TCOD_LIGHTER_CHARTREUSE),
        new TCODColor(...TCOD_LIGHT_CHARTREUSE),
        new TCODColor(...TCOD_CHARTREUSE),
        new TCODColor(...TCOD_DARK_CHARTREUSE),
        new TCODColor(...TCOD_DARKER_CHARTREUSE),
        new TCODColor(...TCOD_DARKEST_CHARTREUSE)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_GREEN),
        new TCODColor(...TCOD_LIGHTEST_GREEN),
        new TCODColor(...TCOD_LIGHTER_GREEN),
        new TCODColor(...TCOD_LIGHT_GREEN),
        new TCODColor(...TCOD_GREEN),
        new TCODColor(...TCOD_DARK_GREEN),
        new TCODColor(...TCOD_DARKER_GREEN),
        new TCODColor(...TCOD_DARKEST_GREEN)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_SEA),
        new TCODColor(...TCOD_LIGHTEST_SEA),
        new TCODColor(...TCOD_LIGHTER_SEA),
        new TCODColor(...TCOD_LIGHT_SEA),
        new TCODColor(...TCOD_SEA),
        new TCODColor(...TCOD_DARK_SEA),
        new TCODColor(...TCOD_DARKER_SEA),
        new TCODColor(...TCOD_DARKEST_SEA)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_TURQUOISE),
        new TCODColor(...TCOD_LIGHTEST_TURQUOISE),
        new TCODColor(...TCOD_LIGHTER_TURQUOISE),
        new TCODColor(...TCOD_LIGHT_TURQUOISE),
        new TCODColor(...TCOD_TURQUOISE),
        new TCODColor(...TCOD_DARK_TURQUOISE),
        new TCODColor(...TCOD_DARKER_TURQUOISE),
        new TCODColor(...TCOD_DARKEST_TURQUOISE)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_CYAN),
        new TCODColor(...TCOD_LIGHTEST_CYAN),
        new TCODColor(...TCOD_LIGHTER_CYAN),
        new TCODColor(...TCOD_LIGHT_CYAN),
        new TCODColor(...TCOD_CYAN),
        new TCODColor(...TCOD_DARK_CYAN),
        new TCODColor(...TCOD_DARKER_CYAN),
        new TCODColor(...TCOD_DARKEST_CYAN)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_SKY),
        new TCODColor(...TCOD_LIGHTEST_SKY),
        new TCODColor(...TCOD_LIGHTER_SKY),
        new TCODColor(...TCOD_LIGHT_SKY),
        new TCODColor(...TCOD_SKY),
        new TCODColor(...TCOD_DARK_SKY),
        new TCODColor(...TCOD_DARKER_SKY),
        new TCODColor(...TCOD_DARKEST_SKY)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_AZURE),
        new TCODColor(...TCOD_LIGHTEST_AZURE),
        new TCODColor(...TCOD_LIGHTER_AZURE),
        new TCODColor(...TCOD_LIGHT_AZURE),
        new TCODColor(...TCOD_AZURE),
        new TCODColor(...TCOD_DARK_AZURE),
        new TCODColor(...TCOD_DARKER_AZURE),
        new TCODColor(...TCOD_DARKEST_AZURE)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_BLUE),
        new TCODColor(...TCOD_LIGHTEST_BLUE),
        new TCODColor(...TCOD_LIGHTER_BLUE),
        new TCODColor(...TCOD_LIGHT_BLUE),
        new TCODColor(...TCOD_BLUE),
        new TCODColor(...TCOD_DARK_BLUE),
        new TCODColor(...TCOD_DARKER_BLUE),
        new TCODColor(...TCOD_DARKEST_BLUE)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_HAN),
        new TCODColor(...TCOD_LIGHTEST_HAN),
        new TCODColor(...TCOD_LIGHTER_HAN),
        new TCODColor(...TCOD_LIGHT_HAN),
        new TCODColor(...TCOD_HAN),
        new TCODColor(...TCOD_DARK_HAN),
        new TCODColor(...TCOD_DARKER_HAN),
        new TCODColor(...TCOD_DARKEST_HAN)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_VIOLET),
        new TCODColor(...TCOD_LIGHTEST_VIOLET),
        new TCODColor(...TCOD_LIGHTER_VIOLET),
        new TCODColor(...TCOD_LIGHT_VIOLET),
        new TCODColor(...TCOD_VIOLET),
        new TCODColor(...TCOD_DARK_VIOLET),
        new TCODColor(...TCOD_DARKER_VIOLET),
        new TCODColor(...TCOD_DARKEST_VIOLET)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_PURPLE),
        new TCODColor(...TCOD_LIGHTEST_PURPLE),
        new TCODColor(...TCOD_LIGHTER_PURPLE),
        new TCODColor(...TCOD_LIGHT_PURPLE),
        new TCODColor(...TCOD_PURPLE),
        new TCODColor(...TCOD_DARK_PURPLE),
        new TCODColor(...TCOD_DARKER_PURPLE),
        new TCODColor(...TCOD_DARKEST_PURPLE)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_FUCHSIA),
        new TCODColor(...TCOD_LIGHTEST_FUCHSIA),
        new TCODColor(...TCOD_LIGHTER_FUCHSIA),
        new TCODColor(...TCOD_LIGHT_FUCHSIA),
        new TCODColor(...TCOD_FUCHSIA),
        new TCODColor(...TCOD_DARK_FUCHSIA),
        new TCODColor(...TCOD_DARKER_FUCHSIA),
        new TCODColor(...TCOD_DARKEST_FUCHSIA)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_MAGENTA),
        new TCODColor(...TCOD_LIGHTEST_MAGENTA),
        new TCODColor(...TCOD_LIGHTER_MAGENTA),
        new TCODColor(...TCOD_LIGHT_MAGENTA),
        new TCODColor(...TCOD_MAGENTA),
        new TCODColor(...TCOD_DARK_MAGENTA),
        new TCODColor(...TCOD_DARKER_MAGENTA),
        new TCODColor(...TCOD_DARKEST_MAGENTA)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_PINK),
        new TCODColor(...TCOD_LIGHTEST_PINK),
        new TCODColor(...TCOD_LIGHTER_PINK),
        new TCODColor(...TCOD_LIGHT_PINK),
        new TCODColor(...TCOD_PINK),
        new TCODColor(...TCOD_DARK_PINK),
        new TCODColor(...TCOD_DARKER_PINK),
        new TCODColor(...TCOD_DARKEST_PINK)
    ],
    [
        new TCODColor(...TCOD_DESATURATED_CRIMSON),
        new TCODColor(...TCOD_LIGHTEST_CRIMSON),
        new TCODColor(...TCOD_LIGHTER_CRIMSON),
        new TCODColor(...TCOD_LIGHT_CRIMSON),
        new TCODColor(...TCOD_CRIMSON),
        new TCODColor(...TCOD_DARK_CRIMSON),
        new TCODColor(...TCOD_DARKER_CRIMSON),
        new TCODColor(...TCOD_DARKEST_CRIMSON)
    ]
];


TCODColor.prototype.setHSV = function setHSV(h, s, v) {
    let c;
    TCOD_color_set_HSV(c, h, s, v);
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
}

TCODColor.prototype.setHue = function setHue(h) {
    let c = { r: this.r, g: this.g, b: this.b };
    TCOD_color_set_hue(c, h);
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
}

TCODColor.prototype.setSaturation = function setSaturation(s) {
    let c = { r: this.r, g: this.g, b: this.b };
    TCOD_color_set_saturation(c, s);
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
}

TCODColor.prototype.setValue = function setValue(v) {
    let c = { r: this.r, g: this.g, b: this.b };
    TCOD_color_set_value(c, v);
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
}

TCODColor.prototype.getHSV = function getHSV(h, s, v) {
    let c = { r: this.r, g: this.g, b: this.b };
    TCOD_color_get_HSV(c, h, s, v);
}

TCODColor.prototype.getHue = function getHue() {
    let c = { r: this.r, g: this.g, b: this.b };
    return TCOD_color_get_hue(c);
}

TCODColor.prototype.getSaturation = function getSaturation() {
    let c = { r: this.r, g: this.g, b: this.b };
    return TCOD_color_get_saturation(c);
}

TCODColor.prototype.getValue = function getValue() {
    let c = { r: this.r, g: this.g, b: this.b };
    return TCOD_color_get_value(c);
}

TCODColor.prototype.shiftHue = function shiftHue(h_shift) {
    let c = { r: this.r, g: this.g, b: this.b };
    TCOD_color_shift_hue(c, h_shift);
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
}

TCODColor.prototype.scaleHSV = function scaleHSV(s_scale, v_scale) {
    let c = { r: this.r, g: this.g, b: this.b };
    TCOD_color_scale_HSV(c, s_scale, v_scale);
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
}

// non member operators

TCODColor.prototype.times = function times(value, c) {
    return c.times(value);
}

/**
 * @param {TCODColor} map
 * @param {number} nbKey
 * @param {TCODColor} keyColor
 * @param {Array<number>} keyIndex;
 */
TCODColor.prototype.genMap = function genMap(map, nbKey, keyColor, keyIndex) {
    for (let segment = 0; segment < nbKey - 1; ++segment) {
        let idxStart = keyIndex[segment];
        let idxEnd = keyIndex[segment + 1];
        for (let idx = idxStart; idx <= idxEnd; ++idx) {
            map[idx] = TCODColor.lerp(
                keyColor[segment], keyColor[segment + 1], (idx - idxStart) / (idxEnd - idxStart));
        }
    }
}

export { TCODColor };
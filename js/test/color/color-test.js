import { color } from "../../color/d3-index.js";

import { rgbEqual } from "./rgbEqual.js";

QUnit.module('color', function () {

    QUnit.test("color(format) parses CSS color names (e.g., \"rebeccapurple\")", function (assert) {
        rgbEqual(assert, color.color("moccasin"), 255, 228, 181, 1);
        rgbEqual(assert, color.color("aliceblue"), 240, 248, 255, 1);
        rgbEqual(assert, color.color("yellow"), 255, 255, 0, 1);
        rgbEqual(assert, color.color("moccasin"), 255, 228, 181, 1);
        rgbEqual(assert, color.color("aliceblue"), 240, 248, 255, 1);
        rgbEqual(assert, color.color("yellow"), 255, 255, 0, 1);
        rgbEqual(assert, color.color("rebeccapurple"), 102, 51, 153, 1);
        rgbEqual(assert, color.color("transparent"), NaN, NaN, NaN, 0);
        assert.end();
    });

    QUnit.test("color(format) parses 6-digit hexadecimal (e.g., \"#abcdef\")", function (assert) {
        rgbEqual(assert, color.color("#abcdef"), 171, 205, 239, 1);
        assert.end();
    });

    QUnit.test("color(format) parses 3-digit hexadecimal (e.g., \"#abc\")", function (assert) {
        rgbEqual(assert, color.color("#abc"), 170, 187, 204, 1);
        assert.end();
    });

    QUnit.test("color(format) does not parse 7-digit hexadecimal (e.g., \"#abcdef3\")", function (assert) {
        assert.strictEqual(color.color("#abcdef3"), null);
        assert.end();
    });

    QUnit.test("color(format) parses 8-digit hexadecimal (e.g., \"#abcdef33\")", function (assert) {
        rgbEqual(assert, color.color("#abcdef33"), 171, 205, 239, 0.2);
        assert.end();
    });

    QUnit.test("color(format) parses 4-digit hexadecimal (e.g., \"#abc3\")", function (assert) {
        rgbEqual(assert, color.color("#abc3"), 170, 187, 204, 0.2);
        assert.end();
    });

    QUnit.test("color(format) parses RGB integer format (e.g., \"rgb(12,34,56)\")", function (assert) {
        rgbEqual(assert, color.color("rgb(12,34,56)"), 12, 34, 56, 1);
        assert.end();
    });

    QUnit.test("color(format) parses RGBA integer format (e.g., \"rgba(12,34,56,0.4)\")", function (assert) {
        rgbEqual(assert, color.color("rgba(12,34,56,0.4)"), 12, 34, 56, 0.4);
        assert.end();
    });

    QUnit.test("color(format) parses RGB percentage format (e.g., \"rgb(12%,34%,56%)\")", function (assert) {
        rgbEqual(assert, color.color("rgb(12%,34%,56%)"), 31, 87, 143, 1);
        assert.rgbStrictEqual(color.color("rgb(100%,100%,100%)"), 255, 255, 255, 1);
        assert.end();
    });

    QUnit.test("color(format) parses RGBA percentage format (e.g., \"rgba(12%,34%,56%,0.4)\")", function (assert) {
        rgbEqual(assert, color.color("rgba(12%,34%,56%,0.4)"), 31, 87, 143, 0.4);
        assert.rgbStrictEqual(color.color("rgba(100%,100%,100%,0.4)"), 255, 255, 255, 0.4);
        assert.end();
    });

    QUnit.test("color(format) parses HSL format (e.g., \"hsl(60,100%,20%)\")", function (assert) {
        assert.hslEqual(color.color("hsl(60,100%,20%)"), 60, 1, 0.2, 1);
        assert.end();
    });

    QUnit.test("color(format) parses HSLA format (e.g., \"hsla(60,100%,20%,0.4)\")", function (assert) {
        assert.hslEqual(color.color("hsla(60,100%,20%,0.4)"), 60, 1, 0.2, 0.4);
        assert.end();
    });

    QUnit.test("color(format) ignores leading and trailing whitespace", function (assert) {
        rgbEqual(assert, color.color(" aliceblue\t\n"), 240, 248, 255, 1);
        rgbEqual(assert, color.color(" #abc\t\n"), 170, 187, 204, 1);
        rgbEqual(assert, color.color(" #aabbcc\t\n"), 170, 187, 204, 1);
        rgbEqual(assert, color.color(" rgb(120,30,50)\t\n"), 120, 30, 50, 1);
        assert.hslEqual(color.color(" hsl(120,30%,50%)\t\n"), 120, 0.3, 0.5, 1);
        assert.end();
    });

    QUnit.test("color(format) ignores whitespace between numbers", function (assert) {
        rgbEqual(assert, color.color(" rgb( 120 , 30 , 50 ) "), 120, 30, 50, 1);
        assert.hslEqual(color.color(" hsl( 120 , 30% , 50% ) "), 120, 0.3, 0.5, 1);
        rgbEqual(assert, color.color(" rgba( 12 , 34 , 56 , 0.4 ) "), 12, 34, 56, 0.4);
        rgbEqual(assert, color.color(" rgba( 12% , 34% , 56% , 0.4 ) "), 31, 87, 143, 0.4);
        assert.hslEqual(color.color(" hsla( 60 , 100% , 20% , 0.4 ) "), 60, 1, 0.2, 0.4);
        assert.end();
    });

    QUnit.test("color(format) allows number signs", function (assert) {
        rgbEqual(assert, color.color("rgb(+120,+30,+50)"), 120, 30, 50, 1);
        assert.hslEqual(color.color("hsl(+120,+30%,+50%)"), 120, 0.3, 0.5, 1);
        rgbEqual(assert, color.color("rgb(-120,-30,-50)"), -120, -30, -50, 1);
        assert.hslEqual(color.color("hsl(-120,-30%,-50%)"), NaN, NaN, -0.5, 1);
        rgbEqual(assert, color.color("rgba(12,34,56,+0.4)"), 12, 34, 56, 0.4);
        rgbEqual(assert, color.color("rgba(12,34,56,-0.4)"), NaN, NaN, NaN, -0.4);
        rgbEqual(assert, color.color("rgba(12%,34%,56%,+0.4)"), 31, 87, 143, 0.4);
        rgbEqual(assert, color.color("rgba(12%,34%,56%,-0.4)"), NaN, NaN, NaN, -0.4);
        assert.hslEqual(color.color("hsla(60,100%,20%,+0.4)"), 60, 1, 0.2, 0.4);
        assert.hslEqual(color.color("hsla(60,100%,20%,-0.4)"), NaN, NaN, NaN, -0.4);
        assert.end();
    });

    QUnit.test("color(format) allows decimals for non-integer values", function (assert) {
        rgbEqual(assert, color.color("rgb(20.0%,30.4%,51.2%)"), 51, 78, 131, 1);
        assert.hslEqual(color.color("hsl(20.0,30.4%,51.2%)"), 20, 0.304, 0.512, 1);
        assert.end();
    });

    QUnit.test("color(format) allows leading decimal for hue, opacity and percentages", function (assert) {
        assert.hslEqual(color.color("hsl(.9,.3%,.5%)"), 0.9, 0.003, 0.005, 1);
        assert.hslEqual(color.color("hsla(.9,.3%,.5%,.5)"), 0.9, 0.003, 0.005, 0.5);
        rgbEqual(assert, color.color("rgb(.1%,.2%,.3%)"), 0, 1, 1, 1);
        rgbEqual(assert, color.color("rgba(120,30,50,.5)"), 120, 30, 50, 0.5);
        assert.end();
    });

    QUnit.test("color(format) allows exponential format for hue, opacity and percentages", function (assert) {
        assert.hslEqual(color.color("hsl(1e1,2e1%,3e1%)"), 10, 0.2, 0.3, 1);
        assert.hslEqual(color.color("hsla(9e-1,3e-1%,5e-1%,5e-1)"), 0.9, 0.003, 0.005, 0.5);
        rgbEqual(assert, color.color("rgb(1e-1%,2e-1%,3e-1%)"), 0, 1, 1, 1);
        rgbEqual(assert, color.color("rgba(120,30,50,1e-1)"), 120, 30, 50, 0.1);
        assert.end();
    });

    QUnit.test("color(format) does not allow decimals for integer values", function (assert) {
        assert.equal(color.color("rgb(120.5,30,50)"), null);
        assert.end();
    });

    QUnit.test("color(format) does not allow empty decimals", function (assert) {
        assert.equal(color.color("rgb(120.,30,50)"), null);
        assert.equal(color.color("rgb(120.%,30%,50%)"), null);
        assert.equal(color.color("rgba(120,30,50,1.)"), null);
        assert.equal(color.color("rgba(12%,30%,50%,1.)"), null);
        assert.equal(color.color("hsla(60,100%,20%,1.)"), null);
        assert.end();
    });

    QUnit.test("color(format) does not allow made-up names", function (assert) {
        assert.equal(color.color("bostock"), null);
        assert.end();
    });

    QUnit.test("color(format) allows achromatic colors", function (assert) {
        rgbEqual(assert, color.color("rgba(0,0,0,0)"), NaN, NaN, NaN, 0);
        rgbEqual(assert, color.color("#0000"), NaN, NaN, NaN, 0);
        rgbEqual(assert, color.color("#00000000"), NaN, NaN, NaN, 0);
        assert.end();
    });

    QUnit.test("color(format) does not allow whitespace before open paren or percent sign", function (assert) {
        assert.equal(color.color("rgb (120,30,50)"), null);
        assert.equal(color.color("rgb (12%,30%,50%)"), null);
        assert.equal(color.color("hsl (120,30%,50%)"), null);
        assert.equal(color.color("hsl(120,30 %,50%)"), null);
        assert.equal(color.color("rgba (120,30,50,1)"), null);
        assert.equal(color.color("rgba (12%,30%,50%,1)"), null);
        assert.equal(color.color("hsla (120,30%,50%,1)"), null);
        assert.end();
    });

    QUnit.test("color(format) is case-insensitive", function (assert) {
        rgbEqual(assert, color.color("aLiCeBlUE"), 240, 248, 255, 1);
        rgbEqual(assert, color.color("transPARENT"), NaN, NaN, NaN, 0);
        rgbEqual(assert, color.color(" #aBc\t\n"), 170, 187, 204, 1);
        rgbEqual(assert, color.color(" #aaBBCC\t\n"), 170, 187, 204, 1);
        rgbEqual(assert, color.color(" rGB(120,30,50)\t\n"), 120, 30, 50, 1);
        assert.hslEqual(color.color(" HSl(120,30%,50%)\t\n"), 120, 0.3, 0.5, 1);
        assert.end();
    });

    QUnit.test("color(format) returns undefined RGB channel values for unknown formats", function (assert) {
        assert.equal(color.color("invalid"), null);
        assert.equal(color.color("hasOwnProperty"), null);
        assert.equal(color.color("__proto__"), null);
        assert.equal(color.color("#ab"), null);
        assert.end();
    });

    QUnit.test("color(format).hex() returns a hexadecimal string", function (assert) {
        assert.equal(color.color("rgba(12%,34%,56%,0.4)").hex(), "#1f578f");
        assert.end();
    });
});
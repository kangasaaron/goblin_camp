import { Enum } from "../../cplusplus/Enums.js"

QUnit.module("Enum test", function() {
    QUnit.test("static Enum properties", function(assert) {
        assert.ok(Enum, "enum truthy");

    });

    QUnit.test("create an enum", function(assert) {
        class myEnum extends Enum {
            static FIRST;
            static SECOND;
            static THIRD;
        }
        myEnum.enumify();
        assert.ok(Object.isFrozen(myEnum));
        assert.equal(myEnum.name, 'myEnum', 'name ok');
        assert.ok(Object.isFrozen(myEnum.ks));
        assert.ok(Object.isFrozen(myEnum.vals));
        assert.ok(Object.isFrozen(myEnum.entrs));

        assert.equal(myEnum.FIRST, 0, 'FIRST');
        assert.equal(myEnum.FIRST.value, 0);
        assert.equal(myEnum.FIRST.name, 'FIRST');
        assert.equal(myEnum.FIRST.enumName, "myEnum");
        assert.equal(myEnum.FIRST.description, "myEnum.FIRST");
        assert.equal(myEnum.FIRST.ordinal, 0);
        assert.ok(myEnum.FIRST instanceof myEnum);
        assert.ok(myEnum.FIRST instanceof Enum);
        assert.ok(Object.isFrozen(myEnum.FIRST));

        assert.equal(myEnum.SECOND, 1, "SECOND");
        assert.equal(myEnum.SECOND.value, 1);
        assert.equal(myEnum.SECOND.name, "SECOND");
        assert.equal(myEnum.SECOND.enumName, "myEnum");
        assert.equal(myEnum.SECOND.description, "myEnum.SECOND");
        assert.equal(myEnum.SECOND.ordinal, 1);
        assert.ok(myEnum.SECOND instanceof myEnum);
        assert.ok(myEnum.SECOND instanceof Enum);
        assert.ok(Object.isFrozen(myEnum.SECOND));

        assert.equal(myEnum.THIRD, 2, "THIRD");
        assert.equal(myEnum.THIRD.value, 2);
        assert.equal(myEnum.THIRD.name, "THIRD");
        assert.equal(myEnum.THIRD.enumName, "myEnum");
        assert.equal(myEnum.THIRD.description, "myEnum.THIRD");
        assert.equal(myEnum.THIRD.ordinal, 2);
        assert.ok(myEnum.THIRD instanceof myEnum);
        assert.ok(myEnum.THIRD instanceof Enum);
        assert.ok(Object.isFrozen(myEnum.THIRD));

        let index = 0;
        for (let k of myEnum.keys()) {
            switch (index) {
                case 0:
                    assert.equal(k, "FIRST", "keys");
                    break;
                case 1:
                    assert.equal(k, "SECOND");
                    break;
                case 2:
                    assert.equal(k, "THIRD");
                    break;
            }
            index++
        }
        assert.equal(index, 3);
        index = 0;
        for (let k of myEnum.values()) {
            switch (index) {
                case 0:
                    assert.equal(k, 0, "values");
                    break;
                case 1:
                    assert.equal(k, 1);
                    break;
                case 2:
                    assert.equal(k, 2);
                    break;
            }
            index++;
        }
        assert.equal(index, 3);
        index = 0;
        for (let k of myEnum.entries()) {
            assert.ok(Array.isArray(k));
            assert.equal(k.length, 2);
            switch (index) {
                case 0:
                    assert.deepEqual(k, ["FIRST", 0], "entries");
                    break;
                case 1:
                    assert.deepEqual(k, ["SECOND", 1]);
                    break;
                case 2:
                    assert.deepEqual(k, ["THIRD", 2]);
                    break;
            }
            index++;
        }
        assert.equal(index, 3);
    });
});
import Plates from '../src/plates.js'
import { expect } from 'chai';


describe("plates", () => {
    it("should push a number", () => {
        let p = new Plates();
        p.push(3);
        expect(p.get()).to.equal(3);
    });

    it("undo", () => {
        let p = new Plates();
        p.push(3);
        p.undo();
        expect(p.get()).to.equal(null);

        // Limit checking
        p.undo();
        expect(p.get()).to.equal(null);
    });

    it("redo", () => {
        let p = new Plates();
        p.push(3);
        p.undo();
        p.redo();
        expect(p.get()).to.equal(3);

        // Limit checking
        p.redo();
        expect(p.get()).to.equal(3);
    });

    it("update a list", () => {
        let p = new Plates();
        p.push([1, 2, 3]);
        p.push([1, 2, 3, 4]);
        p.push([1, 2, 3, 4, 5]);
        expect(p.get()).to.deep.equal([1, 2, 3, 4, 5]);
    });

    it("change basic parameters of objects", () => {
        let p = new Plates();
        let o = {
            "a": 1,
            "b": "str",
            "c": true
        }
        p.push(o);
        o['c'] = false;
        p.push(o);
        expect(p.get()).to.deep.equal(o);
    });

    it("change nested parameters", () => {
        let p = new Plates();
        let o = {
            "a": 1,
            "b": "str",
            "c": {
                "d": "nested param",
                "e": "plates are cool"
            }
        }
        p.push(o);
        o['e'] = 'plates are really cool';
        p.push(o);
        expect(p.get()).to.deep.equal(o);
    });

    it("add new parameters", () => {
        let p = new Plates();
        let o = {
            "a": 1,
            "b": "str",
            "c": {
                "d": "nested param",
                "e": "plates are cool"
            }
        }
        p.push(o);
        o['f'] = 'plates are really cool';
        p.push(o);
        expect(p.get()).to.deep.equal(o);
    });

    it("remove parameters", () => {
        let o = {
            "a": 1,
            "b": "str",
            "c": {
                "d": "nested param",
                "e": "plates are cool"
            }
        }
        let p = new Plates(o);
        delete o["a"];
        delete o["c"]["e"];
        p.push(o);
        expect(p.get()).to.deep.equal(o);
    });

    it("overwrite drastic changes", () => {
        let o = {
            "a": 1,
            "b": "str"
        }
        let p = new Plates(o);
        let differentO = {
            "c": 7,
            "d": {
                "nested": true
            }
        }
        p.push(differentO);
        expect(p.get()).to.deep.equal(differentO);
    });

    it("has undo and redo", () => {
        let p = new Plates(3);
        expect(p.hasUndo()).to.equal(true);
        expect(p.hasRedo()).to.equal(false);
        p.undo();
        expect(p.hasUndo()).to.equal(false);
        expect(p.hasRedo()).to.equal(true);
    });

    it("clears the stack", () => {
        let p = new Plates(3);
        p.clear();
        expect(p.get()).to.equal(null);
    });

    it("goes to the ends of the stack", () => {
        let p = new Plates(3);
        p.push(4);
        p.push(5);
        p.undo();
        expect(p.hasUndo()).to.equal(true);
        expect(p.hasRedo()).to.equal(true);

        p.goToStart();
        expect(p.hasUndo()).to.equal(false);
        expect(p.hasRedo()).to.equal(true);

        p.goToEnd();
        expect(p.hasUndo()).to.equal(true);
        expect(p.hasRedo()).to.equal(false);
    });

    it("callbacks", () => {
        let p = new Plates();
        let x = 0;
        let y = 0;
        function pushCallback() {
            x++;
        }
        function clearCallback() {
            y++;
        }
        p.setOptions({
            onStackPush: pushCallback
        });
        p.push(1);
        expect(x).to.equal(1);

        p.updateOptions({
            onStackClear: clearCallback
        });
        p.clear();
        p.push(2);
        expect(y).to.equal(1);
        expect(x).to.equal(2);
    });
});

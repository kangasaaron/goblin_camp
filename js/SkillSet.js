import {
    Skill
} from "./Skill.js";

let skillSetHandlers = {
    set: function (obj, prop, value) {
        obj[Number(prop)] = value;
    },
    get: function (obj, prop, receiver) {
        return obj[Number(prop)];
    }
}


export class SkillSet {
    static CLASS_VERSION = 0;

    skills = new Array(Skill.SKILLAMOUNT).fill(0);
    constructor() {
        return new Proxy(this, skillSetHandlers);
    }
    save(ar, version) {
        ar.save(this, "skills");
    }
    load(ar, version) {
        this.skills = ar.skills;
    }
}
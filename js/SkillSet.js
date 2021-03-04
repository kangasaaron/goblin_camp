import {
    Serializable
} from "./data/Serialization.js";
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

export class SkillSet extends Serializable {
    static CLASS_VERSION = 0;

    skills = new Array(Skill.SKILLAMOUNT).fill(0);
    constructor() {
        return new Proxy(this, skillSetHandlers);
    }
    serialize(ar, version) {
        return {
            skills: this.skills
        };
    }
    static deserialize(data, version, deserialzier) {
        let result = new SkillSet();
        result.skills = data.skills;
        return result;
    }
}
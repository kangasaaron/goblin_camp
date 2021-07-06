/* the struct containing a definition of an unprocessed syllable set */
class namegen_syllables_t {
    name = "";
    vocals = "";
    consonants = "";
    pre = "";
    start = "";
    middle = "";
    end = "";
    post = "";
    illegal = "";
    rules = "";
}

/* and the generator struct */
class namegen_t {
    /* the name that will be called */
    name = "";
    /* needs to use a random number generator */
    random = null;
    /* the lists with all the data */
    vocals = [];
    consonants = [];
    syllables_pre = [];
    syllables_start = [];
    syllables_middle = [];
    syllables_end = [];
    syllables_post = [];
    illegal_strings = [];
    rules = [];
}

/** ---------------------------
 * variables and stuff
 * ---------------------------- */

/** the list containing the generators */
let namegen_generators_list = null;

/** the file parser */
let namegen_parser = null;
/** parsed files list */
let parsed_files = [];
/** the data that will be filled out 
 * @type{Array<namegen_syllables_t>}
 * */
let parser_data = [];
/** the data that will be filled out 
 * @type{Array<namegen_t>}
 * */
let parser_output = [];
/** this one's needed to correctly update the generators with RNG pointer */
let namegen_random = null;

/** the string that will be pointed to upon generating a name */
namegen_name = "";
/** for keeping track of the size of output names */
namegen_name_size = 0;

/** -----------------------------------
 * stuff to operate on the syllable set
 * ------------------------------------*/

/** initialize a syllable set 
 * @returns {namegen_syllables_t}
*/
function namegen_syllables_new() {
    let data = new namegen_syllables_t();
    return data;
}

/** free a syllables set 
 * @param {namegen_syllables_t} data
*/
function namegen_syllables_delete(data) {
    if (data.vocals && data.vocals.length) delete data.vocals;
    if (data.consonants && data.consonants.length) delete data.consonants;
    if (data.pre && data.pre.length) delete data.pre;
    if (data.start && data.start.length) delete data.start;
    if (data.middle && data.middle.length) delete data.middle;
    if (data.end && data.end.length) delete data.end;
    if (data.post && data.post.length) delete data.post;
    if (data.illegal && data.illegal.length) delete data.illegal;
    if (data.rules && data.rules.length) delete data.rules;
    delete data.name;
    delete data;
}

/** --------------------------------------
 * stuff to operate on the generators
 * ---------------------------------------- */

/** create a new generator 
 * @returns {namegen_t}
*/
function namegen_generator_new() {
    let data = new namegen_t();
    data.name = null;
    data.random = TCOD_random_get_instance();
    return data;
}

/** check whether a given generator already exists
 * @returns {boolean}
 */
function namegen_generator_check(name) {
    // if the list isn't created yet, create it.
    if (namegen_generators_list === null) {
        namegen_generators_list = [];
        return false;
    }
    // otherwise, scan it for the name
    else {
        return namegen_generators_list.some(it => it.name === name);
    }
}

/** retrieve available generator names */
function namegen_get_sets_on_error() {
    let it;
    console.error("Registered syllable sets are:");
    namegen_generators_list.forEach(it => {
        console.error(` * "${it.name}"`)
    });
}

/** get the appropriate syllables set */
function namegen_generator_get(nam) {
    if (namegen_generator_check(nam) === true) {
        return namegen_generators_list.find((it) => it.name === nam);
    }
    else {
        console.error(`Generator "${nam}" could not be retrieved.`)
    }
    return null;
}

/** destroy a generator 
 * @param {namegen_t} generator
*/
function namegen_generator_delete(generator) {
    let data = generator;
    delete data.name;
    data.random = null;
    delete data.vocals;
    delete data.consonants;
    delete data.pre;
    delete data.start;
    delete data.middle;
    delete data.end;
    delete data.post;
    delete data.illegal;
    delete data.rules;
    delete data;
}

/** ------------------------------------------
 * Populating namegen_t with data
 * ------------------------------------------- */

/** fill the pointed list with syllable data by extracting tokens 
 * @param {string} source
 * @param {Array} list
 * @param {boolean} wildcards
*/
function namegen_populate_list(source, list, wildcards) {
    let len = source.length;
    let i = 0;
    let token = "";

    do {
        /* do the tokenizing using an iterator imitation :) */
        let it = source[i];
        /* append a normal character */
        if (/[A-Za-z'-]/.test(it)) token += it;
        /* special character */
        else if (it === "/") {
            if (wildcards) {
                token += it + source[i + 1];
            }
            else {
                token += it;
            }
            i++;
        }
        /* underscore is converted to space */
        else if (it === "_") {
            if (wildcards) {
                token += it;
            }
            else {
                token += " ";
            }
        }
        /* add wildcards if they are allowed */
        else if (wildcards && (it === "$" || it === "%" || /[0-9]/.test(it)))
            token += it;
        /* all other characters are treated as seperators and cause adding the current token to the list */
        else if (it.length) {
            list.push(token);
        }
    } while (++i <= len)
    delete token;
}

/** populate all lists of a namegen_t struct */
function namegen_populate(dst, src) {
    if (!dst || !src) {
        console.error(`Couldn't populate the name generator with data.`);
        return;
    }
    if (src.vocals && src.vocals.length) dst.vocals = src.vocals.slice();
    if (src.consonants && src.consonants.length) dst.consonants = src.consonants.slice();
    if (src.pre && src.pre.length) dst.pre = src.pre.slice();
    if (src.start && src.start.length) dst.start = src.start.slice();
    if (src.middle && src.middle.length) dst.middle = src.middle.slice();
    if (src.end && src.end.length) dst.end = src.end.slice();
    if (src.post && src.post.length) dst.post = src.post.slice();
    if (src.illegal && src.illegal.length) dst.illegal = src.illegal.slice();
    if (src.rules && src.rules.length) dst.rules = src.rules.slice();
    dst.name = src.name.slice();
}

/**----------------------- 
 * parser related stuff
 * ----------------------- */

let namgen_parser_ready = false;
/** preparing the parser */
function namegen_parser_prepare() {
    return true;
}

/** parser listener */
function namegen_parser_new_struct(str, name) {
    parser_data = namegen_syllables_new();
    return true;
}

function namegen_parser_flag(name) {
    return true;
}

function namegen_parser_property(name, value) {
    if (name === "syllablesStart") parser_data.start = value.slice();
    if (name === "syllablesMiddle") parser_data.middle = value.slice();
    if (name === "syllablesEnd") parser_data.end = value.slice();
    if (name === "syllablesPre") parser_data.pre = value.slice();
    if (name === "syllablesPost") parser_data.post = value.slice();
    if (name === "phonemesVocals") parser_data.vocals = value.slice();
    if (name === "phonemesConsonants") parser_data.consonants = value.slice();
    if (name === "rules") parser_data.rules = value.slice();
    if (name === "illegal") {
        let str = "", i = 0;
        parser_data.illegal = value.toLowerCase();
    }
    else return false;
    return true;
}

function namegen_parser_end_struct(str, name) {
    /* if there's no syllable set by this name, add it to the list */
    if (!namegen_generator_check(name)) {
        parser_data.name = name.slice();
        parser_output = namegen_generator_new();
        namegen_populate(parser_output, parser_data);
        parser_output.random = namegen_random;
        if (!namegen_generators_list) namegen_generators_list = [];
        namegen_generators_list.push(parser_output);
    }
}

function namegen_parser_error(msg) {
    console.error(msg);
}

let namegen_listener = {
    new_struct: namegen_parser_new_struct,
    flag: namegen_parser_flag,
    property: namegen_parser_property,
    end_struct: namegen_parser_end_struct,
    error: namegen_parser_error
};

function namegen_parser_run(filename) {
    let it;
    namegen_parser_prepare();
    if (!parsed_files) parsed_files = [];
    if (parsed_files.length > 0) {
        if (parsed_files.some(it => it === filename)) return;
    }
    parsed_files.push(filename.slice());
    parser_run(namegen_parser, filename, namegen_listener);
}

function parser_run(parser, filename, listener) {
    let json = filesystem.JSON(filename);
    for (let obj of json) {
        let name = "";
        if ("name" in obj) name = obj.name;
        listener.new_struct(obj, name);
        for (let key of Object.keys(obj)) {
            if (typeof obj[key] === "boolean")
                listener.flag(key, true);
            else
                listener.property(key, obj[key]);
        }
        listener.end_struct(obj, name);
    }
}

/**--------------------
 * rubbish pruning
 * -------------------- */

/** search for occurances of triple character (case-insensitive) */
function namegen_word_has_triples(str) {
    return /(.)\1\1/i.test(str);
}

/** search for occurences of illegal strings */
function namegen_word_has_illegal(data, str) {
    str = str.toLowerCase();
    return data.illegal_strings.some(it => str.includes(it));
}

/** removes double spaces, as well as leading and ending spaces */
function namegen_word_prune_spaces(str) {
    let result = str.trim();
    while (result.includes("  ")) {
        result = result.replaceAll("  ", " ");
    }
    return result;
}

/** prune repeated "syllables" such as Arnarn */
function namegen_word_prune_syllables(str) {
    let data = str.toLowerCase();
    // 2-character direct repetitions
    for (let i = 0; i < data.length - 4; i++) {
        if (data.slice(i, i + 2) === data.slice(i + 2, i + 4))
            return true;
    }
    // 3 character repetitions
    for (let i = 0; i < data.length - 6; i++) {
        for (let j = 3; j < data.length - 3; j++) {
            if (data.slice(i, i + 3) === data.slice(j, j + 3))
                return true;
        }
    }
    return false;
}

/**everything stacked together */
function namegen_word_is_ok(data, str) {
    str = namegen_word_prune_spaces(str);
    return (str.length > 0) &&
        (!namegen_word_has_triples(str)) &&
        (!namegen_word_has_illegal(data, str)) &&
        (!namegen_word_prune_syllables(str));
}

/** ---------------------------------------
 * Publicly available functions
 * ---------------------------------------- */

/** parse a new syllable sets file - makes new data structure and fills it with necessary content */
export function TCOD_namegen_parse(filename, random) {
    /* check for file existence */
    let input = filesystem.open(filename, "r");
    if (!input) {
        console.error(`File "${filename}" not found!`);
        return;
    }
    filesystem.close(input);
    /* set namegen RNG */
    namegen_random = random;
    /* run the proper parser - add the file's contents to the data structures */
    namegen_parser_run(filename);
}


/** generate a name using a given generator */
export function TCOD_namegen_generate_custom(name, rule) {
    let data, buf = "";
    if (namegen_generator_check(name))
        data = namegen_generator_get(name);
    else {
        console.error(`The name "${name}" has not been found.`);
        namegen_get_sets_on_error();
        return null;
    }
    /* let the show begin! */
    do {
        let it = 0;
        while (it <= rule.length) {
            /* append a normal character */
            if ((rule.charCodeAt(it) >= 'a'.charCodeAt(0) && rule.charCodeAt(it) <= 'z'.charCodeAt(0)) ||
                (rule.charCodeAt(it) >= 'A'.charCodeAt(0) && rule.charCodeAt(it) <= 'Z'.charCodeAt(0)) ||
                (rule.charAt(it) === "'") ||
                (rule.charAt(it) === "-")) buf += it;
            /* special character */
            else if (rule.charAt(it) === "/") {
                it++;
                buf += it;
            }
            /* underscore is converted to space */
            else if (rule.charAt(it) === "_")
                buf += " ";
            /* interpret a wildcard */
            else if (rule.charAt(it) === "/") {
                let chance = 100;
                it++;
                /* food for the randomizer */
                if (rule.charAt(it) >= '0'.charAt(0) && rule.charAt(it) <= '9'.charAt(0)) {
                    chance = 0;
                    while (rule.charAt(it) >= '0'.charAt(0) && rule.charAt(it) <= '9'.charAt(0)) {
                        chance *= 10;
                        chance += rule.charAt(it) - '0'.charAt(0);
                        it++;
                    }
                }
                /*ok so the chance of wildcard occurence is calculated, now evaluate it */
                if (chance >= Math.floor(data.random.random() * 100)) {
                    let lst = [];
                    switch (rule.charAt(it)) {
                        case "P": lst = data.syllables_pre; break;
                        case "s": lst = data.syllables_start; break;
                        case "m": lst = data.syllables_middle; break;
                        case "e": lst = data.syllables_end; break;
                        case "p": lst = data.syllables_post; break;
                        case "v": lst = data.vocals; break;
                        case "c": lst = data.consonants; break;
                        case "?": lst = (data.random.random() > 0.5) ? data.vocals : data.consonants; break;
                        default:
                            console.error("wrong rules syntax encountered!");
                            return;
                    }
                    if (!lst || !lst.length) {
                        console.error(`No data found in the requested string (wildcard ${rule.charAt(it)}). Check your name generation rule ${rule}.`)
                    }
                    else
                        buf += lst[Math.floor(data.random.random() * lst.length)]
                }
            }
            it++
        }
    } while (!namegen_word_is_ok(data, buf));
    /* prune the spare spaces out */
    buf = namegen_word_prune_spaces(buf);
    /* return the name accordingly */
    return buf;
}

/** generate a name with one of the rules from the file */
function TCOD_namegen_generate(Name) {
    let data = null,
        rule_number = 0,
        chance = 0,
        rule_rolled = "",
        truncation = 0,
        rule_parsed = "",
        ret = "";
    if (namegen_generator_check(Name))
        data = namegen_generator_get(Name);
    else {
        console.error(`The name "${Name}" has not been found.`);
        namegen_get_sets_on_error();
        return null;
    }
    /* check if the rules list is present */
    if (!data.rules && !data.rules.length) {
        console.error("The rules list is empty!");
        return;
    }
    /* choose the rule */
    do {
        rule_number = Math.floor(data.random.random() * data.rules.length);
        rule_rolled = data.rules[rule_number];
        chance = 100;
        truncation = 0;
        if (rule_rolled.charAt(0) === "%") {
            truncation = 1;
            chance = 0;
            while (rule_rolled.charCodeAt(truncation) >= '0'.charCodeAt(0) && rule_rolled.charCodeAt(truncation) <= '9'.charCodeAt(0)) {
                chance *= 10;
                chance += rule_rolled.chaCodeAt(truncation) - '0'.charCodeAt(0);
                truncation++;
            }
        }
    } while (Math.floor(data.random.random() * 100) > chance)
    /* OK, we've got ourselves a new rule! */
    rule_parsed = rule_rolled.slice(truncation);
    ret = TCOD_namegen_generate_custom(Name, rule_parsed);
    return ret;
}

/*retrieve the list of all available syllable set names */
function TCOD_namegen_get_sets() {
    if (!namegen_generators_list || !namegen_generators_list.length)
        return [];
    return namegen_generators_list.map(it => it.name);
}

/** delete all the generators */
function TCOD_namegen_destroy() {
    // delete all generators
    let it = 0;
    for (let it = 0; it < namegen_generators_list.length; it++) {
        namegen_generator_delete(namegen_generators_list[i]);
    }
    namegen_generators_list = [];
    parsed_files = [];
}

export class NameGenerator {
    /**
     * 
     * @param {string} filename     the file where the desired syllable set is saved, along with it's relative path, for intsance, "data/names.txt"
     * @param {*} random    A random number generator object, use null for the default random number generator
     */
    parse(filename, random = null) {
        TCOD_namegen_parse(filename, random ? random.data : null);
    }
    destroy() {
        TCOD_namegen_destroy();
    }
    /**
     * 
     * @param {string} name the structure name you wish to refer to, for instance, "celtic female".
     * @returns {string} a name
     */
    generate(name) {
        return TCOD_namegen_generate(name);
    }
    /**
     * 
     * @param {string} name the structure name you wish to refer to, for instance, "celtic female".
     * @param {string} rule the name generation rule
     * @returns {string} a name
     */
    generateCustom(name, rule) {
        return TCOD_namegen_generate_custom(name, rule);
    }

    getSets() {
        TCOD_namegen_get_sets();
    }
}

export let NameGen = new NameGenerator();
const UPDATES_PER_SECOND = 25;
const BFS_MAX_DISTANCE = 20;
const MONTH_LENGTH = (UPDATES_PER_SECOND * 60 * 4);
const LOS_DISTANCE = 12;
const MAXIMUM_JOB_ATTEMPTS = 5;

const THIRST_THRESHOLD = ( UPDATES_PER_SECOND * 60 * 10);
const HUNGER_THRESHOLD = (MONTH_LENGTH * 6);
const WEARY_THRESHOLD = ( UPDATES_PER_SECOND * 60 * 12);

const DRINKABLE_WATER_DEPTH = 2;
const WALKABLE_WATER_DEPTH = 1;

const ENTITYHEIGHT = 5;

const PLAYERFACTION = 0;

const RIVERDEPTH = 5000;

const ANNOUNCE_MAX_LENGTH = 71;
const ANNOUNCE_HEIGHT = 10;

const TERRITORY_OVERLAY = (1 << 0);
const TERRAIN_OVERLAY = (2 << 0);
const HARDCODED_WIDTH = 500;
const HARDCODED_HEIGHT = 500;

const NOTFULL = (1 << 0);
const BETTERTHAN = (1 << 1);
const APPLYMINIMUMS = (1 << 2);
const EMPTY = (1 << 3);
const MOSTDECAYED = (1 << 4);
const AVOIDGARBAGE = (1 << 5);

export const Constants = {
    UPDATES_PER_SECOND,
    BFS_MAX_DISTANCE,
    MONTH_LENGTH,
    LOS_DISTANCE,
    MAXIMUM_JOB_ATTEMPTS,
    THIRST_THRESHOLD,
    HUNGER_THRESHOLD,
    WEARY_THRESHOLD,
    DRINKABLE_WATER_DEPTH,
    WALKABLE_WATER_DEPTH,
    ENTITYHEIGHT,
    PLAYERFACTION,
    RIVERDEPTH,
    ANNOUNCE_MAX_LENGTH,
    ANNOUNCE_HEIGHT,
    TERRITORY_OVERLAY,
    TERRAIN_OVERLAY,
    HARDCODED_WIDTH,
    HARDCODED_HEIGHT,
    NOTFULL,
    BETTERTHAN,
    APPLYMINIMUMS,
    EMPTY,
    MOSTDECAYED,
    AVOIDGARBAGE,
};
Object.freeze(Constants);
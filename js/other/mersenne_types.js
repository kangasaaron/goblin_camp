#ifndef _TCOD_RANDOM_TYPES_H
#define _TCOD_RANDOM_TYPES_H
struct TCOD_Random;
typedef struct TCOD_Random TCOD_Random;
typedef struct TCOD_Random * TCOD_random_t;

/* dice roll */
typedef struct {
    int nb_rolls;
    int nb_faces;
    float multiplier;
    float addsub;
} TCOD_dice_t;

/* PRNG algorithms */
typedef enum { TCOD_RNG_MT, TCOD_RNG_CMWC } TCOD_random_algo_t;

typedef enum {
    TCOD_DISTRIBUTION_LINEAR,
    TCOD_DISTRIBUTION_GAUSSIAN,
    TCOD_DISTRIBUTION_GAUSSIAN_RANGE,
    TCOD_DISTRIBUTION_GAUSSIAN_INVERSE,
    TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE
} TCOD_distribution_t;
#endif /* _TCOD_RANDOM_TYPES_H */

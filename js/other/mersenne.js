
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
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
/* pseudorandom number generator toolkit */
typedef struct TCOD_Random {
  /* algorithm identifier */
  TCOD_random_algo_t algo;
  /* distribution */
  TCOD_distribution_t distribution;
  /* Mersenne Twister stuff */
  uint32_t mt[624];
  int cur_mt;
  /* Complementary-Multiply-With-Carry stuff */
  /* shared with Generalised Feedback Shift Register */
  uint32_t Q[4096], c;
  int cur;
} mersenne_data_t;
#include "libtcod_int.h"
#include "mersenne.h"
#include "utility.h"

static TCOD_random_t instance = NULL;
static float rand_div = 1.0f / (float)(0xffffffff);
static double rand_div_double = 1.0 / (double)(0xffffffff);

/* initialize the mersenne twister array */
static void mt_init(uint32_t seed, uint32_t mt[624]) {
  int i;
  mt[0] = seed;
  for (i = 1; i < 624; i++) {
    mt[i] = (1812433253 * (mt[i - 1] ^ (mt[i - 1] >> 30)) + i);
  }
}

/* get the next random value from the mersenne twister array */
static uint32_t mt_rand(uint32_t mt[624], int* cur_mt) {
#define MT_HIGH_BIT 0x80000000UL
#define MT_LOW_BITS 0x7fffffffUL
  uint32_t y;

  if (*cur_mt == 624) {
    /* our 624 sequence is finished. generate a new one */
    int i;

    for (i = 0; i < 623; i++) {
      y = (mt[i] & MT_HIGH_BIT) | (mt[i + 1] & MT_LOW_BITS);
      if (y & 1) {
        /* odd y */
        mt[i] = mt[(i + 397) % 624] ^ (y >> 1) ^ 2567483615UL;
      } else {
        /* even y */
        mt[i] = mt[(i + 397) % 624] ^ (y >> 1);
      }
    }
    y = (mt[623] & MT_HIGH_BIT) | (mt[0] & MT_LOW_BITS);
    if (y & 1) {
      /* odd y */
      mt[623] = mt[396] ^ (y >> 1) ^ 2567483615UL;
    } else {
      mt[623] = mt[396] ^ (y >> 1);
    }

    *cur_mt = 0;
  }

  y = mt[(*cur_mt)++];
  y ^= (y >> 11);
  y ^= (y << 7) & 2636928640UL;
  y ^= (y << 15) & 4022730752UL;
  y ^= (y >> 18);
  return y;
}

/* get a random float between 0 and 1 */
static float frandom01(mersenne_data_t* r) { return (float)mt_rand(r->mt, &r->cur_mt) * rand_div; }

/* string hashing function */
/* not used (yet)
static uint32_t hash(const char *data,int len) {
        uint32_t hash = 0;
        uint32_t x;
        int i;
        for(i = 0; i < len; data++, i++) {
                hash = (hash << 4) + (*data);
                if((x = hash & 0xF0000000L) != 0) {
                        hash ^= (x >> 24);
                        hash &= ~x;
                }
        }
        return (hash & 0x7FFFFFFF);
}
*/

/* get a random number from the CMWC */
#define CMWC_GET_NUMBER(num)                         \
  {                                                  \
    unsigned long long t;                            \
    uint32_t x;                                      \
    r->cur = (r->cur + 1) & 4095;                    \
    t = 18782LL * r->Q[r->cur] + r->c;               \
    r->c = (t >> 32);                                \
    x = (uint32_t)(t + r->c);                        \
    if (x < r->c) {                                  \
      x++;                                           \
      r->c++;                                        \
    }                                                \
    if ((x + 1) == 0) {                              \
      r->c++;                                        \
      x = 0;                                         \
    }                                                \
    num = (uint32_t)(r->Q[r->cur] = 0xfffffffe - x); \
  }

TCOD_random_t TCOD_random_new(TCOD_random_algo_t algo) { return TCOD_random_new_from_seed(algo, (uint32_t)time(0)); }

TCOD_random_t TCOD_random_get_instance(void) {
  if (!instance) {
    instance = TCOD_random_new(TCOD_RNG_CMWC);
  }
  return instance;
}

TCOD_random_t TCOD_random_new_from_seed(TCOD_random_algo_t algo, uint32_t seed) {
  mersenne_data_t* r = (mersenne_data_t*)calloc(sizeof(mersenne_data_t), 1);
  /* Mersenne Twister */
  if (algo == TCOD_RNG_MT) {
    r->algo = TCOD_RNG_MT;
    r->cur_mt = 624;
    mt_init(seed, r->mt);
  }
  /* Complementary-Multiply-With-Carry or Generalised Feedback Shift Register */
  else {
    int i;
    /* fill the Q array with pseudorandom seeds */
    uint32_t s = seed;
    for (i = 0; i < 4096; i++) r->Q[i] = s = (s * 1103515245) + 12345; /* glibc LCG */
    r->c = ((s * 1103515245) + 12345) % 809430660; /* this max value is recommended by George Marsaglia */
    r->cur = 0;
    r->algo = TCOD_RNG_CMWC;
  }
  r->distribution = TCOD_DISTRIBUTION_LINEAR;
  return (TCOD_random_t)r;
}

int TCOD_random_get_i(TCOD_random_t mersenne, int min, int max) {
  mersenne_data_t* r;
  int delta;
  if (max == min)
    return min;
  else if (max < min) {
    int tmp = max;
    max = min;
    min = tmp;
  }
  if (!mersenne) mersenne = TCOD_random_get_instance();
  r = (mersenne_data_t*)mersenne;
  delta = max - min + 1;
  /* return a number from the Mersenne Twister */
  if (r->algo == TCOD_RNG_MT) return (mt_rand(r->mt, &r->cur_mt) % delta) + min;
  /* or from the CMWC */
  else {
    uint32_t number;
    CMWC_GET_NUMBER(number)
    return number % delta + min;
  }
}

float TCOD_random_get_f(TCOD_random_t mersenne, float min, float max) {
  mersenne_data_t* r;
  float delta, f;
  if (max == min)
    return min;
  else if (max < min) {
    float tmp = max;
    max = min;
    min = tmp;
  }
  if (!mersenne) mersenne = TCOD_random_get_instance();
  r = (mersenne_data_t*)mersenne;
  delta = max - min;
  /* Mersenne Twister */
  if (r->algo == TCOD_RNG_MT) f = delta * frandom01(r);
  /* CMWC */
  else {
    uint32_t number;
    CMWC_GET_NUMBER(number)
    f = (float)(number)*rand_div * delta;
  }
  return min + f;
}

double TCOD_random_get_d(TCOD_random_t mersenne, double min, double max) {
  mersenne_data_t* r;
  double delta, f;
  if (max == min)
    return min;
  else if (max < min) {
    double tmp = max;
    max = min;
    min = tmp;
  }
  if (!mersenne) mersenne = TCOD_random_get_instance();
  r = (mersenne_data_t*)mersenne;
  delta = max - min;
  /* Mersenne Twister */
  if (r->algo == TCOD_RNG_MT) f = delta * (double)frandom01(r);
  /* CMWC */
  else {
    uint32_t number;
    CMWC_GET_NUMBER(number)
    f = (double)(number)*rand_div_double * delta;
  }
  return min + f;
}

void TCOD_random_delete(TCOD_random_t mersenne) {
  TCOD_IFNOT(mersenne != NULL) return;
  if (mersenne == instance) instance = NULL;
  free(mersenne);
}
TCOD_random_t TCOD_random_save(TCOD_random_t mersenne) {
  mersenne_data_t* ret = (mersenne_data_t*)malloc(sizeof(mersenne_data_t));
  if (!mersenne) mersenne = TCOD_random_get_instance();
  memcpy(ret, mersenne, sizeof(mersenne_data_t));
  return (TCOD_random_t)ret;
}

void TCOD_random_restore(TCOD_random_t mersenne, TCOD_random_t backup) {
  if (!mersenne) mersenne = TCOD_random_get_instance();
  memcpy(mersenne, backup, sizeof(mersenne_data_t));
}

/* Box-Muller transform (Gaussian distribution) */

double TCOD_random_get_gaussian_double(TCOD_random_t mersenne, double mean, double std_deviation) {
  double x1, x2, w, y1;
  static double y2;
  static bool again = false;
  double ret;
  if (again)
    ret = mean + y2 * std_deviation;
  else {
    mersenne_data_t* r = NULL;
    if (!mersenne) mersenne = TCOD_random_get_instance();
    r = (mersenne_data_t*)mersenne;
    /* MT */
    if (r->algo == TCOD_RNG_MT) {
      do {
        x1 = (double)frandom01(r) * 2.0 - 1.0;
        x2 = (double)frandom01(r) * 2.0 - 1.0;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1.0);
    }
    /* CMWC */
    else {
      uint32_t number;
      do {
        CMWC_GET_NUMBER(number)
        x1 = number * rand_div_double * 2.0 - 1.0;
        CMWC_GET_NUMBER(number)
        x2 = number * rand_div_double * 2.0 - 1.0;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1.0);
    }
    w = sqrt((-2.0 * log(w)) / w);
    y1 = x1 * w;
    y2 = x2 * w;
    ret = mean + y1 * std_deviation;
  }
  again = !again;
  return ret;
}

float TCOD_random_get_gaussian_float(TCOD_random_t mersenne, float mean, float std_deviation) {
  return (float)TCOD_random_get_gaussian_double(mersenne, (double)mean, (double)std_deviation);
}

int TCOD_random_get_gaussian_int(TCOD_random_t mersenne, int mean, int std_deviation) {
  double num = TCOD_random_get_gaussian_double(mersenne, (double)mean, (double)std_deviation);
  return (num >= 0.0 ? (int)(num + 0.5) : (int)(num - 0.5));
}

/* Box-Muller, ranges */

double TCOD_random_get_gaussian_double_range(TCOD_random_t mersenne, double min, double max) {
  double mean, std_deviation, ret;
  if (min > max) {
    double tmp = max;
    max = min;
    min = tmp;
  }
  mean = (min + max) / 2;
  std_deviation = (max - min) / 6.0; /* 6.0 is used because of the three-sigma rule */
  ret = TCOD_random_get_gaussian_double(mersenne, mean, std_deviation);
  return CLAMP(min, max, ret);
}

float TCOD_random_get_gaussian_float_range(TCOD_random_t mersenne, float min, float max) {
  if (min > max) {
    float tmp = max;
    max = min;
    min = tmp;
  }
  return (float)TCOD_random_get_gaussian_double_range(mersenne, (double)min, (double)max);
}

int TCOD_random_get_gaussian_int_range(TCOD_random_t mersenne, int min, int max) {
  double num;
  int ret;
  if (min > max) {
    int tmp = max;
    max = min;
    min = tmp;
  }
  num = TCOD_random_get_gaussian_double_range(mersenne, (double)min, (double)max);
  ret = (num >= 0.0 ? (int)(num + 0.5) : (int)(num - 0.5));
  return CLAMP(min, max, ret);
}

/* Box-Muller, ranges with a custom mean */

double TCOD_random_get_gaussian_double_range_custom(TCOD_random_t mersenne, double min, double max, double mean) {
  double d1, d2, std_deviation, ret;
  if (min > max) {
    double tmp = max;
    max = min;
    min = tmp;
  }
  d1 = max - mean;
  d2 = mean - min;
  std_deviation = MAX(d1, d2) / 3.0;
  ret = TCOD_random_get_gaussian_double(mersenne, mean, std_deviation);
  return CLAMP(min, max, ret);
}

float TCOD_random_get_gaussian_float_range_custom(TCOD_random_t mersenne, float min, float max, float mean) {
  if (min > max) {
    float tmp = max;
    max = min;
    min = tmp;
  }
  return (float)TCOD_random_get_gaussian_double_range_custom(mersenne, (double)min, (double)max, (double)mean);
}

int TCOD_random_get_gaussian_int_range_custom(TCOD_random_t mersenne, int min, int max, int mean) {
  double num;
  int ret;
  if (min > max) {
    int tmp = max;
    max = min;
    min = tmp;
  }
  num = TCOD_random_get_gaussian_double_range_custom(mersenne, (double)min, (double)max, (double)mean);
  ret = (num >= 0.0 ? (int)(num + 0.5) : (int)(num - 0.5));
  return CLAMP(min, max, ret);
}

/* Box-Muller, inverted distribution */

double TCOD_random_get_gaussian_double_inv(TCOD_random_t mersenne, double mean, double std_deviation) {
  double num = TCOD_random_get_gaussian_double(mersenne, mean, std_deviation);
  return (num >= mean ? num - (3 * std_deviation) : num + (3 * std_deviation));
}

float TCOD_random_get_gaussian_float_inv(TCOD_random_t mersenne, float mean, float std_deviation) {
  float num = (float)TCOD_random_get_gaussian_double(mersenne, (double)mean, (double)std_deviation);
  return (num >= mean ? (num - (3 * std_deviation)) : (num + (3 * std_deviation)));
}

int TCOD_random_get_gaussian_int_inv(TCOD_random_t mersenne, int mean, int std_deviation) {
  double num = TCOD_random_get_gaussian_double(mersenne, (double)mean, (double)std_deviation);
  int i_num = (num >= 0.0 ? (int)(num + 0.5) : (int)(num - 0.5));
  return (num >= mean ? i_num - (3 * std_deviation) : i_num + (3 * std_deviation));
}

/* Box-Muller, ranges, inverted distribution */

double TCOD_random_get_gaussian_double_range_inv(TCOD_random_t mersenne, double min, double max) {
  double mean, std_deviation, ret;
  if (min > max) {
    double tmp = max;
    max = min;
    min = tmp;
  }
  mean = (min + max) / 2.0;
  std_deviation = (max - min) / 6.0; /* 6.0 is used because of the three-sigma rule */
  ret = TCOD_random_get_gaussian_double_inv(mersenne, mean, std_deviation);
  return CLAMP(min, max, ret);
}

float TCOD_random_get_gaussian_float_range_inv(TCOD_random_t mersenne, float min, float max) {
  float ret = (float)TCOD_random_get_gaussian_double_range_inv(mersenne, (double)min, (double)max);
  return CLAMP(min, max, ret);
}

int TCOD_random_get_gaussian_int_range_inv(TCOD_random_t mersenne, int min, int max) {
  double num = TCOD_random_get_gaussian_double_range_inv(mersenne, (double)min, (double)max);
  int ret = (num >= 0.0 ? (int)(num + 0.5) : (int)(num - 0.5));
  return CLAMP(min, max, ret);
}

/* Box-Muller, ranges with a custom mean, inverted distribution */

double TCOD_random_get_gaussian_double_range_custom_inv(TCOD_random_t mersenne, double min, double max, double mean) {
  double d1, d2, std_deviation, ret;
  if (min > max) {
    double tmp = max;
    max = min;
    min = tmp;
  }
  d1 = max - mean;
  d2 = mean - min;
  std_deviation = MAX(d1, d2) / 3.0;
  ret = TCOD_random_get_gaussian_double_inv(mersenne, mean, std_deviation);
  return CLAMP(min, max, ret);
}

float TCOD_random_get_gaussian_float_range_custom_inv(TCOD_random_t mersenne, float min, float max, float mean) {
  float ret = (float)TCOD_random_get_gaussian_double_range_custom_inv(mersenne, (double)min, (double)max, (double)mean);
  return CLAMP(min, max, ret);
}

int TCOD_random_get_gaussian_int_range_custom_inv(TCOD_random_t mersenne, int min, int max, int mean) {
  double num = TCOD_random_get_gaussian_double_range_custom_inv(mersenne, (double)min, (double)max, (double)mean);
  int ret = (num >= 0.0 ? (int)(num + 0.5) : (int)(num - 0.5));
  return CLAMP(min, max, ret);
}

void TCOD_random_set_distribution(TCOD_random_t mersenne, TCOD_distribution_t distribution) {
  mersenne_data_t* r = NULL;
  if (!mersenne) mersenne = TCOD_random_get_instance();
  r = (mersenne_data_t*)mersenne;
  r->distribution = distribution;
}

int TCOD_random_get_int(TCOD_random_t mersenne, int min, int max) {
  if (!mersenne) mersenne = TCOD_random_get_instance();
  switch (((mersenne_data_t*)mersenne)->distribution) {
    case TCOD_DISTRIBUTION_LINEAR:
      return TCOD_random_get_i(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN:
      return TCOD_random_get_gaussian_int(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_INVERSE:
      return TCOD_random_get_gaussian_int_inv(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE:
      return TCOD_random_get_gaussian_int_range(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE:
      return TCOD_random_get_gaussian_int_range_inv(mersenne, min, max);
      break;
    default:
      return TCOD_random_get_i(mersenne, min, max);
      break;
  }
}

float TCOD_random_get_float(TCOD_random_t mersenne, float min, float max) {
  if (!mersenne) mersenne = TCOD_random_get_instance();
  switch (((mersenne_data_t*)mersenne)->distribution) {
    case TCOD_DISTRIBUTION_LINEAR:
      return TCOD_random_get_f(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN:
      return TCOD_random_get_gaussian_float(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_INVERSE:
      return TCOD_random_get_gaussian_float_inv(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE:
      return TCOD_random_get_gaussian_float_range(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE:
      return TCOD_random_get_gaussian_float_range_inv(mersenne, min, max);
      break;
    default:
      return TCOD_random_get_f(mersenne, min, max);
      break;
  }
}

double TCOD_random_get_double(TCOD_random_t mersenne, double min, double max) {
  if (!mersenne) mersenne = TCOD_random_get_instance();
  switch (((mersenne_data_t*)mersenne)->distribution) {
    case TCOD_DISTRIBUTION_LINEAR:
      return TCOD_random_get_d(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN:
      return TCOD_random_get_gaussian_double(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_INVERSE:
      return TCOD_random_get_gaussian_double_inv(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE:
      return TCOD_random_get_gaussian_double_range(mersenne, min, max);
      break;
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE:
      return TCOD_random_get_gaussian_double_range_inv(mersenne, min, max);
      break;
    default:
      return TCOD_random_get_d(mersenne, min, max);
      break;
  }
}

int TCOD_random_get_int_mean(TCOD_random_t mersenne, int min, int max, int mean) {
  if (!mersenne) mersenne = TCOD_random_get_instance();
  switch (((mersenne_data_t*)mersenne)->distribution) {
    case TCOD_DISTRIBUTION_GAUSSIAN_INVERSE:
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE:
      return TCOD_random_get_gaussian_int_range_custom_inv(mersenne, min, max, mean);
      break;
    default:
      return TCOD_random_get_gaussian_int_range_custom(mersenne, min, max, mean);
      break;
  }
}

float TCOD_random_get_float_mean(TCOD_random_t mersenne, float min, float max, float mean) {
  if (!mersenne) mersenne = TCOD_random_get_instance();
  switch (((mersenne_data_t*)mersenne)->distribution) {
    case TCOD_DISTRIBUTION_GAUSSIAN_INVERSE:
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE:
      return TCOD_random_get_gaussian_float_range_custom_inv(mersenne, min, max, mean);
      break;
    default:
      return TCOD_random_get_gaussian_float_range_custom(mersenne, min, max, mean);
      break;
  }
}

double TCOD_random_get_double_mean(TCOD_random_t mersenne, double min, double max, double mean) {
  if (!mersenne) mersenne = TCOD_random_get_instance();
  switch (((mersenne_data_t*)mersenne)->distribution) {
    case TCOD_DISTRIBUTION_GAUSSIAN_INVERSE:
    case TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE:
      return TCOD_random_get_gaussian_double_range_custom_inv(mersenne, min, max, mean);
      break;
    default:
      return TCOD_random_get_gaussian_double_range_custom(mersenne, min, max, mean);
      break;
  }
}

TCOD_dice_t TCOD_random_dice_new(const char* s) {
  TCOD_dice_t d = {1, 1, 1.0f, 0.0f};
  char* ptr = (char*)s;
  char tmp[128];
  size_t l;
  /* get multiplier */
  if ((l = strcspn(ptr, "*x")) < strlen(ptr)) {
    strcpy(tmp, ptr);
    tmp[l] = '\0';
    d.multiplier = (float)atof(tmp);
    ptr += l + 1;
  }
  /* get rolls */
  l = strcspn(ptr, "dD");
  strcpy(tmp, ptr);
  tmp[l] = '\0';
  d.nb_rolls = atoi(tmp);
  ptr += l + 1;
  /* get faces */
  l = strcspn(ptr, "-+");
  strcpy(tmp, ptr);
  tmp[l] = '\0';
  d.nb_faces = atoi(tmp);
  ptr += l;
  /* get addsub */
  if (strlen(ptr) > 0) {
    int sign = (*ptr == '+') ? 1 : (-1);
    ptr++;
    d.addsub = (float)(atof(ptr) * sign);
  }
  return d;
}

int TCOD_random_dice_roll(TCOD_random_t mersenne, TCOD_dice_t dice) {
  int rolls;
  int result = 0;
  for (rolls = 0; rolls < dice.nb_rolls; rolls++) result += TCOD_random_get_i(mersenne, 1, dice.nb_faces);
  return (int)((result + dice.addsub) * dice.multiplier);
}

int TCOD_random_dice_roll_s(TCOD_random_t mersenne, const char* s) {
  return TCOD_random_dice_roll(mersenne, TCOD_random_dice_new(s));
}


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
// clang-format off
#ifndef _TCOD_RANDOM_HPP
#define _TCOD_RANDOM_HPP

#include "mersenne.h"
/**
 @PageName random
 @PageCategory Base toolkits
 @PageTitle Pseudorandom number generator
 @PageDesc This toolkit is an implementation of two fast and high quality pseudorandom number generators:
* a Mersenne twister generator,
* a Complementary-Multiply-With-Carry generator.
CMWC is faster than MT (see table below) and has a much better period (1039460 vs. 106001). It is the default algo since libtcod 1.5.0.
Relative performances in two independent tests (lower is better) :
<table class="param">
    <tr>
      <th>Algorithm</th>
      <th>Numbers generated</th>
      <th>Perf (1)</th>
      <th>Perf (2)</th>
    </tr>
    <tr class="hilite">
      <td>MT</td>
      <td>integer</td>
      <td>62</td>
      <td>50</td>
    </tr>
    <tr>
      <td>MT</td>
      <td>float</td>
      <td>54</td>
      <td>45</td>
    </tr>
    <tr class="hilite">
      <td>CMWC</td>
      <td>integer</td>
      <td>21</td>
      <td>34</td>
    </tr>
    <tr>
      <td>CMWC</td>
      <td>float</td>
      <td>32</td>
      <td>27</td>
    </tr>
</table>
<h6>For Python users:</h6>
Python already has great builtin random generators. But some parts of the Doryen library (noise, heightmap, ...) uses RNG as parameters. If you intend to use those functions, you must provide a RNG created with the library.
<h6>For C# users:</h6>
.NET already has great builtin random generators. But some parts of the Doryen library (noise, heightmap, ...) uses RNG as parameters. If you intend to use those functions, you must provide a RNG created with the library.
 */

class TCODLIB_API TCODRandom {
	public :
		/**
		@PageName random_init
		@PageFather random
		@PageTitle Creating a generator
		@FuncTitle Default generator
		@FuncDesc The simplest way to get random number is to use the default generator. The first time you get this generator, it is initialized by calling TCOD_random_new. Then, on successive calls, this function returns the same generator (singleton pattern).
		@Cpp static TCODRandom * TCODRandom::getInstance (void)
		@C TCOD_random_t TCOD_random_get_instance (void)
		@Py random_get_instance ()
		@C# static TCODRandom TCODRandom::getInstance()
		@Param algo	The PRNG algorithm the generator should be using. Possible values are:
			* TCOD_RNG_MT for Mersenne Twister,
			* TCOD_RNG_CMWC for Complementary Multiply-With-Carry.
		*/
		static TCODRandom * getInstance(void);

		/**
		@PageName random_init
		@FuncTitle Generators with random seeds
		@FuncDesc You can also create as many generators as you want with a random seed (the number of seconds since Jan 1 1970 at the time the constructor is called). Warning ! If you call this function several times in the same second, it will return the same generator.
		@Cpp TCODRandom::TCODRandom (TCOD_random_algo_t algo = TCOD_RNG_CMWC)
		@C TCOD_random_t TCOD_random_new (TCOD_random_algo_t algo)
		@Py random_new (algo = RNG_CMWC)
		@C#
			TCODRandom::TCODRandom() // Defaults to ComplementaryMultiplyWithCarry
			TCODRandom::TCODRandom(TCODRandomType algo)
		@Param algo	The PRNG algorithm the generator should be using.
		*/
		TCODRandom(TCOD_random_algo_t algo = TCOD_RNG_CMWC, bool allocate = true);

		/**
		@PageName random_init
		@FuncTitle Generators with user defined seeds
		@FuncDesc Finally, you can create generators with a specific seed. Those allow you to get a reproducible set of random numbers. You can for example save a dungeon in a file by saving only the seed used for its generation (provided you have a determinist generation algorithm)
		@Cpp TCODRandom::TCODRandom (uint32_t seed, TCOD_random_algo_t algo = TCOD_RNG_CMWC);
		@C TCOD_random_t TCOD_random_new_from_seed (TCOD_random_algo_t algo, uint32_t seed);
		@Py random_new_from_seed(seed, algo=RNG_CMWC)
		@C#
			TCODRandom::TCODRandom(uint32_t seed) // Defaults to ComplementaryMultiplyWithCarry
			TCODRandom::TCODRandom(uint32_t seed, TCODRandomType algo)
		@Param seed	The 32 bits seed used to initialize the generator. Two generators created with the same seed will generate the same set of pseudorandom numbers.
		@Param algo	The PRNG algorithm the generator should be using.
		@CppEx
			// default generator
			TCODRandom * default = TCODRandom::getInstance();
			// another random generator
			TCODRandom * myRandom = new TCODRandom();
			// a random generator with a specific seed
			TCODRandom * myDeterministRandom = new TCODRandom(0xdeadbeef);
        @CEx
			// default generator
			TCOD_random_t default = TCOD_random_get_instance();
			// another random generator
			TCOD_random_t my_random = TCOD_random_new(TCOD_RNG_CMWC);
			// a random generator with a specific seed
			TCOD_random_t my_determinist_random = TCOD_random_new_from_seed(TCOD_RNG_CMWC,0xdeadbeef);
		@PyEx
			# default generator
			default = libtcod.random_get_instance()
			# another random generator
			my_random = libtcod.random_new()
			# a random generator with a specific seed
			my_determinist_random = libtcod.random_new_from_seed(0xdeadbeef)
		*/
		TCODRandom(uint32_t seed, TCOD_random_algo_t algo = TCOD_RNG_CMWC);

    /**
        Take ownership of a `TCOD_Random*` pointer.
        \rst
        .. versionadded:: 1.16
        \endrst
     */
    explicit TCODRandom(TCOD_Random*&& mersenne) : data(mersenne) {}

		/**
		@PageName random_init
		@FuncTitle Destroying a RNG
		@FuncDesc To release resources used by a generator, use those functions :
			NB : do not delete the default random generator !
		@Cpp TCODRandom::~TCODRandom()
		@C void TCOD_random_delete(TCOD_random_t mersenne)
		@Py random_delete(mersenne)
		@C# void TCODRandom::Dispose()
		@Param mersenne	In the C and Python versions, the generator handler, returned by the initialization functions.
		@CppEx
			// create a generator
			TCODRandom *rnd = new TCODRandom();
			// use it
			...
			// destroy it
			delete rnd;
		@CEx
			// create a generator
			TCOD_random_t rnd = TCOD_random_new();
			// use it
			...
			// destroy it
			TCOD_random_delete(rnd);
		@PyEx
			# create a generator
			rnd = libtcod.random_new()
			# use it
			...
			# destroy it
			libtcod.random_delete(rnd)
		*/
		virtual ~TCODRandom();

		/**
		@PageName random_distro
		@PageFather random
		@PageTitle Using a generator
		@FuncTitle Setting the default RNG distribution
		@FuncDesc Random numbers can be obtained using several different distributions. Linear is default, but if you wish to use one of the available Gaussian distributions, you can use this function to tell libtcod which is your preferred distribution. All random number getters will then use that distribution automatically to fetch your random numbers.
The distributions available are as follows:
1. TCOD_DISTRIBUTION_LINEAR
This is the default distribution. It will return a number from a range min-max. The numbers will be evenly distributed, ie, each number from the range has the exact same chance of being selected.
2. TCOD_DISTRIBUTION_GAUSSIAN
This distribution does not have minimum and maximum values. Instead, a mean and a standard deviation are used. The mean is the central value. It will appear with the greatest frequency. The farther away from the mean, the less the probability of appearing the possible results have. Although extreme values are possible, 99.7% of the results will be within the radius of 3 standard deviations from the mean. So, if the mean is 0 and the standard deviation is 5, the numbers will mostly fall in the (-15,15) range.
3. TCOD_DISTRIBUTION_GAUSSIAN_RANGE
This one takes minimum and maximum values. Under the hood, it computes the mean (which falls right between the minimum and maximum) and the standard deviation and applies a standard Gaussian distribution to the values. The difference is that the result is always guaranteed to be in the min-max range.
4. TCOD_DISTRIBUTION_GAUSSIAN_INVERSE
Essentially, this is the same as TCOD_DISTRIBUTION_GAUSSIAN. The difference is that the values near +3 and -3 standard deviations from the mean have the highest possibility of appearing, while the mean has the lowest.
5. TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE
Essentially, this is the same as TCOD_DISTRIBUTION_GAUSSIAN_RANGE, but the min and max values have the greatest probability of appearing, while the values between them, the lowest.
There exist functions to also specify both a min-max range AND a custom mean, which can be any value (possibly either min or max, but it can even be outside that range). In case such a function is used, the distributions will trigger a slightly different behaviour:
* TCOD_DISTRIBUTION_LINEAR
* TCOD_DISTRIBUTION_GAUSSIAN
* TCOD_DISTRIBUTION_GAUSSIAN_RANGE
In these cases, the selected mean will have the highest probability of appearing.
* TCOD_DISTRIBUTION_GAUSSIAN_INVERSE
* TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE
In these cases, the selected mean will appear with the lowest frequency.
		@Cpp void TCODRandom::setDistribution(TCOD_distribution_t distribution)
		@C void TCOD_random_set_distribution(TCOD_random_t mersenne, TCOD_distribution_t distribution)
		@Py
		@C#
		@Param mersenne	In the C and Python versions, the generator handler, returned by the initialization functions. If NULL, the default generator is used..
		@Param distribution The distribution constant from the available set:<ul><li>TCOD_DISTRIBUTION_LINEAR</li><li>TCOD_DISTRIBUTION_GAUSSIAN</li><li>TCOD_DISTRIBUTION_GAUSSIAN_RANGE</li><li>TCOD_DISTRIBUTION_GAUSSIAN_INVERSE</li><li>TCOD_DISTRIBUTION_GAUSSIAN_RANGE_INVERSE</li></ul>
		*/
		inline void setDistribution (TCOD_distribution_t distribution) { TCOD_random_set_distribution(data,distribution); }

		/**
		@PageName random_use
		@PageFather random
		@PageTitle Using a generator
		@FuncTitle Getting an integer
		@FuncDesc Once you obtained a generator (using one of those methods), you can get random numbers using the following functions, using either the explicit or simplified API where applicable:
		@Cpp
			//explicit API:
			int TCODRandom::getInt(int min, int max, int mean = 0)
			//simplified API:
			int TCODRandom::get(int min, int max, int mean = 0)
		@C
			int TCOD_random_get_int(TCOD_random_t mersenne, int min, int max)
			int TCOD_random_get_int_mean(TCOD_random_t mersenne, int min, int max, int mean)
		@Py
		@C#
		@Param mersenne	In the C and Python versions, the generator handler, returned by the initialization functions. If NULL, the default generator is used..
		@Param min,max	Range of values returned. Each time you call this function, you get a number between (including) min and max
		@Param mean This is used to set a custom mean, ie, not min+((max-min)/2). It can even be outside of the min-max range. Using a mean will force the use of a weighted (Gaussian) distribution, even if linear is set.
		*/
		inline int getInt (int min, int max, int mean = 0) { return (mean <= 0) ? TCOD_random_get_int(data,min,max) : TCOD_random_get_int_mean(data,min,max,mean); }
		inline int get (int min, int max, int mean = 0) { return (mean <= 0) ? TCOD_random_get_int(data,min,max) : TCOD_random_get_int_mean(data,min,max,mean); }

		/**
		@PageName random_use
		@FuncTitle Getting a float
		@FuncDesc To get a random floating point number, using either the explicit or simplified API where applicable
		@Cpp
			//explicit API:
			float TCODRandom::getFloat(float min, float max, float mean = 0.0f)
			//simplified API:
			float TCODRandom::get(float min, float max, float mean = 0.0f)
		@C
			float TCOD_random_get_float(TCOD_random_t mersenne, float min, float max)
			float TCOD_random_get_float_mean(TCOD_random_t mersenne, float min, float max, float mean)
		@Py random_get_float(mersenne, mi, ma)
		@C# float TCODRandom::getFloat(float min, float max)
		@Param mersenne	In the C and Python versions, the generator handler, returned by the initialization functions. If NULL, the default generator is used.
		@Param min,max	Range of values returned. Each time you call this function, you get a number between (including) min and max
		@Param mean This is used to set a custom mean, ie, not min+((max-min)/2). It can even be outside of the min-max range. Using a mean will force the use of a weighted (Gaussian) distribution, even if linear is set.
		@CppEx
			// default generator
			TCODRandom * default = TCODRandom::getInstance();
			int aRandomIntBetween0And1000 = default->getInt(0,1000);
			int anotherRandomInt = default->get(0,1000);
			// another random generator
			TCODRandom *myRandom = new TCODRandom();
			float aRandomFloatBetween0And1000 = myRandom->getFloat(0.0f,1000.0f);
			float anotherRandomFloat = myRandom->get(0.0f,1000.0f);
		@CEx
			// default generator
			int a_random_int_between_0_and_1000 = TCOD_random_get_float(NULL,0,1000);
			// another random generator
			TCOD_random_t my_random = TCOD_random_new();
			float a_random_float_between_0_and_1000 = TCOD_random_get_float(my_random,0.0f,1000.0f);
		@PyEx
			# default generator
			a_random_int_between_0_and_1000 = libtcod.random_get_float(0,0,1000)
			# another random generator
			my_random = libtcod.random_new()
			a_random_float_between_0_and_1000 = libtcod.random_get_float(my_random,0.0,1000.0)
		*/
		inline float getFloat (float min, float max, float mean = 0.0f) { return (mean <= 0) ? TCOD_random_get_float(data,min,max) : TCOD_random_get_float_mean(data,min,max,mean); }
		inline float get (float min, float max, float mean = 0.0f) { return (mean <= 0.0f) ? TCOD_random_get_float(data,min,max) : TCOD_random_get_float_mean(data,min,max,mean); }

		/**
		@PageName random_use
		@FuncTitle Getting a double
		@FuncDesc To get a random double precision floating point number, using either the explicit or simplified API where applicable
		@Cpp
			//explicit API:
			double TCODRandom::getDouble(double min, double max, double mean = 0.0f)
			//simplified API:
			double TCODRandom::get(double min, double max, double mean = 0.0f)
		@C
			double TCOD_random_get_double(TCOD_random_t mersenne, double min, double max)
			double TCOD_random_get_double_mean(TCOD_random_t mersenne, double min, double max, double mean)
		@Py
		@C#
		@Param mersenne	In the C and Python versions, the generator handler, returned by the initialization functions. If NULL, the default generator is used.
		@Param min,max	Range of values returned. Each time you call this function, you get a number between (including) min and max
		@Param mean This is used to set a custom mean, ie, not min+((max-min)/2). It can even be outside of the min-max range. Using a mean will force the use of a weighted (Gaussian) distribution, even if linear is set.
		@CppEx
			// default generator
			TCODRandom * default = TCODRandom::getInstance();
			int aRandomIntBetween0And1000 = default->getInt(0,1000);
			int anotherRandomInt = default->get(0,1000);
			// another random generator
			TCODRandom *myRandom = new TCODRandom();
			float aRandomFloatBetween0And1000 = myRandom->getFloat(0.0f,1000.0f);
			float anotherRandomFloat = myRandom->get(0.0f,1000.0f);
		@CEx
			// default generator
			int a_random_int_between_0_and_1000 = TCOD_random_get_float(NULL,0,1000);
			// another random generator
			TCOD_random_t my_random = TCOD_random_new();
			float a_random_float_between_0_and_1000 = TCOD_random_get_float(my_random,0.0f,1000.0f);
		@PyEx
			# default generator
			a_random_int_between_0_and_1000 = libtcod.random_get_float(0,0,1000)
			# another random generator
			my_random = libtcod.random_new()
			a_random_float_between_0_and_1000 = libtcod.random_get_float(my_random,0.0,1000.0)
		*/
		inline double getDouble (double min, double max, double mean = 0.0) { return (mean <= 0) ? TCOD_random_get_double(data,min,max) : TCOD_random_get_double_mean(data,min,max,mean); }
		inline double get (double min, double max, double mean = 0.0f) { return (mean <= 0.0) ? TCOD_random_get_double(data,min,max) : TCOD_random_get_double_mean(data,min,max,mean); }

		/**
		@PageName random_use
		@FuncTitle Saving a RNG state
		@FuncDesc You can save the state of a generator with :
		@Cpp TCODRandom *TCODRandom::save() const
		@C TCOD_random_t TCOD_random_save(TCOD_random_t mersenne)
		@Py random_save(mersenne)
		@C# TCODRandom TCODRandom::save()
		@Param mersenne	In the C and Python versions, the generator handler, returned by the initialization functions. If NULL, the default generator is used.
		*/
		TCODRandom * save() const;

		/**
		@PageName random_use
		@FuncTitle Restoring a saved state
		@FuncDesc And restore it later. This makes it possible to get the same series of number several times with a single generator.
		@Cpp void TCODRandom::restore(const TCODRandom *backup)
		@C void TCOD_random_restore(TCOD_random_t mersenne, TCOD_random_t backup)
		@Py random_restore(mersenne, backup)
		@C# void TCODRandom::restore(TCODRandom backup)
		@Param mersenne	In the C and Python versions, the generator handler, returned by the initialization functions. If NULL, the default generator is used.
		@CppEx
			// default generator
			TCODRandom * default = TCODRandom::getInstance();
			// save the state
			TCODRandom *backup=default->save();
			// get a random number (or several)
			int number1 = default->getInt(0,1000);
			// restore the state
			default->restore(backup);
			// get a random number
			int number2 = default->getInt(0,1000);
			// => number1 == number2
		@CEx
			// save default generator state
			TCOD_random_t backup=TCOD_random_save(NULL);
			// get a random number
			int number1 = TCOD_random_get_float(NULL,0,1000);
			// restore the state
			TCOD_random_restore(NULL,backup);
			// get a random number
			int number2 = TCOD_random_get_float(NULL,0,1000);
			// number1 == number2
		@PyEx
			# save default generator state
			backup=libtcod.random_save(0)
			# get a random number
			number1 = libtcod.random_get_float(0,0,1000)
			# restore the state
			libtcod.random_restore(0,backup)
			# get a random number
			number2 = libtcod.random_get_float(0,0,1000)
			# number1 == number2
		*/
		void restore(const TCODRandom *backup);

		//dice
		inline TCOD_dice_t dice (const char * s) { return TCOD_random_dice_new(s); }
		inline int diceRoll (TCOD_dice_t dice) { return TCOD_random_dice_roll(data,dice); }
		inline int diceRoll (const char * s) { return TCOD_random_dice_roll(data,TCOD_random_dice_new(s)); }

    /**
        Return this objects `TCOD_Random*` pointer.
        \rst
        .. versionadded:: 1.16
        \endrst
     */
		TCOD_Random* get_data() noexcept
		{
			return data;
		}
		const TCOD_Random* get_data() const noexcept
		{
			return data;
		}
	protected :
		friend class TCODLIB_API TCODNoise;
		friend class TCODLIB_API TCODHeightMap;
		friend class TCODLIB_API TCODNamegen;
		friend class TCODNameGenerator;	// Used for SWIG interface, does NOT need TCODLIB_API
		struct TCOD_Random* data;
};

#endif

static TCODRandom* instance = (TCODRandom*)NULL;

TCODRandom* TCODRandom::getInstance(void) {
  if (!instance) {
    instance = new TCODRandom(TCOD_RNG_CMWC, true);
  }
  return instance;
}

TCODRandom::TCODRandom(TCOD_random_algo_t algo, bool allocate) {
  if (allocate) data = TCOD_random_new(algo);
}

TCODRandom::TCODRandom(uint32_t seed, TCOD_random_algo_t algo) { data = TCOD_random_new_from_seed(algo, seed); }

TCODRandom::~TCODRandom() { TCOD_random_delete(data); }

TCODRandom* TCODRandom::save() const {
  TCODRandom* ret = new TCODRandom(data->algo, false);
  ret->data = TCOD_random_save(data);
  return ret;
}

void TCODRandom::restore(const TCODRandom* backup) { TCOD_random_restore(data, backup->data); }

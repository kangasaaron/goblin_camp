function CLAMP(a, b, x) {
  return (x) < (a) ? (a) : ((x) > (b) ? (b) : (x))
}
function LERP(a, b, x) {
  return (a) + (x) * ((b) - (a))
}


export class HeightMap {
  w = 0;
  h = 0;
  values = [];

  GET_VALUE(x, y) {
    return this.values[(x) + (y) * this.w];
  }
  get_value(x, y) {
    if (this.in_bounds(x, y)) {
      return this.GET_VALUE(x, y);
    } else {
      return 0.0;
    }
  }
  SET_VALUE(x, y, value) {
    this.values[(x) + (y) * this.w] = value;
  }
  set_value(x, y, value) {
    if (this.in_bounds(x, y)) {
      this.SET_VALUE(x, y, value);
    }
  }

  in_bounds(x, y) {
    if (x < 0 || x >= this.w) return false;
    if (y < 0 || y >= this.h) return false;
    return true;
  }

  constructor(width, height) {
    this.w = width;
    this.h = height;
    this.values = new Array(width * height).fill(0.0);
  }

  clear() {
    this.w = 0;
    this.h = 0;
    this.values = [];
  }

  normalize(newMin, newMax) {
    let curmin = 0, curmax = 0, result = this.getMinMax();
    curmin = result.min;
    curmax = result.max;

    if (curmax - curmin < FLT_EPSILON) {
      for (let i = 0; i != this.w * this.h; ++i) {
        this.values[i] = newMin;
      }
    } else {
      const invmax = (newMax - newMin) / (curmax - curmin);
      for (let i = 0; i != this.w * this.h; ++i) {
        this.values[i] = newMin + (this.values[i] - curmin) * invmax;
      }
    }
  }


  getMinMax() {
    if (!this.in_bounds(0, 0)) {
      return;
    }
    let min = this.values[0], max = this.values[0];

    for (let i = 0; i != this.h * this.w; i++) {
      const value = this.values[i];
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
    return { min, max };
  }

  addHill(hx, hy, h_radius, height) {
    const h_radius2 = h_radius * h_radius;
    const coef = h_height / h_radius2;
    const minx = Math.round(Math.max(Math.floor(hx - h_radius), 0));
    const miny = Math.round(Math.max(Math.floor(hy - h_radius), 0));
    const maxx = Math.round(Math.min(Math.ceil(hx + h_radius), this.w));
    const maxy = Math.round(Math.min(Math.ceil(hy + h_radius), this.h));
    for (let y = miny; y < maxy; y++) {
      const y_dist = (y - hy) * (y - hy);
      for (let x = minx; x < maxx; x++) {
        const x_dist = (x - hx) * (x - hx);
        const z = h_radius2 - x_dist - y_dist;
        if (z > 0) {
          GET_VALUE(hm, x, y) += z * coef;
        }
      }
    }
  }

  digHill(hx, hy, h_radius, height) {
    const h_radius2 = h_radius * h_radius;
    const coef = h_height / h_radius2;
    const minx = Math.round(Math.max(Math.floor(hx - h_radius), 0));
    const miny = Math.round(Math.max(Math.floor(hy - h_radius), 0));
    const maxx = Math.round(Math.min(Math.ceil(hx + h_radius), this.w));
    const maxy = Math.round(Math.min(Math.ceil(hy + h_radius), this.h));
    for (let y = miny; y < maxy; y++) {
      for (let x = minx; x < maxx; x++) {
        const x_dist = (x - hx) * (x - hx);
        const y_dist = (y - hy) * (y - hy);
        const dist = x_dist + y_dist;
        if (dist < h_radius2) {
          const z = (h_radius2 - dist) * coef;
          if (h_height > 0) {
            if (this.GET_VALUE(x, y) < z)
              this.SET_VALUE(x, y, z);
          } else {
            if (GET_VALUE(hm, x, y) > z)
              this.SET_VALUE(x, y, z);
          }
        }
      }
    }
  }
  /**
   * @param {HeightMap} source
   */
  copy(source) {
    this.w = source.w;
    this.h = source.h;
    this.values = [];
    me = this;
    source.values.forEach(function (value) {
      me.values.push(value);
    });
  }

  /**
   * @param {TCODNoise} noise
   * @param {float} mul_x
   * @param {float} mul_y
   * @param {float} add_x
   * @param {float} add_y
   * @param {float} octaves
   * @param {float} delta
   * @param {float} scale
   */
  addFbm(noise, mul_x, mul_y, add_x, add_y, octaves, delta, scale) {
    const x_coefficient = mul_x / hm.w;
    const y_coefficient = mul_y / hm.h;
    for (let y = 0; y < hm.h; y++) {
      for (let x = 0; x < hm.w; x++) {
        let f = [(x + add_x) * x_coefficient, (y + add_y) * y_coefficient];
        this.GET_VALUE(hm, x, y) += delta + noise.get_fbm(f, octaves) * scale;
      }
    }
  }

  scaleFbm(noise, mul_x, mul_y, add_x, add_y, octaves, delta, scale) {
    const x_coefficient = mul_x / hm.w;
    const y_coefficient = mul_y / hm.h;
    for (let y = 0; y < hm.h; y++) {
      for (let x = 0; x < hm.w; x++) {
        let f = [(x + add_x) * x_coefficient, (y + add_y) * y_coefficient];
        this.GET_VALUE(hm, x, y) *= delta + noise.get_fbm(f, octaves) * scale;
      }
    }
  }

  getInterpolatedValue(x, y) {
    x = CLAMP(0.0, this.w - 1, x);
    y = CLAMP(0.0, this.h - 1, y);
    let fix;
    let fiy;
    let fx = modff(x, fix);
    let fy = modff(y, fiy);
    let ix = Math.round(fix);
    let iy = Math.round(fiy);

    if (ix >= this.w - 1) {
      ix = this.w - 2;
      fx = 1.0;
    }
    if (iy >= this.h - 1) {
      iy = this.h - 2;
      fy = 1.0;
    }
    const c1 = this.GET_VALUE(ix, iy);
    const c2 = this.GET_VALUE(ix + 1, iy);
    const c3 = this.GET_VALUE(ix, iy + 1);
    const c4 = this.GET_VALUE(ix + 1, iy + 1);
    const top = LERP(c1, c2, fx);
    const bottom = LERP(c3, c4, fx);
    return LERP(top, bottom, fy);
  }

  getNormal(x, y, n, waterHeight) {
    let h0, hx, hy, invlen; /* map heights at x,y x+1,y and x,y+1 */
    n[0] = 0.0;
    n[1] = 0.0;
    n[2] = 1.0;
    if (x >= this.w - 1 || y >= this.h - 1) return;
    h0 = getInterpolatedValue(x, y);
    if (h0 < waterLevel) h0 = waterLevel;
    hx = getInterpolatedValue(x + 1, y);
    if (hx < waterLevel) hx = waterLevel;
    hy = getInterpolatedValue(x, y + 1);
    if (hy < waterLevel) hy = waterLevel;
    /* vx = 1       vy = 0 */
    /*      0            1 */
    /*      hx-h0        hy-h0 */
    /* vz = vx cross vy */
    n[0] = 255 * (h0 - hx);
    n[1] = 255 * (h0 - hy);
    n[2] = 16.0;
    /* normalize */
    invlen = 1.0 / Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
    n[0] *= invlen;
    n[1] *= invlen;
    n[2] *= invlen;
    return n;
  }

  digBezier(px, py, startRadius, startDepth, endRadius, endDepth) {
    for (let i = 0; i <= 1000; ++i) {
      const t = i / 1000.0;
      const it = 1.0 - t;
      const xTo = Math.round(px[0] * it * it * it + 3 * px[1] * t * it * it + 3 * px[2] * t * t * it + px[3] * t * t * t);
      const yTo = Math.round(py[0] * it * it * it + 3 * py[1] * t * it * it + 3 * py[2] * t * t * it + py[3] * t * t * t);
      if (xTo != xFrom || yTo != yFrom) {
        let radius = startRadius + (endRadius - startRadius) * t;
        let depth = startDepth + (endDepth - startDepth) * t;
        this.dig_hill(xTo, yTo, radius, depth);
        xFrom = xTo;
        yFrom = yTo;
      }
    }
  }

  hasLandOnBorder(seaLevel) {
    for (let x = 0; x < this.w; x++) {
      if (GET_VALUE(hm, x, 0) > waterLevel || GET_VALUE(hm, x, this.h - 1) > waterLevel) {
        return true;
      }
    }
    for (let y = 0; y < this.h; y++) {
      if (GET_VALUE(hm, 0, y) > waterLevel || GET_VALUE(hm, this.w - 1, y) > waterLevel) {
        return true;
      }
    }
    return false;
  }

  islandify(seaLevel, rnd) {
    // depricated
  }

  add(value) {
    for (let i = 0; i < this.w * this.h; ++i) {
      this.values[i] += value;
    }
  }

  countCells(min, max) {
    let count = 0;
    for (let i = 0; i < this.w * this.h; ++i) {
      if (this.values[i] >= min && this.values[i] <= max) {
        ++count;
      }
    }
    return count;
  }

  scale(value) {
    for (let i = 0; i < this.w * this.h; ++i) {
      this.values[i] *= value;
    }
  }

  clamp(min, max) {
    for (let i = 0; i < this.w * this.h; ++i) {
      this.values[i] = CLAMP(min, max, this.values[i]);
    }
  }

  lerp(other, coef) {
    if (!this.is_same_size(hm2)) {
      return;
    }
    let hm_out = new HeightMap(this.w, this.h);
    for (let i = 0; i < this.w * this.h; i++) {
      hm_out.values[i] = LERP(this.values[i], other.values[i], coef);
    }
    return hm_out;
  }

  add_hm(hm2) {
    if (!this.is_same_size(hm2)) {
      return;
    }
    let hm_out = new HeightMap(this.w, this.h);
    for (let i = 0; i < this.w * this.h; i++) {
      hm_out.values[i] = this.values[i] + hm2.values[i];
    }
    return hm_out;
  }

  multiply(hm2) {
    if (!this.is_same_size(hm2)) {
      return;
    }
    let hm_out = new HeightMap(this.w, this.h);
    for (let i = 0; i < this.w * this.h; i++) {
      hm_out.values[i] = this.values[i] * hm2.values[i];
    }
    return hm_out;
  }

  getSlope(x, y) {
    const dix = [-1, 0, 1, -1, 1, -1, 0, 1];
    const diy = [-1, -1, -1, 0, 0, 1, 1, 1];
    let min_dy = 0.0, max_dy = 0.0;
    if (!this.in_bounds(x, y)) {
      return 0;
    }
    const v = this.GET_VALUE(x, y);
    for (let i = 0; i < 8; i++) {
      const nx = x + dix[i];
      const ny = y + diy[i];
      if (this.in_bounds(nx, ny)) {
        const n_slope = this.GET_VALUE(nx, ny) - v;
        min_dy = Math.min(min_dy, n_slope);
        max_dy = Math.max(max_dy, n_slope);
      }
    }
    return Math.atan2(max_dy + min_dy, 1.0);
  }

  rainErosion(nbDrops, erosionCoef, aggregationCoef, rnd) {
    while (nbDrops-- > 0) {
      let curx = rnd.random_get_int(0, this.w - 1);
      let cury = rnd.random_get_int(0, this.h - 1);
      const dx = [-1, 0, 1, -1, 1, -1, 0, 1];
      const dy = [-1, -1, -1, 0, 0, 1, 1, 1];
      let sediment = 0.0;
      do {
        let next_x = 0, next_y = 0;
        let v = this.GET_VALUE(curx, cury);
        /* calculate slope at x,y */
        let slope = -Infinity;
        for (let i = 0; i < 8; i++) {
          const nx = curx + dx[i];
          const ny = cury + dy[i];
          if (!this.in_bounds(nx, ny)) continue;
          const n_slope = v - this.GET_VALUE(nx, ny);
          if (n_slope > slope) {
            slope = n_slope;
            next_x = nx;
            next_y = ny;
          }
        }
        if (slope > 0.0) {
          /*				GET_VALUE(hm,curx,cury) *= 1.0f - (erosionCoef * slope); */
          this.GET_VALUE(curx, cury) -= erosionCoef * slope;
          curx = next_x;
          cury = next_y;
          sediment += slope;
        } else {
          /*				GET_VALUE(hm,curx,cury) *= 1.0f + (aggregationCoef*sediment); */
          this.GET_VALUE(curx, cury) += aggregationCoef * sediment;
          break;
        }
      } while (1);
    }
  }

  kernelTransform(kernelSize, dx, dy, weight, minLevel, maxLevel) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.GET_VALUE(x, y) >= minLevel && this.GET_VALUE(x, y) <= maxLevel) {
          let val = 0.0;
          let totalWeight = 0.0;
          for (let i = 0; i < kernelsize; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];
            if (this.in_bounds(nx, ny)) {
              val += weight[i] * this.GET_VALUE(nx, ny);
              totalWeight += weight[i];
            }
          }
          this.SET_VALUE(x, y, val / totalWeight);
        }
      }
    }
  }

  addVoronoi(nbPoints, nbCoef, coef, rnd) {
    if (nbPoints <= 0) return;
    let pt = new Array(nbPoints);
    nbCoef = Math.min(nbCoef, nbPoints);
    for (let i = 0; i < nbPoints; i++) {
      pt[i].x = rnd.random_get_int(0, this.w - 1);
      pt[i].y = rnd.random_get_int(0, this.h - 1);
    }
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        /* calculate distance to voronoi points */
        for (let i = 0; i < nbPoints; i++) {
          const dx = pt[i].x - x;
          const dy = pt[i].y - y;
          pt[i].dist = (dx * dx + dy * dy);
        }
        for (let i = 0; i < nbCoef; i++) {
          /* get closest point */
          let minDist = 1E8;
          let idx = -1;
          for (let j = 0; j < nbPoints; j++) {
            if (pt[j].dist < minDist) {
              idx = j;
              minDist = pt[j].dist;
            }
          }
          if (idx == -1) break;
          this.SET_VALUE(x, y, this.GET_VALUE(x, y) + coef[i] * pt[idx].dist);
          pt[idx].dist = 1E8;
        }
      }
    }

  }

  //   #if 0
  // heatErosion(int nbPass, float minSlope, float erosionCoef, float aggregationCoef, TCODRandom * rnd) {
  //   TCOD_heightmap_t hm = { w, h, values };
  //   TCOD_heightmap_heat_erosion(& hm, nbPass, minSlope, erosionCoef, aggregationCoef, rnd -> data);
  // }
  //   #endif

  midPointDisplacement(rnd, roughness) {
    let step = 1;
    let offset = 1.0;
    let initsz = Math.min(this.w, this.h) - 1;
    let sz = initsz;
    this.values[0] = rnd.random_get_float(0.0, 1.0);
    this.values[sz - 1] = rnd.random_get_float(0.0, 1.0);
    this.values[(sz - 1) * sz] = rnd.random_get_float(0.0, 1.0);
    this.values[sz * sz - 1] = rnd.random_get_float(0.0, 1.0);
    while (sz > 0) {
      /* diamond step */
      for (let y = 0; y < step; y++) {
        for (let x = 0; x < step; x++) {
          const diamond_x = sz / 2 + x * sz;
          const diamond_y = sz / 2 + y * sz;
          let z = this.GET_VALUE(x * sz, y * sz);
          z += this.GET_VALUE((x + 1) * sz, y * sz);
          z += this.GET_VALUE((x + 1) * sz, (y + 1) * sz);
          z += this.GET_VALUE(x * sz, (y + 1) * sz);
          z *= 0.25;
          this.setMPDHeight(rnd, diamond_x, diamond_y, z, offset);
        }
      }
      offset *= roughness;
      /* square step */
      for (let y = 0; y < step; y++) {
        for (let x = 0; x < step; x++) {
          let diamond_x = sz / 2 + x * sz;
          let diamond_y = sz / 2 + y * sz;
          /* north */
          this.setMDPHeightSquare(rnd, diamond_x, diamond_y - sz / 2, initsz, sz / 2, offset);
          /* south */
          this.setMDPHeightSquare(rnd, diamond_x, diamond_y + sz / 2, initsz, sz / 2, offset);
          /* west */
          this.setMDPHeightSquare(rnd, diamond_x - sz / 2, diamond_y, initsz, sz / 2, offset);
          /* east */
          this.setMDPHeightSquare(rnd, diamond_x + sz / 2, diamond_y, initsz, sz / 2, offset);
        }
      }
      sz /= 2;
      step *= 2;
    }
  }

  setMPDHeight(rnd, x, y, z, offset) {
    z += rnd.random_get_float(-offset, offset);
    this.SET_VALUE(x, y, z);
  }

  setMDPHeightSquare(rnd, x, y, initsz, sz, offset) {
    let z = 0;
    let count = 0;
    if (y >= sz) {
      z += this.GET_VALUE(x, y - sz);
      count++;
    }
    if (x >= sz) {
      z += this.GET_VALUE(x - sz, y);
      count++;
    }
    if (y + sz < initsz) {
      z += this.GET_VALUE(x, y + sz);
      count++;
    }
    if (x + sz < initsz) {
      z += this.GET_VALUE(x + sz, y);
      count++;
    }
    z /= count;
    this.setMPDHeight(rnd, x, y, z, offset);
  }
}

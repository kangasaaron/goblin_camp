/* Copyright 2010-2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but without any warranty; without even the implied warranty of
merchantability or fitness for a particular purpose. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/



export function FindBestMatching( /** @param {boost.numeric.ublas.matrix<int>} */ costs) {
    let n = costs.length;
    /**std.vector<int>*/
    let lx = new Array(n).fill(0);
    let ly = new Array(n).fill(0);
    /**std.vector<int>*/
    let xy = new Array(n).fill(0);
    let yx = new Array(n).fill(0);
    /**std.vector<bool>*/
    let S = new Array(n).fill(false);
    let T = new Array(n).fill(false);
    /**std.vector<int>*/
    let slack = new Array(n).fill(0);
    let slackx = new Array(n).fill(0);
    /**std.vector<int>*/
    let prev = new Array(n).fill(-1);
    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            lx[x] = Math.max(lx[x], costs[x][y]);
        }
        ly[x] = 0;
        xy[x] = -1;
        yx[x] = -1;
    }

    let numMatched = 0;
    while (numMatched < n) {
        /**std.vector<int>*/
        let q = new Array(n).fill(0);
        let rd = 0,
            wr = 0;
        for (let i = 0; i < n; ++i) {
            S[i] = false;
            T[i] = false;
            prev[i] = -1;
        }
        let root = -1;
        for (let x = 0; x < n; x++) {
            if (xy[x] === -1) {
                root = x;
                q[wr++] = x;
                prev[x] = -2;
                S[x] = true;
                break;
            }
        }

        for (let y = 0; y < n; y++) {
            slack[y] = lx[root] + ly[y] - costs[root][y];
            slackx[y] = root;
        }

        let px, py;
        let foundPath = false;
        while (!foundPath) {
            while (rd < wr) {
                let x = q[rd++];
                for (let y = 0; y < n; y++) {
                    if (costs[x][y] === lx[x] + ly[y] && !T[y]) {
                        if (yx[y] === -1) {
                            foundPath = true;
                            px = x;
                            py = y;
                            break;
                        }
                        T[y] = true;
                        q[wr++] = yx[y];
                        S[yx[y]] = true;
                        prev[yx[y]] = x;
                        for (let sy = 0; sy < n; sy++) {
                            if (lx[yx[y]] + ly[sy] - costs[yx[y]][sy] < slack[sy]) {
                                slack[sy] = lx[yx[y]] + ly[sy] - costs[yx[y]][sy];
                                slackx[sy] = yx[y];
                            }
                        }
                    }
                }
                if (foundPath) {
                    break;
                }
            }
            if (foundPath) {
                break;
            }
            let delta = Number.MAXIMUM_SAFE_INTEGER; //std.numeric_limits<int>.max();
            for (let y = 0; y < n; y++) {
                if (!T[y]) {
                    delta = Math.min(delta, slack[y]);
                }
            }
            for (let x = 0; x < n; x++) {
                if (S[x]) {
                    lx[x] -= delta;
                }
            }
            for (let y = 0; y < n; y++) {
                if (T[y]) {
                    ly[y] += delta;
                } else {
                    slack[y] -= delta;
                }
            }
            wr = rd = 0;
            for (let y = 0; y < n; y++) {
                if (!T[y] && slack[y] === 0) {
                    if (yx[y] === -1) {
                        px = slackx[y];
                        py = y;
                        foundPath = true;
                        break;
                    } else {
                        T[y] = true;
                        if (!S[yx[y]]) {
                            q[wr++] = yx[y];
                            let sx = yx[y];
                            let sp = slackx[y];
                            S[sx] = true;
                            prev[sx] = sp;
                            for (let sy = 0; sy < n; sy++) {
                                if (lx[sx] + ly[sy] - costs[sx][sy] < slack[sy]) {
                                    slack[sy] = lx[sx] + ly[sy] - costs[sx][sy];
                                    slackx[sy] = sx;
                                }
                            }
                        }
                    }
                }
            }
        }

        numMatched++;
        for (let cx = px, cy = py, ty; cx !== -2; cx = prev[cx], cy = ty) {
            ty = xy[cx];
            yx[cy] = cx;
            xy[cx] = cy;
        }
    }

    let rtn;
    for (let x = 0; x < n; x++) {
        rtn.push(xy[x]);
    }
    return rtn;
}
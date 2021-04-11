/* Copyright 2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/

// import "vector"

class ViewportLayer {
    // std.vector<unsigned char> data;
    data = [];
    width = 0;
    height = 0;

    constructor() {
        data();
        width(0);
        height(0)
    }
    constructor(width, height) {
        data(width * height * 4, 0),
            width(width),
            height(height)
    }

    // void Reset();
    // void ViewportLayer.Reset() {
    Reset() {
        for (let i = 3; i < 4 * width * height; i += 4) {
            data[i] = 0;
        }
    }

    // void SetTile(int x, int y, unsigned int tile);
    // void ViewportLayer.SetTile(int x, int y, unsigned int tile) {
    SetTile(x, y, tile) {
        let index = 4 * (x + y * width);
        data[index] = tile & 0xff;
        data[index + 1] = (tile >> 8) & 0xff;
        data[index + 2] = (tile >> 16) & 0xff;
        data[index + 3] = 0xff;
    }

    // int GetTile(int x, int y) const;
    // int ViewportLayer.GetTile(int x, int y) const {
    GetTile(x, y) {
        let index = 4 * (x + y * width);
        return data[index] | (data[index + 1] << 8) | (data[index + 2] << 16);
    }

    // bool IsTileSet(int x, int y) const;
    // bool ViewportLayer.IsTileSet(int x, int y) const {
    IsTileSet(x, y) {
        return data[4 * (x + y * width) + 3] != 0;
    }

    // unsigned char * operator * ();
    // unsigned char * ViewportLayer.operator * () {
    operator_star() {
        return data[0];
    }
}
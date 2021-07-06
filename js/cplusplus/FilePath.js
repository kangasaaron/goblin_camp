import { Path } from "../data/Path.js";

export class FilePath {
    /** @type {string} */
    cacheName = "";
    /** @type {string} */
    fullURL = "";
    /** @type {string} */
    url = "";
    /**
     * @param {string} url
     */
    constructor(url) {
        this.fullURL = url;
    }
    parse(Paths) {
        for (let p of Path.values()) {
            let name = Paths.GetName(p);
            if (this.fullURL.startsWith(name)) {
                this.cacheName = name;
                this.url = this.fullURL.replace(this.cacheName, "");
                return;
            }
        }
    }
    GetCache(Paths) {
        if (this.cacheName === "") this.parse(Paths);
        return Paths.caches[this.cacheName];
    }
    GetCacheName(Paths) {
        if (this.cacheName === "") this.parse(Paths);
        return this.cacheName;
    }
    GetURL(Paths) {
        if (this.url === "") this.parse(Paths);
        return this.url;
    }
}
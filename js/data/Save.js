/**
 * saves
 */
export class Save {
    filename = "";
    size = 0;
    date = "";
    timestamp = 0; // for sorting

    constructor(filename, size, timestamp) {
        this.filename = filename;
        this.timestamp = timestamp;
        this.size = Data.FormatFileSize(size);
        this.date = Data.FormatTimestamp(timestamp);
    }

    isLessThan(that) {
        return this.timestamp < that.timestamp;
    }
    isGreaterThan(that) {
        return this.timestamp > that.timestamp;
    }
    isLessThanOrEqualTo(that) {
        return this.timestamp <= that.timestamp;
    }
    isGreaterThanOrEqualTo(that) {
        return this.timestamp >= that.timestamp;
    }
}
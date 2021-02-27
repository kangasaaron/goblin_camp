class fileSystem {
    constructor() {

    }
    exists(path) {
        path = String(path);

    }
    writeDirectory(path) {
        path = String(path);

    }
    addItemToDirectory(directory, filepath) {
        directory = String(directory);
        filepath = String(filepath);

    }
    removeItemFromDirectory(directory, filepath) {
        directory = String(directory);
        filepath = String(filepath);

    }
    writeFile(path, data) {
        path = String(path);

    }
    readDirectory(path) {
        path = String(path);

    }
    readFile(path) {
        path = String(path);

    }
    deleteFile(path) {
        path = String(path);

    }
    isDirectory(path) {

    }
    deleteDirectory(path) {

    }
}

export let fs = new fileSystem();
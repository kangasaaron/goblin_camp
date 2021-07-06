

export class Struct{
    constructor(...args){
        for(let key in Object.keys(this)){
            this[key] = args.shift();
        }
    }
}
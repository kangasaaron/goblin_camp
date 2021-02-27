

export class UnorderedSet{
	constructor(from){
		this.storage = [];
		this.addAll(from);
	}
	static get [Symbol.species](){
		return UnorderedSet.constructor;
	}
	get size(){
		return this.storage.length;
	}
	empty(){
		return this.size === 0;
	}
	insert(value){
		return this.add(value);
	}
	set(value){
		return this.add(value);
	}
	add(value){
		if(!this.has(value))
			return this.storage.push(value);
		return false;
	}
	addAll(values){
		for(let v of values){
			this.add(v);
		}
	}
	clear(){
		return this.storage.clear();
	}
	delete(value){
		var i = this.storage.findIndex((item) => item === value);
		if(i > -1){
			this.storage.splice(value,1);
			return true;
		}
		return false;
	}
	erase(value){
		return this.delete(value);
	}
	remove(value){
		return this.delete(value);
	}
	keyOf(index){
		return this.storage[index];
	}
	entries(){
		return makeSetIterator(this,'key+value');
	}
	forEach(callback,thisArg){
		return this.storage.forEach(callback,thisArg);
	}
	has(value){
		return this.storage.includes(value);
	}
	includes(value){
		return this.has(value);
	}
	contains(value){
		return this.has(value);
	}
	containsAll(collection){
		for(let item of collection){
			if(!this.has(item))
				return false;
		}
		return true;
	}
	isSuperSet(subset){
		return this.containsAll(subset);
	}
	values(){
		return makeSetIterator(this,'value');
	}
	concat(otherSet){
		let returnSet = new UnorderedSet(this);
		for(let item of otherSet)
			returnSet.add(item);
		return returnSet;
	}
	union(otherSet){
		return this.concat(otherSet);
	}
	intersection(otherSet){
		if(this.size > otherSet.size)
			return otherSet.intersection(this);
		let returnSet = new UnorderedSet();
		for(let item of this.values()){
			if(otherSet.has(item))
				returnSet.add(item);
		}
		return returnSet;
	}
	symmetricDifference(otherSet){
		let returnSet = new Set(this);
		for(let value of otherSet){
			if(returnSet.has(value))
				returnSet.delete(value);
			else
				returnSet.add(value);
		}
		return returnSet;
	}
	difference(otherSet){
		let returnSet = new Set(this);
		for(let value of otherSet){
			returnSet.delete(value);
		}
		return returnSet;
	}
	every(callback,thisArg){
		return this.storage.every(callback,thisArg);
	}
	some(callback,thisArg){		
		return this.storage.some(callback,thisArg);
	}
	filter(callback,thisArg){
		return new UnorderedSet(this.storage.filter(callback,thisArg));
	}
	map(callback,thisArg){
		return new UnorderedSet(this.storage.map(callback,thisArg));
	}
	reduce(callback,initialValue,thisArg){
		return this.storage.reduce(callback.bind(thisArg),initialValue);
	}
	join(separator){
		return this.storage.join(separator);
	}
	set equality_function(f){
		if(typeof f !== "function")
			throw new TypeError("cannot change an UnorderedSet equality_function to something that is not a function");
		this._comparision_function = f;
	}
	get equality_function(){
		return this._equality_function || this.default_equality_function;
	}
	get default_equality_function(){
		return (a,b) => a === b;
	}
	[Symbol.iterator](){
		return this.storage[Symbol.iterator]();
	}
}
import {UnorderedSet} from "./UnorderedSet.js";
import {makeSetIterator} from "./SetIterator.js";

export class OrderedSet extends UnorderedSet{
	sort(comp_func){
		this.storage.sort(comp_func);
	}
	[Symbol.iterator](){
		this.sort(this.comparision_function);
		return this.storage[Symbol.iterator];
	}
	keyOf(index){
		return index;
	}
	map(...args){
		this.sort(this.comparision_function);
		return new OrderedMap(this.storage.map(...args));
	}
	values(){
		this.sort(this.comparision_function);
		return this.storage.values();
	}
	entries(){
		this.sort(this.comparision_function);
		return this.storage.entries();
	}
	keys(){
		this.sort(this.comparision_function);
		return this.storage.keys();
	}
	findIndex(callback,thisArg){
		this.sort(this.comparison_function);
		return this.storage.findIndex(callback,thisArg);
	}
	indexOf(item,thisArg){
		this.sort(this.comparison_function);
		return this.storage.indexOf(item,thisArg);
	}
	lastIndexOf(item,thisArg){
		this.sort(this.comparison_function);
		return this.storage.lastIndexOf(item,thisArg);
	}
	pop(){
		this.sort(this.comparison_function);
		return this.storage.pop();
	}
	shift(){
		this.sort(this.comparison_function);
		return this.storage.shift();
	}
	set comparison_function(f){
		if(typeof f !== "function")
			throw new TypeError("cannot change an OrderedSet comparison_function to something that is not a function");
		this._comparison_function = f;
	}
	get comparison_function(){
		return this._comparison_function || OrderedSet.default_comparison_function;
	}
	static get default_comparison_function(){
		return (a,b) => a.valueOf() - b.valueOf();
	}
	static get string_comparison_function(){
		return (a,b) => a.localeCompare(b);
	}
	static get number_comparison_function(){
		return this.default_comparison_function;
	}
	static get date_comparison_function(){
		return this.default_comparison_function;
	}
}
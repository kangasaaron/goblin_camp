
export function Singletonify(klass){
    if(!("_instance" in klass))
        klass._instance = null;
    if(!("Reset" in klass)){
        klass.Reset = function(){
            this._instance = null;
            if("reset" in this && typeof this.reset === "function")
                this.reset();
            return this.i;
        };
    }
    let desc = Object.getOwnPropertyDescriptor(klass,'i');
    if (!desc || !desc.get){
        Object.defineProperty(klass,'i',{
            get: function(){
                if (!klass._instance)
                    klass._instance = new klass();
                return klass._instance;
            }
        });
    }
}
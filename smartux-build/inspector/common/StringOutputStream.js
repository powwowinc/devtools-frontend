export class OutputStream{async write(data){}
async close(){}}
export class StringOutputStream{constructor(){this._data='';}
async write(chunk){this._data+=chunk;}
async close(){}
data(){return this._data;}}
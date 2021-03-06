import*as StringUtilities from'./string-utilities.js';String.sprintf=StringUtilities.sprintf;self.mod=function(m,n){return((m%n)+n)%n;};String.prototype.replaceControlCharacters=function(){return this.replace(/[\0-\x08\x0B\f\x0E-\x1F\x80-\x9F]/g,'\uFFFD');};String.regexSpecialCharacters=function(){return'^[]{}()\\.^$*+?|-,';};String.prototype.escapeForRegExp=function(){return StringUtilities.escapeCharacters(this,String.regexSpecialCharacters());};String.filterRegex=function(query){const toEscape=String.regexSpecialCharacters();let regexString='';for(let i=0;i<query.length;++i){let c=query.charAt(i);if(toEscape.indexOf(c)!==-1){c='\\'+c;}
if(i){regexString+='[^\\0'+c+']*';}
regexString+=c;}
return new RegExp(regexString,'i');};String.prototype.trimMiddle=function(maxLength){if(this.length<=maxLength){return String(this);}
let leftHalf=maxLength>>1;let rightHalf=maxLength-leftHalf-1;if(this.codePointAt(this.length-rightHalf-1)>=0x10000){--rightHalf;++leftHalf;}
if(leftHalf>0&&this.codePointAt(leftHalf-1)>=0x10000){--leftHalf;}
return this.substr(0,leftHalf)+'…'+this.substr(this.length-rightHalf,rightHalf);};String.prototype.trimEndWithMaxLength=function(maxLength){if(this.length<=maxLength){return String(this);}
return this.substr(0,maxLength-1)+'…';};String.prototype.toTitleCase=function(){return this.substring(0,1).toUpperCase()+this.substring(1);};String.prototype.compareTo=function(other){if(this>other){return 1;}
if(this<other){return-1;}
return 0;};String.prototype.removeURLFragment=function(){let fragmentIndex=this.indexOf('#');if(fragmentIndex===-1){fragmentIndex=this.length;}
return this.substring(0,fragmentIndex);};String.hashCode=function(string){if(!string){return 0;}
const p=((1<<30)*4-5);const z=0x5033d967;const z2=0x59d2f15d;let s=0;let zi=1;for(let i=0;i<string.length;i++){const xi=string.charCodeAt(i)*z2;s=(s+zi*xi)%p;zi=(zi*z)%p;}
s=(s+zi*(p-1))%p;return Math.abs(s|0);};String.isDigitAt=function(string,index){const c=string.charCodeAt(index);return(48<=c&&c<=57);};String.naturalOrderComparator=function(a,b){const chunk=/^\d+|^\D+/;let chunka,chunkb,anum,bnum;while(1){if(a){if(!b){return 1;}}else{if(b){return-1;}
return 0;}
chunka=a.match(chunk)[0];chunkb=b.match(chunk)[0];anum=!isNaN(chunka);bnum=!isNaN(chunkb);if(anum&&!bnum){return-1;}
if(bnum&&!anum){return 1;}
if(anum&&bnum){const diff=chunka-chunkb;if(diff){return diff;}
if(chunka.length!==chunkb.length){if(!+chunka&&!+chunkb){return chunka.length-chunkb.length;}
return chunkb.length-chunka.length;}}else if(chunka!==chunkb){return(chunka<chunkb)?-1:1;}
a=a.substring(chunka.length);b=b.substring(chunkb.length);}};String.caseInsensetiveComparator=function(a,b){a=a.toUpperCase();b=b.toUpperCase();if(a===b){return 0;}
return a>b?1:-1;};Number.constrain=function(num,min,max){if(num<min){num=min;}else if(num>max){num=max;}
return num;};Number.toFixedIfFloating=function(value){if(!value||isNaN(value)){return value;}
const number=Number(value);return number%1?number.toFixed(3):String(number);};Date.prototype.isValid=function(){return!isNaN(this.getTime());};Date.prototype.toISO8601Compact=function(){function leadZero(x){return(x>9?'':'0')+x;}
return this.getFullYear()+leadZero(this.getMonth()+1)+leadZero(this.getDate())+'T'+
leadZero(this.getHours())+leadZero(this.getMinutes())+leadZero(this.getSeconds());};Object.defineProperty(Array.prototype,'remove',{value:function(value,firstOnly){let index=this.indexOf(value);if(index===-1){return false;}
if(firstOnly){this.splice(index,1);return true;}
for(let i=index+1,n=this.length;i<n;++i){if(this[i]!==value){this[index++]=this[i];}}
this.length=index;return true;},configurable:true});(function(){const partition={value:function(comparator,left,right,pivotIndex){function swap(array,i1,i2){const temp=array[i1];array[i1]=array[i2];array[i2]=temp;}
const pivotValue=this[pivotIndex];swap(this,right,pivotIndex);let storeIndex=left;for(let i=left;i<right;++i){if(comparator(this[i],pivotValue)<0){swap(this,storeIndex,i);++storeIndex;}}
swap(this,right,storeIndex);return storeIndex;},configurable:true};Object.defineProperty(Array.prototype,'partition',partition);Object.defineProperty(Uint32Array.prototype,'partition',partition);const sortRange={value:function(comparator,leftBound,rightBound,sortWindowLeft,sortWindowRight){function quickSortRange(array,comparator,left,right,sortWindowLeft,sortWindowRight){if(right<=left){return;}
const pivotIndex=Math.floor(Math.random()*(right-left))+left;const pivotNewIndex=array.partition(comparator,left,right,pivotIndex);if(sortWindowLeft<pivotNewIndex){quickSortRange(array,comparator,left,pivotNewIndex-1,sortWindowLeft,sortWindowRight);}
if(pivotNewIndex<sortWindowRight){quickSortRange(array,comparator,pivotNewIndex+1,right,sortWindowLeft,sortWindowRight);}}
if(leftBound===0&&rightBound===(this.length-1)&&sortWindowLeft===0&&sortWindowRight>=rightBound){this.sort(comparator);}else{quickSortRange(this,comparator,leftBound,rightBound,sortWindowLeft,sortWindowRight);}
return this;},configurable:true};Object.defineProperty(Array.prototype,'sortRange',sortRange);Object.defineProperty(Uint32Array.prototype,'sortRange',sortRange);})();Object.defineProperty(Array.prototype,'lowerBound',{value:function(object,comparator,left,right){function defaultComparator(a,b){return a<b?-1:(a>b?1:0);}
comparator=comparator||defaultComparator;let l=left||0;let r=right!==undefined?right:this.length;while(l<r){const m=(l+r)>>1;if(comparator(object,this[m])>0){l=m+1;}else{r=m;}}
return r;},configurable:true});Object.defineProperty(Array.prototype,'upperBound',{value:function(object,comparator,left,right){function defaultComparator(a,b){return a<b?-1:(a>b?1:0);}
comparator=comparator||defaultComparator;let l=left||0;let r=right!==undefined?right:this.length;while(l<r){const m=(l+r)>>1;if(comparator(object,this[m])>=0){l=m+1;}else{r=m;}}
return r;},configurable:true});Object.defineProperty(Uint32Array.prototype,'lowerBound',{value:Array.prototype.lowerBound,configurable:true});Object.defineProperty(Uint32Array.prototype,'upperBound',{value:Array.prototype.upperBound,configurable:true});Object.defineProperty(Int32Array.prototype,'lowerBound',{value:Array.prototype.lowerBound,configurable:true});Object.defineProperty(Int32Array.prototype,'upperBound',{value:Array.prototype.upperBound,configurable:true});Object.defineProperty(Float64Array.prototype,'lowerBound',{value:Array.prototype.lowerBound,configurable:true});Object.defineProperty(Array.prototype,'binaryIndexOf',{value:function(value,comparator){const index=this.lowerBound(value,comparator);return index<this.length&&comparator(value,this[index])===0?index:-1;},configurable:true});Object.defineProperty(Array.prototype,'peekLast',{value:function(){return this[this.length-1];},configurable:true});(function(){function mergeOrIntersect(array1,array2,comparator,mergeNotIntersect){const result=[];let i=0;let j=0;while(i<array1.length&&j<array2.length){const compareValue=comparator(array1[i],array2[j]);if(mergeNotIntersect||!compareValue){result.push(compareValue<=0?array1[i]:array2[j]);}
if(compareValue<=0){i++;}
if(compareValue>=0){j++;}}
if(mergeNotIntersect){while(i<array1.length){result.push(array1[i++]);}
while(j<array2.length){result.push(array2[j++]);}}
return result;}
Object.defineProperty(Array.prototype,'intersectOrdered',{value:function(array,comparator){return mergeOrIntersect(this,array,comparator,false);},configurable:true});Object.defineProperty(Array.prototype,'mergeOrdered',{value:function(array,comparator){return mergeOrIntersect(this,array,comparator,true);},configurable:true});})();self.createSearchRegex=function(query,caseSensitive,isRegex){const regexFlags=caseSensitive?'g':'gi';let regexObject;if(isRegex){try{regexObject=new RegExp(query,regexFlags);}catch(e){}}
if(!regexObject){regexObject=self.createPlainTextSearchRegex(query,regexFlags);}
return regexObject;};self.createPlainTextSearchRegex=function(query,flags){const regexSpecialCharacters=String.regexSpecialCharacters();let regex='';for(let i=0;i<query.length;++i){const c=query.charAt(i);if(regexSpecialCharacters.indexOf(c)!==-1){regex+='\\';}
regex+=c;}
return new RegExp(regex,flags||'');};self.spacesPadding=function(spacesCount){return'\xA0'.repeat(spacesCount);};self.numberToStringWithSpacesPadding=function(value,symbolsCount){const numberString=value.toString();const paddingLength=Math.max(0,symbolsCount-numberString.length);return self.spacesPadding(paddingLength)+numberString;};Set.prototype.firstValue=function(){if(!this.size){return null;}
return this.values().next().value;};Set.prototype.addAll=function(iterable){for(const e of iterable){this.add(e);}};Map.prototype.remove=function(key){const value=this.get(key);this.delete(key);return value;};Map.prototype.inverse=function(){const result=new Platform.Multimap();for(const key of this.keys()){const value=this.get(key);result.set(value,key);}
return result;};export class Multimap{constructor(){this._map=new Map();}
set(key,value){let set=this._map.get(key);if(!set){set=new Set();this._map.set(key,set);}
set.add(value);}
get(key){return this._map.get(key)||new Set();}
has(key){return this._map.has(key);}
hasValue(key,value){const set=this._map.get(key);if(!set){return false;}
return set.has(value);}
get size(){return this._map.size;}
delete(key,value){const values=this.get(key);if(!values){return false;}
const result=values.delete(value);if(!values.size){this._map.delete(key);}
return result;}
deleteAll(key){this._map.delete(key);}
keysArray(){return[...this._map.keys()];}
valuesArray(){const result=[];for(const set of this._map.values()){result.push(...set.values());}
return result;}
clear(){this._map.clear();}}
self.loadXHR=function(url){return new Promise(load);function load(successCallback,failureCallback){function onReadyStateChanged(){if(xhr.readyState!==XMLHttpRequest.DONE){return;}
if(xhr.status!==200){xhr.onreadystatechange=null;failureCallback(new Error(xhr.status));return;}
xhr.onreadystatechange=null;successCallback(xhr.responseText);}
const xhr=new XMLHttpRequest();xhr.withCredentials=false;xhr.open('GET',url,true);xhr.onreadystatechange=onReadyStateChanged;xhr.send(null);}};self.suppressUnused=function(value){};self.setImmediate=function(callback){const args=[...arguments].slice(1);Promise.resolve().then(()=>callback(...args));return 0;};Promise.prototype.catchException=function(defaultValue){return this.catch(function(error){console.error(error);return defaultValue;});};self.runOnWindowLoad=function(callback){function windowLoaded(){self.removeEventListener('DOMContentLoaded',windowLoaded,false);callback();}
if(document.readyState==='complete'||document.readyState==='interactive'){callback();}else{self.addEventListener('DOMContentLoaded',windowLoaded,false);}};const _singletonSymbol=Symbol('singleton');self.singleton=function(constructorFunction){if(_singletonSymbol in constructorFunction){return constructorFunction[_singletonSymbol];}
const instance=new constructorFunction();constructorFunction[_singletonSymbol]=instance;return instance;};self.base64ToSize=function(content){if(!content){return 0;}
let size=content.length*3/4;if(content[content.length-1]==='='){size--;}
if(content.length>1&&content[content.length-2]==='='){size--;}
return size;};self.unescapeCssString=function(input){const reCssEscapeSequence=/(?<!\\)\\(?:([a-fA-F0-9]{1,6})|(.))[\n\t\x20]?/gs;return input.replace(reCssEscapeSequence,(_,$1,$2)=>{if($2){return $2;}
const codePoint=parseInt($1,16);const isSurrogate=0xD800<=codePoint&&codePoint<=0xDFFF;if(isSurrogate||codePoint===0x0000||codePoint>0x10FFFF){return'\uFFFD';}
return String.fromCodePoint(codePoint);});};self.Platform=self.Platform||{};Platform=Platform||{};Platform.Multimap=Multimap;
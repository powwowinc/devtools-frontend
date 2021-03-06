import*as Common from'../common/common.js';const MaxWorkers=2;export class FormatterWorkerPool{constructor(){this._taskQueue=[];this._workerTasks=new Map();}
_createWorker(){const worker=new Common.Worker.WorkerWrapper('formatter_worker_entrypoint');worker.onmessage=this._onWorkerMessage.bind(this,worker);worker.onerror=this._onWorkerError.bind(this,worker);return worker;}
_processNextTask(){if(!this._taskQueue.length){return;}
let freeWorker=[...this._workerTasks.keys()].find(worker=>!this._workerTasks.get(worker));if(!freeWorker&&this._workerTasks.size<MaxWorkers){freeWorker=this._createWorker();}
if(!freeWorker){return;}
const task=this._taskQueue.shift();this._workerTasks.set(freeWorker,task);freeWorker.postMessage({method:task.method,params:task.params});}
_onWorkerMessage(worker,event){const task=this._workerTasks.get(worker);if(task.isChunked&&event.data&&!event.data['isLastChunk']){task.callback(event.data);return;}
this._workerTasks.set(worker,null);this._processNextTask();task.callback(event.data?event.data:null);}
_onWorkerError(worker,event){console.error(event);const task=this._workerTasks.get(worker);worker.terminate();this._workerTasks.delete(worker);const newWorker=this._createWorker();this._workerTasks.set(newWorker,null);this._processNextTask();task.callback(null);}
_runChunkedTask(methodName,params,callback){const task=new Task(methodName,params,onData,true);this._taskQueue.push(task);this._processNextTask();function onData(data){if(!data){callback(true,null);return;}
const isLastChunk=!!data['isLastChunk'];const chunk=data['chunk'];callback(isLastChunk,chunk);}}
_runTask(methodName,params){let callback;const promise=new Promise(fulfill=>callback=fulfill);const task=new Task(methodName,params,callback,false);this._taskQueue.push(task);this._processNextTask();return promise;}
parseJSONRelaxed(content){return this._runTask('parseJSONRelaxed',{content:content});}
parseSCSS(content){return this._runTask('parseSCSS',{content:content}).then(rules=>rules||[]);}
format(mimeType,content,indentString){const parameters={mimeType:mimeType,content:content,indentString:indentString};return(this._runTask('format',parameters));}
javaScriptIdentifiers(content){return this._runTask('javaScriptIdentifiers',{content:content}).then(ids=>ids||[]);}
evaluatableJavaScriptSubstring(content){return this._runTask('evaluatableJavaScriptSubstring',{content:content}).then(text=>text||'');}
parseCSS(content,callback){this._runChunkedTask('parseCSS',{content:content},onDataChunk);function onDataChunk(isLastChunk,data){const rules=(data||[]);callback(isLastChunk,rules);}}
javaScriptOutline(content,callback){this._runChunkedTask('javaScriptOutline',{content:content},onDataChunk);function onDataChunk(isLastChunk,data){const items=(data||[]);callback(isLastChunk,items);}}
outlineForMimetype(content,mimeType,callback){switch(mimeType){case'text/html':case'text/javascript':this.javaScriptOutline(content,javaScriptCallback);return true;case'text/css':this.parseCSS(content,cssCallback);return true;}
return false;function javaScriptCallback(isLastChunk,items){callback(isLastChunk,items.map(item=>({line:item.line,column:item.column,title:item.name,subtitle:item.arguments})));}
function cssCallback(isLastChunk,rules){callback(isLastChunk,rules.map(rule=>({line:rule.lineNumber,column:rule.columnNumber,title:rule.selectorText||rule.atRule})));}}
findLastExpression(content){return(this._runTask('findLastExpression',{content}));}
findLastFunctionCall(content){return(this._runTask('findLastFunctionCall',{content}));}
argumentsList(content){return(this._runTask('argumentsList',{content}));}}
class Task{constructor(method,params,callback,isChunked){this.method=method;this.params=params;this.callback=callback;this.isChunked=isChunked;}}
export class FormatResult{constructor(){this.content;this.mapping;}}
class JSOutlineItem{constructor(){this.name;this.arguments;this.line;this.column;}}
class CSSProperty{constructor(){this.name;this.nameRange;this.value;this.valueRange;this.range;this.disabled;}}
class CSSStyleRule{constructor(){this.selectorText;this.styleRange;this.lineNumber;this.columnNumber;this.properties;}}
class SCSSProperty{constructor(){this.range;this.name;this.value;this.disabled;}}
class SCSSRule{constructor(){this.selectors;this.properties;this.styleRange;}}
export function formatterWorkerPool(){if(!Formatter._formatterWorkerPool){Formatter._formatterWorkerPool=new FormatterWorkerPool();}
return Formatter._formatterWorkerPool;}
export let OutlineItem;
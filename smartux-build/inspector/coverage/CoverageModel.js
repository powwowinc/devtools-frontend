import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as TextUtils from'../text_utils/text_utils.js';export const CoverageType={CSS:(1<<0),JavaScript:(1<<1),JavaScriptPerFunction:(1<<2),};export const SuspensionState={Active:Symbol('Active'),Suspending:Symbol('Suspending'),Suspended:Symbol('Suspended')};export const Events={CoverageUpdated:Symbol('CoverageUpdated'),CoverageReset:Symbol('CoverageReset'),};const _coveragePollingPeriodMs=200;export class CoverageModel extends SDK.SDKModel.SDKModel{constructor(target){super(target);this._cpuProfilerModel=target.model(SDK.CPUProfilerModel.CPUProfilerModel);this._cssModel=target.model(SDK.CSSModel.CSSModel);this._debuggerModel=target.model(SDK.DebuggerModel.DebuggerModel);this._coverageByURL=new Map();this._coverageByContentProvider=new Map();this._coverageUpdateTimes=new Set();this._suspensionState=SuspensionState.Active;this._pollTimer=null;this._currentPollPromise=null;this._shouldResumePollingOnResume=false;this._jsBacklog=[];this._cssBacklog=[];this._performanceTraceRecording=false;}
async start(jsCoveragePerBlock){if(this._suspensionState!==SuspensionState.Active){throw Error('Cannot start CoverageModel while it is not active.');}
const promises=[];if(this._cssModel){this._clearCSS();this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetAdded,this._handleStyleSheetAdded,this);promises.push(this._cssModel.startCoverage());}
if(this._cpuProfilerModel){promises.push(this._cpuProfilerModel.startPreciseCoverage(jsCoveragePerBlock,this.preciseCoverageDeltaUpdate.bind(this)));}
await Promise.all(promises);return!!(this._cssModel||this._cpuProfilerModel);}
preciseCoverageDeltaUpdate(timestamp,occasion,coverageData){this._coverageUpdateTimes.add(timestamp);this._backlogOrProcessJSCoverage(coverageData,timestamp);}
async stop(){await this.stopPolling();const promises=[];if(this._cpuProfilerModel){promises.push(this._cpuProfilerModel.stopPreciseCoverage());}
if(this._cssModel){promises.push(this._cssModel.stopCoverage());this._cssModel.removeEventListener(SDK.CSSModel.Events.StyleSheetAdded,this._handleStyleSheetAdded,this);}
await Promise.all(promises);}
reset(){this._coverageByURL=new Map();this._coverageByContentProvider=new Map();this._coverageUpdateTimes=new Set();this.dispatchEventToListeners(CoverageModel.Events.CoverageReset);}
async startPolling(){if(this._currentPollPromise||this._suspensionState!==SuspensionState.Active){return;}
await this._pollLoop();}
async _pollLoop(){this._clearTimer();this._currentPollPromise=this._pollAndCallback();await this._currentPollPromise;if(this._suspensionState===SuspensionState.Active||this._performanceTraceRecording){this._pollTimer=setTimeout(()=>this._pollLoop(),_coveragePollingPeriodMs);}}
async stopPolling(){this._clearTimer();await this._currentPollPromise;this._currentPollPromise=null;await this._pollAndCallback();}
async _pollAndCallback(){if(this._suspensionState===SuspensionState.Suspended&&!this._performanceTraceRecording){return;}
const updates=await this._takeAllCoverage();console.assert(this._suspensionState!==SuspensionState.Suspended||this._performanceTraceRecording,'CoverageModel was suspended while polling.');if(updates.length){this.dispatchEventToListeners(Events.CoverageUpdated,updates);}}
_clearTimer(){if(this._pollTimer){clearTimeout(this._pollTimer);this._pollTimer=null;}}
async preSuspendModel(reason){if(this._suspensionState!==SuspensionState.Active){return;}
this._suspensionState=SuspensionState.Suspending;if(reason==='performance-timeline'){this._performanceTraceRecording=true;return;}
if(this._currentPollPromise){await this.stopPolling();this._shouldResumePollingOnResume=true;}}
async suspendModel(reason){this._suspensionState=SuspensionState.Suspended;}
async resumeModel(){}
async postResumeModel(){this._suspensionState=SuspensionState.Active;this._performanceTraceRecording=false;if(this._shouldResumePollingOnResume){this._shouldResumePollingOnResume=false;await this.startPolling();}}
entries(){return Array.from(this._coverageByURL.values());}
getCoverageForUrl(url){return this._coverageByURL.get(url);}
usageForRange(contentProvider,startOffset,endOffset){const coverageInfo=this._coverageByContentProvider.get(contentProvider);return coverageInfo&&coverageInfo.usageForRange(startOffset,endOffset);}
_clearCSS(){for(const entry of this._coverageByContentProvider.values()){if(entry.type()!==CoverageType.CSS){continue;}
const contentProvider=(entry.contentProvider());this._coverageByContentProvider.delete(contentProvider);const key=`${contentProvider.startLine}:${contentProvider.startColumn}`;const urlEntry=this._coverageByURL.get(entry.url());if(!urlEntry||!urlEntry._coverageInfoByLocation.delete(key)){continue;}
urlEntry._addToSizes(-entry._usedSize,-entry._size);if(!urlEntry._coverageInfoByLocation.size){this._coverageByURL.delete(entry.url());}}
for(const styleSheetHeader of this._cssModel.getAllStyleSheetHeaders()){this._addStyleSheetToCSSCoverage(styleSheetHeader);}}
async _takeAllCoverage(){const[updatesCSS,updatesJS]=await Promise.all([this._takeCSSCoverage(),this._takeJSCoverage()]);return[...updatesCSS,...updatesJS];}
async _takeJSCoverage(){if(!this._cpuProfilerModel){return[];}
const{coverage,timestamp}=await this._cpuProfilerModel.takePreciseCoverage();this._coverageUpdateTimes.add(timestamp);return this._backlogOrProcessJSCoverage(coverage,timestamp);}
coverageUpdateTimes(){return this._coverageUpdateTimes;}
async _backlogOrProcessJSCoverage(freshRawCoverageData,freshTimestamp){if(freshRawCoverageData.length>0){this._jsBacklog.push({rawCoverageData:freshRawCoverageData,stamp:freshTimestamp});}
if(this._suspensionState!==SuspensionState.Active){return[];}
const ascendingByTimestamp=(x,y)=>x.stamp-y.stamp;const results=[];for(const{rawCoverageData,stamp}of this._jsBacklog.sort(ascendingByTimestamp)){results.push(this._processJSCoverage(rawCoverageData,stamp));}
this._jsBacklog=[];return results.flat();}
async processJSBacklog(){this._backlogOrProcessJSCoverage([],0);}
_processJSCoverage(scriptsCoverage,stamp){const updatedEntries=[];for(const entry of scriptsCoverage){const script=this._debuggerModel.scriptForId(entry.scriptId);if(!script){continue;}
const ranges=[];let type=CoverageType.JavaScript;for(const func of entry.functions){if(func.isBlockCoverage===false&&!(func.ranges.length===1&&!func.ranges[0].count)){type|=CoverageType.JavaScriptPerFunction;}
for(const range of func.ranges){ranges.push(range);}}
const subentry=this._addCoverage(script,script.contentLength,script.lineOffset,script.columnOffset,ranges,(type),stamp);if(subentry){updatedEntries.push(subentry);}}
return updatedEntries;}
_handleStyleSheetAdded(event){const styleSheetHeader=(event.data);this._addStyleSheetToCSSCoverage(styleSheetHeader);}
async _takeCSSCoverage(){if(!this._cssModel||this._suspensionState!==SuspensionState.Active){return[];}
const{coverage,timestamp}=await this._cssModel.takeCoverageDelta();this._coverageUpdateTimes.add(timestamp);return this._backlogOrProcessCSSCoverage(coverage,timestamp);}
async _backlogOrProcessCSSCoverage(freshRawCoverageData,freshTimestamp){if(freshRawCoverageData.length>0){this._cssBacklog.push({rawCoverageData:freshRawCoverageData,stamp:freshTimestamp});}
if(this._suspensionState!==SuspensionState.Active){return[];}
const ascendingByTimestamp=(x,y)=>x.stamp-y.stamp;const results=[];for(const{rawCoverageData,stamp}of this._cssBacklog.sort(ascendingByTimestamp)){results.push(this._processCSSCoverage(rawCoverageData,stamp));}
this._cssBacklog=[];return results.flat();}
_processCSSCoverage(ruleUsageList,stamp){const updatedEntries=[];const rulesByStyleSheet=new Map();for(const rule of ruleUsageList){const styleSheetHeader=this._cssModel.styleSheetHeaderForId(rule.styleSheetId);if(!styleSheetHeader){continue;}
let ranges=rulesByStyleSheet.get(styleSheetHeader);if(!ranges){ranges=[];rulesByStyleSheet.set(styleSheetHeader,ranges);}
ranges.push({startOffset:rule.startOffset,endOffset:rule.endOffset,count:Number(rule.used)});}
for(const entry of rulesByStyleSheet){const styleSheetHeader=(entry[0]);const ranges=(entry[1]);const subentry=this._addCoverage(styleSheetHeader,styleSheetHeader.contentLength,styleSheetHeader.startLine,styleSheetHeader.startColumn,ranges,CoverageType.CSS,stamp);if(subentry){updatedEntries.push(subentry);}}
return updatedEntries;}
static _convertToDisjointSegments(ranges,stamp){ranges.sort((a,b)=>a.startOffset-b.startOffset);const result=[];const stack=[];for(const entry of ranges){let top=stack.peekLast();while(top&&top.endOffset<=entry.startOffset){append(top.endOffset,top.count);stack.pop();top=stack.peekLast();}
append(entry.startOffset,top?top.count:undefined);stack.push(entry);}
while(stack.length){const top=stack.pop();append(top.endOffset,top.count);}
function append(end,count){const last=result.peekLast();if(last){if(last.end===end){return;}
if(last.count===count){last.end=end;return;}}
result.push({end:end,count:count,stamp:stamp});}
return result;}
_addStyleSheetToCSSCoverage(styleSheetHeader){this._addCoverage(styleSheetHeader,styleSheetHeader.contentLength,styleSheetHeader.startLine,styleSheetHeader.startColumn,[],CoverageType.CSS,Date.now());}
_addCoverage(contentProvider,contentLength,startLine,startColumn,ranges,type,stamp){const url=contentProvider.contentURL();if(!url){return null;}
let urlCoverage=this._coverageByURL.get(url);let isNewUrlCoverage=false;if(!urlCoverage){isNewUrlCoverage=true;urlCoverage=new URLCoverageInfo(url);this._coverageByURL.set(url,urlCoverage);}
const coverageInfo=urlCoverage._ensureEntry(contentProvider,contentLength,startLine,startColumn,type);this._coverageByContentProvider.set(contentProvider,coverageInfo);const segments=CoverageModel._convertToDisjointSegments(ranges,stamp);if(segments.length&&segments.peekLast().end<contentLength){segments.push({end:contentLength,stamp:stamp});}
const oldUsedSize=coverageInfo._usedSize;coverageInfo.mergeCoverage(segments);if(!isNewUrlCoverage&&coverageInfo._usedSize===oldUsedSize){return null;}
urlCoverage._addToSizes(coverageInfo._usedSize-oldUsedSize,0);return coverageInfo;}
async exportReport(fos){const result=[];function locationCompare(a,b){const[aLine,aPos]=a.split(':');const[bLine,bPos]=b.split(':');return aLine-bLine||aPos-bPos;}
const coverageByUrlKeys=Array.from(this._coverageByURL.keys()).sort();for(const urlInfoKey of coverageByUrlKeys){const urlInfo=this._coverageByURL.get(urlInfoKey);const url=urlInfo.url();if(url.startsWith('extensions::')||url.startsWith('chrome-extension://')){continue;}
let useFullText=false;for(const info of urlInfo._coverageInfoByLocation.values()){if(info._lineOffset||info._columnOffset){useFullText=!!url;break;}}
let fullText=null;if(useFullText){const resource=SDK.ResourceTreeModel.ResourceTreeModel.resourceForURL(url);const content=(await resource.requestContent()).content;fullText=resource?new TextUtils.Text.Text(content||''):null;}
const coverageByLocationKeys=Array.from(urlInfo._coverageInfoByLocation.keys()).sort(locationCompare);if(fullText){const entry={url,ranges:[],text:fullText.value()};for(const infoKey of coverageByLocationKeys){const info=urlInfo._coverageInfoByLocation.get(infoKey);const offset=fullText?fullText.offsetFromPosition(info._lineOffset,info._columnOffset):0;let start=0;for(const segment of info._segments){if(segment.count){entry.ranges.push({start:start+offset,end:segment.end+offset});}else{start=segment.end;}}}
result.push(entry);continue;}
for(const infoKey of coverageByLocationKeys){const info=urlInfo._coverageInfoByLocation.get(infoKey);const entry={url,ranges:[],text:(await info.contentProvider().requestContent()).content};let start=0;for(const segment of info._segments){if(segment.count){entry.ranges.push({start:start,end:segment.end});}else{start=segment.end;}}
result.push(entry);}}
await fos.write(JSON.stringify(result,undefined,2));fos.close();}}
SDK.SDKModel.SDKModel.register(CoverageModel,SDK.SDKModel.Capability.None,false);export class URLCoverageInfo extends Common.ObjectWrapper.ObjectWrapper{constructor(url){super();this._url=url;this._coverageInfoByLocation=new Map();this._size=0;this._usedSize=0;this._type;this._isContentScript=false;}
url(){return this._url;}
type(){return this._type;}
size(){return this._size;}
usedSize(){return this._usedSize;}
unusedSize(){return this._size-this._usedSize;}
usedPercentage(){if(this._size===0){return 0;}
return this.usedSize()/this.size()*100;}
unusedPercentage(){if(this._size===0){return 100;}
return this.unusedSize()/this.size()*100;}
isContentScript(){return this._isContentScript;}
entries(){return this._coverageInfoByLocation.values();}
_addToSizes(usedSize,size){this._usedSize+=usedSize;this._size+=size;if(usedSize!==0||size!==0){this.dispatchEventToListeners(URLCoverageInfo.Events.SizesChanged);}}
_ensureEntry(contentProvider,contentLength,lineOffset,columnOffset,type){const key=`${lineOffset}:${columnOffset}`;let entry=this._coverageInfoByLocation.get(key);if((type&CoverageType.JavaScript)&&!this._coverageInfoByLocation.size){this._isContentScript=(contentProvider).isContentScript();}
this._type|=type;if(entry){entry._coverageType|=type;return entry;}
if((type&CoverageType.JavaScript)&&!this._coverageInfoByLocation.size){this._isContentScript=(contentProvider).isContentScript();}
entry=new CoverageInfo(contentProvider,contentLength,lineOffset,columnOffset,type);this._coverageInfoByLocation.set(key,entry);this._addToSizes(0,contentLength);return entry;}}
URLCoverageInfo.Events={SizesChanged:Symbol('SizesChanged')};export class CoverageInfo{constructor(contentProvider,size,lineOffset,columnOffset,type){this._contentProvider=contentProvider;this._size=size;this._usedSize=0;this._statsByTimestamp=new Map();this._lineOffset=lineOffset;this._columnOffset=columnOffset;this._coverageType=type;this._segments=[];}
contentProvider(){return this._contentProvider;}
url(){return this._contentProvider.contentURL();}
type(){return this._coverageType;}
mergeCoverage(segments){this._segments=CoverageInfo._mergeCoverage(this._segments,segments);this._updateStats();}
usedByTimestamp(){return this._statsByTimestamp;}
size(){return this._size;}
usageForRange(start,end){let index=this._segments.upperBound(start,(position,segment)=>position-segment.end);for(;index<this._segments.length&&this._segments[index].end<end;++index){if(this._segments[index].count){return true;}}
return index<this._segments.length&&!!this._segments[index].count;}
static _mergeCoverage(segmentsA,segmentsB){const result=[];let indexA=0;let indexB=0;while(indexA<segmentsA.length&&indexB<segmentsB.length){const a=segmentsA[indexA];const b=segmentsB[indexB];const count=typeof a.count==='number'||typeof b.count==='number'?(a.count||0)+(b.count||0):undefined;const end=Math.min(a.end,b.end);const last=result.peekLast();const stamp=Math.min(a.stamp,b.stamp);if(!last||last.count!==count||last.stamp!==stamp){result.push({end:end,count:count,stamp:stamp});}else{last.end=end;}
if(a.end<=b.end){indexA++;}
if(a.end>=b.end){indexB++;}}
for(;indexA<segmentsA.length;indexA++){result.push(segmentsA[indexA]);}
for(;indexB<segmentsB.length;indexB++){result.push(segmentsB[indexB]);}
return result;}
_updateStats(){this._statsByTimestamp=new Map();this._usedSize=0;let last=0;for(const segment of this._segments){if(!this._statsByTimestamp.has(segment.stamp)){this._statsByTimestamp.set(segment.stamp,0);}
if(segment.count){const used=segment.end-last;this._usedSize+=used;this._statsByTimestamp.set(segment.stamp,this._statsByTimestamp.get(segment.stamp)+used);}
last=segment.end;}}}
import*as Common from'../common/common.js';import*as Platform from'../platform/platform.js';import{EventDescriptors,Events}from'./InspectorFrontendHostAPI.js';import{streamWrite as resourceLoaderStreamWrite}from'./ResourceLoader.js';export class InspectorFrontendHostStub{constructor(){function stopEventPropagation(event){const zoomModifier=this.platform()==='mac'?event.metaKey:event.ctrlKey;if(zoomModifier&&(event.keyCode===187||event.keyCode===189)){event.stopPropagation();}}
document.addEventListener('keydown',stopEventPropagation.bind(this),true);this._urlsBeingSaved=new Map();this.events;}
platform(){let match=navigator.userAgent.match(/Windows NT/);if(match){return'windows';}
match=navigator.userAgent.match(/Mac OS X/);if(match){return'mac';}
return'linux';}
loadCompleted(){}
bringToFront(){this._windowVisible=true;}
closeWindow(){this._windowVisible=false;}
setIsDocked(isDocked,callback){setTimeout(callback,0);}
setInspectedPageBounds(bounds){}
inspectElementCompleted(){}
setInjectedScriptForOrigin(origin,script){}
inspectedURLChanged(url){}
copyText(text){if(text===undefined||text===null){return;}
if(navigator.clipboard){navigator.clipboard.writeText(text);}else if(document.queryCommandSupported('copy')){const input=document.createElement('input');input.value=text;document.body.appendChild(input);input.select();document.execCommand('copy');document.body.removeChild(input);}else{self.Common.console.error('Clipboard is not enabled in hosted mode. Please inspect using chrome://inspect');}}
openInNewTab(url){window.open(url,'_blank');}
showItemInFolder(fileSystemPath){self.Common.console.error('Show item in folder is not enabled in hosted mode. Please inspect using chrome://inspect');}
save(url,content,forceSaveAs){let buffer=this._urlsBeingSaved.get(url);if(!buffer){buffer=[];this._urlsBeingSaved.set(url,buffer);}
buffer.push(content);this.events.dispatchEventToListeners(Events.SavedURL,{url,fileSystemPath:url});}
append(url,content){const buffer=this._urlsBeingSaved.get(url);buffer.push(content);this.events.dispatchEventToListeners(Events.AppendedToURL,url);}
close(url){const buffer=this._urlsBeingSaved.get(url);this._urlsBeingSaved.delete(url);const fileName=url?Platform.StringUtilities.trimURL(url).removeURLFragment():'';const link=createElement('a');link.download=fileName;const blob=new Blob([buffer.join('')],{type:'text/plain'});link.href=URL.createObjectURL(blob);link.click();}
sendMessageToBackend(message){}
recordEnumeratedHistogram(actionName,actionCode,bucketSize){}
recordPerformanceHistogram(histogramName,duration){}
recordUserMetricsAction(umaName){}
requestFileSystems(){this.events.dispatchEventToListeners(Events.FileSystemsLoaded,[]);}
addFileSystem(type){}
removeFileSystem(fileSystemPath){}
isolatedFileSystem(fileSystemId,registeredName){return null;}
loadNetworkResource(url,headers,streamId,callback){Root.Runtime.loadResourcePromise(url).then(function(text){resourceLoaderStreamWrite(streamId,text);callback({statusCode:200});}).catch(function(){callback({statusCode:404});});}
getPreferences(callback){const prefs={};for(const name in window.localStorage){prefs[name]=window.localStorage[name];}
callback(prefs);}
setPreference(name,value){window.localStorage[name]=value;}
removePreference(name){delete window.localStorage[name];}
clearPreferences(){window.localStorage.clear();}
upgradeDraggedFileSystemPermissions(fileSystem){}
indexPath(requestId,fileSystemPath,excludedFolders){}
stopIndexing(requestId){}
searchInPath(requestId,fileSystemPath,query){}
zoomFactor(){return 1;}
zoomIn(){}
zoomOut(){}
resetZoom(){}
setWhitelistedShortcuts(shortcuts){}
setEyeDropperActive(active){}
showCertificateViewer(certChain){}
reattach(callback){}
readyForTest(){}
connectionReady(){}
setOpenNewWindowForPopups(value){}
setDevicesDiscoveryConfig(config){}
setDevicesUpdatesEnabled(enabled){}
performActionOnRemotePage(pageId,action){}
openRemotePage(browserId,url){}
openNodeFrontend(){}
showContextMenuAtPoint(x,y,items,document){throw'Soft context menu should be used';}
isHostedMode(){return true;}
setAddExtensionCallback(callback){}}
export let InspectorFrontendHostInstance=window.InspectorFrontendHost;class InspectorFrontendAPIImpl{constructor(){this._debugFrontend=(self.Root&&Root.Runtime&&!!Root.Runtime.queryParam('debugFrontend'))||(window['InspectorTest']&&window['InspectorTest']['debugTest']);const descriptors=EventDescriptors;for(let i=0;i<descriptors.length;++i){this[descriptors[i][1]]=this._dispatch.bind(this,descriptors[i][0],descriptors[i][2],descriptors[i][3]);}}
_dispatch(name,signature,runOnceLoaded){const params=Array.prototype.slice.call(arguments,3);if(this._debugFrontend){setImmediate(innerDispatch);}else{innerDispatch();}
function innerDispatch(){if(signature.length<2){try{InspectorFrontendHostInstance.events.dispatchEventToListeners(name,params[0]);}catch(e){console.error(e+' '+e.stack);}
return;}
const data={};for(let i=0;i<signature.length;++i){data[signature[i]]=params[i];}
try{InspectorFrontendHostInstance.events.dispatchEventToListeners(name,data);}catch(e){console.error(e+' '+e.stack);}}}
streamWrite(id,chunk){resourceLoaderStreamWrite(id,chunk);}}
(function(){function initializeInspectorFrontendHost(){let proto;if(!InspectorFrontendHostInstance){window.InspectorFrontendHost=InspectorFrontendHostInstance=new InspectorFrontendHostStub();}else{proto=InspectorFrontendHostStub.prototype;for(const name of Object.getOwnPropertyNames(proto)){const stub=proto[name];if(typeof stub!=='function'||InspectorFrontendHostInstance[name]){continue;}
console.error('Incompatible embedder: method Host.InspectorFrontendHost.'+name+' is missing. Using stub instead.');InspectorFrontendHostInstance[name]=stub;}}
InspectorFrontendHostInstance.events=new Common.ObjectWrapper.ObjectWrapper();}
initializeInspectorFrontendHost();window.InspectorFrontendAPI=new InspectorFrontendAPIImpl();})();export function isUnderTest(prefs){if(Root.Runtime.queryParam('test')){return true;}
if(prefs){return prefs['isUnderTest']==='true';}
return self.Common.settings&&self.Common.settings.createSetting('isUnderTest',false).get();}
import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as Workspace from'../workspace/workspace.js';import{LiveLocation,LiveLocationPool}from'./LiveLocation.js';export class PresentationConsoleMessageManager{constructor(){self.SDK.targetManager.observeModels(SDK.DebuggerModel.DebuggerModel,this);self.SDK.consoleModel.addEventListener(SDK.ConsoleModel.Events.ConsoleCleared,this._consoleCleared,this);self.SDK.consoleModel.addEventListener(SDK.ConsoleModel.Events.MessageAdded,event=>this._consoleMessageAdded((event.data)));self.SDK.consoleModel.messages().forEach(this._consoleMessageAdded,this);}
modelAdded(debuggerModel){debuggerModel[PresentationConsoleMessageManager._symbol]=new PresentationConsoleMessageHelper(debuggerModel);}
modelRemoved(debuggerModel){debuggerModel[PresentationConsoleMessageManager._symbol]._consoleCleared();}
_consoleMessageAdded(message){if(!message.isErrorOrWarning()||!message.runtimeModel()||message.source===SDK.ConsoleModel.MessageSource.Violation){return;}
const debuggerModel=message.runtimeModel().debuggerModel();debuggerModel[PresentationConsoleMessageManager._symbol]._consoleMessageAdded(message);}
_consoleCleared(){for(const debuggerModel of self.SDK.targetManager.models(SDK.DebuggerModel.DebuggerModel)){debuggerModel[PresentationConsoleMessageManager._symbol]._consoleCleared();}}}
PresentationConsoleMessageManager._symbol=Symbol('PresentationConsoleMessageHelper');export class PresentationConsoleMessageHelper{constructor(debuggerModel){this._debuggerModel=debuggerModel;this._pendingConsoleMessages={};this._presentationConsoleMessages=[];debuggerModel.addEventListener(SDK.DebuggerModel.Events.ParsedScriptSource,event=>{setImmediate(this._parsedScriptSource.bind(this,event));});debuggerModel.addEventListener(SDK.DebuggerModel.Events.GlobalObjectCleared,this._debuggerReset,this);this._locationPool=new LiveLocationPool();}
_consoleMessageAdded(message){const rawLocation=this._rawLocation(message);if(rawLocation){this._addConsoleMessageToScript(message,rawLocation);}else{this._addPendingConsoleMessage(message);}}
_rawLocation(message){if(message.scriptId){return this._debuggerModel.createRawLocationByScriptId(message.scriptId,message.line,message.column);}
const callFrame=message.stackTrace&&message.stackTrace.callFrames?message.stackTrace.callFrames[0]:null;if(callFrame){return this._debuggerModel.createRawLocationByScriptId(callFrame.scriptId,callFrame.lineNumber,callFrame.columnNumber);}
if(message.url){return this._debuggerModel.createRawLocationByURL(message.url,message.line,message.column);}
return null;}
_addConsoleMessageToScript(message,rawLocation){this._presentationConsoleMessages.push(new PresentationConsoleMessage(message,rawLocation,this._locationPool));}
_addPendingConsoleMessage(message){if(!message.url){return;}
if(!this._pendingConsoleMessages[message.url]){this._pendingConsoleMessages[message.url]=[];}
this._pendingConsoleMessages[message.url].push(message);}
_parsedScriptSource(event){const script=(event.data);const messages=this._pendingConsoleMessages[script.sourceURL];if(!messages){return;}
const pendingMessages=[];for(let i=0;i<messages.length;i++){const message=messages[i];const rawLocation=this._rawLocation(message);if(!rawLocation){continue;}
if(script.scriptId===rawLocation.scriptId){this._addConsoleMessageToScript(message,rawLocation);}else{pendingMessages.push(message);}}
if(pendingMessages.length){this._pendingConsoleMessages[script.sourceURL]=pendingMessages;}else{delete this._pendingConsoleMessages[script.sourceURL];}}
_consoleCleared(){this._pendingConsoleMessages={};this._debuggerReset();}
_debuggerReset(){for(const message of this._presentationConsoleMessages){message.dispose();}
this._presentationConsoleMessages=[];this._locationPool.disposeAll();}}
export class PresentationConsoleMessage{constructor(message,rawLocation,locationPool){this._text=message.messageText;this._level=message.level===SDK.ConsoleModel.MessageLevel.Error?Workspace.UISourceCode.Message.Level.Error:Workspace.UISourceCode.Message.Level.Warning;self.Bindings.debuggerWorkspaceBinding.createLiveLocation(rawLocation,this._updateLocation.bind(this),locationPool);}
_updateLocation(liveLocation){if(this._uiMessage){this._uiMessage.remove();}
const uiLocation=liveLocation.uiLocation();if(!uiLocation){return;}
this._uiMessage=uiLocation.uiSourceCode.addLineMessage(this._level,this._text,uiLocation.lineNumber,uiLocation.columnNumber);}
dispose(){if(this._uiMessage){this._uiMessage.remove();}}}
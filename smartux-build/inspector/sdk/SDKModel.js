import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as ProtocolModule from'../protocol/protocol.js';const _registeredModels=new Map();export class SDKModel extends Common.ObjectWrapper.ObjectWrapper{constructor(target){super();this._target=target;}
target(){return this._target;}
preSuspendModel(reason){return Promise.resolve();}
suspendModel(reason){return Promise.resolve();}
resumeModel(){return Promise.resolve();}
postResumeModel(){return Promise.resolve();}
dispose(){}
static register(modelClass,capabilities,autostart){_registeredModels.set(modelClass,{capabilities,autostart});}
static get registeredModels(){return _registeredModels;}}
export class Target extends ProtocolModule.InspectorBackend.TargetBase{constructor(targetManager,id,name,type,parentTarget,sessionId,suspended,connection){const needsNodeJSPatching=type===Type.Node;super(needsNodeJSPatching,parentTarget,sessionId,connection);this._targetManager=targetManager;this._name=name;this._inspectedURL='';this._inspectedURLName='';this._capabilitiesMask=0;switch(type){case Type.Frame:this._capabilitiesMask=Capability.Browser|Capability.Storage|Capability.DOM|Capability.JS|Capability.Log|Capability.Network|Capability.Target|Capability.Tracing|Capability.Emulation|Capability.Input|Capability.Inspector;if(!parentTarget){this._capabilitiesMask|=Capability.DeviceEmulation|Capability.ScreenCapture|Capability.Security|Capability.ServiceWorker;}
break;case Type.ServiceWorker:this._capabilitiesMask=Capability.JS|Capability.Log|Capability.Network|Capability.Target|Capability.Inspector;if(!parentTarget){this._capabilitiesMask|=Capability.Browser;}
break;case Type.Worker:this._capabilitiesMask=Capability.JS|Capability.Log|Capability.Network|Capability.Target;break;case Type.Node:this._capabilitiesMask=Capability.JS;break;case Type.Browser:this._capabilitiesMask=Capability.Target;break;}
this._type=type;this._parentTarget=parentTarget;this._id=id;this._modelByConstructor=new Map();this._isSuspended=suspended;}
createModels(required){this._creatingModels=true;this.model(SDK.ResourceTreeModel);const registered=Array.from(SDKModel.registeredModels.keys());for(const modelClass of registered){const info=SDKModel.registeredModels.get(modelClass);if(info.autostart||required.has(modelClass)){this.model(modelClass);}}
this._creatingModels=false;}
id(){return this._id;}
name(){return this._name||this._inspectedURLName;}
type(){return this._type;}
markAsNodeJSForTest(){super.markAsNodeJSForTest();this._type=Type.Node;}
targetManager(){return this._targetManager;}
hasAllCapabilities(capabilitiesMask){return(this._capabilitiesMask&capabilitiesMask)===capabilitiesMask;}
decorateLabel(label){return(this._type===Type.Worker||this._type===Type.ServiceWorker)?'\u2699 '+label:label;}
parentTarget(){return this._parentTarget;}
dispose(reason){super.dispose(reason);this._targetManager.removeTarget(this);for(const model of this._modelByConstructor.values()){model.dispose();}}
model(modelClass){if(!this._modelByConstructor.get(modelClass)){const info=SDKModel.registeredModels.get(modelClass);if(info===undefined){throw'Model class is not registered @'+new Error().stack;}
if((this._capabilitiesMask&info.capabilities)===info.capabilities){const model=new modelClass(this);this._modelByConstructor.set(modelClass,model);if(!this._creatingModels){this._targetManager.modelAdded(this,modelClass,model);}}}
return this._modelByConstructor.get(modelClass)||null;}
models(){return this._modelByConstructor;}
inspectedURL(){return this._inspectedURL;}
setInspectedURL(inspectedURL){this._inspectedURL=inspectedURL;const parsedURL=Common.ParsedURL.ParsedURL.fromString(inspectedURL);this._inspectedURLName=parsedURL?parsedURL.lastPathComponentWithFragment():'#'+this._id;if(!this.parentTarget()){Host.InspectorFrontendHost.InspectorFrontendHostInstance.inspectedURLChanged(inspectedURL||'');}
this._targetManager.dispatchEventToListeners(Events.InspectedURLChanged,this);if(!this._name){this._targetManager.dispatchEventToListeners(Events.NameChanged,this);}}
async suspend(reason){if(this._isSuspended){return Promise.resolve();}
this._isSuspended=true;await Promise.all(Array.from(this.models().values(),m=>m.preSuspendModel(reason)));await Promise.all(Array.from(this.models().values(),m=>m.suspendModel(reason)));}
async resume(){if(!this._isSuspended){return Promise.resolve();}
this._isSuspended=false;await Promise.all(Array.from(this.models().values(),m=>m.resumeModel()));await Promise.all(Array.from(this.models().values(),m=>m.postResumeModel()));}
suspended(){return this._isSuspended;}}
export const Capability={Browser:1<<0,DOM:1<<1,JS:1<<2,Log:1<<3,Network:1<<4,Target:1<<5,ScreenCapture:1<<6,Tracing:1<<7,Emulation:1<<8,Security:1<<9,Input:1<<10,Inspector:1<<11,DeviceEmulation:1<<12,Storage:1<<13,ServiceWorker:1<<14,None:0,};export const Type={Frame:'frame',ServiceWorker:'service-worker',Worker:'worker',Node:'node',Browser:'browser',};export class TargetManager extends Common.ObjectWrapper.ObjectWrapper{constructor(){super();this._targets=new Set();this._observers=new Set();this._modelListeners=new Platform.Multimap();this._modelObservers=new Platform.Multimap();this._isSuspended=false;}
suspendAllTargets(reason){if(this._isSuspended){return Promise.resolve();}
this._isSuspended=true;this.dispatchEventToListeners(Events.SuspendStateChanged);const suspendPromises=Array.from(this._targets.values(),target=>target.suspend(reason));return Promise.all(suspendPromises);}
resumeAllTargets(){if(!this._isSuspended){return Promise.resolve();}
this._isSuspended=false;this.dispatchEventToListeners(Events.SuspendStateChanged);const resumePromises=Array.from(this._targets.values(),target=>target.resume());return Promise.all(resumePromises);}
allTargetsSuspended(){return this._isSuspended;}
models(modelClass){const result=[];for(const target of this._targets){const model=target.model(modelClass);if(model){result.push(model);}}
return result;}
inspectedURL(){const mainTarget=this.mainTarget();return mainTarget?mainTarget.inspectedURL():'';}
observeModels(modelClass,observer){const models=this.models(modelClass);this._modelObservers.set(modelClass,observer);for(const model of models){observer.modelAdded(model);}}
unobserveModels(modelClass,observer){this._modelObservers.delete(modelClass,observer);}
modelAdded(target,modelClass,model){for(const observer of this._modelObservers.get(modelClass).values()){observer.modelAdded(model);}}
_modelRemoved(target,modelClass,model){for(const observer of this._modelObservers.get(modelClass).values()){observer.modelRemoved(model);}}
addModelListener(modelClass,eventType,listener,thisObject){for(const model of this.models(modelClass)){model.addEventListener(eventType,listener,thisObject);}
this._modelListeners.set(eventType,{modelClass:modelClass,thisObject:thisObject,listener:listener});}
removeModelListener(modelClass,eventType,listener,thisObject){if(!this._modelListeners.has(eventType)){return;}
for(const model of this.models(modelClass)){model.removeEventListener(eventType,listener,thisObject);}
for(const info of this._modelListeners.get(eventType)){if(info.modelClass===modelClass&&info.listener===listener&&info.thisObject===thisObject){this._modelListeners.delete(eventType,info);}}}
observeTargets(targetObserver){if(this._observers.has(targetObserver)){throw new Error('Observer can only be registered once');}
for(const target of this._targets){targetObserver.targetAdded(target);}
this._observers.add(targetObserver);}
unobserveTargets(targetObserver){this._observers.delete(targetObserver);}
createTarget(id,name,type,parentTarget,sessionId,waitForDebuggerInPage,connection){const target=new Target(this,id,name,type,parentTarget,sessionId||'',this._isSuspended,connection||null);if(waitForDebuggerInPage){target.pageAgent().waitForDebugger();}
target.createModels(new Set(this._modelObservers.keysArray()));this._targets.add(target);for(const observer of[...this._observers]){observer.targetAdded(target);}
for(const modelClass of target.models().keys()){this.modelAdded(target,modelClass,target.models().get(modelClass));}
for(const key of this._modelListeners.keysArray()){for(const info of this._modelListeners.get(key)){const model=target.model(info.modelClass);if(model){model.addEventListener(key,info.listener,info.thisObject);}}}
return target;}
removeTarget(target){if(!this._targets.has(target)){return;}
this._targets.delete(target);for(const modelClass of target.models().keys()){this._modelRemoved(target,modelClass,target.models().get(modelClass));}
for(const observer of[...this._observers]){observer.targetRemoved(target);}
for(const key of this._modelListeners.keysArray()){for(const info of this._modelListeners.get(key)){const model=target.model(info.modelClass);if(model){model.removeEventListener(key,info.listener,info.thisObject);}}}}
targets(){return[...this._targets];}
targetById(id){return this.targets().find(target=>target.id()===id)||null;}
mainTarget(){return this._targets.size?this._targets.values().next().value:null;}}
export const Events={AvailableTargetsChanged:Symbol('AvailableTargetsChanged'),InspectedURLChanged:Symbol('InspectedURLChanged'),NameChanged:Symbol('NameChanged'),SuspendStateChanged:Symbol('SuspendStateChanged')};export class Observer{targetAdded(target){}
targetRemoved(target){}}
export class SDKModelObserver{modelAdded(model){}
modelRemoved(model){}}
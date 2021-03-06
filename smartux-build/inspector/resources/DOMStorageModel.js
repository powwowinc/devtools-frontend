import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';export class DOMStorage extends Common.ObjectWrapper.ObjectWrapper{constructor(model,securityOrigin,isLocalStorage){super();this._model=model;this._securityOrigin=securityOrigin;this._isLocalStorage=isLocalStorage;}
static storageId(securityOrigin,isLocalStorage){return{securityOrigin:securityOrigin,isLocalStorage:isLocalStorage};}
get id(){return DOMStorage.storageId(this._securityOrigin,this._isLocalStorage);}
get securityOrigin(){return this._securityOrigin;}
get isLocalStorage(){return this._isLocalStorage;}
getItems(){return this._model._agent.getDOMStorageItems(this.id);}
setItem(key,value){this._model._agent.setDOMStorageItem(this.id,key,value);}
removeItem(key){this._model._agent.removeDOMStorageItem(this.id,key);}
clear(){this._model._agent.clear(this.id);}}
DOMStorage.Events={DOMStorageItemsCleared:Symbol('DOMStorageItemsCleared'),DOMStorageItemRemoved:Symbol('DOMStorageItemRemoved'),DOMStorageItemAdded:Symbol('DOMStorageItemAdded'),DOMStorageItemUpdated:Symbol('DOMStorageItemUpdated')};export class DOMStorageModel extends SDK.SDKModel.SDKModel{constructor(target){super(target);this._securityOriginManager=target.model(SDK.SecurityOriginManager.SecurityOriginManager);this._storages={};this._agent=target.domstorageAgent();}
enable(){if(this._enabled){return;}
this.target().registerDOMStorageDispatcher(new DOMStorageDispatcher(this));this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginAdded,this._securityOriginAdded,this);this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginRemoved,this._securityOriginRemoved,this);for(const securityOrigin of this._securityOriginManager.securityOrigins()){this._addOrigin(securityOrigin);}
this._agent.enable();this._enabled=true;}
clearForOrigin(origin){if(!this._enabled){return;}
for(const isLocal of[true,false]){const key=this._storageKey(origin,isLocal);const storage=this._storages[key];storage.clear();}
this._removeOrigin(origin);this._addOrigin(origin);}
_securityOriginAdded(event){this._addOrigin((event.data));}
_addOrigin(securityOrigin){const parsed=new Common.ParsedURL.ParsedURL(securityOrigin);if(!parsed.isValid||parsed.scheme==='data'||parsed.scheme==='about'||parsed.scheme==='javascript'){return;}
for(const isLocal of[true,false]){const key=this._storageKey(securityOrigin,isLocal);console.assert(!this._storages[key]);const storage=new DOMStorage(this,securityOrigin,isLocal);this._storages[key]=storage;this.dispatchEventToListeners(Events.DOMStorageAdded,storage);}}
_securityOriginRemoved(event){this._removeOrigin((event.data));}
_removeOrigin(securityOrigin){for(const isLocal of[true,false]){const key=this._storageKey(securityOrigin,isLocal);const storage=this._storages[key];if(!storage){continue;}
delete this._storages[key];this.dispatchEventToListeners(Events.DOMStorageRemoved,storage);}}
_storageKey(securityOrigin,isLocalStorage){return JSON.stringify(DOMStorage.storageId(securityOrigin,isLocalStorage));}
_domStorageItemsCleared(storageId){const domStorage=this.storageForId(storageId);if(!domStorage){return;}
const eventData={};domStorage.dispatchEventToListeners(DOMStorage.Events.DOMStorageItemsCleared,eventData);}
_domStorageItemRemoved(storageId,key){const domStorage=this.storageForId(storageId);if(!domStorage){return;}
const eventData={key:key};domStorage.dispatchEventToListeners(DOMStorage.Events.DOMStorageItemRemoved,eventData);}
_domStorageItemAdded(storageId,key,value){const domStorage=this.storageForId(storageId);if(!domStorage){return;}
const eventData={key:key,value:value};domStorage.dispatchEventToListeners(DOMStorage.Events.DOMStorageItemAdded,eventData);}
_domStorageItemUpdated(storageId,key,oldValue,value){const domStorage=this.storageForId(storageId);if(!domStorage){return;}
const eventData={key:key,oldValue:oldValue,value:value};domStorage.dispatchEventToListeners(DOMStorage.Events.DOMStorageItemUpdated,eventData);}
storageForId(storageId){return this._storages[JSON.stringify(storageId)];}
storages(){const result=[];for(const id in this._storages){result.push(this._storages[id]);}
return result;}}
SDK.SDKModel.SDKModel.register(DOMStorageModel,SDK.SDKModel.Capability.DOM,false);export const Events={DOMStorageAdded:Symbol('DOMStorageAdded'),DOMStorageRemoved:Symbol('DOMStorageRemoved')};export class DOMStorageDispatcher{constructor(model){this._model=model;}
domStorageItemsCleared(storageId){this._model._domStorageItemsCleared(storageId);}
domStorageItemRemoved(storageId,key){this._model._domStorageItemRemoved(storageId,key);}
domStorageItemAdded(storageId,key,value){this._model._domStorageItemAdded(storageId,key,value);}
domStorageItemUpdated(storageId,key,oldValue,value){this._model._domStorageItemUpdated(storageId,key,oldValue,value);}}
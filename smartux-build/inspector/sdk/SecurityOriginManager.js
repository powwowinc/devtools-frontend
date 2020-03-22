import{Capability,SDKModel,Target}from'./SDKModel.js';export class SecurityOriginManager extends SDKModel{constructor(target){super(target);this._mainSecurityOrigin='';this._unreachableMainSecurityOrigin='';this._securityOrigins=new Set();}
updateSecurityOrigins(securityOrigins){const oldOrigins=this._securityOrigins;this._securityOrigins=securityOrigins;for(const origin of oldOrigins){if(!this._securityOrigins.has(origin)){this.dispatchEventToListeners(Events.SecurityOriginRemoved,origin);}}
for(const origin of this._securityOrigins){if(!oldOrigins.has(origin)){this.dispatchEventToListeners(Events.SecurityOriginAdded,origin);}}}
securityOrigins(){return[...this._securityOrigins];}
mainSecurityOrigin(){return this._mainSecurityOrigin;}
unreachableMainSecurityOrigin(){return this._unreachableMainSecurityOrigin;}
setMainSecurityOrigin(securityOrigin,unreachableSecurityOrigin){this._mainSecurityOrigin=securityOrigin;this._unreachableMainSecurityOrigin=unreachableSecurityOrigin||null;this.dispatchEventToListeners(Events.MainSecurityOriginChanged,{mainSecurityOrigin:this._mainSecurityOrigin,unreachableMainSecurityOrigin:this._unreachableMainSecurityOrigin});}}
export const Events={SecurityOriginAdded:Symbol('SecurityOriginAdded'),SecurityOriginRemoved:Symbol('SecurityOriginRemoved'),MainSecurityOriginChanged:Symbol('MainSecurityOriginChanged')};SDKModel.register(SecurityOriginManager,Capability.None,false);
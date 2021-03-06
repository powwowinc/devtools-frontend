import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as ProtocolModule from'../protocol/protocol.js';export class MainConnection{constructor(){this._onMessage=null;this._onDisconnect=null;this._messageBuffer='';this._messageSize=0;this._eventListeners=[Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.DispatchMessage,this._dispatchMessage,this),Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.DispatchMessageChunk,this._dispatchMessageChunk,this),];}
setOnMessage(onMessage){this._onMessage=onMessage;}
setOnDisconnect(onDisconnect){this._onDisconnect=onDisconnect;}
sendRawMessage(message){if(this._onMessage){Host.InspectorFrontendHost.InspectorFrontendHostInstance.sendMessageToBackend(message);}}
_dispatchMessage(event){if(this._onMessage){this._onMessage.call(null,(event.data));}}
_dispatchMessageChunk(event){const messageChunk=(event.data['messageChunk']);const messageSize=(event.data['messageSize']);if(messageSize){this._messageBuffer='';this._messageSize=messageSize;}
this._messageBuffer+=messageChunk;if(this._messageBuffer.length===this._messageSize){this._onMessage.call(null,this._messageBuffer);this._messageBuffer='';this._messageSize=0;}}
disconnect(){const onDisconnect=this._onDisconnect;Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);this._onDisconnect=null;this._onMessage=null;if(onDisconnect){onDisconnect.call(null,'force disconnect');}
return Promise.resolve();}}
export class WebSocketConnection{constructor(url,onWebSocketDisconnect,onWebSocketOpen){this._socket=new WebSocket(url);this._socket.onerror=this._onError.bind(this);this._socket.onopen=this._onOpen.bind(this,onWebSocketOpen);this._socket.onmessage=messageEvent=>{if(this._onMessage){this._onMessage.call(null,(messageEvent.data));}
let msgData=JSON.parse(messageEvent.data);if(msgData.method){let eventName='EXPLORER_'+msgData.method;let msgParams={detail:{params:msgData.params}};window.document.dispatchEvent(new CustomEvent(eventName,msgParams));}};this._socket.onclose=this._onClose.bind(this);this._onMessage=null;this._onDisconnect=null;this._onWebSocketDisconnect=onWebSocketDisconnect;this._connected=false;this._messages=[];}
setOnMessage(onMessage){this._onMessage=onMessage;}
setOnDisconnect(onDisconnect){this._onDisconnect=onDisconnect;}
_onError(){this._onWebSocketDisconnect.call(null);this._onDisconnect.call(null,'connection failed');this._close();}
_onOpen(callback){this._socket.onerror=console.error;this._connected=true;for(const message of this._messages){this._socket.send(message);}
this._messages=[];if(callback)callback();}
_onClose(){this._onWebSocketDisconnect.call(null);this._onDisconnect.call(null,'websocket closed');this._close();}
_close(callback){this._socket.onerror=null;this._socket.onopen=null;this._socket.onclose=callback||null;this._socket.onmessage=null;this._socket.close();this._socket=null;this._onWebSocketDisconnect=null;}
sendRawMessage(message){if(this._connected){this._socket.send(message);}else{this._messages.push(message);}}
disconnect(){let fulfill;const promise=new Promise(f=>fulfill=f);this._close(()=>{if(this._onDisconnect){this._onDisconnect.call(null,'force disconnect');}
fulfill();});return promise;}}
export class StubConnection{constructor(){this._onMessage=null;this._onDisconnect=null;}
setOnMessage(onMessage){this._onMessage=onMessage;}
setOnDisconnect(onDisconnect){this._onDisconnect=onDisconnect;}
sendRawMessage(message){setTimeout(this._respondWithError.bind(this,message),0);}
_respondWithError(message){const messageObject=JSON.parse(message);const error={message:'This is a stub connection, can\'t dispatch message.',code:ProtocolModule.InspectorBackend.DevToolsStubErrorCode,data:messageObject};if(this._onMessage){this._onMessage.call(null,{id:messageObject.id,error:error});}}
disconnect(){if(this._onDisconnect){this._onDisconnect.call(null,'force disconnect');}
this._onDisconnect=null;this._onMessage=null;return Promise.resolve();}}
export class ParallelConnection{constructor(connection,sessionId){this._connection=connection;this._sessionId=sessionId;this._onMessage=null;this._onDisconnect=null;}
setOnMessage(onMessage){this._onMessage=onMessage;}
setOnDisconnect(onDisconnect){this._onDisconnect=onDisconnect;}
sendRawMessage(message){const messageObject=JSON.parse(message);if(!messageObject.sessionId){messageObject.sessionId=this._sessionId;}
this._connection.sendRawMessage(JSON.stringify(messageObject));}
disconnect(){if(this._onDisconnect){this._onDisconnect.call(null,'force disconnect');}
this._onDisconnect=null;this._onMessage=null;return Promise.resolve();}}
export async function initMainConnection(createMainTarget,websocketConnectionLost,websocketConnectionOpen){ProtocolModule.InspectorBackend.Connection.setFactory(_createMainConnection.bind(null,websocketConnectionLost,websocketConnectionOpen));await createMainTarget();Host.InspectorFrontendHost.InspectorFrontendHostInstance.connectionReady();Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.ReattachMainTarget,()=>{self.SDK.targetManager.mainTarget().router().connection().disconnect();createMainTarget();});return Promise.resolve();}
export function _createMainConnection(websocketConnectionLost,websocketConnectionOpen){const wsParam=Root.Runtime.queryParam('ws');const wssParam=Root.Runtime.queryParam('wss');if(wsParam||wssParam){const ws=wsParam?`ws://${wsParam}`:`wss://${wssParam}`;return new WebSocketConnection(ws,websocketConnectionLost,websocketConnectionOpen);}
if(Host.InspectorFrontendHost.InspectorFrontendHostInstance.isHostedMode()){return new StubConnection();}
return new MainConnection();}
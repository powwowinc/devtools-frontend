import*as SDK from'../sdk/sdk.js';export class InputModel extends SDK.SDKModel.SDKModel{constructor(target){super(target);this._inputAgent=target.inputAgent();this._activeTouchOffsetTop=null;this._activeTouchParams=null;}
emitKeyEvent(event){let type;switch(event.type){case'keydown':type='keyDown';break;case'keyup':type='keyUp';break;case'keypress':type='char';break;default:return;}
const text=event.type==='keypress'?String.fromCharCode(event.charCode):undefined;this._inputAgent.invoke_dispatchKeyEvent({type:type,modifiers:this._modifiersForEvent(event),text:text,unmodifiedText:text?text.toLowerCase():undefined,keyIdentifier:event.keyIdentifier,code:event.code,key:event.key,windowsVirtualKeyCode:event.keyCode,nativeVirtualKeyCode:event.keyCode,autoRepeat:false,isKeypad:false,isSystemKey:false});}
emitTouchFromMouseEvent(event,offsetTop,zoom){const buttons={0:'none',1:'left',2:'middle',3:'right'};const types={'mousedown':'mousePressed','mouseup':'mouseReleased','mousemove':'mouseMoved','mousewheel':'mouseWheel'};if(!(event.type in types)||!(event.which in buttons)){return;}
if(event.type!=='mousewheel'&&buttons[event.which]==='none'){return;}
if(event.type==='mousedown'||this._activeTouchOffsetTop===null){this._activeTouchOffsetTop=offsetTop;}
const x=Math.round(event.offsetX/zoom);let y=Math.round(event.offsetY/zoom);y=Math.round(y-this._activeTouchOffsetTop);const params={type:types[event.type],x:x,y:y,modifiers:this._modifiersForEvent(event),button:buttons[event.which],clickCount:0,timestamp:Date.now()};if(event.type==='mousewheel'){params.deltaX=event.wheelDeltaX/zoom;params.deltaY=event.wheelDeltaY/zoom;}else{this._activeTouchParams=params;}
if(event.type==='mouseup'){this._activeTouchOffsetTop=null;}
if(event.type==='mousedown')
params.clickCount=1;this._inputAgent.invoke_emulateTouchFromMouseEvent(params);}
cancelTouch(){if(this._activeTouchParams!==null){const params=this._activeTouchParams;this._activeTouchParams=null;params.type='mouseReleased';this._inputAgent.invoke_emulateTouchFromMouseEvent(params);}}
_modifiersForEvent(event){return(event.altKey?1:0)|(event.ctrlKey?2:0)|(event.metaKey?4:0)|(event.shiftKey?8:0);}}
SDK.SDKModel.SDKModel.register(InputModel,SDK.SDKModel.Capability.Input,false);
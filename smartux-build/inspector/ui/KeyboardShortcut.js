import*as Host from'../host/host.js';export class KeyboardShortcut{static makeKey(keyCode,modifiers){if(typeof keyCode==='string'){keyCode=keyCode.charCodeAt(0)-(/^[a-z]/.test(keyCode)?32:0);}
modifiers=modifiers||Modifiers.None;return KeyboardShortcut._makeKeyFromCodeAndModifiers(keyCode,modifiers);}
static makeKeyFromEvent(keyboardEvent){let modifiers=Modifiers.None;if(keyboardEvent.shiftKey){modifiers|=Modifiers.Shift;}
if(keyboardEvent.ctrlKey){modifiers|=Modifiers.Ctrl;}
if(keyboardEvent.altKey){modifiers|=Modifiers.Alt;}
if(keyboardEvent.metaKey){modifiers|=Modifiers.Meta;}
const keyCode=keyboardEvent.keyCode||keyboardEvent['__keyCode'];return KeyboardShortcut._makeKeyFromCodeAndModifiers(keyCode,modifiers);}
static makeKeyFromEventIgnoringModifiers(keyboardEvent){const keyCode=keyboardEvent.keyCode||keyboardEvent['__keyCode'];return KeyboardShortcut._makeKeyFromCodeAndModifiers(keyCode,Modifiers.None);}
static eventHasCtrlOrMeta(event){return Host.Platform.isMac()?event.metaKey&&!event.ctrlKey:event.ctrlKey&&!event.metaKey;}
static hasNoModifiers(event){return!event.ctrlKey&&!event.shiftKey&&!event.altKey&&!event.metaKey;}
static makeDescriptor(key,modifiers){return{key:KeyboardShortcut.makeKey(typeof key==='string'?key:key.code,modifiers),name:KeyboardShortcut.shortcutToString(key,modifiers)};}
static makeDescriptorFromBindingShortcut(shortcut){const parts=shortcut.split(/\+(?!$)/);let modifiers=0;let keyString;for(let i=0;i<parts.length;++i){if(typeof Modifiers[parts[i]]!=='undefined'){modifiers|=Modifiers[parts[i]];continue;}
console.assert(i===parts.length-1,'Only one key other than modifier is allowed in shortcut <'+shortcut+'>');keyString=parts[i];break;}
console.assert(keyString,'Modifiers-only shortcuts are not allowed (encountered <'+shortcut+'>)');if(!keyString){return null;}
const key=Keys[keyString]||KeyBindings[keyString];if(key&&key.shiftKey){modifiers|=Modifiers.Shift;}
return KeyboardShortcut.makeDescriptor(key?key:keyString,modifiers);}
static shortcutToString(key,modifiers){return KeyboardShortcut._modifiersToString(modifiers)+KeyboardShortcut._keyName(key);}
static _keyName(key){if(typeof key==='string'){return key.toUpperCase();}
if(typeof key.name==='string'){return key.name;}
return key.name[Host.Platform.platform()]||key.name.other||'';}
static _makeKeyFromCodeAndModifiers(keyCode,modifiers){return(keyCode&255)|(modifiers<<8);}
static keyCodeAndModifiersFromKey(key){return{keyCode:key&255,modifiers:key>>8};}
static _modifiersToString(modifiers){const isMac=Host.Platform.isMac();const m=Modifiers;const modifierNames=new Map([[m.Ctrl,isMac?'Ctrl\u2004':'Ctrl\u200A+\u200A'],[m.Alt,isMac?'\u2325\u2004':'Alt\u200A+\u200A'],[m.Shift,isMac?'\u21e7\u2004':'Shift\u200A+\u200A'],[m.Meta,isMac?'\u2318\u2004':'Win\u200A+\u200A']]);return[m.Meta,m.Ctrl,m.Alt,m.Shift].map(mapModifiers).join('');function mapModifiers(m){return modifiers&m?(modifierNames.get(m)):'';}}}
export const Modifiers={None:0,Shift:1,Ctrl:2,Alt:4,Meta:8,get CtrlOrMeta(){return Host.Platform.isMac()?this.Meta:this.Ctrl;},get ShiftOrOption(){return Host.Platform.isMac()?this.Alt:this.Shift;}};export const Keys={Backspace:{code:8,name:'\u21a4'},Tab:{code:9,name:{mac:'\u21e5',other:'Tab'}},Enter:{code:13,name:{mac:'\u21a9',other:'Enter'}},Shift:{code:16,name:{mac:'\u21e7',other:'Shift'}},Ctrl:{code:17,name:'Ctrl'},Esc:{code:27,name:'Esc'},Space:{code:32,name:'Space'},PageUp:{code:33,name:{mac:'\u21de',other:'PageUp'}},PageDown:{code:34,name:{mac:'\u21df',other:'PageDown'}},End:{code:35,name:{mac:'\u2197',other:'End'}},Home:{code:36,name:{mac:'\u2196',other:'Home'}},Left:{code:37,name:'\u2190'},Up:{code:38,name:'\u2191'},Right:{code:39,name:'\u2192'},Down:{code:40,name:'\u2193'},Delete:{code:46,name:'Del'},Zero:{code:48,name:'0'},H:{code:72,name:'H'},N:{code:78,name:'N'},P:{code:80,name:'P'},Meta:{code:91,name:'Meta'},F1:{code:112,name:'F1'},F2:{code:113,name:'F2'},F3:{code:114,name:'F3'},F4:{code:115,name:'F4'},F5:{code:116,name:'F5'},F6:{code:117,name:'F6'},F7:{code:118,name:'F7'},F8:{code:119,name:'F8'},F9:{code:120,name:'F9'},F10:{code:121,name:'F10'},F11:{code:122,name:'F11'},F12:{code:123,name:'F12'},Semicolon:{code:186,name:';'},NumpadPlus:{code:107,name:'Numpad +'},NumpadMinus:{code:109,name:'Numpad -'},Numpad0:{code:96,name:'Numpad 0'},Plus:{code:187,name:'+'},Comma:{code:188,name:','},Minus:{code:189,name:'-'},Period:{code:190,name:'.'},Slash:{code:191,name:'/'},QuestionMark:{code:191,name:'?'},Apostrophe:{code:192,name:'`'},Tilde:{code:192,name:'Tilde'},LeftSquareBracket:{code:219,name:'['},RightSquareBracket:{code:221,name:']'},Backslash:{code:220,name:'\\'},SingleQuote:{code:222,name:'\''},get CtrlOrMeta(){return Host.Platform.isMac()?this.Meta:this.Ctrl;},};export const KeyBindings={};(function(){for(const key in Keys){const descriptor=Keys[key];if(typeof descriptor==='object'&&descriptor['code']){const name=typeof descriptor['name']==='string'?descriptor['name']:key;KeyBindings[name]=descriptor;}}})();export let Key;export let Descriptor;
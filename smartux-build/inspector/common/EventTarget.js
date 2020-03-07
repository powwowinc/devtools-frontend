export let EventDescriptor;export function removeEventListeners(eventList){for(const eventInfo of eventList){eventInfo.eventTarget.removeEventListener(eventInfo.eventType,eventInfo.listener,eventInfo.thisObject);}
eventList.splice(0);}
export class EventTarget{addEventListener(eventType,listener,thisObject){throw new Error('not implemented');}
once(eventType){throw new Error('not implemented');}
removeEventListener(eventType,listener,thisObject){throw new Error('not implemented');}
hasEventListeners(eventType){throw new Error('not implemented');}
dispatchEventToListeners(eventType,eventData){}}
EventTarget.removeEventListeners=removeEventListeners;export function fireEvent(name,detail={},target=window){const evt=new CustomEvent(name,{bubbles:true,cancelable:true,detail});target.dispatchEvent(evt);}
export let EventTargetEvent;
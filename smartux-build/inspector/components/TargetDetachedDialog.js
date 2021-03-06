import*as UI from'../ui/ui.js';export class TargetDetachedDialog extends SDK.SDKModel{constructor(target){super(target);if(target.parentTarget()){return;}
target.registerInspectorDispatcher(this);target.inspectorAgent().enable();this._hideCrashedDialog=null;TargetDetachedDialog._disconnectedScreenWithReasonWasShown=false;}
detached(reason){console.log("DevTools: Target was detached, reason =",reason);}
static webSocketConnectionLost(){console.log("DevTools: Target was detached - WebSocket disconnected");}
targetCrashed(){const dialog=new UI.Dialog.Dialog();dialog.setSizeBehavior(UI.GlassPane.SizeBehavior.MeasureContent);dialog.addCloseButton();dialog.setDimmed(true);this._hideCrashedDialog=dialog.hide.bind(dialog);new UI.TargetCrashedScreen.TargetCrashedScreen(()=>this._hideCrashedDialog=null).show(dialog.contentElement);dialog.show();}
targetReloadedAfterCrash(){this.target().runtimeAgent().runIfWaitingForDebugger();if(this._hideCrashedDialog){this._hideCrashedDialog.call(null);this._hideCrashedDialog=null;}}}
SDK.SDKModel.register(TargetDetachedDialog,SDK.Target.Capability.Inspector,true);
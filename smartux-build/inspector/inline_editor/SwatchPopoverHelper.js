import*as Common from'../common/common.js';import*as UI from'../ui/ui.js';export class SwatchPopoverHelper extends Common.ObjectWrapper.ObjectWrapper{constructor(){super();this._popover=new UI.GlassPane.GlassPane();this._popover.registerRequiredCSS('inline_editor/swatchPopover.css');this._popover.setSizeBehavior(UI.GlassPane.SizeBehavior.MeasureContent);this._popover.setMarginBehavior(UI.GlassPane.MarginBehavior.Arrow);this._popover.element.addEventListener('mousedown',e=>e.consume(),false);this._hideProxy=this.hide.bind(this,true);this._boundOnKeyDown=this._onKeyDown.bind(this);this._boundFocusOut=this._onFocusOut.bind(this);this._isHidden=true;}
_onFocusOut(event){if(!event.relatedTarget||event.relatedTarget.isSelfOrDescendant(this._view.contentElement)){return;}
this._hideProxy();}
isShowing(){return this._popover.isShowing();}
show(view,anchorElement,hiddenCallback){if(this._popover.isShowing()){if(this._anchorElement===anchorElement){return;}
this.hide(true);}
delete this._isHidden;this._anchorElement=anchorElement;this._view=view;this._hiddenCallback=hiddenCallback;this.reposition();view.focus();const document=this._popover.element.ownerDocument;document.addEventListener('mousedown',this._hideProxy,false);document.defaultView.addEventListener('resize',this._hideProxy,false);this._view.contentElement.addEventListener('keydown',this._boundOnKeyDown,false);}
reposition(){this._view.contentElement.removeEventListener('focusout',this._boundFocusOut,false);this._view.show(this._popover.contentElement);this._popover.setContentAnchorBox(this._anchorElement.boxInWindow());this._popover.show(this._anchorElement.ownerDocument);this._view.contentElement.addEventListener('focusout',this._boundFocusOut,false);if(!this._focusRestorer){this._focusRestorer=new UI.Widget.WidgetFocusRestorer(this._view);}}
hide(commitEdit){if(this._isHidden){return;}
const document=this._popover.element.ownerDocument;this._isHidden=true;this._popover.hide();document.removeEventListener('mousedown',this._hideProxy,false);document.defaultView.removeEventListener('resize',this._hideProxy,false);if(this._hiddenCallback){this._hiddenCallback.call(null,!!commitEdit);}
this._focusRestorer.restore();delete this._anchorElement;if(this._view){this._view.detach();this._view.contentElement.removeEventListener('keydown',this._boundOnKeyDown,false);this._view.contentElement.removeEventListener('focusout',this._boundFocusOut,false);delete this._view;}}
_onKeyDown(event){if(event.key==='Enter'){this.hide(true);event.consume(true);return;}
if(event.key==='Escape'){this.hide(false);event.consume(true);}}}
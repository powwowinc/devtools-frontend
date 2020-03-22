import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as Platform from'../platform/platform.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ContrastDetails,Events as ContrastDetailsEvents}from'./ContrastDetails.js';import{ContrastInfo}from'./ContrastInfo.js';import{ContrastOverlay}from'./ContrastOverlay.js';export class Spectrum extends UI.Widget.VBox{constructor(contrastInfo){function appendSwitcherIcon(parentElement){const icon=parentElement.createSVGChild('svg');icon.setAttribute('height',16);icon.setAttribute('width',16);const path=icon.createSVGChild('path');path.setAttribute('d','M5,6 L11,6 L8,2 Z M5,10 L11,10 L8,14 Z');return icon;}
super(true);this.registerRequiredCSS('color_picker/spectrum.css');this._colorElement=this.contentElement.createChild('div','spectrum-color');this._colorElement.tabIndex=0;this.setDefaultFocusedElement(this._colorElement);this._colorElement.addEventListener('keydown',this._onSliderKeydown.bind(this,positionColor.bind(this)));const swatchAriaText=ls`Press arrow keys with or without modifiers to move swatch position. Arrow key with Shift key moves position largely, with Ctrl key it is less and with Alt key it is even less`;UI.ARIAUtils.setAccessibleName(this._colorElement,swatchAriaText);UI.ARIAUtils.markAsApplication(this._colorElement);this._colorDragElement=this._colorElement.createChild('div','spectrum-sat fill').createChild('div','spectrum-val fill').createChild('div','spectrum-dragger');this._dragX=0;this._dragY=0;const toolsContainer=this.contentElement.createChild('div','spectrum-tools');const toolbar=new UI.Toolbar.Toolbar('spectrum-eye-dropper',toolsContainer);this._colorPickerButton=new UI.Toolbar.ToolbarToggle(Common.UIString.UIString('Toggle color picker'),'largeicon-eyedropper');this._colorPickerButton.setToggled(true);this._colorPickerButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._toggleColorPicker.bind(this,undefined));toolbar.appendToolbarItem(this._colorPickerButton);this._swatch=new Swatch(toolsContainer);this._hueElement=toolsContainer.createChild('div','spectrum-hue');this._hueElement.tabIndex=0;this._hueElement.addEventListener('keydown',this._onSliderKeydown.bind(this,positionHue.bind(this)));UI.ARIAUtils.setAccessibleName(this._hueElement,ls`Change hue`);UI.ARIAUtils.markAsSlider(this._hueElement,0,360);this._hueSlider=this._hueElement.createChild('div','spectrum-slider');this._alphaElement=toolsContainer.createChild('div','spectrum-alpha');this._alphaElement.tabIndex=0;this._alphaElement.addEventListener('keydown',this._onSliderKeydown.bind(this,positionAlpha.bind(this)));UI.ARIAUtils.setAccessibleName(this._alphaElement,ls`Change alpha`);UI.ARIAUtils.markAsSlider(this._alphaElement,0,1);this._alphaElementBackground=this._alphaElement.createChild('div','spectrum-alpha-background');this._alphaSlider=this._alphaElement.createChild('div','spectrum-slider');this._displayContainer=toolsContainer.createChild('div','spectrum-text source-code');UI.ARIAUtils.markAsPoliteLiveRegion(this._displayContainer,true);this._textValues=[];for(let i=0;i<4;++i){const inputValue=UI.UIUtils.createInput('spectrum-text-value');this._displayContainer.appendChild(inputValue);inputValue.maxLength=4;this._textValues.push(inputValue);inputValue.addEventListener('keydown',this._inputChanged.bind(this),false);inputValue.addEventListener('input',this._inputChanged.bind(this),false);inputValue.addEventListener('mousewheel',this._inputChanged.bind(this),false);}
this._textLabels=this._displayContainer.createChild('div','spectrum-text-label');this._hexContainer=toolsContainer.createChild('div','spectrum-text spectrum-text-hex source-code');UI.ARIAUtils.markAsPoliteLiveRegion(this._hexContainer,true);this._hexValue=UI.UIUtils.createInput('spectrum-text-value');this._hexContainer.appendChild(this._hexValue);this._hexValue.maxLength=9;this._hexValue.addEventListener('keydown',this._inputChanged.bind(this),false);this._hexValue.addEventListener('input',this._inputChanged.bind(this),false);this._hexValue.addEventListener('mousewheel',this._inputChanged.bind(this),false);const label=this._hexContainer.createChild('div','spectrum-text-label');label.textContent=ls`HEX`;UI.ARIAUtils.setAccessibleName(this._hexValue,label.textContent);const displaySwitcher=toolsContainer.createChild('div','spectrum-display-switcher spectrum-switcher');appendSwitcherIcon(displaySwitcher);displaySwitcher.tabIndex=0;self.onInvokeElement(displaySwitcher,event=>{this._formatViewSwitch();event.consume(true);});UI.ARIAUtils.setAccessibleName(displaySwitcher,ls`Change color format`);UI.ARIAUtils.markAsButton(displaySwitcher);UI.UIUtils.installDragHandle(this._hueElement,dragStart.bind(this,positionHue.bind(this)),positionHue.bind(this),null,'pointer','default');UI.UIUtils.installDragHandle(this._alphaElement,dragStart.bind(this,positionAlpha.bind(this)),positionAlpha.bind(this),null,'pointer','default');UI.UIUtils.installDragHandle(this._colorElement,dragStart.bind(this,positionColor.bind(this)),positionColor.bind(this),null,'pointer','default');if(contrastInfo){this._contrastInfo=contrastInfo;this._contrastOverlay=new ContrastOverlay(this._contrastInfo,this._colorElement);this._contrastDetails=new ContrastDetails(this._contrastInfo,this.contentElement,this._toggleColorPicker.bind(this),this._contrastPanelExpanded.bind(this));this._contrastDetailsBackgroundColorPickedToggledBound=this._contrastDetailsBackgroundColorPickedToggled.bind(this);}
this.element.classList.add('flex-none');this._palettes=new Map();this._palettePanel=this.contentElement.createChild('div','palette-panel');this._palettePanelShowing=false;this._paletteSectionContainer=this.contentElement.createChild('div','spectrum-palette-container');this._paletteContainer=this._paletteSectionContainer.createChild('div','spectrum-palette');this._paletteContainer.addEventListener('contextmenu',this._showPaletteColorContextMenu.bind(this,-1));this._shadesContainer=this.contentElement.createChild('div','palette-color-shades hidden');UI.UIUtils.installDragHandle(this._paletteContainer,this._paletteDragStart.bind(this),this._paletteDrag.bind(this),this._paletteDragEnd.bind(this),'default');const paletteSwitcher=this._paletteSectionContainer.createChild('div','spectrum-palette-switcher spectrum-switcher');appendSwitcherIcon(paletteSwitcher);UI.ARIAUtils.markAsButton(paletteSwitcher);UI.ARIAUtils.setAccessibleName(paletteSwitcher,ls`Preview palettes`);paletteSwitcher.tabIndex=0;self.onInvokeElement(paletteSwitcher,event=>{this._togglePalettePanel(true);event.consume(true);});this._deleteIconToolbar=new UI.Toolbar.Toolbar('delete-color-toolbar');this._deleteButton=new UI.Toolbar.ToolbarButton('','largeicon-trash-bin');this._deleteIconToolbar.appendToolbarItem(this._deleteButton);const overlay=this.contentElement.createChild('div','spectrum-overlay fill');overlay.addEventListener('click',this._togglePalettePanel.bind(this,false));this._addColorToolbar=new UI.Toolbar.Toolbar('add-color-toolbar');const addColorButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Add to palette'),'largeicon-add');addColorButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._onAddColorMousedown.bind(this));addColorButton.element.addEventListener('keydown',this._onAddColorKeydown.bind(this));this._addColorToolbar.appendToolbarItem(addColorButton);this._colorPickedBound=this._colorPicked.bind(this);this._loadPalettes();new PaletteGenerator(palette=>{if(palette.colors.length){this.addPalette(palette);}else if(this._selectedColorPalette.get()===palette.title){this._paletteSelected(MaterialPalette);}});function dragStart(callback,event){this._colorOffset=this._colorElement.totalOffset();callback(event);return true;}
function getUpdatedSliderPosition(element,event){const elementPosition=element.getBoundingClientRect();switch(event.key){case'ArrowLeft':case'ArrowDown':return elementPosition.left-1;case'ArrowRight':case'ArrowUp':return elementPosition.right+1;default:return event.x;}}
function positionHue(event){const hsva=this._hsv.slice();const sliderPosition=getUpdatedSliderPosition(this._hueSlider,event);const hueAlphaLeft=this._hueElement.getBoundingClientRect().left;const positionFraction=(sliderPosition-hueAlphaLeft)/this._hueAlphaWidth;const newHue=1-positionFraction;hsva[0]=Number.constrain(newHue,0,1);this._innerSetColor(hsva,'',undefined,undefined,ChangeSource.Other);const colorValues=this._color().canonicalHSLA();UI.ARIAUtils.setValueNow(this._hueElement,colorValues[0]);}
function positionAlpha(event){const hsva=this._hsv.slice();const sliderPosition=getUpdatedSliderPosition(this._alphaSlider,event);const hueAlphaLeft=this._hueElement.getBoundingClientRect().left;const positionFraction=(sliderPosition-hueAlphaLeft)/this._hueAlphaWidth;const newAlpha=Math.round(positionFraction*100)/100;hsva[3]=Number.constrain(newAlpha,0,1);this._innerSetColor(hsva,'',undefined,undefined,ChangeSource.Other);const colorValues=this._color().canonicalHSLA();UI.ARIAUtils.setValueText(this._alphaElement,colorValues[3]);}
function positionColor(event){const hsva=this._hsv.slice();const colorPosition=getUpdatedColorPosition(this._colorDragElement,event);this._colorOffset=this._colorElement.totalOffset();hsva[1]=Number.constrain((colorPosition.x-this._colorOffset.left)/this.dragWidth,0,1);hsva[2]=Number.constrain(1-(colorPosition.y-this._colorOffset.top)/this.dragHeight,0,1);this._innerSetColor(hsva,'',undefined,undefined,ChangeSource.Other);}
function getUpdatedColorPosition(dragElement,event){const elementPosition=dragElement.getBoundingClientRect();const verticalX=elementPosition.x+elementPosition.width/2;const horizontalY=elementPosition.y+elementPosition.width/2;const defaultUnit=elementPosition.width/4;const unit=getUnitToMove(defaultUnit,event);switch(event.key){case'ArrowLeft':return{x:elementPosition.left-unit,y:horizontalY};case'ArrowRight':return{x:elementPosition.right+unit,y:horizontalY};case'ArrowDown':return{x:verticalX,y:elementPosition.bottom+unit};case'ArrowUp':return{x:verticalX,y:elementPosition.top-unit};default:return{x:event.x,y:event.y};}}
function getUnitToMove(unit,event){if(event.altKey){unit=1;}else if(event.ctrlKey){unit=10;}else if(event.shiftKey){unit=20;}
return unit;}}
_contrastDetailsBackgroundColorPickedToggled({data:enabled}){if(enabled){this._toggleColorPicker(false);}}
_contrastPanelExpanded(){this._contrastOverlay.setVisible(this._contrastDetails.expanded());this._resizeForSelectedPalette(true);}
_updatePalettePanel(){this._palettePanel.removeChildren();const title=this._palettePanel.createChild('div','palette-title');title.textContent=Common.UIString.UIString('Color Palettes');const toolbar=new UI.Toolbar.Toolbar('',this._palettePanel);this._closeButton=new UI.Toolbar.ToolbarButton(ls`Return to color picker`,'largeicon-delete');this._closeButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._togglePalettePanel.bind(this,false));this._closeButton.element.addEventListener('keydown',this._onCloseBtnKeydown.bind(this));toolbar.appendToolbarItem(this._closeButton);for(const palette of this._palettes.values()){this._palettePanel.appendChild(this._createPreviewPaletteElement(palette));}}
_togglePalettePanel(show){if(this._palettePanelShowing===show){return;}
if(show){this._updatePalettePanel();}
this._palettePanelShowing=show;this.contentElement.classList.toggle('palette-panel-showing',show);this._focus();}
_onCloseBtnKeydown(event){if(isEscKey(event)||isEnterOrSpaceKey(event)){this._togglePalettePanel(false);event.consume(true);}}
_onSliderKeydown(sliderNewPosition,event){switch(event.key){case'ArrowLeft':case'ArrowRight':case'ArrowDown':case'ArrowUp':sliderNewPosition(event);event.consume(true);}}
_focus(){if(!this.isShowing()){return;}
if(this._palettePanelShowing){this._closeButton.element.focus({preventScroll:true});}else{this.contentElement.focus();}}
_createPaletteColor(colorText,colorName,animationDelay){const element=createElementWithClass('div','spectrum-palette-color');element.style.background=Platform.StringUtilities.sprintf('linear-gradient(%s, %s), url(Images/checker.png)',colorText,colorText);if(animationDelay){element.animate([{opacity:0},{opacity:1}],{duration:100,delay:animationDelay,fill:'backwards'});}
element.title=colorName||colorText;return element;}
_showPalette(palette,animate,event){this._resizeForSelectedPalette();this._paletteContainer.removeChildren();for(let i=0;i<palette.colors.length;i++){const animationDelay=animate?i*100/palette.colors.length:0;const colorElement=this._createPaletteColor(palette.colors[i],palette.colorNames[i],animationDelay);UI.ARIAUtils.markAsButton(colorElement);UI.ARIAUtils.setAccessibleName(colorElement,ls`Color ${palette.colors[i]}`);colorElement.tabIndex=-1;colorElement.addEventListener('mousedown',this._paletteColorSelected.bind(this,palette.colors[i],palette.colorNames[i],palette.matchUserFormat));colorElement.addEventListener('focus',this._paletteColorSelected.bind(this,palette.colors[i],palette.colorNames[i],palette.matchUserFormat));colorElement.addEventListener('keydown',this._onPaletteColorKeydown.bind(this,i));if(palette.mutable){colorElement.__mutable=true;colorElement.__color=palette.colors[i];colorElement.addEventListener('contextmenu',this._showPaletteColorContextMenu.bind(this,i));}else if(palette===MaterialPalette){colorElement.classList.add('has-material-shades');let shadow=colorElement.createChild('div','spectrum-palette-color spectrum-palette-color-shadow');shadow.style.background=palette.colors[i];shadow=colorElement.createChild('div','spectrum-palette-color spectrum-palette-color-shadow');shadow.style.background=palette.colors[i];colorElement.title=ls`Long-click or long-press space to show alternate shades of ${palette.colors[i]}`;UI.ARIAUtils.setAccessibleName(colorElement,colorElement.title);new UI.UIUtils.LongClickController(colorElement,this._showLightnessShades.bind(this,colorElement,palette.colors[i]));}
this._paletteContainer.appendChild(colorElement);}
if(this._paletteContainer.childNodes.length>0){this._paletteContainer.childNodes[0].tabIndex=0;}
this._paletteContainerMutable=palette.mutable;if(palette.mutable){this._paletteContainer.appendChild(this._addColorToolbar.element);this._paletteContainer.appendChild(this._deleteIconToolbar.element);}else{this._addColorToolbar.element.remove();this._deleteIconToolbar.element.remove();}
this._togglePalettePanel(false);this._focus();}
_showLightnessShades(colorElement,colorText,event){function closeLightnessShades(element){this._shadesContainer.classList.add('hidden');element.classList.remove('spectrum-shades-shown');this._shadesContainer.ownerDocument.removeEventListener('mousedown',this._shadesCloseHandler,true);delete this._shadesCloseHandler;}
if(this._shadesCloseHandler){this._shadesCloseHandler();}
this._shadesContainer.classList.remove('hidden');this._shadesContainer.removeChildren();this._shadesContainer.animate([{transform:'scaleY(0)',opacity:'0'},{transform:'scaleY(1)',opacity:'1'}],{duration:200,easing:'cubic-bezier(0.4, 0, 0.2, 1)'});let shadesTop=this._paletteContainer.offsetTop+colorElement.offsetTop+colorElement.parentElement.offsetTop;if(this._contrastDetails){shadesTop+=this._contrastDetails.element().offsetHeight;}
this._shadesContainer.style.top=shadesTop+'px';this._shadesContainer.style.left=colorElement.offsetLeft+'px';colorElement.classList.add('spectrum-shades-shown');const shades=MaterialPaletteShades[colorText];for(let i=shades.length-1;i>=0;i--){const shadeElement=this._createPaletteColor(shades[i],undefined,i*200/shades.length+100);UI.ARIAUtils.markAsButton(shadeElement);UI.ARIAUtils.setAccessibleName(shadeElement,ls`Color ${shades[i]}`);shadeElement.tabIndex=-1;shadeElement.addEventListener('mousedown',this._paletteColorSelected.bind(this,shades[i],shades[i],false));shadeElement.addEventListener('focus',this._paletteColorSelected.bind(this,shades[i],shades[i],false));shadeElement.addEventListener('keydown',this._onShadeColorKeydown.bind(this,colorElement));this._shadesContainer.appendChild(shadeElement);}
if(this._shadesContainer.childNodes.length>0){this._shadesContainer.childNodes[this._shadesContainer.childNodes.length-1].focus();}
this._shadesCloseHandler=closeLightnessShades.bind(this,colorElement);this._shadesContainer.ownerDocument.addEventListener('mousedown',this._shadesCloseHandler,true);}
_slotIndexForEvent(e){const localX=e.pageX-this._paletteContainer.totalOffsetLeft();const localY=e.pageY-this._paletteContainer.totalOffsetTop();const col=Math.min(localX/_colorChipSize|0,_itemsPerPaletteRow-1);const row=(localY/_colorChipSize)|0;return Math.min(row*_itemsPerPaletteRow+col,this._customPaletteSetting.get().colors.length-1);}
_isDraggingToBin(e){return e.pageX>this._deleteIconToolbar.element.totalOffsetLeft();}
_paletteDragStart(e){const element=e.deepElementFromPoint();if(!element||!element.__mutable){return false;}
const index=this._slotIndexForEvent(e);this._dragElement=element;this._dragHotSpotX=e.pageX-(index%_itemsPerPaletteRow)*_colorChipSize;this._dragHotSpotY=e.pageY-(index/_itemsPerPaletteRow|0)*_colorChipSize;return true;}
_paletteDrag(e){if(e.pageX<this._paletteContainer.totalOffsetLeft()||e.pageY<this._paletteContainer.totalOffsetTop()){return;}
const newIndex=this._slotIndexForEvent(e);const offsetX=e.pageX-(newIndex%_itemsPerPaletteRow)*_colorChipSize;const offsetY=e.pageY-(newIndex/_itemsPerPaletteRow|0)*_colorChipSize;const isDeleting=this._isDraggingToBin(e);this._deleteIconToolbar.element.classList.add('dragging');this._deleteIconToolbar.element.classList.toggle('delete-color-toolbar-active',isDeleting);const dragElementTransform='translateX('+(offsetX-this._dragHotSpotX)+'px) translateY('+(offsetY-this._dragHotSpotY)+'px)';this._dragElement.style.transform=isDeleting?dragElementTransform+' scale(0.8)':dragElementTransform;const children=Array.prototype.slice.call(this._paletteContainer.children);const index=children.indexOf(this._dragElement);const swatchOffsets=new Map();for(const swatch of children){swatchOffsets.set(swatch,swatch.totalOffset());}
if(index!==newIndex){this._paletteContainer.insertBefore(this._dragElement,children[newIndex>index?newIndex+1:newIndex]);}
for(const swatch of children){if(swatch===this._dragElement){continue;}
const before=swatchOffsets.get(swatch);const after=swatch.totalOffset();if(before.left!==after.left||before.top!==after.top){swatch.animate([{transform:'translateX('+(before.left-after.left)+'px) translateY('+(before.top-after.top)+'px)'},{transform:'none'}],{duration:100,easing:'cubic-bezier(0, 0, 0.2, 1)'});}}}
_paletteDragEnd(e){if(this._isDraggingToBin(e)){this._dragElement.remove();}
this._dragElement.style.removeProperty('transform');const children=this._paletteContainer.children;const colors=[];for(let i=0;i<children.length;++i){if(children[i].__color){colors.push(children[i].__color);}}
const palette=this._customPaletteSetting.get();palette.colors=colors;this._customPaletteSetting.set(palette);this._showPalette(this._customPaletteSetting.get(),false);this._deleteIconToolbar.element.classList.remove('dragging');this._deleteIconToolbar.element.classList.remove('delete-color-toolbar-active');}
_loadPalettes(){this._palettes.set(MaterialPalette.title,MaterialPalette);const defaultCustomPalette={title:'Custom',colors:[],colorNames:[],mutable:true};this._customPaletteSetting=self.Common.settings.createSetting('customColorPalette',defaultCustomPalette);const customPalette=this._customPaletteSetting.get();customPalette.colorNames=customPalette.colorNames||[];this._palettes.set(customPalette.title,customPalette);this._selectedColorPalette=self.Common.settings.createSetting('selectedColorPalette',GeneratedPaletteTitle);const palette=this._palettes.get(this._selectedColorPalette.get());if(palette){this._showPalette(palette,true);}}
addPalette(palette){this._palettes.set(palette.title,palette);if(this._selectedColorPalette.get()===palette.title){this._showPalette(palette,true);}}
_createPreviewPaletteElement(palette){const colorsPerPreviewRow=5;const previewElement=createElementWithClass('div','palette-preview');UI.ARIAUtils.markAsButton(previewElement);previewElement.tabIndex=0;const titleElement=previewElement.createChild('div','palette-preview-title');titleElement.textContent=palette.title;let i;for(i=0;i<colorsPerPreviewRow&&i<palette.colors.length;i++){previewElement.appendChild(this._createPaletteColor(palette.colors[i],palette.colorNames[i]));}
for(;i<colorsPerPreviewRow;i++){previewElement.createChild('div','spectrum-palette-color empty-color');}
self.onInvokeElement(previewElement,event=>{this._paletteSelected(palette);event.consume(true);});return previewElement;}
_paletteSelected(palette){this._selectedColorPalette.set(palette.title);this._showPalette(palette,true);}
_resizeForSelectedPalette(force){const palette=this._palettes.get(this._selectedColorPalette.get());if(!palette){return;}
let numColors=palette.colors.length;if(palette===this._customPaletteSetting.get()){numColors++;}
const rowsNeeded=Math.max(1,Math.ceil(numColors/_itemsPerPaletteRow));if(this._numPaletteRowsShown===rowsNeeded&&!force){return;}
this._numPaletteRowsShown=rowsNeeded;const paletteColorHeight=12;const paletteMargin=12;let paletteTop=236;if(this._contrastDetails){if(this._contrastDetails.expanded()){paletteTop+=78;}else{paletteTop+=36;}}
this.element.style.height=(paletteTop+paletteMargin+(paletteColorHeight+paletteMargin)*rowsNeeded)+'px';this.dispatchEventToListeners(Events.SizeChanged);}
_paletteColorSelected(colorText,colorName,matchUserFormat){const color=Common.Color.Color.parse(colorText);if(!color){return;}
this._innerSetColor(color.hsva(),colorText,colorName,matchUserFormat?this._colorFormat:color.format(),ChangeSource.Other);}
_onPaletteColorKeydown(colorIndex,event){let nextColorIndex;switch(event.key){case'ArrowLeft':nextColorIndex=colorIndex-1;break;case'ArrowRight':nextColorIndex=colorIndex+1;break;case'ArrowUp':nextColorIndex=colorIndex-_itemsPerPaletteRow;break;case'ArrowDown':nextColorIndex=colorIndex+_itemsPerPaletteRow;break;}
if(nextColorIndex>-1&&nextColorIndex<this._paletteContainer.childNodes.length){this._paletteContainer.childNodes[nextColorIndex].focus();}}
_onShadeColorKeydown(colorElement,event){if(isEscKey(event)||event.key==='Tab'){colorElement.focus();this._shadesCloseHandler();event.consume(true);}else if(event.key==='ArrowUp'&&event.target.previousElementSibling){event.target.previousElementSibling.focus();event.consume(true);}else if(event.key==='ArrowDown'&&event.target.nextElementSibling){event.target.nextElementSibling.focus();event.consume(true);}}
_onAddColorMousedown(){this._addColorToCustomPalette();}
_onAddColorKeydown(event){if(isEnterOrSpaceKey(event)){this._addColorToCustomPalette();event.consume(true);}}
_addColorToCustomPalette(){const palette=this._customPaletteSetting.get();palette.colors.push(this.colorString());this._customPaletteSetting.set(palette);this._showPalette(this._customPaletteSetting.get(),false);const colorElements=this._paletteContainer.querySelectorAll('.spectrum-palette-color');colorElements[colorElements.length-1].focus();}
_showPaletteColorContextMenu(colorIndex,event){if(!this._paletteContainerMutable){return;}
const contextMenu=new UI.ContextMenu.ContextMenu(event);if(colorIndex!==-1){contextMenu.defaultSection().appendItem(Common.UIString.UIString('Remove color'),this._deletePaletteColors.bind(this,colorIndex,false));contextMenu.defaultSection().appendItem(Common.UIString.UIString('Remove all to the right'),this._deletePaletteColors.bind(this,colorIndex,true));}
contextMenu.defaultSection().appendItem(Common.UIString.UIString('Clear palette'),this._deletePaletteColors.bind(this,-1,true));contextMenu.show();}
_deletePaletteColors(colorIndex,toRight){const palette=this._customPaletteSetting.get();if(toRight){palette.colors.splice(colorIndex+1,palette.colors.length-colorIndex-1);}else{palette.colors.splice(colorIndex,1);}
this._customPaletteSetting.set(palette);this._showPalette(this._customPaletteSetting.get(),false);}
setColor(color,colorFormat){this._originalFormat=colorFormat;this._innerSetColor(color.hsva(),'',undefined,colorFormat,ChangeSource.Model);const colorValues=this._color().canonicalHSLA();UI.ARIAUtils.setValueNow(this._hueElement,colorValues[0]);UI.ARIAUtils.setValueText(this._alphaElement,colorValues[3]);}
_innerSetColor(hsva,colorString,colorName,colorFormat,changeSource){if(hsva!==undefined){this._hsv=hsva;}
this._colorName=colorName;if(colorString!==undefined){this._colorString=colorString;}
if(colorFormat!==undefined){const cf=Common.Color.Format;console.assert(colorFormat!==cf.Original,'Spectrum\'s color format cannot be Original');if(colorFormat===cf.RGBA){colorFormat=cf.RGB;}else if(colorFormat===cf.HSLA){colorFormat=cf.HSL;}else if(colorFormat===cf.HEXA){colorFormat=cf.HEX;}else if(colorFormat===cf.ShortHEXA){colorFormat=cf.ShortHEX;}
this._colorFormat=colorFormat;}
if(hsva&&this._contrastInfo){this._contrastInfo.setColor(Common.Color.Color.fromHSVA(hsva));}
this._updateHelperLocations();this._updateUI();if(changeSource!==ChangeSource.Input){this._updateInput();}
if(changeSource!==ChangeSource.Model){this.dispatchEventToListeners(Events.ColorChanged,this.colorString());}}
_color(){return Common.Color.Color.fromHSVA(this._hsv);}
colorName(){return this._colorName;}
colorString(){if(this._colorString){return this._colorString;}
const cf=Common.Color.Format;const color=this._color();let colorString=color.asString(this._colorFormat);if(colorString){return colorString;}
if(this._colorFormat===cf.Nickname){colorString=color.asString(color.hasAlpha()?cf.HEXA:cf.HEX);}else if(this._colorFormat===cf.ShortHEX){colorString=color.asString(color.detectHEXFormat());}else if(this._colorFormat===cf.HEX){colorString=color.asString(cf.HEXA);}else if(this._colorFormat===cf.HSL){colorString=color.asString(cf.HSLA);}else{colorString=color.asString(cf.RGBA);}
console.assert(colorString);return colorString||'';}
_updateHelperLocations(){const h=this._hsv[0];const s=this._hsv[1];const v=this._hsv[2];const alpha=this._hsv[3];this._dragX=s*this.dragWidth;this._dragY=this.dragHeight-(v*this.dragHeight);const dragX=Math.max(-this._colorDragElementHeight,Math.min(this.dragWidth-this._colorDragElementHeight,this._dragX-this._colorDragElementHeight));const dragY=Math.max(-this._colorDragElementHeight,Math.min(this.dragHeight-this._colorDragElementHeight,this._dragY-this._colorDragElementHeight));this._colorDragElement.positionAt(dragX,dragY);const hueSlideX=(1-h)*this._hueAlphaWidth-this.slideHelperWidth;this._hueSlider.style.left=hueSlideX+'px';const alphaSlideX=alpha*this._hueAlphaWidth-this.slideHelperWidth;this._alphaSlider.style.left=alphaSlideX+'px';}
_updateInput(){const cf=Common.Color.Format;if(this._colorFormat===cf.HEX||this._colorFormat===cf.ShortHEX||this._colorFormat===cf.Nickname){this._hexContainer.hidden=false;this._displayContainer.hidden=true;if(this._colorFormat===cf.ShortHEX){this._hexValue.value=this._color().asString(this._color().detectHEXFormat());}else{this._hexValue.value=this._color().asString(this._color().hasAlpha()?cf.HEXA:cf.HEX);}}else{this._hexContainer.hidden=true;this._displayContainer.hidden=false;const isRgb=this._colorFormat===cf.RGB;this._textLabels.textContent=isRgb?'RGBA':'HSLA';const colorValues=isRgb?this._color().canonicalRGBA():this._color().canonicalHSLA();for(let i=0;i<3;++i){UI.ARIAUtils.setAccessibleName(this._textValues[i],ls`${this._textLabels.textContent.charAt(i)} in ${this._textLabels.textContent}`);this._textValues[i].value=colorValues[i];if(!isRgb&&(i===1||i===2)){this._textValues[i].value+='%';}}
UI.ARIAUtils.setAccessibleName(this._textValues[3],ls`${this._textLabels.textContent.charAt(3)} in ${this._textLabels.textContent}`);this._textValues[3].value=Math.round(colorValues[3]*100)/100;}}
_updateUI(){const h=Common.Color.Color.fromHSVA([this._hsv[0],1,1,1]);this._colorElement.style.backgroundColor=(h.asString(Common.Color.Format.RGB));if(this._contrastOverlay){this._contrastOverlay.setDimensions(this.dragWidth,this.dragHeight);}
this._swatch.setColor(this._color(),this.colorString());this._colorDragElement.style.backgroundColor=(this._color().asString(Common.Color.Format.RGBA));const noAlpha=Common.Color.Color.fromHSVA(this._hsv.slice(0,3).concat(1));this._alphaElementBackground.style.backgroundImage=Platform.StringUtilities.sprintf('linear-gradient(to right, rgba(0,0,0,0), %s)',noAlpha.asString(Common.Color.Format.RGB));}
_formatViewSwitch(){const cf=Common.Color.Format;let format=cf.RGB;if(this._colorFormat===cf.RGB){format=cf.HSL;}else if(this._colorFormat===cf.HSL){format=(this._originalFormat===cf.ShortHEX||this._originalFormat===cf.ShortHEXA)?cf.ShortHEX:cf.HEX;}
this._innerSetColor(undefined,'',undefined,format,ChangeSource.Other);}
_inputChanged(event){function elementValue(element){return element.value;}
const inputElement=(event.currentTarget);const newValue=UI.UIUtils.createReplacementString(inputElement.value,event);if(newValue){inputElement.value=newValue;inputElement.selectionStart=0;inputElement.selectionEnd=newValue.length;event.consume(true);}
const cf=Common.Color.Format;let colorString;if(this._colorFormat===cf.Nickname||this._colorFormat===cf.HEX||this._colorFormat===cf.ShortHEX){colorString=this._hexValue.value;}else{const format=this._colorFormat===cf.RGB?'rgba':'hsla';const values=this._textValues.map(elementValue).join(', ');colorString=Platform.StringUtilities.sprintf('%s(%s)',format,values);}
const color=Common.Color.Color.parse(colorString);if(!color){return;}
let colorFormat=undefined;if(this._colorFormat===cf.HEX||this._colorFormat===cf.ShortHEX){colorFormat=color.detectHEXFormat();}
this._innerSetColor(color.hsva(),colorString,undefined,colorFormat,ChangeSource.Input);}
wasShown(){this._hueAlphaWidth=this._hueElement.offsetWidth;this.slideHelperWidth=this._hueSlider.offsetWidth/2;this.dragWidth=this._colorElement.offsetWidth;this.dragHeight=this._colorElement.offsetHeight;this._colorDragElementHeight=this._colorDragElement.offsetHeight/2;this._innerSetColor(undefined,undefined,undefined,undefined,ChangeSource.Model);this._toggleColorPicker(true);if(this._contrastDetails){this._contrastDetails.addEventListener(ContrastDetailsEvents.BackgroundColorPickerWillBeToggled,this._contrastDetailsBackgroundColorPickedToggledBound);}}
willHide(){this._toggleColorPicker(false);if(this._contrastDetails){this._contrastDetails.removeEventListener(ContrastDetailsEvents.BackgroundColorPickerWillBeToggled,this._contrastDetailsBackgroundColorPickedToggledBound);}}
_toggleColorPicker(enabled,event){if(enabled===undefined){enabled=!this._colorPickerButton.toggled();}
this._colorPickerButton.setToggled(enabled);if(this._contrastDetails&&enabled&&this._contrastDetails.backgroundColorPickerEnabled()){this._contrastDetails.toggleBackgroundColorPicker(false);}
Host.InspectorFrontendHost.InspectorFrontendHostInstance.setEyeDropperActive(enabled);if(enabled){Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.EyeDropperPickedColor,this._colorPickedBound);}else{Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.removeEventListener(Host.InspectorFrontendHostAPI.Events.EyeDropperPickedColor,this._colorPickedBound);}}
_colorPicked(event){const rgbColor=(event.data);const rgba=[rgbColor.r,rgbColor.g,rgbColor.b,(rgbColor.a/2.55|0)/100];const color=Common.Color.Color.fromRGBA(rgba);this._innerSetColor(color.hsva(),'',undefined,undefined,ChangeSource.Other);Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();}}
export const ChangeSource={Input:'Input',Model:'Model',Other:'Other'};export const Events={ColorChanged:Symbol('ColorChanged'),SizeChanged:Symbol('SizeChanged')};const _colorChipSize=24;const _itemsPerPaletteRow=8;const GeneratedPaletteTitle='Page colors';export class PaletteGenerator{constructor(callback){this._callback=callback;this._frequencyMap=new Map();const stylesheetPromises=[];for(const cssModel of self.SDK.targetManager.models(SDK.CSSModel.CSSModel)){for(const stylesheet of cssModel.allStyleSheets()){stylesheetPromises.push(this._processStylesheet(stylesheet));}}
Promise.all(stylesheetPromises).catchException(null).then(this._finish.bind(this));}
_frequencyComparator(a,b){return this._frequencyMap.get(b)-this._frequencyMap.get(a);}
_finish(){function hueComparator(a,b){const hsva=paletteColors.get(a).hsva();const hsvb=paletteColors.get(b).hsva();if(hsvb[1]<0.12&&hsva[1]<0.12){return hsvb[2]*hsvb[3]-hsva[2]*hsva[3];}
if(hsvb[1]<0.12){return-1;}
if(hsva[1]<0.12){return 1;}
if(hsvb[0]===hsva[0]){return hsvb[1]*hsvb[3]-hsva[1]*hsva[3];}
return(hsvb[0]+0.94)%1-(hsva[0]+0.94)%1;}
let colors=[...this._frequencyMap.keys()];colors=colors.sort(this._frequencyComparator.bind(this));const paletteColors=new Map();const colorsPerRow=24;while(paletteColors.size<colorsPerRow&&colors.length){const colorText=colors.shift();const color=Common.Color.Color.parse(colorText);if(!color||color.nickname()==='white'||color.nickname()==='black'){continue;}
paletteColors.set(colorText,color);}
this._callback({title:GeneratedPaletteTitle,colors:[...paletteColors.keys()].sort(hueComparator),colorNames:[],mutable:false});}
async _processStylesheet(stylesheet){let text=(await stylesheet.requestContent()).content||'';text=text.toLowerCase();const regexResult=text.match(/((?:rgb|hsl)a?\([^)]+\)|#[0-9a-f]{6}|#[0-9a-f]{3})/g)||[];for(const c of regexResult){let frequency=this._frequencyMap.get(c)||0;this._frequencyMap.set(c,++frequency);}}}
export const MaterialPaletteShades={'#F44336':['#FFEBEE','#FFCDD2','#EF9A9A','#E57373','#EF5350','#F44336','#E53935','#D32F2F','#C62828','#B71C1C'],'#E91E63':['#FCE4EC','#F8BBD0','#F48FB1','#F06292','#EC407A','#E91E63','#D81B60','#C2185B','#AD1457','#880E4F'],'#9C27B0':['#F3E5F5','#E1BEE7','#CE93D8','#BA68C8','#AB47BC','#9C27B0','#8E24AA','#7B1FA2','#6A1B9A','#4A148C'],'#673AB7':['#EDE7F6','#D1C4E9','#B39DDB','#9575CD','#7E57C2','#673AB7','#5E35B1','#512DA8','#4527A0','#311B92'],'#3F51B5':['#E8EAF6','#C5CAE9','#9FA8DA','#7986CB','#5C6BC0','#3F51B5','#3949AB','#303F9F','#283593','#1A237E'],'#2196F3':['#E3F2FD','#BBDEFB','#90CAF9','#64B5F6','#42A5F5','#2196F3','#1E88E5','#1976D2','#1565C0','#0D47A1'],'#03A9F4':['#E1F5FE','#B3E5FC','#81D4FA','#4FC3F7','#29B6F6','#03A9F4','#039BE5','#0288D1','#0277BD','#01579B'],'#00BCD4':['#E0F7FA','#B2EBF2','#80DEEA','#4DD0E1','#26C6DA','#00BCD4','#00ACC1','#0097A7','#00838F','#006064'],'#009688':['#E0F2F1','#B2DFDB','#80CBC4','#4DB6AC','#26A69A','#009688','#00897B','#00796B','#00695C','#004D40'],'#4CAF50':['#E8F5E9','#C8E6C9','#A5D6A7','#81C784','#66BB6A','#4CAF50','#43A047','#388E3C','#2E7D32','#1B5E20'],'#8BC34A':['#F1F8E9','#DCEDC8','#C5E1A5','#AED581','#9CCC65','#8BC34A','#7CB342','#689F38','#558B2F','#33691E'],'#CDDC39':['#F9FBE7','#F0F4C3','#E6EE9C','#DCE775','#D4E157','#CDDC39','#C0CA33','#AFB42B','#9E9D24','#827717'],'#FFEB3B':['#FFFDE7','#FFF9C4','#FFF59D','#FFF176','#FFEE58','#FFEB3B','#FDD835','#FBC02D','#F9A825','#F57F17'],'#FFC107':['#FFF8E1','#FFECB3','#FFE082','#FFD54F','#FFCA28','#FFC107','#FFB300','#FFA000','#FF8F00','#FF6F00'],'#FF9800':['#FFF3E0','#FFE0B2','#FFCC80','#FFB74D','#FFA726','#FF9800','#FB8C00','#F57C00','#EF6C00','#E65100'],'#FF5722':['#FBE9E7','#FFCCBC','#FFAB91','#FF8A65','#FF7043','#FF5722','#F4511E','#E64A19','#D84315','#BF360C'],'#795548':['#EFEBE9','#D7CCC8','#BCAAA4','#A1887F','#8D6E63','#795548','#6D4C41','#5D4037','#4E342E','#3E2723'],'#9E9E9E':['#FAFAFA','#F5F5F5','#EEEEEE','#E0E0E0','#BDBDBD','#9E9E9E','#757575','#616161','#424242','#212121'],'#607D8B':['#ECEFF1','#CFD8DC','#B0BEC5','#90A4AE','#78909C','#607D8B','#546E7A','#455A64','#37474F','#263238']};export const MaterialPalette={title:'Material',mutable:false,matchUserFormat:true,colors:Object.keys(MaterialPaletteShades),colorNames:[]};export class Swatch{constructor(parentElement){this._colorString;const swatchElement=parentElement.createChild('span','swatch');this._swatchInnerElement=swatchElement.createChild('span','swatch-inner');this._swatchOverlayElement=swatchElement.createChild('span','swatch-overlay');UI.ARIAUtils.markAsButton(this._swatchOverlayElement);UI.ARIAUtils.setPressed(this._swatchOverlayElement,false);this._swatchOverlayElement.tabIndex=0;self.onInvokeElement(this._swatchOverlayElement,this._onCopyText.bind(this));this._swatchOverlayElement.addEventListener('mouseout',this._onCopyIconMouseout.bind(this));this._swatchOverlayElement.addEventListener('blur',this._onCopyIconMouseout.bind(this));this._swatchCopyIcon=UI.Icon.Icon.create('largeicon-copy','copy-color-icon');this._swatchCopyIcon.title=ls`Copy color to clipboard`;this._swatchOverlayElement.appendChild(this._swatchCopyIcon);UI.ARIAUtils.setAccessibleName(this._swatchOverlayElement,this._swatchCopyIcon.title);}
setColor(color,colorString){this._swatchInnerElement.style.backgroundColor=(color.asString(Common.Color.Format.RGBA));this._swatchInnerElement.classList.toggle('swatch-inner-white',color.hsla()[2]>0.9);this._colorString=colorString||null;if(colorString){this._swatchOverlayElement.hidden=false;}else{this._swatchOverlayElement.hidden=true;}}
_onCopyText(event){this._swatchCopyIcon.setIconType('largeicon-checkmark');Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this._colorString);UI.ARIAUtils.setPressed(this._swatchOverlayElement,true);event.consume();}
_onCopyIconMouseout(){this._swatchCopyIcon.setIconType('largeicon-copy');UI.ARIAUtils.setPressed(this._swatchOverlayElement,false);}}
export let Palette;
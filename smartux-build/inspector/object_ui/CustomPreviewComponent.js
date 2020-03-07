import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ObjectPropertiesSection}from'./ObjectPropertiesSection.js';export class CustomPreviewSection{constructor(object){this._sectionElement=createElementWithClass('span','custom-expandable-section');this._object=object;this._expanded=false;this._cachedContent=null;const customPreview=object.customPreview();let headerJSON;try{headerJSON=JSON.parse(customPreview.header);}catch(e){self.Common.console.error('Broken formatter: header is invalid json '+e);return;}
this._header=this._renderJSONMLTag(headerJSON);if(this._header.nodeType===Node.TEXT_NODE){self.Common.console.error('Broken formatter: header should be an element node.');return;}
if(customPreview.hasBody||customPreview.bodyGetterId){this._header.classList.add('custom-expandable-section-header');this._header.addEventListener('click',this._onClick.bind(this),false);this._expandIcon=UI.Icon.Icon.create('smallicon-triangle-right','custom-expand-icon');this._header.insertBefore(this._expandIcon,this._header.firstChild);}
this._sectionElement.appendChild(this._header);}
element(){return this._sectionElement;}
_renderJSONMLTag(jsonML){if(!Array.isArray(jsonML)){return createTextNode(jsonML+'');}
const array=(jsonML);return array[0]==='object'?this._layoutObjectTag(array):this._renderElement(array);}
_renderElement(object){const tagName=object.shift();if(!CustomPreviewSection._tagsWhiteList.has(tagName)){self.Common.console.error('Broken formatter: element '+tagName+' is not allowed!');return createElement('span');}
const element=createElement((tagName));if((typeof object[0]==='object')&&!Array.isArray(object[0])){const attributes=object.shift();for(const key in attributes){const value=attributes[key];if((key!=='style')||(typeof value!=='string')){continue;}
element.setAttribute(key,value);}}
this._appendJsonMLTags(element,object);return element;}
_layoutObjectTag(objectTag){objectTag.shift();const attributes=objectTag.shift();const remoteObject=this._object.runtimeModel().createRemoteObject((attributes));if(remoteObject.customPreview()){return(new CustomPreviewSection(remoteObject)).element();}
const sectionElement=ObjectPropertiesSection.defaultObjectPresentation(remoteObject);sectionElement.classList.toggle('custom-expandable-section-standard-section',remoteObject.hasChildren);return sectionElement;}
_appendJsonMLTags(parentElement,jsonMLTags){for(let i=0;i<jsonMLTags.length;++i){parentElement.appendChild(this._renderJSONMLTag(jsonMLTags[i]));}}
_onClick(event){event.consume(true);if(this._cachedContent){this._toggleExpand();}else{this._loadBody();}}
_toggleExpand(){this._expanded=!this._expanded;this._header.classList.toggle('expanded',this._expanded);this._cachedContent.classList.toggle('hidden',!this._expanded);if(this._expanded){this._expandIcon.setIconType('smallicon-triangle-down');}else{this._expandIcon.setIconType('smallicon-triangle-right');}}
_loadBody(){function load(bindRemoteObject,formatter,config){function substituteObjectTagsInCustomPreview(jsonMLObject){if(!jsonMLObject||(typeof jsonMLObject!=='object')||(typeof jsonMLObject.splice!=='function')){return;}
const obj=jsonMLObject.length;if(!(typeof obj==='number'&&obj>>>0===obj&&(obj>0||1/obj>0))){return;}
let startIndex=1;if(jsonMLObject[0]==='object'){const attributes=jsonMLObject[1];const originObject=attributes['object'];const config=attributes['config'];if(typeof originObject==='undefined'){throw'Illegal format: obligatory attribute "object" isn\'t specified';}
jsonMLObject[1]=bindRemoteObject(originObject,config);startIndex=2;}
for(let i=startIndex;i<jsonMLObject.length;++i){substituteObjectTagsInCustomPreview(jsonMLObject[i]);}}
try{const body=formatter.body(this,config);substituteObjectTagsInCustomPreview(body);return body;}catch(e){console.error('Custom Formatter Failed: '+e);return null;}}
const customPreview=this._object.customPreview();if(customPreview.bindRemoteObjectFunctionId&&customPreview.formatterObjectId){const args=[{objectId:customPreview.bindRemoteObjectFunctionId},{objectId:customPreview.formatterObjectId}];if(customPreview.configObjectId){args.push({objectId:customPreview.configObjectId});}
this._object.callFunctionJSON(load,args).then(onBodyLoaded.bind(this));}else if(customPreview.bodyGetterId){this._object.callFunctionJSON(bodyGetter=>bodyGetter(),[{objectId:customPreview.bodyGetterId}]).then(onBodyLoaded.bind(this));}
function onBodyLoaded(bodyJsonML){if(!bodyJsonML){return;}
this._cachedContent=this._renderJSONMLTag(bodyJsonML);this._sectionElement.appendChild(this._cachedContent);this._toggleExpand();}}}
export class CustomPreviewComponent{constructor(object){this._object=object;this._customPreviewSection=new CustomPreviewSection(object);this.element=createElementWithClass('span','source-code');const shadowRoot=UI.Utils.createShadowRootWithCoreStyles(this.element,'object_ui/customPreviewComponent.css');this.element.addEventListener('contextmenu',this._contextMenuEventFired.bind(this),false);shadowRoot.appendChild(this._customPreviewSection.element());}
expandIfPossible(){if((this._object.customPreview().hasBody||this._object.customPreview().bodyGetterId)&&this._customPreviewSection){this._customPreviewSection._loadBody();}}
_contextMenuEventFired(event){const contextMenu=new UI.ContextMenu.ContextMenu(event);if(this._customPreviewSection){contextMenu.revealSection().appendItem(Common.UIString.UIString('Show as JavaScript object'),this._disassemble.bind(this));}
contextMenu.appendApplicableItems(this._object);contextMenu.show();}
_disassemble(){this.element.shadowRoot.textContent='';this._customPreviewSection=null;this.element.shadowRoot.appendChild(ObjectPropertiesSection.defaultObjectPresentation(this._object));}}
CustomPreviewSection._tagsWhiteList=new Set(['span','div','ol','li','table','tr','td']);
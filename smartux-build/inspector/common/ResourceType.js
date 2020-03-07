import{ParsedURL}from'./ParsedURL.js';import{ls}from'./UIString.js';export class ResourceType{constructor(name,title,category,isTextType){this._name=name;this._title=title;this._category=category;this._isTextType=isTextType;}
static fromMimeType(mimeType){if(!mimeType){return resourceTypes.Other;}
if(mimeType.startsWith('text/html')){return resourceTypes.Document;}
if(mimeType.startsWith('text/css')){return resourceTypes.Stylesheet;}
if(mimeType.startsWith('image/')){return resourceTypes.Image;}
if(mimeType.startsWith('text/')){return resourceTypes.Script;}
if(mimeType.includes('font')){return resourceTypes.Font;}
if(mimeType.includes('script')){return resourceTypes.Script;}
if(mimeType.includes('octet')){return resourceTypes.Other;}
if(mimeType.includes('application')){return resourceTypes.Script;}
return resourceTypes.Other;}
static fromURL(url){return _resourceTypeByExtension.get(ParsedURL.extractExtension(url))||null;}
static fromName(name){for(const resourceTypeId in resourceTypes){const resourceType=(resourceTypes)[resourceTypeId];if(resourceType.name()===name){return resourceType;}}
return null;}
static mimeFromURL(url){const name=ParsedURL.extractName(url);if(_mimeTypeByName.has(name)){return _mimeTypeByName.get(name);}
const ext=ParsedURL.extractExtension(url).toLowerCase();return _mimeTypeByExtension.get(ext);}
static mimeFromExtension(ext){return _mimeTypeByExtension.get(ext);}
name(){return this._name;}
title(){return this._title;}
category(){return this._category;}
isTextType(){return this._isTextType;}
isScript(){return this._name==='script'||this._name==='sm-script';}
hasScripts(){return this.isScript()||this.isDocument();}
isStyleSheet(){return this._name==='stylesheet'||this._name==='sm-stylesheet';}
isDocument(){return this._name==='document';}
isDocumentOrScriptOrStyleSheet(){return this.isDocument()||this.isScript()||this.isStyleSheet();}
isFromSourceMap(){return this._name.startsWith('sm-');}
toString(){return this._name;}
canonicalMimeType(){if(this.isDocument()){return'text/html';}
if(this.isScript()){return'text/javascript';}
if(this.isStyleSheet()){return'text/css';}
return'';}}
export class ResourceCategory{constructor(title,shortTitle){this.title=title;this.shortTitle=shortTitle;}}
export const resourceCategories={XHR:new ResourceCategory(ls`XHR and Fetch`,ls`XHR`),Script:new ResourceCategory(ls`Scripts`,ls`JS`),Stylesheet:new ResourceCategory(ls`Stylesheets`,ls`CSS`),Image:new ResourceCategory(ls`Images`,ls`Img`),Media:new ResourceCategory(ls`Media`,ls`Media`),Font:new ResourceCategory(ls`Fonts`,ls`Font`),Document:new ResourceCategory(ls`Documents`,ls`Doc`),WebSocket:new ResourceCategory(ls`WebSockets`,ls`WS`),Manifest:new ResourceCategory(ls`Manifest`,ls`Manifest`),Other:new ResourceCategory(ls`Other`,ls`Other`)};export const resourceTypes={XHR:new ResourceType('xhr',ls`XHR`,resourceCategories.XHR,true),Fetch:new ResourceType('fetch',ls`Fetch`,resourceCategories.XHR,true),EventSource:new ResourceType('eventsource',ls`EventSource`,resourceCategories.XHR,true),Script:new ResourceType('script',ls`Script`,resourceCategories.Script,true),Stylesheet:new ResourceType('stylesheet',ls`Stylesheet`,resourceCategories.Stylesheet,true),Image:new ResourceType('image',ls`Image`,resourceCategories.Image,false),Media:new ResourceType('media',ls`Media`,resourceCategories.Media,false),Font:new ResourceType('font',ls`Font`,resourceCategories.Font,false),Document:new ResourceType('document',ls`Document`,resourceCategories.Document,true),TextTrack:new ResourceType('texttrack',ls`TextTrack`,resourceCategories.Other,true),WebSocket:new ResourceType('websocket',ls`WebSocket`,resourceCategories.WebSocket,false),Other:new ResourceType('other',ls`Other`,resourceCategories.Other,false),SourceMapScript:new ResourceType('sm-script',ls`Script`,resourceCategories.Script,true),SourceMapStyleSheet:new ResourceType('sm-stylesheet',ls`Stylesheet`,resourceCategories.Stylesheet,true),Manifest:new ResourceType('manifest',ls`Manifest`,resourceCategories.Manifest,true),SignedExchange:new ResourceType('signed-exchange',ls`SignedExchange`,resourceCategories.Other,false)};export const _mimeTypeByName=new Map([['Cakefile','text/x-coffeescript']]);export const _resourceTypeByExtension=new Map([['js',resourceTypes.Script],['mjs',resourceTypes.Script],['css',resourceTypes.Stylesheet],['xsl',resourceTypes.Stylesheet],['jpeg',resourceTypes.Image],['jpg',resourceTypes.Image],['svg',resourceTypes.Image],['gif',resourceTypes.Image],['png',resourceTypes.Image],['ico',resourceTypes.Image],['tiff',resourceTypes.Image],['tif',resourceTypes.Image],['bmp',resourceTypes.Image],['webp',resourceTypes.Media],['ttf',resourceTypes.Font],['otf',resourceTypes.Font],['ttc',resourceTypes.Font],['woff',resourceTypes.Font]]);export const _mimeTypeByExtension=new Map([['js','text/javascript'],['mjs','text/javascript'],['css','text/css'],['html','text/html'],['htm','text/html'],['xml','application/xml'],['xsl','application/xml'],['asp','application/x-aspx'],['aspx','application/x-aspx'],['jsp','application/x-jsp'],['c','text/x-c++src'],['cc','text/x-c++src'],['cpp','text/x-c++src'],['h','text/x-c++src'],['m','text/x-c++src'],['mm','text/x-c++src'],['coffee','text/x-coffeescript'],['dart','text/javascript'],['ts','text/typescript'],['tsx','text/typescript-jsx'],['json','application/json'],['gyp','application/json'],['gypi','application/json'],['cs','text/x-csharp'],['java','text/x-java'],['less','text/x-less'],['php','text/x-php'],['phtml','application/x-httpd-php'],['py','text/x-python'],['sh','text/x-sh'],['scss','text/x-scss'],['vtt','text/vtt'],['ls','text/x-livescript'],['md','text/markdown'],['cljs','text/x-clojure'],['cljc','text/x-clojure'],['cljx','text/x-clojure'],['styl','text/x-styl'],['jsx','text/jsx'],['jpeg','image/jpeg'],['jpg','image/jpeg'],['svg','image/svg+xml'],['gif','image/gif'],['webp','image/webp'],['png','image/png'],['ico','image/ico'],['tiff','image/tiff'],['tif','image/tif'],['bmp','image/bmp'],['ttf','font/opentype'],['otf','font/opentype'],['ttc','font/opentype'],['woff','application/font-woff']]);
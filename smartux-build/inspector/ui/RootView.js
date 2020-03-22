import{VBox}from'./Widget.js';export class RootView extends VBox{constructor(){super();this.markAsRoot();this.element.classList.add('root-view');this.registerRequiredCSS('ui/rootView.css');this.element.setAttribute('spellcheck',false);}
attachToDocument(document){if(document.defaultView){document.defaultView.addEventListener('resize',this.doResize.bind(this),false);this._window=document.defaultView;}else{window.document.addEventListener('BOTTOM_PANE_RESIZE',this.doResize.bind(this),false);this._window=document;}
this.doResize();if(document.body){let domInspector=document.body.querySelector('#domInspector');if(domInspector){this.show(domInspector);}}else{this.show((document.body));}}
doResize(){if(this._window){const size=this.constraints().minimum;const zoom=self.UI.zoomManager.zoomFactor();const right=Math.min(0,this._window.innerWidth-size.width/zoom);this.element.style.marginRight=right+'px';const bottom=Math.min(0,this._window.innerHeight-size.height/zoom);this.element.style.marginBottom=bottom+'px';}
super.doResize();}}
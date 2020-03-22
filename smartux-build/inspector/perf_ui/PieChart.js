import*as UI from'../ui/ui.js';export class PieChart{constructor(options){const{size,formatter,showLegend,chartName}=options;this.element=createElement('div');this._shadowRoot=UI.Utils.createShadowRootWithCoreStyles(this.element,'perf_ui/pieChart.css');const root=this._shadowRoot.createChild('div','root');UI.ARIAUtils.markAsGroup(root);UI.ARIAUtils.setAccessibleName(root,chartName);this._chartRoot=root.createChild('div','chart-root');const svg=this._createSVGChild(this._chartRoot,'svg');this._group=this._createSVGChild(svg,'g');this._innerR=0.618;const strokeWidth=1/size;let circle=this._createSVGChild(this._group,'circle');circle.setAttribute('r',1);circle.setAttribute('stroke','hsl(0, 0%, 80%)');circle.setAttribute('fill','transparent');circle.setAttribute('stroke-width',strokeWidth);circle=this._createSVGChild(this._group,'circle');circle.setAttribute('r',this._innerR);circle.setAttribute('stroke','hsl(0, 0%, 80%)');circle.setAttribute('fill','transparent');circle.setAttribute('stroke-width',strokeWidth);this._foregroundElement=this._chartRoot.createChild('div','pie-chart-foreground');this._totalElement=this._foregroundElement.createChild('div','pie-chart-total');this._formatter=formatter;this._slices=[];this._lastAngle=-Math.PI/2;if(showLegend){this._legend=root.createChild('div','pie-chart-legend');}
this._setSize(size);}
setTotal(totalValue){for(let i=0;i<this._slices.length;++i){this._slices[i].remove();}
this._slices=[];this._totalValue=totalValue;this._lastAngle=-Math.PI/2;let totalString;if(totalValue){totalString=this._formatter?this._formatter(totalValue):totalValue;}else{totalString='';}
this._totalElement.textContent=totalString;if(this._legend){this._legend.removeChildren();this._addLegendItem(this._totalElement,totalValue,ls`Total`);}}
_setSize(value){this._group.setAttribute('transform','scale('+(value/2)+') translate(1, 1) scale(0.99, 0.99)');const size=value+'px';this._chartRoot.style.width=size;this._chartRoot.style.height=size;}
addSlice(value,color,name){let sliceAngle=value/this._totalValue*2*Math.PI;if(!isFinite(sliceAngle)){return;}
sliceAngle=Math.min(sliceAngle,2*Math.PI*0.9999);const path=this._createSVGChild(this._group,'path');const x1=Math.cos(this._lastAngle);const y1=Math.sin(this._lastAngle);this._lastAngle+=sliceAngle;const x2=Math.cos(this._lastAngle);const y2=Math.sin(this._lastAngle);const r2=this._innerR;const x3=x2*r2;const y3=y2*r2;const x4=x1*r2;const y4=y1*r2;const largeArc=sliceAngle>Math.PI?1:0;path.setAttribute('d',`M${x1},${y1} A1,1,0,${largeArc},1,${x2},${y2} L${x3},${y3} A${r2},${r2},0,${largeArc},0,${x4},${y4} Z`);path.setAttribute('fill',color);this._slices.push(path);if(this._legend){this._addLegendItem(path,value,name,color);}}
_createSVGChild(parent,childType){const child=parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg',childType);parent.appendChild(child);return child;}
_addLegendItem(figureElement,value,name,color){const node=this._legend.ownerDocument.createElement('div');node.className='pie-chart-legend-row';if(this._legend.childElementCount){this._legend.insertBefore(node,this._legend.lastElementChild);}else{this._legend.appendChild(node);}
const sizeDiv=node.createChild('div','pie-chart-size');const swatchDiv=node.createChild('div','pie-chart-swatch');const nameDiv=node.createChild('div','pie-chart-name');if(color){swatchDiv.style.backgroundColor=color;}else{swatchDiv.classList.add('pie-chart-empty-swatch');}
nameDiv.textContent=name;const size=this._formatter?this._formatter(value):value;sizeDiv.textContent=size;UI.ARIAUtils.setAccessibleName(figureElement,name+' '+size);return node;}}
export let PieChartOptions;
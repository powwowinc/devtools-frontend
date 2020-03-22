import*as Common from'../common/common.js';import{ContrastInfo,Events}from'./ContrastInfo.js';export class ContrastOverlay{constructor(contrastInfo,colorElement){this._contrastInfo=contrastInfo;this._visible=false;this._contrastRatioSVG=colorElement.createSVGChild('svg','spectrum-contrast-container fill');this._contrastRatioLines={aa:this._contrastRatioSVG.createSVGChild('path','spectrum-contrast-line'),aaa:this._contrastRatioSVG.createSVGChild('path','spectrum-contrast-line')};this._width=0;this._height=0;this._contrastRatioLineBuilder=new ContrastRatioLineBuilder(this._contrastInfo);this._contrastRatioLinesThrottler=new Common.Throttler.Throttler(0);this._drawContrastRatioLinesBound=this._drawContrastRatioLines.bind(this);this._contrastInfo.addEventListener(Events.ContrastInfoUpdated,this._update.bind(this));}
_update(){if(!this._visible||this._contrastInfo.isNull()||!this._contrastInfo.contrastRatio()){return;}
this._contrastRatioLinesThrottler.schedule(this._drawContrastRatioLinesBound);}
setDimensions(width,height){this._width=width;this._height=height;this._update();}
setVisible(visible){this._visible=visible;this._contrastRatioSVG.classList.toggle('hidden',!visible);this._update();}
async _drawContrastRatioLines(){for(const level in this._contrastRatioLines){const path=this._contrastRatioLineBuilder.drawContrastRatioLine(this._width,this._height,level);if(path){this._contrastRatioLines[level].setAttribute('d',path);}else{this._contrastRatioLines[level].removeAttribute('d');}}}}
export class ContrastRatioLineBuilder{constructor(contrastInfo){this._contrastInfo=contrastInfo;}
drawContrastRatioLine(width,height,level){const requiredContrast=this._contrastInfo.contrastRatioThreshold(level);if(!width||!height||!requiredContrast){return null;}
const dS=0.02;const epsilon=0.0002;const H=0;const S=1;const V=2;const A=3;const color=this._contrastInfo.color();const bgColor=this._contrastInfo.bgColor();if(!color||!bgColor){return null;}
const fgRGBA=color.rgba();const fgHSVA=color.hsva();const bgRGBA=bgColor.rgba();const bgLuminance=Common.Color.Color.luminance(bgRGBA);const blendedRGBA=[];Common.Color.Color.blendColors(fgRGBA,bgRGBA,blendedRGBA);const fgLuminance=Common.Color.Color.luminance(blendedRGBA);const fgIsLighter=fgLuminance>bgLuminance;const desiredLuminance=Common.Color.Color.desiredLuminance(bgLuminance,requiredContrast,fgIsLighter);let lastV=fgHSVA[V];let currentSlope=0;const candidateHSVA=[fgHSVA[H],0,0,fgHSVA[A]];let pathBuilder=[];const candidateRGBA=[];Common.Color.Color.hsva2rgba(candidateHSVA,candidateRGBA);Common.Color.Color.blendColors(candidateRGBA,bgRGBA,blendedRGBA);function updateCandidateAndComputeDelta(index,x){candidateHSVA[index]=x;Common.Color.Color.hsva2rgba(candidateHSVA,candidateRGBA);Common.Color.Color.blendColors(candidateRGBA,bgRGBA,blendedRGBA);return Common.Color.Color.luminance(blendedRGBA)-desiredLuminance;}
function approach(index){let x=candidateHSVA[index];let multiplier=1;let dLuminance=updateCandidateAndComputeDelta(index,x);let previousSign=Math.sign(dLuminance);for(let guard=100;guard;guard--){if(Math.abs(dLuminance)<epsilon){return x;}
const sign=Math.sign(dLuminance);if(sign!==previousSign){multiplier/=2;previousSign=sign;}else if(x<0||x>1){return null;}
x+=multiplier*(index===V?-dLuminance:dLuminance);dLuminance=updateCandidateAndComputeDelta(index,x);}
console.error('Loop exited unexpectedly');return null;}
let s;for(s=0;s<1+dS;s+=dS){s=Math.min(1,s);candidateHSVA[S]=s;candidateHSVA[V]=lastV+currentSlope*dS;const v=approach(V);if(v===null){break;}
currentSlope=s===0?0:(v-lastV)/dS;lastV=v;pathBuilder.push(pathBuilder.length?'L':'M');pathBuilder.push((s*width).toFixed(2));pathBuilder.push(((1-v)*height).toFixed(2));}
if(s<1+dS){s-=dS;candidateHSVA[V]=1;s=approach(S);if(s!==null){pathBuilder=pathBuilder.concat(['L',(s*width).toFixed(2),'-0.1']);}}
if(pathBuilder.length===0){return null;}
return pathBuilder.join(' ');}}
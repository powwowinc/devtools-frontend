export const escapeCharacters=(inputString,charsToEscape)=>{let foundChar=false;for(let i=0;i<charsToEscape.length;++i){if(inputString.indexOf(charsToEscape.charAt(i))!==-1){foundChar=true;break;}}
if(!foundChar){return String(inputString);}
let result='';for(let i=0;i<inputString.length;++i){if(charsToEscape.indexOf(inputString.charAt(i))!==-1){result+='\\';}
result+=inputString.charAt(i);}
return result;};export const tokenizeFormatString=function(formatString,formatters){const tokens=[];function addStringToken(str){if(!str){return;}
if(tokens.length&&tokens[tokens.length-1].type==='string'){tokens[tokens.length-1].value+=str;}else{tokens.push({type:'string',value:str});}}
function addSpecifierToken(specifier,precision,substitutionIndex){tokens.push({type:'specifier',specifier:specifier,precision:precision,substitutionIndex:substitutionIndex});}
function addAnsiColor(code){const types={3:'color',9:'colorLight',4:'bgColor',10:'bgColorLight'};const colorCodes=['black','red','green','yellow','blue','magenta','cyan','lightGray','','default'];const colorCodesLight=['darkGray','lightRed','lightGreen','lightYellow','lightBlue','lightMagenta','lightCyan','white',''];const colors={color:colorCodes,colorLight:colorCodesLight,bgColor:colorCodes,bgColorLight:colorCodesLight};const type=types[Math.floor(code/10)];if(!type){return;}
const color=colors[type][code%10];if(!color){return;}
tokens.push({type:'specifier',specifier:'c',value:{description:(type.startsWith('bg')?'background : ':'color: ')+color}});}
let textStart=0;let substitutionIndex=0;const re=new RegExp(`%%|%(?:(\\d+)\\$)?(?:\\.(\\d*))?([${Object.keys(formatters).join('')}])|\\u001b\\[(\\d+)m`,'g');for(let match=re.exec(formatString);!!match;match=re.exec(formatString)){const matchStart=match.index;if(matchStart>textStart){addStringToken(formatString.substring(textStart,matchStart));}
if(match[0]==='%%'){addStringToken('%');}else if(match[0].startsWith('%')){const[_,substitionString,precisionString,specifierString]=match;if(substitionString&&Number(substitionString)>0){substitutionIndex=Number(substitionString)-1;}
const precision=precisionString?Number(precisionString):-1;addSpecifierToken(specifierString,precision,substitutionIndex);++substitutionIndex;}else{const code=Number(match[4]);addAnsiColor(code);}
textStart=matchStart+match[0].length;}
addStringToken(formatString.substring(textStart));return tokens;};export const format=function(formatString,substitutions,formatters,initialValue,append,tokenizedFormat){if(!formatString||((!substitutions||!substitutions.length)&&formatString.search(/\u001b\[(\d+)m/)===-1)){return{formattedResult:append(initialValue,formatString),unusedSubstitutions:substitutions};}
function prettyFunctionName(){return'String.format("'+formatString+'", "'+Array.prototype.join.call(substitutions,'", "')+'")';}
function warn(msg){console.warn(prettyFunctionName()+': '+msg);}
function error(msg){console.error(prettyFunctionName()+': '+msg);}
let result=initialValue;const tokens=tokenizedFormat||tokenizeFormatString(formatString,formatters);const usedSubstitutionIndexes={};for(let i=0;i<tokens.length;++i){const token=tokens[i];if(token.type==='string'){result=append(result,token.value);continue;}
if(token.type!=='specifier'){error('Unknown token type "'+token.type+'" found.');continue;}
if(!token.value&&token.substitutionIndex>=substitutions.length){error('not enough substitution arguments. Had '+substitutions.length+' but needed '+
(token.substitutionIndex+1)+', so substitution was skipped.');result=append(result,'%'+(token.precision>-1?token.precision:'')+token.specifier);continue;}
if(!token.value){usedSubstitutionIndexes[token.substitutionIndex]=true;}
if(!(token.specifier in formatters)){warn('unsupported format character \u201C'+token.specifier+'\u201D. Treating as a string.');result=append(result,token.value?'':substitutions[token.substitutionIndex]);continue;}
result=append(result,formatters[token.specifier](token.value||substitutions[token.substitutionIndex],token));}
const unusedSubstitutions=[];for(let i=0;i<substitutions.length;++i){if(i in usedSubstitutionIndexes){continue;}
unusedSubstitutions.push(substitutions[i]);}
return{formattedResult:result,unusedSubstitutions:unusedSubstitutions};};export const standardFormatters={d:function(substitution){return!isNaN(substitution)?substitution:0;},f:function(substitution,token){if(substitution&&token.precision>-1){substitution=substitution.toFixed(token.precision);}
return!isNaN(substitution)?substitution:(token.precision>-1?Number(0).toFixed(token.precision):0);},s:function(substitution){return substitution;}};export const vsprintf=function(formatString,substitutions){return format(formatString,substitutions,standardFormatters,'',function(a,b){return a+b;}).formattedResult;};export const sprintf=function(format,var_arg){return vsprintf(format,Array.prototype.slice.call(arguments,1));};export const toBase64=inputString=>{function encodeBits(b){return b<26?b+65:b<52?b+71:b<62?b-4:b===62?43:b===63?47:65;}
const encoder=new TextEncoder();const data=encoder.encode(inputString.toString());const n=data.length;let encoded='';if(n===0){return encoded;}
let shift;let v=0;for(let i=0;i<n;i++){shift=i%3;v|=data[i]<<(16>>>shift&24);if(shift===2){encoded+=String.fromCharCode(encodeBits(v>>>18&63),encodeBits(v>>>12&63),encodeBits(v>>>6&63),encodeBits(v&63));v=0;}}
if(shift===0){encoded+=String.fromCharCode(encodeBits(v>>>18&63),encodeBits(v>>>12&63),61,61);}else if(shift===1){encoded+=String.fromCharCode(encodeBits(v>>>18&63),encodeBits(v>>>12&63),encodeBits(v>>>6&63),61);}
return encoded;};export const findIndexesOfSubString=(inputString,searchString)=>{const matches=[];let i=inputString.indexOf(searchString);while(i!==-1){matches.push(i);i=inputString.indexOf(searchString,i+searchString.length);}
return matches;};export const findLineEndingIndexes=inputString=>{const endings=findIndexesOfSubString(inputString,'\n');endings.push(inputString.length);return endings;};export const isWhitespace=inputString=>{return/^\s*$/.test(inputString);};export const trimURL=(url,baseURLDomain)=>{let result=url.replace(/^(https|http|file):\/\//i,'');if(baseURLDomain){if(result.toLowerCase().startsWith(baseURLDomain.toLowerCase())){result=result.substr(baseURLDomain.length);}}
return result;};export const collapseWhitespace=inputString=>{return inputString.replace(/[\s\xA0]+/g,' ');};export const reverse=inputString=>{return inputString.split('').reverse().join('');};
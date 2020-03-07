import*as GraphStyle from'./GraphStyle.js';import{generateInputPortId,generateOutputPortId,generateParamPortId}from'./NodeView.js';export class EdgeView{constructor(data,type){const{edgeId,sourcePortId,destinationPortId}=generateEdgePortIdsByData(data,type);this.id=edgeId;this.type=type;this.sourceId=data.sourceId;this.destinationId=data.destinationId;this.sourcePortId=sourcePortId;this.destinationPortId=destinationPortId;}}
export const generateEdgePortIdsByData=(data,type)=>{if(!data.sourceId||!data.destinationId){console.error(`Undefined node message: ${JSON.stringify(data)}`);return null;}
const sourcePortId=generateOutputPortId(data.sourceId,data.sourceOutputIndex);const destinationPortId=getDestinationPortId(data,type);return{edgeId:`${sourcePortId}->${destinationPortId}`,sourcePortId:sourcePortId,destinationPortId:destinationPortId,};function getDestinationPortId(data,type){if(type===EdgeTypes.NodeToNode){return generateInputPortId(data.destinationId,data.destinationInputIndex);}
if(type===EdgeTypes.NodeToParam){return generateParamPortId(data.destinationId,data.destinationParamId);}
console.error(`Unknown edge type: ${type}`);return'';}};export const EdgeTypes={NodeToNode:Symbol('NodeToNode'),NodeToParam:Symbol('NodeToParam'),};
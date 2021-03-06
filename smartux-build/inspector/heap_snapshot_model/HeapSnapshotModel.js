export const HeapSnapshotProgressEvent={Update:'ProgressUpdate',BrokenSnapshot:'BrokenSnapshot'};export const baseSystemDistance=100000000;export class AllocationNodeCallers{constructor(nodesWithSingleCaller,branchingCallers){this.nodesWithSingleCaller=nodesWithSingleCaller;this.branchingCallers=branchingCallers;}}
export class SerializedAllocationNode{constructor(nodeId,functionName,scriptName,scriptId,line,column,count,size,liveCount,liveSize,hasChildren){this.id=nodeId;this.name=functionName;this.scriptName=scriptName;this.scriptId=scriptId;this.line=line;this.column=column;this.count=count;this.size=size;this.liveCount=liveCount;this.liveSize=liveSize;this.hasChildren=hasChildren;}}
export class AllocationStackFrame{constructor(functionName,scriptName,scriptId,line,column){this.functionName=functionName;this.scriptName=scriptName;this.scriptId=scriptId;this.line=line;this.column=column;}}
export class Node{constructor(id,name,distance,nodeIndex,retainedSize,selfSize,type){this.id=id;this.name=name;this.distance=distance;this.nodeIndex=nodeIndex;this.retainedSize=retainedSize;this.selfSize=selfSize;this.type=type;this.canBeQueried=false;this.detachedDOMTreeNode=false;}}
export class Edge{constructor(name,node,type,edgeIndex){this.name=name;this.node=node;this.type=type;this.edgeIndex=edgeIndex;}}
export class Aggregate{constructor(){this.count;this.distance;this.self;this.maxRet;this.type;this.name;this.idxs;}}
export class AggregateForDiff{constructor(){this.indexes=[];this.ids=[];this.selfSizes=[];}}
export class Diff{constructor(){this.addedCount=0;this.removedCount=0;this.addedSize=0;this.removedSize=0;this.deletedIndexes=[];this.addedIndexes=[];}}
export class DiffForClass{constructor(){this.addedCount;this.removedCount;this.addedSize;this.removedSize;this.deletedIndexes;this.addedIndexes;this.countDelta;this.sizeDelta;}}
export class ComparatorConfig{constructor(){this.fieldName1;this.ascending1;this.fieldName2;this.ascending2;}}
export class WorkerCommand{constructor(){this.callId;this.disposition;this.objectId;this.newObjectId;this.methodName;this.methodArguments;this.source;}}
export class ItemsRange{constructor(startPosition,endPosition,totalLength,items){this.startPosition=startPosition;this.endPosition=endPosition;this.totalLength=totalLength;this.items=items;}}
export class StaticData{constructor(nodeCount,rootNodeIndex,totalSize,maxJSObjectId){this.nodeCount=nodeCount;this.rootNodeIndex=rootNodeIndex;this.totalSize=totalSize;this.maxJSObjectId=maxJSObjectId;}}
export class Statistics{constructor(){this.total;this.v8heap;this.native;this.code;this.jsArrays;this.strings;this.system;}}
export class NodeFilter{constructor(minNodeId,maxNodeId){this.minNodeId=minNodeId;this.maxNodeId=maxNodeId;this.allocationNodeId;}
equals(o){return this.minNodeId===o.minNodeId&&this.maxNodeId===o.maxNodeId&&this.allocationNodeId===o.allocationNodeId;}}
export class SearchConfig{constructor(query,caseSensitive,isRegex,shouldJump,jumpBackward){this.query=query;this.caseSensitive=caseSensitive;this.isRegex=isRegex;this.shouldJump=shouldJump;this.jumpBackward=jumpBackward;}}
export class Samples{constructor(timestamps,lastAssignedIds,sizes){this.timestamps=timestamps;this.lastAssignedIds=lastAssignedIds;this.sizes=sizes;}}
export class Location{constructor(scriptId,lineNumber,columnNumber){this.scriptId=scriptId;this.lineNumber=lineNumber;this.columnNumber=columnNumber;}}
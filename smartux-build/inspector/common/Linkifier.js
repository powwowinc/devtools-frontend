export class Linkifier{linkify(object,options){}
static linkify(object,options){if(!object){return Promise.reject(new Error('Can\'t linkify '+object));}
return self.runtime.extension(Linkifier,object).instance().then(linkifier=>linkifier.linkify(object,options));}}
export let Options;
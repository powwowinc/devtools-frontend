Root.allDescriptors.push(...[{"skip_compilation":["WasmDis.js","WasmParser.js"],"modules":["WasmDis.js","WasmParser.js"],"name":"third_party/wasmparser","scripts":[]},{"skip_compilation":[],"dependencies":["third_party/wasmparser"],"modules":["wasmparser_worker.js","WasmParserWorker.js"],"name":"wasmparser_worker","scripts":[]}]);Root.applicationDescriptor={"has_html":false,"modules":[{"type":"autostart","name":"third_party/wasmparser"},{"type":"autostart","name":"wasmparser_worker"}]};import'./Runtime.js';import'./platform/platform.js';import'./wasmparser_worker/wasmparser_worker.js';Root.Runtime.startWorker('wasmparser_worker_entrypoint');;
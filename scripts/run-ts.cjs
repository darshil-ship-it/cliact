/* eslint @typescript-eslint/no-require-imports: "off" -- This file implements a CommonJS script loader. */
// Lightweight script runner using the project's TypeScript compiler.
// Avoids a separate background transpiler and works in restricted Windows environments.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const original = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  return original.call(this, request.startsWith('@/') ? path.join(process.cwd(), request.slice(2)) : request, parent, ...rest);
};
require.extensions['.ts'] = function(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  module._compile(result.outputText, filename);
};
require(path.resolve(process.argv[2]));


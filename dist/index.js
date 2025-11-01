var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// node_modules/abitype/dist/esm/version.js
var version = "1.1.0";

// node_modules/abitype/dist/esm/errors.js
var BaseError;
var init_errors = __esm(() => {
  BaseError = class BaseError extends Error {
    constructor(shortMessage, args = {}) {
      const details = args.cause instanceof BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
      const docsPath = args.cause instanceof BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
      const message = [
        shortMessage || "An error occurred.",
        "",
        ...args.metaMessages ? [...args.metaMessages, ""] : [],
        ...docsPath ? [`Docs: https://abitype.dev${docsPath}`] : [],
        ...details ? [`Details: ${details}`] : [],
        `Version: abitype@${version}`
      ].join(`
`);
      super(message);
      Object.defineProperty(this, "details", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "docsPath", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "metaMessages", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "shortMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiTypeError"
      });
      if (args.cause)
        this.cause = args.cause;
      this.details = details;
      this.docsPath = docsPath;
      this.metaMessages = args.metaMessages;
      this.shortMessage = shortMessage;
    }
  };
});

// node_modules/abitype/dist/esm/regex.js
function execTyped(regex, string) {
  const match = regex.exec(string);
  return match?.groups;
}
var bytesRegex, integerRegex, isTupleRegex;
var init_regex = __esm(() => {
  bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
  integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
  isTupleRegex = /^\(.+?\).*?$/;
});

// node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js
function formatAbiParameter(abiParameter) {
  let type = abiParameter.type;
  if (tupleRegex.test(abiParameter.type) && "components" in abiParameter) {
    type = "(";
    const length = abiParameter.components.length;
    for (let i = 0;i < length; i++) {
      const component = abiParameter.components[i];
      type += formatAbiParameter(component);
      if (i < length - 1)
        type += ", ";
    }
    const result = execTyped(tupleRegex, abiParameter.type);
    type += `)${result?.array ?? ""}`;
    return formatAbiParameter({
      ...abiParameter,
      type
    });
  }
  if ("indexed" in abiParameter && abiParameter.indexed)
    type = `${type} indexed`;
  if (abiParameter.name)
    return `${type} ${abiParameter.name}`;
  return type;
}
var tupleRegex;
var init_formatAbiParameter = __esm(() => {
  init_regex();
  tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
});

// node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js
function formatAbiParameters(abiParameters) {
  let params = "";
  const length = abiParameters.length;
  for (let i = 0;i < length; i++) {
    const abiParameter = abiParameters[i];
    params += formatAbiParameter(abiParameter);
    if (i !== length - 1)
      params += ", ";
  }
  return params;
}
var init_formatAbiParameters = __esm(() => {
  init_formatAbiParameter();
});

// node_modules/abitype/dist/esm/human-readable/formatAbiItem.js
function formatAbiItem(abiItem) {
  if (abiItem.type === "function")
    return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== "nonpayable" ? ` ${abiItem.stateMutability}` : ""}${abiItem.outputs?.length ? ` returns (${formatAbiParameters(abiItem.outputs)})` : ""}`;
  if (abiItem.type === "event")
    return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "error")
    return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "constructor")
    return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  if (abiItem.type === "fallback")
    return `fallback() external${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  return "receive() external payable";
}
var init_formatAbiItem = __esm(() => {
  init_formatAbiParameters();
});

// node_modules/abitype/dist/esm/human-readable/runtime/signatures.js
function isErrorSignature(signature) {
  return errorSignatureRegex.test(signature);
}
function execErrorSignature(signature) {
  return execTyped(errorSignatureRegex, signature);
}
function isEventSignature(signature) {
  return eventSignatureRegex.test(signature);
}
function execEventSignature(signature) {
  return execTyped(eventSignatureRegex, signature);
}
function isFunctionSignature(signature) {
  return functionSignatureRegex.test(signature);
}
function execFunctionSignature(signature) {
  return execTyped(functionSignatureRegex, signature);
}
function isStructSignature(signature) {
  return structSignatureRegex.test(signature);
}
function execStructSignature(signature) {
  return execTyped(structSignatureRegex, signature);
}
function isConstructorSignature(signature) {
  return constructorSignatureRegex.test(signature);
}
function execConstructorSignature(signature) {
  return execTyped(constructorSignatureRegex, signature);
}
function isFallbackSignature(signature) {
  return fallbackSignatureRegex.test(signature);
}
function execFallbackSignature(signature) {
  return execTyped(fallbackSignatureRegex, signature);
}
function isReceiveSignature(signature) {
  return receiveSignatureRegex.test(signature);
}
var errorSignatureRegex, eventSignatureRegex, functionSignatureRegex, structSignatureRegex, constructorSignatureRegex, fallbackSignatureRegex, receiveSignatureRegex, modifiers, eventModifiers, functionModifiers;
var init_signatures = __esm(() => {
  init_regex();
  errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
  eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
  functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
  structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
  constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
  fallbackSignatureRegex = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
  receiveSignatureRegex = /^receive\(\) external payable$/;
  modifiers = new Set([
    "memory",
    "indexed",
    "storage",
    "calldata"
  ]);
  eventModifiers = new Set(["indexed"]);
  functionModifiers = new Set([
    "calldata",
    "memory",
    "storage"
  ]);
});

// node_modules/abitype/dist/esm/human-readable/errors/abiItem.js
var InvalidAbiItemError, UnknownTypeError, UnknownSolidityTypeError;
var init_abiItem = __esm(() => {
  init_errors();
  InvalidAbiItemError = class InvalidAbiItemError extends BaseError {
    constructor({ signature }) {
      super("Failed to parse ABI item.", {
        details: `parseAbiItem(${JSON.stringify(signature, null, 2)})`,
        docsPath: "/api/human#parseabiitem-1"
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidAbiItemError"
      });
    }
  };
  UnknownTypeError = class UnknownTypeError extends BaseError {
    constructor({ type }) {
      super("Unknown type.", {
        metaMessages: [
          `Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "UnknownTypeError"
      });
    }
  };
  UnknownSolidityTypeError = class UnknownSolidityTypeError extends BaseError {
    constructor({ type }) {
      super("Unknown type.", {
        metaMessages: [`Type "${type}" is not a valid ABI type.`]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "UnknownSolidityTypeError"
      });
    }
  };
});

// node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js
var InvalidAbiParametersError, InvalidParameterError, SolidityProtectedKeywordError, InvalidModifierError, InvalidFunctionModifierError, InvalidAbiTypeParameterError;
var init_abiParameter = __esm(() => {
  init_errors();
  InvalidAbiParametersError = class InvalidAbiParametersError extends BaseError {
    constructor({ params }) {
      super("Failed to parse ABI parameters.", {
        details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
        docsPath: "/api/human#parseabiparameters-1"
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidAbiParametersError"
      });
    }
  };
  InvalidParameterError = class InvalidParameterError extends BaseError {
    constructor({ param }) {
      super("Invalid ABI parameter.", {
        details: param
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidParameterError"
      });
    }
  };
  SolidityProtectedKeywordError = class SolidityProtectedKeywordError extends BaseError {
    constructor({ param, name }) {
      super("Invalid ABI parameter.", {
        details: param,
        metaMessages: [
          `"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "SolidityProtectedKeywordError"
      });
    }
  };
  InvalidModifierError = class InvalidModifierError extends BaseError {
    constructor({ param, type, modifier }) {
      super("Invalid ABI parameter.", {
        details: param,
        metaMessages: [
          `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidModifierError"
      });
    }
  };
  InvalidFunctionModifierError = class InvalidFunctionModifierError extends BaseError {
    constructor({ param, type, modifier }) {
      super("Invalid ABI parameter.", {
        details: param,
        metaMessages: [
          `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`,
          `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidFunctionModifierError"
      });
    }
  };
  InvalidAbiTypeParameterError = class InvalidAbiTypeParameterError extends BaseError {
    constructor({ abiParameter }) {
      super("Invalid ABI parameter.", {
        details: JSON.stringify(abiParameter, null, 2),
        metaMessages: ["ABI parameter type is invalid."]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidAbiTypeParameterError"
      });
    }
  };
});

// node_modules/abitype/dist/esm/human-readable/errors/signature.js
var InvalidSignatureError, UnknownSignatureError, InvalidStructSignatureError;
var init_signature = __esm(() => {
  init_errors();
  InvalidSignatureError = class InvalidSignatureError extends BaseError {
    constructor({ signature, type }) {
      super(`Invalid ${type} signature.`, {
        details: signature
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidSignatureError"
      });
    }
  };
  UnknownSignatureError = class UnknownSignatureError extends BaseError {
    constructor({ signature }) {
      super("Unknown signature.", {
        details: signature
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "UnknownSignatureError"
      });
    }
  };
  InvalidStructSignatureError = class InvalidStructSignatureError extends BaseError {
    constructor({ signature }) {
      super("Invalid struct signature.", {
        details: signature,
        metaMessages: ["No properties exist."]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidStructSignatureError"
      });
    }
  };
});

// node_modules/abitype/dist/esm/human-readable/errors/struct.js
var CircularReferenceError;
var init_struct = __esm(() => {
  init_errors();
  CircularReferenceError = class CircularReferenceError extends BaseError {
    constructor({ type }) {
      super("Circular reference detected.", {
        metaMessages: [`Struct "${type}" is a circular reference.`]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "CircularReferenceError"
      });
    }
  };
});

// node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js
var InvalidParenthesisError;
var init_splitParameters = __esm(() => {
  init_errors();
  InvalidParenthesisError = class InvalidParenthesisError extends BaseError {
    constructor({ current, depth }) {
      super("Unbalanced parentheses.", {
        metaMessages: [
          `"${current.trim()}" has too many ${depth > 0 ? "opening" : "closing"} parentheses.`
        ],
        details: `Depth "${depth}"`
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidParenthesisError"
      });
    }
  };
});

// node_modules/abitype/dist/esm/human-readable/runtime/cache.js
function getParameterCacheKey(param, type, structs) {
  let structKey = "";
  if (structs)
    for (const struct of Object.entries(structs)) {
      if (!struct)
        continue;
      let propertyKey = "";
      for (const property of struct[1]) {
        propertyKey += `[${property.type}${property.name ? `:${property.name}` : ""}]`;
      }
      structKey += `(${struct[0]}{${propertyKey}})`;
    }
  if (type)
    return `${type}:${param}${structKey}`;
  return param;
}
var parameterCache;
var init_cache = __esm(() => {
  parameterCache = new Map([
    ["address", { type: "address" }],
    ["bool", { type: "bool" }],
    ["bytes", { type: "bytes" }],
    ["bytes32", { type: "bytes32" }],
    ["int", { type: "int256" }],
    ["int256", { type: "int256" }],
    ["string", { type: "string" }],
    ["uint", { type: "uint256" }],
    ["uint8", { type: "uint8" }],
    ["uint16", { type: "uint16" }],
    ["uint24", { type: "uint24" }],
    ["uint32", { type: "uint32" }],
    ["uint64", { type: "uint64" }],
    ["uint96", { type: "uint96" }],
    ["uint112", { type: "uint112" }],
    ["uint160", { type: "uint160" }],
    ["uint192", { type: "uint192" }],
    ["uint256", { type: "uint256" }],
    ["address owner", { type: "address", name: "owner" }],
    ["address to", { type: "address", name: "to" }],
    ["bool approved", { type: "bool", name: "approved" }],
    ["bytes _data", { type: "bytes", name: "_data" }],
    ["bytes data", { type: "bytes", name: "data" }],
    ["bytes signature", { type: "bytes", name: "signature" }],
    ["bytes32 hash", { type: "bytes32", name: "hash" }],
    ["bytes32 r", { type: "bytes32", name: "r" }],
    ["bytes32 root", { type: "bytes32", name: "root" }],
    ["bytes32 s", { type: "bytes32", name: "s" }],
    ["string name", { type: "string", name: "name" }],
    ["string symbol", { type: "string", name: "symbol" }],
    ["string tokenURI", { type: "string", name: "tokenURI" }],
    ["uint tokenId", { type: "uint256", name: "tokenId" }],
    ["uint8 v", { type: "uint8", name: "v" }],
    ["uint256 balance", { type: "uint256", name: "balance" }],
    ["uint256 tokenId", { type: "uint256", name: "tokenId" }],
    ["uint256 value", { type: "uint256", name: "value" }],
    [
      "event:address indexed from",
      { type: "address", name: "from", indexed: true }
    ],
    ["event:address indexed to", { type: "address", name: "to", indexed: true }],
    [
      "event:uint indexed tokenId",
      { type: "uint256", name: "tokenId", indexed: true }
    ],
    [
      "event:uint256 indexed tokenId",
      { type: "uint256", name: "tokenId", indexed: true }
    ]
  ]);
});

// node_modules/abitype/dist/esm/human-readable/runtime/utils.js
function parseSignature(signature, structs = {}) {
  if (isFunctionSignature(signature))
    return parseFunctionSignature(signature, structs);
  if (isEventSignature(signature))
    return parseEventSignature(signature, structs);
  if (isErrorSignature(signature))
    return parseErrorSignature(signature, structs);
  if (isConstructorSignature(signature))
    return parseConstructorSignature(signature, structs);
  if (isFallbackSignature(signature))
    return parseFallbackSignature(signature);
  if (isReceiveSignature(signature))
    return {
      type: "receive",
      stateMutability: "payable"
    };
  throw new UnknownSignatureError({ signature });
}
function parseFunctionSignature(signature, structs = {}) {
  const match = execFunctionSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "function" });
  const inputParams = splitParameters(match.parameters);
  const inputs = [];
  const inputLength = inputParams.length;
  for (let i = 0;i < inputLength; i++) {
    inputs.push(parseAbiParameter(inputParams[i], {
      modifiers: functionModifiers,
      structs,
      type: "function"
    }));
  }
  const outputs = [];
  if (match.returns) {
    const outputParams = splitParameters(match.returns);
    const outputLength = outputParams.length;
    for (let i = 0;i < outputLength; i++) {
      outputs.push(parseAbiParameter(outputParams[i], {
        modifiers: functionModifiers,
        structs,
        type: "function"
      }));
    }
  }
  return {
    name: match.name,
    type: "function",
    stateMutability: match.stateMutability ?? "nonpayable",
    inputs,
    outputs
  };
}
function parseEventSignature(signature, structs = {}) {
  const match = execEventSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "event" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0;i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], {
      modifiers: eventModifiers,
      structs,
      type: "event"
    }));
  return { name: match.name, type: "event", inputs: abiParameters };
}
function parseErrorSignature(signature, structs = {}) {
  const match = execErrorSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "error" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0;i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], { structs, type: "error" }));
  return { name: match.name, type: "error", inputs: abiParameters };
}
function parseConstructorSignature(signature, structs = {}) {
  const match = execConstructorSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "constructor" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0;i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], { structs, type: "constructor" }));
  return {
    type: "constructor",
    stateMutability: match.stateMutability ?? "nonpayable",
    inputs: abiParameters
  };
}
function parseFallbackSignature(signature) {
  const match = execFallbackSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "fallback" });
  return {
    type: "fallback",
    stateMutability: match.stateMutability ?? "nonpayable"
  };
}
function parseAbiParameter(param, options) {
  const parameterCacheKey = getParameterCacheKey(param, options?.type, options?.structs);
  if (parameterCache.has(parameterCacheKey))
    return parameterCache.get(parameterCacheKey);
  const isTuple = isTupleRegex.test(param);
  const match = execTyped(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
  if (!match)
    throw new InvalidParameterError({ param });
  if (match.name && isSolidityKeyword(match.name))
    throw new SolidityProtectedKeywordError({ param, name: match.name });
  const name = match.name ? { name: match.name } : {};
  const indexed = match.modifier === "indexed" ? { indexed: true } : {};
  const structs = options?.structs ?? {};
  let type;
  let components = {};
  if (isTuple) {
    type = "tuple";
    const params = splitParameters(match.type);
    const components_ = [];
    const length = params.length;
    for (let i = 0;i < length; i++) {
      components_.push(parseAbiParameter(params[i], { structs }));
    }
    components = { components: components_ };
  } else if (match.type in structs) {
    type = "tuple";
    components = { components: structs[match.type] };
  } else if (dynamicIntegerRegex.test(match.type)) {
    type = `${match.type}256`;
  } else if (match.type === "address payable") {
    type = "address";
  } else {
    type = match.type;
    if (!(options?.type === "struct") && !isSolidityType(type))
      throw new UnknownSolidityTypeError({ type });
  }
  if (match.modifier) {
    if (!options?.modifiers?.has?.(match.modifier))
      throw new InvalidModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
    if (functionModifiers.has(match.modifier) && !isValidDataLocation(type, !!match.array))
      throw new InvalidFunctionModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
  }
  const abiParameter = {
    type: `${type}${match.array ?? ""}`,
    ...name,
    ...indexed,
    ...components
  };
  parameterCache.set(parameterCacheKey, abiParameter);
  return abiParameter;
}
function splitParameters(params, result = [], current = "", depth = 0) {
  const length = params.trim().length;
  for (let i = 0;i < length; i++) {
    const char = params[i];
    const tail = params.slice(i + 1);
    switch (char) {
      case ",":
        return depth === 0 ? splitParameters(tail, [...result, current.trim()]) : splitParameters(tail, result, `${current}${char}`, depth);
      case "(":
        return splitParameters(tail, result, `${current}${char}`, depth + 1);
      case ")":
        return splitParameters(tail, result, `${current}${char}`, depth - 1);
      default:
        return splitParameters(tail, result, `${current}${char}`, depth);
    }
  }
  if (current === "")
    return result;
  if (depth !== 0)
    throw new InvalidParenthesisError({ current, depth });
  result.push(current.trim());
  return result;
}
function isSolidityType(type) {
  return type === "address" || type === "bool" || type === "function" || type === "string" || bytesRegex.test(type) || integerRegex.test(type);
}
function isSolidityKeyword(name) {
  return name === "address" || name === "bool" || name === "function" || name === "string" || name === "tuple" || bytesRegex.test(name) || integerRegex.test(name) || protectedKeywordsRegex.test(name);
}
function isValidDataLocation(type, isArray) {
  return isArray || type === "bytes" || type === "string" || type === "tuple";
}
var abiParameterWithoutTupleRegex, abiParameterWithTupleRegex, dynamicIntegerRegex, protectedKeywordsRegex;
var init_utils = __esm(() => {
  init_regex();
  init_abiItem();
  init_abiParameter();
  init_signature();
  init_splitParameters();
  init_cache();
  init_signatures();
  abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*(?:\spayable)?)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
  abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
  dynamicIntegerRegex = /^u?int$/;
  protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
});

// node_modules/abitype/dist/esm/human-readable/runtime/structs.js
function parseStructs(signatures) {
  const shallowStructs = {};
  const signaturesLength = signatures.length;
  for (let i = 0;i < signaturesLength; i++) {
    const signature = signatures[i];
    if (!isStructSignature(signature))
      continue;
    const match = execStructSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "struct" });
    const properties = match.properties.split(";");
    const components = [];
    const propertiesLength = properties.length;
    for (let k = 0;k < propertiesLength; k++) {
      const property = properties[k];
      const trimmed = property.trim();
      if (!trimmed)
        continue;
      const abiParameter = parseAbiParameter(trimmed, {
        type: "struct"
      });
      components.push(abiParameter);
    }
    if (!components.length)
      throw new InvalidStructSignatureError({ signature });
    shallowStructs[match.name] = components;
  }
  const resolvedStructs = {};
  const entries = Object.entries(shallowStructs);
  const entriesLength = entries.length;
  for (let i = 0;i < entriesLength; i++) {
    const [name, parameters] = entries[i];
    resolvedStructs[name] = resolveStructs(parameters, shallowStructs);
  }
  return resolvedStructs;
}
function resolveStructs(abiParameters, structs, ancestors = new Set) {
  const components = [];
  const length = abiParameters.length;
  for (let i = 0;i < length; i++) {
    const abiParameter = abiParameters[i];
    const isTuple = isTupleRegex.test(abiParameter.type);
    if (isTuple)
      components.push(abiParameter);
    else {
      const match = execTyped(typeWithoutTupleRegex, abiParameter.type);
      if (!match?.type)
        throw new InvalidAbiTypeParameterError({ abiParameter });
      const { array, type } = match;
      if (type in structs) {
        if (ancestors.has(type))
          throw new CircularReferenceError({ type });
        components.push({
          ...abiParameter,
          type: `tuple${array ?? ""}`,
          components: resolveStructs(structs[type] ?? [], structs, new Set([...ancestors, type]))
        });
      } else {
        if (isSolidityType(type))
          components.push(abiParameter);
        else
          throw new UnknownTypeError({ type });
      }
    }
  }
  return components;
}
var typeWithoutTupleRegex;
var init_structs = __esm(() => {
  init_regex();
  init_abiItem();
  init_abiParameter();
  init_signature();
  init_struct();
  init_signatures();
  init_utils();
  typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
});

// node_modules/abitype/dist/esm/human-readable/parseAbi.js
function parseAbi(signatures) {
  const structs = parseStructs(signatures);
  const abi = [];
  const length = signatures.length;
  for (let i = 0;i < length; i++) {
    const signature = signatures[i];
    if (isStructSignature(signature))
      continue;
    abi.push(parseSignature(signature, structs));
  }
  return abi;
}
var init_parseAbi = __esm(() => {
  init_signatures();
  init_structs();
  init_utils();
});

// node_modules/abitype/dist/esm/human-readable/parseAbiItem.js
function parseAbiItem(signature) {
  let abiItem;
  if (typeof signature === "string")
    abiItem = parseSignature(signature);
  else {
    const structs = parseStructs(signature);
    const length = signature.length;
    for (let i = 0;i < length; i++) {
      const signature_ = signature[i];
      if (isStructSignature(signature_))
        continue;
      abiItem = parseSignature(signature_, structs);
      break;
    }
  }
  if (!abiItem)
    throw new InvalidAbiItemError({ signature });
  return abiItem;
}
var init_parseAbiItem = __esm(() => {
  init_abiItem();
  init_signatures();
  init_structs();
  init_utils();
});

// node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js
function parseAbiParameters(params) {
  const abiParameters = [];
  if (typeof params === "string") {
    const parameters = splitParameters(params);
    const length = parameters.length;
    for (let i = 0;i < length; i++) {
      abiParameters.push(parseAbiParameter(parameters[i], { modifiers }));
    }
  } else {
    const structs = parseStructs(params);
    const length = params.length;
    for (let i = 0;i < length; i++) {
      const signature = params[i];
      if (isStructSignature(signature))
        continue;
      const parameters = splitParameters(signature);
      const length2 = parameters.length;
      for (let k = 0;k < length2; k++) {
        abiParameters.push(parseAbiParameter(parameters[k], { modifiers, structs }));
      }
    }
  }
  if (abiParameters.length === 0)
    throw new InvalidAbiParametersError({ params });
  return abiParameters;
}
var init_parseAbiParameters = __esm(() => {
  init_abiParameter();
  init_signatures();
  init_structs();
  init_utils();
  init_utils();
});

// node_modules/abitype/dist/esm/exports/index.js
var init_exports = __esm(() => {
  init_formatAbiItem();
  init_formatAbiParameters();
  init_parseAbi();
  init_parseAbiItem();
  init_parseAbiParameters();
});

// node_modules/viem/_esm/utils/getAction.js
function getAction(client, actionFn, name) {
  const action_implicit = client[actionFn.name];
  if (typeof action_implicit === "function")
    return action_implicit;
  const action_explicit = client[name];
  if (typeof action_explicit === "function")
    return action_explicit;
  return (params) => actionFn(client, params);
}

// node_modules/viem/_esm/utils/abi/formatAbiItem.js
function formatAbiItem2(abiItem, { includeName = false } = {}) {
  if (abiItem.type !== "function" && abiItem.type !== "event" && abiItem.type !== "error")
    throw new InvalidDefinitionTypeError(abiItem.type);
  return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
}
function formatAbiParams(params, { includeName = false } = {}) {
  if (!params)
    return "";
  return params.map((param) => formatAbiParam(param, { includeName })).join(includeName ? ", " : ",");
}
function formatAbiParam(param, { includeName }) {
  if (param.type.startsWith("tuple")) {
    return `(${formatAbiParams(param.components, { includeName })})${param.type.slice("tuple".length)}`;
  }
  return param.type + (includeName && param.name ? ` ${param.name}` : "");
}
var init_formatAbiItem2 = __esm(() => {
  init_abi();
});

// node_modules/viem/_esm/utils/data/isHex.js
function isHex(value, { strict = true } = {}) {
  if (!value)
    return false;
  if (typeof value !== "string")
    return false;
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}

// node_modules/viem/_esm/utils/data/size.js
function size(value) {
  if (isHex(value, { strict: false }))
    return Math.ceil((value.length - 2) / 2);
  return value.length;
}
var init_size = () => {};

// node_modules/viem/_esm/errors/version.js
var version2 = "2.38.4";

// node_modules/viem/_esm/errors/base.js
function walk(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause !== undefined)
    return walk(err.cause, fn);
  return fn ? null : err;
}
var errorConfig, BaseError2;
var init_base = __esm(() => {
  errorConfig = {
    getDocsUrl: ({ docsBaseUrl, docsPath = "", docsSlug }) => docsPath ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath}${docsSlug ? `#${docsSlug}` : ""}` : undefined,
    version: `viem@${version2}`
  };
  BaseError2 = class BaseError2 extends Error {
    constructor(shortMessage, args = {}) {
      const details = (() => {
        if (args.cause instanceof BaseError2)
          return args.cause.details;
        if (args.cause?.message)
          return args.cause.message;
        return args.details;
      })();
      const docsPath = (() => {
        if (args.cause instanceof BaseError2)
          return args.cause.docsPath || args.docsPath;
        return args.docsPath;
      })();
      const docsUrl = errorConfig.getDocsUrl?.({ ...args, docsPath });
      const message = [
        shortMessage || "An error occurred.",
        "",
        ...args.metaMessages ? [...args.metaMessages, ""] : [],
        ...docsUrl ? [`Docs: ${docsUrl}`] : [],
        ...details ? [`Details: ${details}`] : [],
        ...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
      ].join(`
`);
      super(message, args.cause ? { cause: args.cause } : undefined);
      Object.defineProperty(this, "details", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "docsPath", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "metaMessages", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "shortMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "version", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "BaseError"
      });
      this.details = details;
      this.docsPath = docsPath;
      this.metaMessages = args.metaMessages;
      this.name = args.name ?? this.name;
      this.shortMessage = shortMessage;
      this.version = version2;
    }
    walk(fn) {
      return walk(this, fn);
    }
  };
});

// node_modules/viem/_esm/errors/abi.js
var AbiConstructorNotFoundError, AbiConstructorParamsNotFoundError, AbiDecodingDataSizeTooSmallError, AbiDecodingZeroDataError, AbiEncodingArrayLengthMismatchError, AbiEncodingBytesSizeMismatchError, AbiEncodingLengthMismatchError, AbiErrorInputsNotFoundError, AbiErrorNotFoundError, AbiErrorSignatureNotFoundError, AbiEventSignatureEmptyTopicsError, AbiEventSignatureNotFoundError, AbiEventNotFoundError, AbiFunctionNotFoundError, AbiFunctionOutputsNotFoundError, AbiFunctionSignatureNotFoundError, AbiItemAmbiguityError, BytesSizeMismatchError, DecodeLogDataMismatch, DecodeLogTopicsMismatch, InvalidAbiEncodingTypeError, InvalidAbiDecodingTypeError, InvalidArrayError, InvalidDefinitionTypeError;
var init_abi = __esm(() => {
  init_formatAbiItem2();
  init_size();
  init_base();
  AbiConstructorNotFoundError = class AbiConstructorNotFoundError extends BaseError2 {
    constructor({ docsPath }) {
      super([
        "A constructor was not found on the ABI.",
        "Make sure you are using the correct ABI and that the constructor exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiConstructorNotFoundError"
      });
    }
  };
  AbiConstructorParamsNotFoundError = class AbiConstructorParamsNotFoundError extends BaseError2 {
    constructor({ docsPath }) {
      super([
        "Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.",
        "Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists."
      ].join(`
`), {
        docsPath,
        name: "AbiConstructorParamsNotFoundError"
      });
    }
  };
  AbiDecodingDataSizeTooSmallError = class AbiDecodingDataSizeTooSmallError extends BaseError2 {
    constructor({ data, params, size: size2 }) {
      super([`Data size of ${size2} bytes is too small for given parameters.`].join(`
`), {
        metaMessages: [
          `Params: (${formatAbiParams(params, { includeName: true })})`,
          `Data:   ${data} (${size2} bytes)`
        ],
        name: "AbiDecodingDataSizeTooSmallError"
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "params", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "size", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.data = data;
      this.params = params;
      this.size = size2;
    }
  };
  AbiDecodingZeroDataError = class AbiDecodingZeroDataError extends BaseError2 {
    constructor() {
      super('Cannot decode zero data ("0x") with ABI parameters.', {
        name: "AbiDecodingZeroDataError"
      });
    }
  };
  AbiEncodingArrayLengthMismatchError = class AbiEncodingArrayLengthMismatchError extends BaseError2 {
    constructor({ expectedLength, givenLength, type }) {
      super([
        `ABI encoding array length mismatch for type ${type}.`,
        `Expected length: ${expectedLength}`,
        `Given length: ${givenLength}`
      ].join(`
`), { name: "AbiEncodingArrayLengthMismatchError" });
    }
  };
  AbiEncodingBytesSizeMismatchError = class AbiEncodingBytesSizeMismatchError extends BaseError2 {
    constructor({ expectedSize, value }) {
      super(`Size of bytes "${value}" (bytes${size(value)}) does not match expected size (bytes${expectedSize}).`, { name: "AbiEncodingBytesSizeMismatchError" });
    }
  };
  AbiEncodingLengthMismatchError = class AbiEncodingLengthMismatchError extends BaseError2 {
    constructor({ expectedLength, givenLength }) {
      super([
        "ABI encoding params/values length mismatch.",
        `Expected length (params): ${expectedLength}`,
        `Given length (values): ${givenLength}`
      ].join(`
`), { name: "AbiEncodingLengthMismatchError" });
    }
  };
  AbiErrorInputsNotFoundError = class AbiErrorInputsNotFoundError extends BaseError2 {
    constructor(errorName, { docsPath }) {
      super([
        `Arguments (\`args\`) were provided to "${errorName}", but "${errorName}" on the ABI does not contain any parameters (\`inputs\`).`,
        "Cannot encode error result without knowing what the parameter types are.",
        "Make sure you are using the correct ABI and that the inputs exist on it."
      ].join(`
`), {
        docsPath,
        name: "AbiErrorInputsNotFoundError"
      });
    }
  };
  AbiErrorNotFoundError = class AbiErrorNotFoundError extends BaseError2 {
    constructor(errorName, { docsPath } = {}) {
      super([
        `Error ${errorName ? `"${errorName}" ` : ""}not found on ABI.`,
        "Make sure you are using the correct ABI and that the error exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiErrorNotFoundError"
      });
    }
  };
  AbiErrorSignatureNotFoundError = class AbiErrorSignatureNotFoundError extends BaseError2 {
    constructor(signature, { docsPath }) {
      super([
        `Encoded error signature "${signature}" not found on ABI.`,
        "Make sure you are using the correct ABI and that the error exists on it.",
        `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`
      ].join(`
`), {
        docsPath,
        name: "AbiErrorSignatureNotFoundError"
      });
      Object.defineProperty(this, "signature", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.signature = signature;
    }
  };
  AbiEventSignatureEmptyTopicsError = class AbiEventSignatureEmptyTopicsError extends BaseError2 {
    constructor({ docsPath }) {
      super("Cannot extract event signature from empty topics.", {
        docsPath,
        name: "AbiEventSignatureEmptyTopicsError"
      });
    }
  };
  AbiEventSignatureNotFoundError = class AbiEventSignatureNotFoundError extends BaseError2 {
    constructor(signature, { docsPath }) {
      super([
        `Encoded event signature "${signature}" not found on ABI.`,
        "Make sure you are using the correct ABI and that the event exists on it.",
        `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`
      ].join(`
`), {
        docsPath,
        name: "AbiEventSignatureNotFoundError"
      });
    }
  };
  AbiEventNotFoundError = class AbiEventNotFoundError extends BaseError2 {
    constructor(eventName, { docsPath } = {}) {
      super([
        `Event ${eventName ? `"${eventName}" ` : ""}not found on ABI.`,
        "Make sure you are using the correct ABI and that the event exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiEventNotFoundError"
      });
    }
  };
  AbiFunctionNotFoundError = class AbiFunctionNotFoundError extends BaseError2 {
    constructor(functionName, { docsPath } = {}) {
      super([
        `Function ${functionName ? `"${functionName}" ` : ""}not found on ABI.`,
        "Make sure you are using the correct ABI and that the function exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiFunctionNotFoundError"
      });
    }
  };
  AbiFunctionOutputsNotFoundError = class AbiFunctionOutputsNotFoundError extends BaseError2 {
    constructor(functionName, { docsPath }) {
      super([
        `Function "${functionName}" does not contain any \`outputs\` on ABI.`,
        "Cannot decode function result without knowing what the parameter types are.",
        "Make sure you are using the correct ABI and that the function exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiFunctionOutputsNotFoundError"
      });
    }
  };
  AbiFunctionSignatureNotFoundError = class AbiFunctionSignatureNotFoundError extends BaseError2 {
    constructor(signature, { docsPath }) {
      super([
        `Encoded function signature "${signature}" not found on ABI.`,
        "Make sure you are using the correct ABI and that the function exists on it.",
        `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`
      ].join(`
`), {
        docsPath,
        name: "AbiFunctionSignatureNotFoundError"
      });
    }
  };
  AbiItemAmbiguityError = class AbiItemAmbiguityError extends BaseError2 {
    constructor(x, y) {
      super("Found ambiguous types in overloaded ABI items.", {
        metaMessages: [
          `\`${x.type}\` in \`${formatAbiItem2(x.abiItem)}\`, and`,
          `\`${y.type}\` in \`${formatAbiItem2(y.abiItem)}\``,
          "",
          "These types encode differently and cannot be distinguished at runtime.",
          "Remove one of the ambiguous items in the ABI."
        ],
        name: "AbiItemAmbiguityError"
      });
    }
  };
  BytesSizeMismatchError = class BytesSizeMismatchError extends BaseError2 {
    constructor({ expectedSize, givenSize }) {
      super(`Expected bytes${expectedSize}, got bytes${givenSize}.`, {
        name: "BytesSizeMismatchError"
      });
    }
  };
  DecodeLogDataMismatch = class DecodeLogDataMismatch extends BaseError2 {
    constructor({ abiItem, data, params, size: size2 }) {
      super([
        `Data size of ${size2} bytes is too small for non-indexed event parameters.`
      ].join(`
`), {
        metaMessages: [
          `Params: (${formatAbiParams(params, { includeName: true })})`,
          `Data:   ${data} (${size2} bytes)`
        ],
        name: "DecodeLogDataMismatch"
      });
      Object.defineProperty(this, "abiItem", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "params", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "size", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.abiItem = abiItem;
      this.data = data;
      this.params = params;
      this.size = size2;
    }
  };
  DecodeLogTopicsMismatch = class DecodeLogTopicsMismatch extends BaseError2 {
    constructor({ abiItem, param }) {
      super([
        `Expected a topic for indexed event parameter${param.name ? ` "${param.name}"` : ""} on event "${formatAbiItem2(abiItem, { includeName: true })}".`
      ].join(`
`), { name: "DecodeLogTopicsMismatch" });
      Object.defineProperty(this, "abiItem", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.abiItem = abiItem;
    }
  };
  InvalidAbiEncodingTypeError = class InvalidAbiEncodingTypeError extends BaseError2 {
    constructor(type, { docsPath }) {
      super([
        `Type "${type}" is not a valid encoding type.`,
        "Please provide a valid ABI type."
      ].join(`
`), { docsPath, name: "InvalidAbiEncodingType" });
    }
  };
  InvalidAbiDecodingTypeError = class InvalidAbiDecodingTypeError extends BaseError2 {
    constructor(type, { docsPath }) {
      super([
        `Type "${type}" is not a valid decoding type.`,
        "Please provide a valid ABI type."
      ].join(`
`), { docsPath, name: "InvalidAbiDecodingType" });
    }
  };
  InvalidArrayError = class InvalidArrayError extends BaseError2 {
    constructor(value) {
      super([`Value "${value}" is not a valid array.`].join(`
`), {
        name: "InvalidArrayError"
      });
    }
  };
  InvalidDefinitionTypeError = class InvalidDefinitionTypeError extends BaseError2 {
    constructor(type) {
      super([
        `"${type}" is not a valid definition type.`,
        'Valid types: "function", "event", "error"'
      ].join(`
`), { name: "InvalidDefinitionTypeError" });
    }
  };
});

// node_modules/viem/_esm/errors/log.js
var FilterTypeNotSupportedError;
var init_log = __esm(() => {
  init_base();
  FilterTypeNotSupportedError = class FilterTypeNotSupportedError extends BaseError2 {
    constructor(type) {
      super(`Filter type "${type}" is not supported.`, {
        name: "FilterTypeNotSupportedError"
      });
    }
  };
});

// node_modules/viem/_esm/errors/data.js
var SliceOffsetOutOfBoundsError, SizeExceedsPaddingSizeError, InvalidBytesLengthError;
var init_data = __esm(() => {
  init_base();
  SliceOffsetOutOfBoundsError = class SliceOffsetOutOfBoundsError extends BaseError2 {
    constructor({ offset, position, size: size2 }) {
      super(`Slice ${position === "start" ? "starting" : "ending"} at offset "${offset}" is out-of-bounds (size: ${size2}).`, { name: "SliceOffsetOutOfBoundsError" });
    }
  };
  SizeExceedsPaddingSizeError = class SizeExceedsPaddingSizeError extends BaseError2 {
    constructor({ size: size2, targetSize, type }) {
      super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size2}) exceeds padding size (${targetSize}).`, { name: "SizeExceedsPaddingSizeError" });
    }
  };
  InvalidBytesLengthError = class InvalidBytesLengthError extends BaseError2 {
    constructor({ size: size2, targetSize, type }) {
      super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} is expected to be ${targetSize} ${type} long, but is ${size2} ${type} long.`, { name: "InvalidBytesLengthError" });
    }
  };
});

// node_modules/viem/_esm/utils/data/pad.js
function pad(hexOrBytes, { dir, size: size2 = 32 } = {}) {
  if (typeof hexOrBytes === "string")
    return padHex(hexOrBytes, { dir, size: size2 });
  return padBytes(hexOrBytes, { dir, size: size2 });
}
function padHex(hex_, { dir, size: size2 = 32 } = {}) {
  if (size2 === null)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size2 * 2)
    throw new SizeExceedsPaddingSizeError({
      size: Math.ceil(hex.length / 2),
      targetSize: size2,
      type: "hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size2 * 2, "0")}`;
}
function padBytes(bytes, { dir, size: size2 = 32 } = {}) {
  if (size2 === null)
    return bytes;
  if (bytes.length > size2)
    throw new SizeExceedsPaddingSizeError({
      size: bytes.length,
      targetSize: size2,
      type: "bytes"
    });
  const paddedBytes = new Uint8Array(size2);
  for (let i = 0;i < size2; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size2 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
var init_pad = __esm(() => {
  init_data();
});

// node_modules/viem/_esm/errors/encoding.js
var IntegerOutOfRangeError, InvalidBytesBooleanError, InvalidHexBooleanError, SizeOverflowError;
var init_encoding = __esm(() => {
  init_base();
  IntegerOutOfRangeError = class IntegerOutOfRangeError extends BaseError2 {
    constructor({ max, min, signed, size: size2, value }) {
      super(`Number "${value}" is not in safe ${size2 ? `${size2 * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: "IntegerOutOfRangeError" });
    }
  };
  InvalidBytesBooleanError = class InvalidBytesBooleanError extends BaseError2 {
    constructor(bytes) {
      super(`Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`, {
        name: "InvalidBytesBooleanError"
      });
    }
  };
  InvalidHexBooleanError = class InvalidHexBooleanError extends BaseError2 {
    constructor(hex) {
      super(`Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, { name: "InvalidHexBooleanError" });
    }
  };
  SizeOverflowError = class SizeOverflowError extends BaseError2 {
    constructor({ givenSize, maxSize }) {
      super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: "SizeOverflowError" });
    }
  };
});

// node_modules/viem/_esm/utils/data/trim.js
function trim(hexOrBytes, { dir = "left" } = {}) {
  let data = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;
  let sliceLength = 0;
  for (let i = 0;i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (typeof hexOrBytes === "string") {
    if (data.length === 1 && dir === "right")
      data = `${data}0`;
    return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
  }
  return data;
}

// node_modules/viem/_esm/utils/encoding/fromHex.js
function assertSize(hexOrBytes, { size: size2 }) {
  if (size(hexOrBytes) > size2)
    throw new SizeOverflowError({
      givenSize: size(hexOrBytes),
      maxSize: size2
    });
}
function hexToBigInt(hex, opts = {}) {
  const { signed } = opts;
  if (opts.size)
    assertSize(hex, { size: opts.size });
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size2 = (hex.length - 2) / 2;
  const max = (1n << BigInt(size2) * 8n - 1n) - 1n;
  if (value <= max)
    return value;
  return value - BigInt(`0x${"f".padStart(size2 * 2, "f")}`) - 1n;
}
function hexToBool(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = trim(hex);
  }
  if (trim(hex) === "0x00")
    return false;
  if (trim(hex) === "0x01")
    return true;
  throw new InvalidHexBooleanError(hex);
}
function hexToNumber(hex, opts = {}) {
  return Number(hexToBigInt(hex, opts));
}
var init_fromHex = __esm(() => {
  init_encoding();
  init_size();
});

// node_modules/viem/_esm/utils/encoding/toHex.js
function toHex(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToHex(value, opts);
  if (typeof value === "string") {
    return stringToHex(value, opts);
  }
  if (typeof value === "boolean")
    return boolToHex(value, opts);
  return bytesToHex(value, opts);
}
function boolToHex(value, opts = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { size: opts.size });
  }
  return hex;
}
function bytesToHex(value, opts = {}) {
  let string = "";
  for (let i = 0;i < value.length; i++) {
    string += hexes[value[i]];
  }
  const hex = `0x${string}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { dir: "right", size: opts.size });
  }
  return hex;
}
function numberToHex(value_, opts = {}) {
  const { signed, size: size2 } = opts;
  const value = BigInt(value_);
  let maxValue;
  if (size2) {
    if (signed)
      maxValue = (1n << BigInt(size2) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size2) * 8n) - 1n;
  } else if (typeof value_ === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value > maxValue || value < minValue) {
    const suffix = typeof value_ === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError({
      max: maxValue ? `${maxValue}${suffix}` : undefined,
      min: `${minValue}${suffix}`,
      signed,
      size: size2,
      value: `${value_}${suffix}`
    });
  }
  const hex = `0x${(signed && value < 0 ? (1n << BigInt(size2 * 8)) + BigInt(value) : value).toString(16)}`;
  if (size2)
    return pad(hex, { size: size2 });
  return hex;
}
function stringToHex(value_, opts = {}) {
  const value = encoder.encode(value_);
  return bytesToHex(value, opts);
}
var hexes, encoder;
var init_toHex = __esm(() => {
  init_encoding();
  init_pad();
  init_fromHex();
  hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
  encoder = /* @__PURE__ */ new TextEncoder;
});

// node_modules/viem/_esm/utils/encoding/toBytes.js
function toBytes(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToBytes(value, opts);
  if (typeof value === "boolean")
    return boolToBytes(value, opts);
  if (isHex(value))
    return hexToBytes(value, opts);
  return stringToBytes(value, opts);
}
function boolToBytes(value, opts = {}) {
  const bytes = new Uint8Array(1);
  bytes[0] = Number(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { size: opts.size });
  }
  return bytes;
}
function charCodeToBase16(char) {
  if (char >= charCodeMap.zero && char <= charCodeMap.nine)
    return char - charCodeMap.zero;
  if (char >= charCodeMap.A && char <= charCodeMap.F)
    return char - (charCodeMap.A - 10);
  if (char >= charCodeMap.a && char <= charCodeMap.f)
    return char - (charCodeMap.a - 10);
  return;
}
function hexToBytes(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = pad(hex, { dir: "right", size: opts.size });
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index = 0, j = 0;index < length; index++) {
    const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
    if (nibbleLeft === undefined || nibbleRight === undefined) {
      throw new BaseError2(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index] = nibbleLeft * 16 + nibbleRight;
  }
  return bytes;
}
function numberToBytes(value, opts) {
  const hex = numberToHex(value, opts);
  return hexToBytes(hex);
}
function stringToBytes(value, opts = {}) {
  const bytes = encoder2.encode(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { dir: "right", size: opts.size });
  }
  return bytes;
}
var encoder2, charCodeMap;
var init_toBytes = __esm(() => {
  init_base();
  init_pad();
  init_fromHex();
  init_toHex();
  encoder2 = /* @__PURE__ */ new TextEncoder;
  charCodeMap = {
    zero: 48,
    nine: 57,
    A: 65,
    F: 70,
    a: 97,
    f: 102
  };
});

// node_modules/viem/node_modules/@noble/hashes/esm/_u64.js
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0;i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var U32_MASK64, _32n, rotlSH = (h, l, s) => h << s | l >>> 32 - s, rotlSL = (h, l, s) => l << s | h >>> 32 - s, rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s, rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
var init__u64 = __esm(() => {
  U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
  _32n = /* @__PURE__ */ BigInt(32);
});

// node_modules/viem/node_modules/@noble/hashes/esm/cryptoNode.js
import * as nc from "node:crypto";
var crypto2;
var init_cryptoNode = __esm(() => {
  crypto2 = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : nc && typeof nc === "object" && ("randomBytes" in nc) ? nc : undefined;
});

// node_modules/viem/node_modules/@noble/hashes/esm/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0;i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0;i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0;i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0;i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}

class Hash {
}
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto2 && typeof crypto2.getRandomValues === "function") {
    return crypto2.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto2 && typeof crypto2.randomBytes === "function") {
    return Uint8Array.from(crypto2.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}
var isLE, swap32IfBE;
var init_utils2 = __esm(() => {
  init_cryptoNode();
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
  swap32IfBE = isLE ? (u) => u : byteSwap32;
});

// node_modules/viem/node_modules/@noble/hashes/esm/sha3.js
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds;round < 24; round++) {
    for (let x = 0;x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0;x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0;y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0;t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0;y < 50; y += 10) {
      for (let x = 0;x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0;x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean(B);
}
var _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_PI, SHA3_ROTL, _SHA3_IOTA, IOTAS, SHA3_IOTA_H, SHA3_IOTA_L, rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s), rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s), Keccak, gen = (suffix, blockLen, outputLen) => createHasher(() => new Keccak(blockLen, suffix, outputLen)), keccak_256;
var init_sha3 = __esm(() => {
  init__u64();
  init_utils2();
  _0n = BigInt(0);
  _1n = BigInt(1);
  _2n = BigInt(2);
  _7n = BigInt(7);
  _256n = BigInt(256);
  _0x71n = BigInt(113);
  SHA3_PI = [];
  SHA3_ROTL = [];
  _SHA3_IOTA = [];
  for (let round = 0, R = _1n, x = 1, y = 0;round < 24; round++) {
    [x, y] = [y, (2 * x + 3 * y) % 5];
    SHA3_PI.push(2 * (5 * y + x));
    SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
    let t = _0n;
    for (let j = 0;j < 7; j++) {
      R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
      if (R & _2n)
        t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
    }
    _SHA3_IOTA.push(t);
  }
  IOTAS = split(_SHA3_IOTA, true);
  SHA3_IOTA_H = IOTAS[0];
  SHA3_IOTA_L = IOTAS[1];
  Keccak = class Keccak extends Hash {
    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
      super();
      this.pos = 0;
      this.posOut = 0;
      this.finished = false;
      this.destroyed = false;
      this.enableXOF = false;
      this.blockLen = blockLen;
      this.suffix = suffix;
      this.outputLen = outputLen;
      this.enableXOF = enableXOF;
      this.rounds = rounds;
      anumber(outputLen);
      if (!(0 < blockLen && blockLen < 200))
        throw new Error("only keccak-f1600 function is supported");
      this.state = new Uint8Array(200);
      this.state32 = u32(this.state);
    }
    clone() {
      return this._cloneInto();
    }
    keccak() {
      swap32IfBE(this.state32);
      keccakP(this.state32, this.rounds);
      swap32IfBE(this.state32);
      this.posOut = 0;
      this.pos = 0;
    }
    update(data) {
      aexists(this);
      data = toBytes2(data);
      abytes(data);
      const { blockLen, state } = this;
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        for (let i = 0;i < take; i++)
          state[this.pos++] ^= data[pos++];
        if (this.pos === blockLen)
          this.keccak();
      }
      return this;
    }
    finish() {
      if (this.finished)
        return;
      this.finished = true;
      const { state, suffix, pos, blockLen } = this;
      state[pos] ^= suffix;
      if ((suffix & 128) !== 0 && pos === blockLen - 1)
        this.keccak();
      state[blockLen - 1] ^= 128;
      this.keccak();
    }
    writeInto(out) {
      aexists(this, false);
      abytes(out);
      this.finish();
      const bufferOut = this.state;
      const { blockLen } = this;
      for (let pos = 0, len = out.length;pos < len; ) {
        if (this.posOut >= blockLen)
          this.keccak();
        const take = Math.min(blockLen - this.posOut, len - pos);
        out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
        this.posOut += take;
        pos += take;
      }
      return out;
    }
    xofInto(out) {
      if (!this.enableXOF)
        throw new Error("XOF is not possible for this instance");
      return this.writeInto(out);
    }
    xof(bytes) {
      anumber(bytes);
      return this.xofInto(new Uint8Array(bytes));
    }
    digestInto(out) {
      aoutput(out, this);
      if (this.finished)
        throw new Error("digest() was already called");
      this.writeInto(out);
      this.destroy();
      return out;
    }
    digest() {
      return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
      this.destroyed = true;
      clean(this.state);
    }
    _cloneInto(to) {
      const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
      to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
      to.state32.set(this.state32);
      to.pos = this.pos;
      to.posOut = this.posOut;
      to.finished = this.finished;
      to.rounds = rounds;
      to.suffix = suffix;
      to.outputLen = outputLen;
      to.enableXOF = enableXOF;
      to.destroyed = this.destroyed;
      return to;
    }
  };
  keccak_256 = /* @__PURE__ */ (() => gen(1, 136, 256 / 8))();
});

// node_modules/viem/_esm/utils/hash/keccak256.js
function keccak256(value, to_) {
  const to = to_ || "hex";
  const bytes = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
var init_keccak256 = __esm(() => {
  init_sha3();
  init_toBytes();
  init_toHex();
});

// node_modules/viem/_esm/utils/hash/hashSignature.js
function hashSignature(sig) {
  return hash(sig);
}
var hash = (value) => keccak256(toBytes(value));
var init_hashSignature = __esm(() => {
  init_toBytes();
  init_keccak256();
});

// node_modules/viem/_esm/utils/hash/normalizeSignature.js
function normalizeSignature(signature) {
  let active = true;
  let current = "";
  let level = 0;
  let result = "";
  let valid = false;
  for (let i = 0;i < signature.length; i++) {
    const char = signature[i];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level++;
    if (char === ")")
      level--;
    if (!active)
      continue;
    if (level === 0) {
      if (char === " " && ["event", "function", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError2("Unable to normalize signature.");
  return result;
}
var init_normalizeSignature = __esm(() => {
  init_base();
});

// node_modules/viem/_esm/utils/hash/toSignature.js
var toSignature = (def) => {
  const def_ = (() => {
    if (typeof def === "string")
      return def;
    return formatAbiItem(def);
  })();
  return normalizeSignature(def_);
};
var init_toSignature = __esm(() => {
  init_exports();
  init_normalizeSignature();
});

// node_modules/viem/_esm/utils/hash/toSignatureHash.js
function toSignatureHash(fn) {
  return hashSignature(toSignature(fn));
}
var init_toSignatureHash = __esm(() => {
  init_hashSignature();
  init_toSignature();
});

// node_modules/viem/_esm/utils/hash/toEventSelector.js
var toEventSelector;
var init_toEventSelector = __esm(() => {
  init_toSignatureHash();
  toEventSelector = toSignatureHash;
});

// node_modules/viem/_esm/errors/address.js
var InvalidAddressError;
var init_address = __esm(() => {
  init_base();
  InvalidAddressError = class InvalidAddressError extends BaseError2 {
    constructor({ address }) {
      super(`Address "${address}" is invalid.`, {
        metaMessages: [
          "- Address must be a hex value of 20 bytes (40 hex characters).",
          "- Address must match its checksum counterpart."
        ],
        name: "InvalidAddressError"
      });
    }
  };
});

// node_modules/viem/_esm/utils/lru.js
var LruMap;
var init_lru = __esm(() => {
  LruMap = class LruMap extends Map {
    constructor(size2) {
      super();
      Object.defineProperty(this, "maxSize", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.maxSize = size2;
    }
    get(key) {
      const value = super.get(key);
      if (super.has(key) && value !== undefined) {
        this.delete(key);
        super.set(key, value);
      }
      return value;
    }
    set(key, value) {
      super.set(key, value);
      if (this.maxSize && this.size > this.maxSize) {
        const firstKey = this.keys().next().value;
        if (firstKey)
          this.delete(firstKey);
      }
      return this;
    }
  };
});

// node_modules/viem/_esm/utils/address/getAddress.js
function checksumAddress(address_, chainId) {
  if (checksumAddressCache.has(`${address_}.${chainId}`))
    return checksumAddressCache.get(`${address_}.${chainId}`);
  const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
  const hash2 = keccak256(stringToBytes(hexAddress), "bytes");
  const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
  for (let i = 0;i < 40; i += 2) {
    if (hash2[i >> 1] >> 4 >= 8 && address[i]) {
      address[i] = address[i].toUpperCase();
    }
    if ((hash2[i >> 1] & 15) >= 8 && address[i + 1]) {
      address[i + 1] = address[i + 1].toUpperCase();
    }
  }
  const result = `0x${address.join("")}`;
  checksumAddressCache.set(`${address_}.${chainId}`, result);
  return result;
}
function getAddress(address, chainId) {
  if (!isAddress(address, { strict: false }))
    throw new InvalidAddressError({ address });
  return checksumAddress(address, chainId);
}
var checksumAddressCache;
var init_getAddress = __esm(() => {
  init_address();
  init_toBytes();
  init_keccak256();
  init_lru();
  init_isAddress();
  checksumAddressCache = /* @__PURE__ */ new LruMap(8192);
});

// node_modules/viem/_esm/utils/address/isAddress.js
function isAddress(address, options) {
  const { strict = true } = options ?? {};
  const cacheKey = `${address}.${strict}`;
  if (isAddressCache.has(cacheKey))
    return isAddressCache.get(cacheKey);
  const result = (() => {
    if (!addressRegex.test(address))
      return false;
    if (address.toLowerCase() === address)
      return true;
    if (strict)
      return checksumAddress(address) === address;
    return true;
  })();
  isAddressCache.set(cacheKey, result);
  return result;
}
var addressRegex, isAddressCache;
var init_isAddress = __esm(() => {
  init_lru();
  init_getAddress();
  addressRegex = /^0x[a-fA-F0-9]{40}$/;
  isAddressCache = /* @__PURE__ */ new LruMap(8192);
});

// node_modules/viem/_esm/utils/data/concat.js
function concat(values) {
  if (typeof values[0] === "string")
    return concatHex(values);
  return concatBytes2(values);
}
function concatBytes2(values) {
  let length = 0;
  for (const arr of values) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of values) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
function concatHex(values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}

// node_modules/viem/_esm/utils/data/slice.js
function slice(value, start, end, { strict } = {}) {
  if (isHex(value, { strict: false }))
    return sliceHex(value, start, end, {
      strict
    });
  return sliceBytes(value, start, end, {
    strict
  });
}
function assertStartOffset(value, start) {
  if (typeof start === "number" && start > 0 && start > size(value) - 1)
    throw new SliceOffsetOutOfBoundsError({
      offset: start,
      position: "start",
      size: size(value)
    });
}
function assertEndOffset(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError({
      offset: end,
      position: "end",
      size: size(value)
    });
  }
}
function sliceBytes(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = value_.slice(start, end);
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
function sliceHex(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = `0x${value_.replace("0x", "").slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
var init_slice = __esm(() => {
  init_data();
  init_size();
});

// node_modules/viem/_esm/utils/regex.js
var bytesRegex2, integerRegex2;
var init_regex2 = __esm(() => {
  bytesRegex2 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
  integerRegex2 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
});

// node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
function encodeAbiParameters(params, values) {
  if (params.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: params.length,
      givenLength: values.length
    });
  const preparedParams = prepareParams({
    params,
    values
  });
  const data = encodeParams(preparedParams);
  if (data.length === 0)
    return "0x";
  return data;
}
function prepareParams({ params, values }) {
  const preparedParams = [];
  for (let i = 0;i < params.length; i++) {
    preparedParams.push(prepareParam({ param: params[i], value: values[i] }));
  }
  return preparedParams;
}
function prepareParam({ param, value }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray(value, { length, param: { ...param, type } });
  }
  if (param.type === "tuple") {
    return encodeTuple(value, {
      param
    });
  }
  if (param.type === "address") {
    return encodeAddress(value);
  }
  if (param.type === "bool") {
    return encodeBool(value);
  }
  if (param.type.startsWith("uint") || param.type.startsWith("int")) {
    const signed = param.type.startsWith("int");
    const [, , size2 = "256"] = integerRegex2.exec(param.type) ?? [];
    return encodeNumber(value, {
      signed,
      size: Number(size2)
    });
  }
  if (param.type.startsWith("bytes")) {
    return encodeBytes(value, { param });
  }
  if (param.type === "string") {
    return encodeString(value);
  }
  throw new InvalidAbiEncodingTypeError(param.type, {
    docsPath: "/docs/contract/encodeAbiParameters"
  });
}
function encodeParams(preparedParams) {
  let staticSize = 0;
  for (let i = 0;i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size(encoded);
  }
  const staticParams = [];
  const dynamicParams = [];
  let dynamicSize = 0;
  for (let i = 0;i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i];
    if (dynamic) {
      staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }));
      dynamicParams.push(encoded);
      dynamicSize += size(encoded);
    } else {
      staticParams.push(encoded);
    }
  }
  return concat([...staticParams, ...dynamicParams]);
}
function encodeAddress(value) {
  if (!isAddress(value))
    throw new InvalidAddressError({ address: value });
  return { dynamic: false, encoded: padHex(value.toLowerCase()) };
}
function encodeArray(value, { length, param }) {
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError(value);
  if (!dynamic && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${param.type}[${length}]`
    });
  let dynamicChild = false;
  const preparedParams = [];
  for (let i = 0;i < value.length; i++) {
    const preparedParam = prepareParam({ param, value: value[i] });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParams.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encodeParams(preparedParams);
    if (dynamic) {
      const length2 = numberToHex(preparedParams.length, { size: 32 });
      return {
        dynamic: true,
        encoded: preparedParams.length > 0 ? concat([length2, data]) : length2
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concat(preparedParams.map(({ encoded }) => encoded))
  };
}
function encodeBytes(value, { param }) {
  const [, paramSize] = param.type.split("bytes");
  const bytesSize = size(value);
  if (!paramSize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padHex(value_, {
        dir: "right",
        size: Math.ceil((value.length - 2) / 2 / 32) * 32
      });
    return {
      dynamic: true,
      encoded: concat([padHex(numberToHex(bytesSize, { size: 32 })), value_])
    };
  }
  if (bytesSize !== Number.parseInt(paramSize, 10))
    throw new AbiEncodingBytesSizeMismatchError({
      expectedSize: Number.parseInt(paramSize, 10),
      value
    });
  return { dynamic: false, encoded: padHex(value, { dir: "right" }) };
}
function encodeBool(value) {
  if (typeof value !== "boolean")
    throw new BaseError2(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padHex(boolToHex(value)) };
}
function encodeNumber(value, { signed, size: size2 = 256 }) {
  if (typeof size2 === "number") {
    const max = 2n ** (BigInt(size2) - (signed ? 1n : 0n)) - 1n;
    const min = signed ? -max - 1n : 0n;
    if (value > max || value < min)
      throw new IntegerOutOfRangeError({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size2 / 8,
        value: value.toString()
      });
  }
  return {
    dynamic: false,
    encoded: numberToHex(value, {
      size: 32,
      signed
    })
  };
}
function encodeString(value) {
  const hexValue = stringToHex(value);
  const partsLength = Math.ceil(size(hexValue) / 32);
  const parts = [];
  for (let i = 0;i < partsLength; i++) {
    parts.push(padHex(slice(hexValue, i * 32, (i + 1) * 32), {
      dir: "right"
    }));
  }
  return {
    dynamic: true,
    encoded: concat([
      padHex(numberToHex(size(hexValue), { size: 32 })),
      ...parts
    ])
  };
}
function encodeTuple(value, { param }) {
  let dynamic = false;
  const preparedParams = [];
  for (let i = 0;i < param.components.length; i++) {
    const param_ = param.components[i];
    const index = Array.isArray(value) ? i : param_.name;
    const preparedParam = prepareParam({
      param: param_,
      value: value[index]
    });
    preparedParams.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encodeParams(preparedParams) : concat(preparedParams.map(({ encoded }) => encoded))
  };
}
function getArrayComponents(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? [matches[2] ? Number(matches[2]) : null, matches[1]] : undefined;
}
var init_encodeAbiParameters = __esm(() => {
  init_abi();
  init_address();
  init_base();
  init_encoding();
  init_isAddress();
  init_pad();
  init_size();
  init_slice();
  init_toHex();
  init_regex2();
});

// node_modules/viem/_esm/utils/hash/toFunctionSelector.js
var toFunctionSelector = (fn) => slice(toSignatureHash(fn), 0, 4);
var init_toFunctionSelector = __esm(() => {
  init_slice();
  init_toSignatureHash();
});

// node_modules/viem/_esm/utils/abi/getAbiItem.js
function getAbiItem(parameters) {
  const { abi, args = [], name } = parameters;
  const isSelector = isHex(name, { strict: false });
  const abiItems = abi.filter((abiItem) => {
    if (isSelector) {
      if (abiItem.type === "function")
        return toFunctionSelector(abiItem) === name;
      if (abiItem.type === "event")
        return toEventSelector(abiItem) === name;
      return false;
    }
    return "name" in abiItem && abiItem.name === name;
  });
  if (abiItems.length === 0)
    return;
  if (abiItems.length === 1)
    return abiItems[0];
  let matchedAbiItem;
  for (const abiItem of abiItems) {
    if (!("inputs" in abiItem))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0)
        return abiItem;
      continue;
    }
    if (!abiItem.inputs)
      continue;
    if (abiItem.inputs.length === 0)
      continue;
    if (abiItem.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index) => {
      const abiParameter = "inputs" in abiItem && abiItem.inputs[index];
      if (!abiParameter)
        return false;
      return isArgOfType(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AbiItemAmbiguityError({
            abiItem,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem;
    }
  }
  if (matchedAbiItem)
    return matchedAbiItem;
  return abiItems[0];
}
function isArgOfType(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return isAddress(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index) => {
          return isArgOfType(Object.values(arg)[index], component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
        return argType === "number" || argType === "bigint";
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === "string" || arg instanceof Uint8Array;
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return Array.isArray(arg) && arg.every((x) => isArgOfType(x, {
          ...abiParameter,
          type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
        }));
      }
      return false;
    }
  }
}
function getAmbiguousTypes(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
      return getAmbiguousTypes(sourceParameter.components, targetParameter.components, args[parameterIndex]);
    const types = [sourceParameter.type, targetParameter.type];
    const ambiguous = (() => {
      if (types.includes("address") && types.includes("bytes20"))
        return true;
      if (types.includes("address") && types.includes("string"))
        return isAddress(args[parameterIndex], { strict: false });
      if (types.includes("address") && types.includes("bytes"))
        return isAddress(args[parameterIndex], { strict: false });
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
var init_getAbiItem = __esm(() => {
  init_abi();
  init_isAddress();
  init_toEventSelector();
  init_toFunctionSelector();
});

// node_modules/viem/_esm/utils/abi/encodeEventTopics.js
function encodeEventTopics(parameters) {
  const { abi, eventName, args } = parameters;
  let abiItem = abi[0];
  if (eventName) {
    const item = getAbiItem({ abi, name: eventName });
    if (!item)
      throw new AbiEventNotFoundError(eventName, { docsPath });
    abiItem = item;
  }
  if (abiItem.type !== "event")
    throw new AbiEventNotFoundError(undefined, { docsPath });
  const definition = formatAbiItem2(abiItem);
  const signature = toEventSelector(definition);
  let topics = [];
  if (args && "inputs" in abiItem) {
    const indexedInputs = abiItem.inputs?.filter((param) => ("indexed" in param) && param.indexed);
    const args_ = Array.isArray(args) ? args : Object.values(args).length > 0 ? indexedInputs?.map((x) => args[x.name]) ?? [] : [];
    if (args_.length > 0) {
      topics = indexedInputs?.map((param, i) => {
        if (Array.isArray(args_[i]))
          return args_[i].map((_, j) => encodeArg({ param, value: args_[i][j] }));
        return typeof args_[i] !== "undefined" && args_[i] !== null ? encodeArg({ param, value: args_[i] }) : null;
      }) ?? [];
    }
  }
  return [signature, ...topics];
}
function encodeArg({ param, value }) {
  if (param.type === "string" || param.type === "bytes")
    return keccak256(toBytes(value));
  if (param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    throw new FilterTypeNotSupportedError(param.type);
  return encodeAbiParameters([param], [value]);
}
var docsPath = "/docs/contract/encodeEventTopics";
var init_encodeEventTopics = __esm(() => {
  init_abi();
  init_log();
  init_toBytes();
  init_keccak256();
  init_toEventSelector();
  init_encodeAbiParameters();
  init_formatAbiItem2();
  init_getAbiItem();
});

// node_modules/viem/_esm/utils/filters/createFilterRequestScope.js
function createFilterRequestScope(client, { method }) {
  const requestMap = {};
  if (client.transport.type === "fallback")
    client.transport.onResponse?.(({ method: method_, response: id, status, transport }) => {
      if (status === "success" && method === method_)
        requestMap[id] = transport.request;
    });
  return (id) => requestMap[id] || client.request;
}

// node_modules/viem/_esm/actions/public/createContractEventFilter.js
async function createContractEventFilter(client, parameters) {
  const { address, abi, args, eventName, fromBlock, strict, toBlock } = parameters;
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  const topics = eventName ? encodeEventTopics({
    abi,
    args,
    eventName
  }) : undefined;
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        topics
      }
    ]
  });
  return {
    abi,
    args,
    eventName,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    type: "event"
  };
}
var init_createContractEventFilter = __esm(() => {
  init_encodeEventTopics();
  init_toHex();
});

// node_modules/viem/_esm/accounts/utils/parseAccount.js
function parseAccount(account) {
  if (typeof account === "string")
    return { address: account, type: "json-rpc" };
  return account;
}

// node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js
function prepareEncodeFunctionData(parameters) {
  const { abi, args, functionName } = parameters;
  let abiItem = abi[0];
  if (functionName) {
    const item = getAbiItem({
      abi,
      args,
      name: functionName
    });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath2 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(undefined, { docsPath: docsPath2 });
  return {
    abi: [abiItem],
    functionName: toFunctionSelector(formatAbiItem2(abiItem))
  };
}
var docsPath2 = "/docs/contract/encodeFunctionData";
var init_prepareEncodeFunctionData = __esm(() => {
  init_abi();
  init_toFunctionSelector();
  init_formatAbiItem2();
  init_getAbiItem();
});

// node_modules/viem/_esm/utils/abi/encodeFunctionData.js
function encodeFunctionData(parameters) {
  const { args } = parameters;
  const { abi, functionName } = (() => {
    if (parameters.abi.length === 1 && parameters.functionName?.startsWith("0x"))
      return parameters;
    return prepareEncodeFunctionData(parameters);
  })();
  const abiItem = abi[0];
  const signature = functionName;
  const data = "inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : undefined;
  return concatHex([signature, data ?? "0x"]);
}
var init_encodeFunctionData = __esm(() => {
  init_encodeAbiParameters();
  init_prepareEncodeFunctionData();
});

// node_modules/viem/_esm/constants/solidity.js
var panicReasons, solidityError, solidityPanic;
var init_solidity = __esm(() => {
  panicReasons = {
    1: "An `assert` condition failed.",
    17: "Arithmetic operation resulted in underflow or overflow.",
    18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).",
    33: "Attempted to convert to an invalid type.",
    34: "Attempted to access a storage byte array that is incorrectly encoded.",
    49: "Performed `.pop()` on an empty array",
    50: "Array index is out of bounds.",
    65: "Allocated too much memory or created an array which is too large.",
    81: "Attempted to call a zero-initialized variable of internal function type."
  };
  solidityError = {
    inputs: [
      {
        name: "message",
        type: "string"
      }
    ],
    name: "Error",
    type: "error"
  };
  solidityPanic = {
    inputs: [
      {
        name: "reason",
        type: "uint256"
      }
    ],
    name: "Panic",
    type: "error"
  };
});

// node_modules/viem/_esm/errors/cursor.js
var NegativeOffsetError, PositionOutOfBoundsError, RecursiveReadLimitExceededError;
var init_cursor = __esm(() => {
  init_base();
  NegativeOffsetError = class NegativeOffsetError extends BaseError2 {
    constructor({ offset }) {
      super(`Offset \`${offset}\` cannot be negative.`, {
        name: "NegativeOffsetError"
      });
    }
  };
  PositionOutOfBoundsError = class PositionOutOfBoundsError extends BaseError2 {
    constructor({ length, position }) {
      super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`, { name: "PositionOutOfBoundsError" });
    }
  };
  RecursiveReadLimitExceededError = class RecursiveReadLimitExceededError extends BaseError2 {
    constructor({ count, limit }) {
      super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`, { name: "RecursiveReadLimitExceededError" });
    }
  };
});

// node_modules/viem/_esm/utils/cursor.js
function createCursor(bytes, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor);
  cursor.bytes = bytes;
  cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  cursor.positionReadCount = new Map;
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
var staticCursor;
var init_cursor2 = __esm(() => {
  init_cursor();
  staticCursor = {
    bytes: new Uint8Array,
    dataView: new DataView(new ArrayBuffer(0)),
    position: 0,
    positionReadCount: new Map,
    recursiveReadCount: 0,
    recursiveReadLimit: Number.POSITIVE_INFINITY,
    assertReadLimit() {
      if (this.recursiveReadCount >= this.recursiveReadLimit)
        throw new RecursiveReadLimitExceededError({
          count: this.recursiveReadCount + 1,
          limit: this.recursiveReadLimit
        });
    },
    assertPosition(position) {
      if (position < 0 || position > this.bytes.length - 1)
        throw new PositionOutOfBoundsError({
          length: this.bytes.length,
          position
        });
    },
    decrementPosition(offset) {
      if (offset < 0)
        throw new NegativeOffsetError({ offset });
      const position = this.position - offset;
      this.assertPosition(position);
      this.position = position;
    },
    getReadCount(position) {
      return this.positionReadCount.get(position || this.position) || 0;
    },
    incrementPosition(offset) {
      if (offset < 0)
        throw new NegativeOffsetError({ offset });
      const position = this.position + offset;
      this.assertPosition(position);
      this.position = position;
    },
    inspectByte(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position);
      return this.bytes[position];
    },
    inspectBytes(length, position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + length - 1);
      return this.bytes.subarray(position, position + length);
    },
    inspectUint8(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position);
      return this.bytes[position];
    },
    inspectUint16(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 1);
      return this.dataView.getUint16(position);
    },
    inspectUint24(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 2);
      return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
    },
    inspectUint32(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 3);
      return this.dataView.getUint32(position);
    },
    pushByte(byte) {
      this.assertPosition(this.position);
      this.bytes[this.position] = byte;
      this.position++;
    },
    pushBytes(bytes) {
      this.assertPosition(this.position + bytes.length - 1);
      this.bytes.set(bytes, this.position);
      this.position += bytes.length;
    },
    pushUint8(value) {
      this.assertPosition(this.position);
      this.bytes[this.position] = value;
      this.position++;
    },
    pushUint16(value) {
      this.assertPosition(this.position + 1);
      this.dataView.setUint16(this.position, value);
      this.position += 2;
    },
    pushUint24(value) {
      this.assertPosition(this.position + 2);
      this.dataView.setUint16(this.position, value >> 8);
      this.dataView.setUint8(this.position + 2, value & ~4294967040);
      this.position += 3;
    },
    pushUint32(value) {
      this.assertPosition(this.position + 3);
      this.dataView.setUint32(this.position, value);
      this.position += 4;
    },
    readByte() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectByte();
      this.position++;
      return value;
    },
    readBytes(length, size2) {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectBytes(length);
      this.position += size2 ?? length;
      return value;
    },
    readUint8() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint8();
      this.position += 1;
      return value;
    },
    readUint16() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint16();
      this.position += 2;
      return value;
    },
    readUint24() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint24();
      this.position += 3;
      return value;
    },
    readUint32() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint32();
      this.position += 4;
      return value;
    },
    get remaining() {
      return this.bytes.length - this.position;
    },
    setPosition(position) {
      const oldPosition = this.position;
      this.assertPosition(position);
      this.position = position;
      return () => this.position = oldPosition;
    },
    _touch() {
      if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
        return;
      const count = this.getReadCount();
      this.positionReadCount.set(this.position, count + 1);
      if (count > 0)
        this.recursiveReadCount++;
    }
  };
});

// node_modules/viem/_esm/utils/encoding/fromBytes.js
function bytesToBigInt(bytes, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes, { size: opts.size });
  const hex = bytesToHex(bytes, opts);
  return hexToBigInt(hex, opts);
}
function bytesToBool(bytes_, opts = {}) {
  let bytes = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes, { size: opts.size });
    bytes = trim(bytes);
  }
  if (bytes.length > 1 || bytes[0] > 1)
    throw new InvalidBytesBooleanError(bytes);
  return Boolean(bytes[0]);
}
function bytesToNumber(bytes, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes, { size: opts.size });
  const hex = bytesToHex(bytes, opts);
  return hexToNumber(hex, opts);
}
function bytesToString(bytes_, opts = {}) {
  let bytes = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes, { size: opts.size });
    bytes = trim(bytes, { dir: "right" });
  }
  return new TextDecoder().decode(bytes);
}
var init_fromBytes = __esm(() => {
  init_encoding();
  init_fromHex();
  init_toHex();
});

// node_modules/viem/_esm/utils/abi/decodeAbiParameters.js
function decodeAbiParameters(params, data) {
  const bytes = typeof data === "string" ? hexToBytes(data) : data;
  const cursor = createCursor(bytes);
  if (size(bytes) === 0 && params.length > 0)
    throw new AbiDecodingZeroDataError;
  if (size(data) && size(data) < 32)
    throw new AbiDecodingDataSizeTooSmallError({
      data: typeof data === "string" ? data : bytesToHex(data),
      params,
      size: size(data)
    });
  let consumed = 0;
  const values = [];
  for (let i = 0;i < params.length; ++i) {
    const param = params[i];
    cursor.setPosition(consumed);
    const [data2, consumed_] = decodeParameter(cursor, param, {
      staticPosition: 0
    });
    consumed += consumed_;
    values.push(data2);
  }
  return values;
}
function decodeParameter(cursor, param, { staticPosition }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return decodeArray(cursor, { ...param, type }, { length, staticPosition });
  }
  if (param.type === "tuple")
    return decodeTuple(cursor, param, { staticPosition });
  if (param.type === "address")
    return decodeAddress(cursor);
  if (param.type === "bool")
    return decodeBool(cursor);
  if (param.type.startsWith("bytes"))
    return decodeBytes(cursor, param, { staticPosition });
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return decodeNumber(cursor, param);
  if (param.type === "string")
    return decodeString(cursor, { staticPosition });
  throw new InvalidAbiDecodingTypeError(param.type, {
    docsPath: "/docs/contract/decodeAbiParameters"
  });
}
function decodeAddress(cursor) {
  const value = cursor.readBytes(32);
  return [checksumAddress(bytesToHex(sliceBytes(value, -20))), 32];
}
function decodeArray(cursor, param, { length, staticPosition }) {
  if (!length) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const startOfData = start + sizeOfLength;
    cursor.setPosition(start);
    const length2 = bytesToNumber(cursor.readBytes(sizeOfLength));
    const dynamicChild = hasDynamicChild(param);
    let consumed2 = 0;
    const value2 = [];
    for (let i = 0;i < length2; ++i) {
      cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
      const [data, consumed_] = decodeParameter(cursor, param, {
        staticPosition: startOfData
      });
      consumed2 += consumed_;
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const value2 = [];
    for (let i = 0;i < length; ++i) {
      cursor.setPosition(start + i * 32);
      const [data] = decodeParameter(cursor, param, {
        staticPosition: start
      });
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  let consumed = 0;
  const value = [];
  for (let i = 0;i < length; ++i) {
    const [data, consumed_] = decodeParameter(cursor, param, {
      staticPosition: staticPosition + consumed
    });
    consumed += consumed_;
    value.push(data);
  }
  return [value, consumed];
}
function decodeBool(cursor) {
  return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32];
}
function decodeBytes(cursor, param, { staticPosition }) {
  const [_, size2] = param.type.split("bytes");
  if (!size2) {
    const offset = bytesToNumber(cursor.readBytes(32));
    cursor.setPosition(staticPosition + offset);
    const length = bytesToNumber(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["0x", 32];
    }
    const data = cursor.readBytes(length);
    cursor.setPosition(staticPosition + 32);
    return [bytesToHex(data), 32];
  }
  const value = bytesToHex(cursor.readBytes(Number.parseInt(size2, 10), 32));
  return [value, 32];
}
function decodeNumber(cursor, param) {
  const signed = param.type.startsWith("int");
  const size2 = Number.parseInt(param.type.split("int")[1] || "256", 10);
  const value = cursor.readBytes(32);
  return [
    size2 > 48 ? bytesToBigInt(value, { signed }) : bytesToNumber(value, { signed }),
    32
  ];
}
function decodeTuple(cursor, param, { staticPosition }) {
  const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
  const value = hasUnnamedChild ? [] : {};
  let consumed = 0;
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    for (let i = 0;i < param.components.length; ++i) {
      const component = param.components[i];
      cursor.setPosition(start + consumed);
      const [data, consumed_] = decodeParameter(cursor, component, {
        staticPosition: start
      });
      consumed += consumed_;
      value[hasUnnamedChild ? i : component?.name] = data;
    }
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  for (let i = 0;i < param.components.length; ++i) {
    const component = param.components[i];
    const [data, consumed_] = decodeParameter(cursor, component, {
      staticPosition
    });
    value[hasUnnamedChild ? i : component?.name] = data;
    consumed += consumed_;
  }
  return [value, consumed];
}
function decodeString(cursor, { staticPosition }) {
  const offset = bytesToNumber(cursor.readBytes(32));
  const start = staticPosition + offset;
  cursor.setPosition(start);
  const length = bytesToNumber(cursor.readBytes(32));
  if (length === 0) {
    cursor.setPosition(staticPosition + 32);
    return ["", 32];
  }
  const data = cursor.readBytes(length, 32);
  const value = bytesToString(trim(data));
  cursor.setPosition(staticPosition + 32);
  return [value, 32];
}
function hasDynamicChild(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild);
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents && hasDynamicChild({ ...param, type: arrayComponents[1] }))
    return true;
  return false;
}
var sizeOfLength = 32, sizeOfOffset = 32;
var init_decodeAbiParameters = __esm(() => {
  init_abi();
  init_getAddress();
  init_cursor2();
  init_size();
  init_slice();
  init_fromBytes();
  init_toBytes();
  init_toHex();
  init_encodeAbiParameters();
});

// node_modules/viem/_esm/utils/abi/decodeErrorResult.js
function decodeErrorResult(parameters) {
  const { abi, data } = parameters;
  const signature = slice(data, 0, 4);
  if (signature === "0x")
    throw new AbiDecodingZeroDataError;
  const abi_ = [...abi || [], solidityError, solidityPanic];
  const abiItem = abi_.find((x) => x.type === "error" && signature === toFunctionSelector(formatAbiItem2(x)));
  if (!abiItem)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: "/docs/contract/decodeErrorResult"
    });
  return {
    abiItem,
    args: "inputs" in abiItem && abiItem.inputs && abiItem.inputs.length > 0 ? decodeAbiParameters(abiItem.inputs, slice(data, 4)) : undefined,
    errorName: abiItem.name
  };
}
var init_decodeErrorResult = __esm(() => {
  init_solidity();
  init_abi();
  init_slice();
  init_toFunctionSelector();
  init_decodeAbiParameters();
  init_formatAbiItem2();
});

// node_modules/viem/_esm/utils/stringify.js
var stringify = (value, replacer, space) => JSON.stringify(value, (key, value_) => {
  const value2 = typeof value_ === "bigint" ? value_.toString() : value_;
  return typeof replacer === "function" ? replacer(key, value2) : value2;
}, space);

// node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js
function formatAbiItemWithArgs({ abiItem, args, includeFunctionName = true, includeName = false }) {
  if (!("name" in abiItem))
    return;
  if (!("inputs" in abiItem))
    return;
  if (!abiItem.inputs)
    return;
  return `${includeFunctionName ? abiItem.name : ""}(${abiItem.inputs.map((input, i) => `${includeName && input.name ? `${input.name}: ` : ""}${typeof args[i] === "object" ? stringify(args[i]) : args[i]}`).join(", ")})`;
}
var init_formatAbiItemWithArgs = () => {};

// node_modules/viem/_esm/constants/unit.js
var etherUnits, gweiUnits;
var init_unit = __esm(() => {
  etherUnits = {
    gwei: 9,
    wei: 18
  };
  gweiUnits = {
    ether: -9,
    wei: 9
  };
});

// node_modules/viem/_esm/utils/unit/formatUnits.js
function formatUnits(value, decimals) {
  let display = value.toString();
  const negative = display.startsWith("-");
  if (negative)
    display = display.slice(1);
  display = display.padStart(decimals, "0");
  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals)
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}

// node_modules/viem/_esm/utils/unit/formatEther.js
function formatEther(wei, unit = "wei") {
  return formatUnits(wei, etherUnits[unit]);
}
var init_formatEther = __esm(() => {
  init_unit();
});

// node_modules/viem/_esm/utils/unit/formatGwei.js
function formatGwei(wei, unit = "wei") {
  return formatUnits(wei, gweiUnits[unit]);
}
var init_formatGwei = __esm(() => {
  init_unit();
});

// node_modules/viem/_esm/errors/stateOverride.js
function prettyStateMapping(stateMapping) {
  return stateMapping.reduce((pretty, { slot, value }) => {
    return `${pretty}        ${slot}: ${value}
`;
  }, "");
}
function prettyStateOverride(stateOverride) {
  return stateOverride.reduce((pretty, { address, ...state }) => {
    let val = `${pretty}    ${address}:
`;
    if (state.nonce)
      val += `      nonce: ${state.nonce}
`;
    if (state.balance)
      val += `      balance: ${state.balance}
`;
    if (state.code)
      val += `      code: ${state.code}
`;
    if (state.state) {
      val += `      state:
`;
      val += prettyStateMapping(state.state);
    }
    if (state.stateDiff) {
      val += `      stateDiff:
`;
      val += prettyStateMapping(state.stateDiff);
    }
    return val;
  }, `  State Override:
`).slice(0, -1);
}
var AccountStateConflictError, StateAssignmentConflictError;
var init_stateOverride = __esm(() => {
  init_base();
  AccountStateConflictError = class AccountStateConflictError extends BaseError2 {
    constructor({ address }) {
      super(`State for account "${address}" is set multiple times.`, {
        name: "AccountStateConflictError"
      });
    }
  };
  StateAssignmentConflictError = class StateAssignmentConflictError extends BaseError2 {
    constructor() {
      super("state and stateDiff are set on the same account.", {
        name: "StateAssignmentConflictError"
      });
    }
  };
});

// node_modules/viem/_esm/errors/transaction.js
function prettyPrint(args) {
  const entries = Object.entries(args).map(([key, value]) => {
    if (value === undefined || value === false)
      return null;
    return [key, value];
  }).filter(Boolean);
  const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
  return entries.map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join(`
`);
}
var FeeConflictError, InvalidLegacyVError, InvalidSerializableTransactionError, InvalidStorageKeySizeError, TransactionExecutionError, TransactionNotFoundError, TransactionReceiptNotFoundError, TransactionReceiptRevertedError, WaitForTransactionReceiptTimeoutError;
var init_transaction = __esm(() => {
  init_formatEther();
  init_formatGwei();
  init_base();
  FeeConflictError = class FeeConflictError extends BaseError2 {
    constructor() {
      super([
        "Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.",
        "Use `maxFeePerGas`/`maxPriorityFeePerGas` for EIP-1559 compatible networks, and `gasPrice` for others."
      ].join(`
`), { name: "FeeConflictError" });
    }
  };
  InvalidLegacyVError = class InvalidLegacyVError extends BaseError2 {
    constructor({ v }) {
      super(`Invalid \`v\` value "${v}". Expected 27 or 28.`, {
        name: "InvalidLegacyVError"
      });
    }
  };
  InvalidSerializableTransactionError = class InvalidSerializableTransactionError extends BaseError2 {
    constructor({ transaction }) {
      super("Cannot infer a transaction type from provided transaction.", {
        metaMessages: [
          "Provided Transaction:",
          "{",
          prettyPrint(transaction),
          "}",
          "",
          "To infer the type, either provide:",
          "- a `type` to the Transaction, or",
          "- an EIP-1559 Transaction with `maxFeePerGas`, or",
          "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
          "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
          "- an EIP-7702 Transaction with `authorizationList`, or",
          "- a Legacy Transaction with `gasPrice`"
        ],
        name: "InvalidSerializableTransactionError"
      });
    }
  };
  InvalidStorageKeySizeError = class InvalidStorageKeySizeError extends BaseError2 {
    constructor({ storageKey }) {
      super(`Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${Math.floor((storageKey.length - 2) / 2)} bytes.`, { name: "InvalidStorageKeySizeError" });
    }
  };
  TransactionExecutionError = class TransactionExecutionError extends BaseError2 {
    constructor(cause, { account, docsPath: docsPath3, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
      const prettyArgs = prettyPrint({
        chain: chain && `${chain?.name} (id: ${chain?.id})`,
        from: account?.address,
        to,
        value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
        data,
        gas,
        gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
        maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
        maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
        nonce
      });
      super(cause.shortMessage, {
        cause,
        docsPath: docsPath3,
        metaMessages: [
          ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
          "Request Arguments:",
          prettyArgs
        ].filter(Boolean),
        name: "TransactionExecutionError"
      });
      Object.defineProperty(this, "cause", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.cause = cause;
    }
  };
  TransactionNotFoundError = class TransactionNotFoundError extends BaseError2 {
    constructor({ blockHash, blockNumber, blockTag, hash: hash2, index }) {
      let identifier = "Transaction";
      if (blockTag && index !== undefined)
        identifier = `Transaction at block time "${blockTag}" at index "${index}"`;
      if (blockHash && index !== undefined)
        identifier = `Transaction at block hash "${blockHash}" at index "${index}"`;
      if (blockNumber && index !== undefined)
        identifier = `Transaction at block number "${blockNumber}" at index "${index}"`;
      if (hash2)
        identifier = `Transaction with hash "${hash2}"`;
      super(`${identifier} could not be found.`, {
        name: "TransactionNotFoundError"
      });
    }
  };
  TransactionReceiptNotFoundError = class TransactionReceiptNotFoundError extends BaseError2 {
    constructor({ hash: hash2 }) {
      super(`Transaction receipt with hash "${hash2}" could not be found. The Transaction may not be processed on a block yet.`, {
        name: "TransactionReceiptNotFoundError"
      });
    }
  };
  TransactionReceiptRevertedError = class TransactionReceiptRevertedError extends BaseError2 {
    constructor({ receipt }) {
      super(`Transaction with hash "${receipt.transactionHash}" reverted.`, {
        metaMessages: [
          'The receipt marked the transaction as "reverted". This could mean that the function on the contract you are trying to call threw an error.',
          " ",
          "You can attempt to extract the revert reason by:",
          "- calling the `simulateContract` or `simulateCalls` Action with the `abi` and `functionName` of the contract",
          "- using the `call` Action with raw `data`"
        ],
        name: "TransactionReceiptRevertedError"
      });
      Object.defineProperty(this, "receipt", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.receipt = receipt;
    }
  };
  WaitForTransactionReceiptTimeoutError = class WaitForTransactionReceiptTimeoutError extends BaseError2 {
    constructor({ hash: hash2 }) {
      super(`Timed out while waiting for transaction with hash "${hash2}" to be confirmed.`, { name: "WaitForTransactionReceiptTimeoutError" });
    }
  };
});

// node_modules/viem/_esm/errors/utils.js
var getContractAddress = (address) => address, getUrl = (url) => url;

// node_modules/viem/_esm/errors/contract.js
var CallExecutionError, ContractFunctionExecutionError, ContractFunctionRevertedError, ContractFunctionZeroDataError, CounterfactualDeploymentFailedError, RawContractError;
var init_contract = __esm(() => {
  init_solidity();
  init_decodeErrorResult();
  init_formatAbiItem2();
  init_formatAbiItemWithArgs();
  init_getAbiItem();
  init_formatEther();
  init_formatGwei();
  init_abi();
  init_base();
  init_stateOverride();
  init_transaction();
  CallExecutionError = class CallExecutionError extends BaseError2 {
    constructor(cause, { account: account_, docsPath: docsPath3, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride }) {
      const account = account_ ? parseAccount(account_) : undefined;
      let prettyArgs = prettyPrint({
        from: account?.address,
        to,
        value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
        data,
        gas,
        gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
        maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
        maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
        nonce
      });
      if (stateOverride) {
        prettyArgs += `
${prettyStateOverride(stateOverride)}`;
      }
      super(cause.shortMessage, {
        cause,
        docsPath: docsPath3,
        metaMessages: [
          ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
          "Raw Call Arguments:",
          prettyArgs
        ].filter(Boolean),
        name: "CallExecutionError"
      });
      Object.defineProperty(this, "cause", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.cause = cause;
    }
  };
  ContractFunctionExecutionError = class ContractFunctionExecutionError extends BaseError2 {
    constructor(cause, { abi, args, contractAddress, docsPath: docsPath3, functionName, sender }) {
      const abiItem = getAbiItem({ abi, args, name: functionName });
      const formattedArgs = abiItem ? formatAbiItemWithArgs({
        abiItem,
        args,
        includeFunctionName: false,
        includeName: false
      }) : undefined;
      const functionWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : undefined;
      const prettyArgs = prettyPrint({
        address: contractAddress && getContractAddress(contractAddress),
        function: functionWithParams,
        args: formattedArgs && formattedArgs !== "()" && `${[...Array(functionName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}`,
        sender
      });
      super(cause.shortMessage || `An unknown error occurred while executing the contract function "${functionName}".`, {
        cause,
        docsPath: docsPath3,
        metaMessages: [
          ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
          prettyArgs && "Contract Call:",
          prettyArgs
        ].filter(Boolean),
        name: "ContractFunctionExecutionError"
      });
      Object.defineProperty(this, "abi", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "args", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "cause", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "contractAddress", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "formattedArgs", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "functionName", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "sender", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.abi = abi;
      this.args = args;
      this.cause = cause;
      this.contractAddress = contractAddress;
      this.functionName = functionName;
      this.sender = sender;
    }
  };
  ContractFunctionRevertedError = class ContractFunctionRevertedError extends BaseError2 {
    constructor({ abi, data, functionName, message }) {
      let cause;
      let decodedData;
      let metaMessages;
      let reason;
      if (data && data !== "0x") {
        try {
          decodedData = decodeErrorResult({ abi, data });
          const { abiItem, errorName, args: errorArgs } = decodedData;
          if (errorName === "Error") {
            reason = errorArgs[0];
          } else if (errorName === "Panic") {
            const [firstArg] = errorArgs;
            reason = panicReasons[firstArg];
          } else {
            const errorWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : undefined;
            const formattedArgs = abiItem && errorArgs ? formatAbiItemWithArgs({
              abiItem,
              args: errorArgs,
              includeFunctionName: false,
              includeName: false
            }) : undefined;
            metaMessages = [
              errorWithParams ? `Error: ${errorWithParams}` : "",
              formattedArgs && formattedArgs !== "()" ? `       ${[...Array(errorName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}` : ""
            ];
          }
        } catch (err) {
          cause = err;
        }
      } else if (message)
        reason = message;
      let signature;
      if (cause instanceof AbiErrorSignatureNotFoundError) {
        signature = cause.signature;
        metaMessages = [
          `Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it.",
          `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`
        ];
      }
      super(reason && reason !== "execution reverted" || signature ? [
        `The contract function "${functionName}" reverted with the following ${signature ? "signature" : "reason"}:`,
        reason || signature
      ].join(`
`) : `The contract function "${functionName}" reverted.`, {
        cause,
        metaMessages,
        name: "ContractFunctionRevertedError"
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "raw", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "reason", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "signature", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.data = decodedData;
      this.raw = data;
      this.reason = reason;
      this.signature = signature;
    }
  };
  ContractFunctionZeroDataError = class ContractFunctionZeroDataError extends BaseError2 {
    constructor({ functionName }) {
      super(`The contract function "${functionName}" returned no data ("0x").`, {
        metaMessages: [
          "This could be due to any of the following:",
          `  - The contract does not have the function "${functionName}",`,
          "  - The parameters passed to the contract function may be invalid, or",
          "  - The address is not a contract."
        ],
        name: "ContractFunctionZeroDataError"
      });
    }
  };
  CounterfactualDeploymentFailedError = class CounterfactualDeploymentFailedError extends BaseError2 {
    constructor({ factory }) {
      super(`Deployment for counterfactual contract call failed${factory ? ` for factory "${factory}".` : ""}`, {
        metaMessages: [
          "Please ensure:",
          "- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).",
          "- The `factoryData` is a valid encoded function call for contract deployment function on the factory."
        ],
        name: "CounterfactualDeploymentFailedError"
      });
    }
  };
  RawContractError = class RawContractError extends BaseError2 {
    constructor({ data, message }) {
      super(message || "", { name: "RawContractError" });
      Object.defineProperty(this, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 3
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.data = data;
    }
  };
});

// node_modules/viem/_esm/errors/request.js
var HttpRequestError, RpcRequestError, TimeoutError;
var init_request = __esm(() => {
  init_base();
  HttpRequestError = class HttpRequestError extends BaseError2 {
    constructor({ body, cause, details, headers, status, url }) {
      super("HTTP request failed.", {
        cause,
        details,
        metaMessages: [
          status && `Status: ${status}`,
          `URL: ${getUrl(url)}`,
          body && `Request body: ${stringify(body)}`
        ].filter(Boolean),
        name: "HttpRequestError"
      });
      Object.defineProperty(this, "body", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "headers", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "status", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "url", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.body = body;
      this.headers = headers;
      this.status = status;
      this.url = url;
    }
  };
  RpcRequestError = class RpcRequestError extends BaseError2 {
    constructor({ body, error, url }) {
      super("RPC Request failed.", {
        cause: error,
        details: error.message,
        metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
        name: "RpcRequestError"
      });
      Object.defineProperty(this, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.code = error.code;
      this.data = error.data;
    }
  };
  TimeoutError = class TimeoutError extends BaseError2 {
    constructor({ body, url }) {
      super("The request took too long to respond.", {
        details: "The request timed out.",
        metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
        name: "TimeoutError"
      });
    }
  };
});

// node_modules/viem/_esm/errors/rpc.js
var unknownErrorCode = -1, RpcError, ProviderRpcError, ParseRpcError, InvalidRequestRpcError, MethodNotFoundRpcError, InvalidParamsRpcError, InternalRpcError, InvalidInputRpcError, ResourceNotFoundRpcError, ResourceUnavailableRpcError, TransactionRejectedRpcError, MethodNotSupportedRpcError, LimitExceededRpcError, JsonRpcVersionUnsupportedError, UserRejectedRequestError, UnauthorizedProviderError, UnsupportedProviderMethodError, ProviderDisconnectedError, ChainDisconnectedError, SwitchChainError, UnsupportedNonOptionalCapabilityError, UnsupportedChainIdError, DuplicateIdError, UnknownBundleIdError, BundleTooLargeError, AtomicReadyWalletRejectedUpgradeError, AtomicityNotSupportedError, UnknownRpcError;
var init_rpc = __esm(() => {
  init_base();
  init_request();
  RpcError = class RpcError extends BaseError2 {
    constructor(cause, { code, docsPath: docsPath3, metaMessages, name, shortMessage }) {
      super(shortMessage, {
        cause,
        docsPath: docsPath3,
        metaMessages: metaMessages || cause?.metaMessages,
        name: name || "RpcError"
      });
      Object.defineProperty(this, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.name = name || cause.name;
      this.code = cause instanceof RpcRequestError ? cause.code : code ?? unknownErrorCode;
    }
  };
  ProviderRpcError = class ProviderRpcError extends RpcError {
    constructor(cause, options) {
      super(cause, options);
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.data = options.data;
    }
  };
  ParseRpcError = class ParseRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: ParseRpcError.code,
        name: "ParseRpcError",
        shortMessage: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
      });
    }
  };
  Object.defineProperty(ParseRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32700
  });
  InvalidRequestRpcError = class InvalidRequestRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: InvalidRequestRpcError.code,
        name: "InvalidRequestRpcError",
        shortMessage: "JSON is not a valid request object."
      });
    }
  };
  Object.defineProperty(InvalidRequestRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32600
  });
  MethodNotFoundRpcError = class MethodNotFoundRpcError extends RpcError {
    constructor(cause, { method } = {}) {
      super(cause, {
        code: MethodNotFoundRpcError.code,
        name: "MethodNotFoundRpcError",
        shortMessage: `The method${method ? ` "${method}"` : ""} does not exist / is not available.`
      });
    }
  };
  Object.defineProperty(MethodNotFoundRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32601
  });
  InvalidParamsRpcError = class InvalidParamsRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: InvalidParamsRpcError.code,
        name: "InvalidParamsRpcError",
        shortMessage: [
          "Invalid parameters were provided to the RPC method.",
          "Double check you have provided the correct parameters."
        ].join(`
`)
      });
    }
  };
  Object.defineProperty(InvalidParamsRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32602
  });
  InternalRpcError = class InternalRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: InternalRpcError.code,
        name: "InternalRpcError",
        shortMessage: "An internal error was received."
      });
    }
  };
  Object.defineProperty(InternalRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32603
  });
  InvalidInputRpcError = class InvalidInputRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: InvalidInputRpcError.code,
        name: "InvalidInputRpcError",
        shortMessage: [
          "Missing or invalid parameters.",
          "Double check you have provided the correct parameters."
        ].join(`
`)
      });
    }
  };
  Object.defineProperty(InvalidInputRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32000
  });
  ResourceNotFoundRpcError = class ResourceNotFoundRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: ResourceNotFoundRpcError.code,
        name: "ResourceNotFoundRpcError",
        shortMessage: "Requested resource not found."
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "ResourceNotFoundRpcError"
      });
    }
  };
  Object.defineProperty(ResourceNotFoundRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32001
  });
  ResourceUnavailableRpcError = class ResourceUnavailableRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: ResourceUnavailableRpcError.code,
        name: "ResourceUnavailableRpcError",
        shortMessage: "Requested resource not available."
      });
    }
  };
  Object.defineProperty(ResourceUnavailableRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32002
  });
  TransactionRejectedRpcError = class TransactionRejectedRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: TransactionRejectedRpcError.code,
        name: "TransactionRejectedRpcError",
        shortMessage: "Transaction creation failed."
      });
    }
  };
  Object.defineProperty(TransactionRejectedRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32003
  });
  MethodNotSupportedRpcError = class MethodNotSupportedRpcError extends RpcError {
    constructor(cause, { method } = {}) {
      super(cause, {
        code: MethodNotSupportedRpcError.code,
        name: "MethodNotSupportedRpcError",
        shortMessage: `Method${method ? ` "${method}"` : ""} is not supported.`
      });
    }
  };
  Object.defineProperty(MethodNotSupportedRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32004
  });
  LimitExceededRpcError = class LimitExceededRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: LimitExceededRpcError.code,
        name: "LimitExceededRpcError",
        shortMessage: "Request exceeds defined limit."
      });
    }
  };
  Object.defineProperty(LimitExceededRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32005
  });
  JsonRpcVersionUnsupportedError = class JsonRpcVersionUnsupportedError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: JsonRpcVersionUnsupportedError.code,
        name: "JsonRpcVersionUnsupportedError",
        shortMessage: "Version of JSON-RPC protocol is not supported."
      });
    }
  };
  Object.defineProperty(JsonRpcVersionUnsupportedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32006
  });
  UserRejectedRequestError = class UserRejectedRequestError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: UserRejectedRequestError.code,
        name: "UserRejectedRequestError",
        shortMessage: "User rejected the request."
      });
    }
  };
  Object.defineProperty(UserRejectedRequestError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4001
  });
  UnauthorizedProviderError = class UnauthorizedProviderError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: UnauthorizedProviderError.code,
        name: "UnauthorizedProviderError",
        shortMessage: "The requested method and/or account has not been authorized by the user."
      });
    }
  };
  Object.defineProperty(UnauthorizedProviderError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4100
  });
  UnsupportedProviderMethodError = class UnsupportedProviderMethodError extends ProviderRpcError {
    constructor(cause, { method } = {}) {
      super(cause, {
        code: UnsupportedProviderMethodError.code,
        name: "UnsupportedProviderMethodError",
        shortMessage: `The Provider does not support the requested method${method ? ` " ${method}"` : ""}.`
      });
    }
  };
  Object.defineProperty(UnsupportedProviderMethodError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4200
  });
  ProviderDisconnectedError = class ProviderDisconnectedError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: ProviderDisconnectedError.code,
        name: "ProviderDisconnectedError",
        shortMessage: "The Provider is disconnected from all chains."
      });
    }
  };
  Object.defineProperty(ProviderDisconnectedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4900
  });
  ChainDisconnectedError = class ChainDisconnectedError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: ChainDisconnectedError.code,
        name: "ChainDisconnectedError",
        shortMessage: "The Provider is not connected to the requested chain."
      });
    }
  };
  Object.defineProperty(ChainDisconnectedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4901
  });
  SwitchChainError = class SwitchChainError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: SwitchChainError.code,
        name: "SwitchChainError",
        shortMessage: "An error occurred when attempting to switch chain."
      });
    }
  };
  Object.defineProperty(SwitchChainError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4902
  });
  UnsupportedNonOptionalCapabilityError = class UnsupportedNonOptionalCapabilityError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: UnsupportedNonOptionalCapabilityError.code,
        name: "UnsupportedNonOptionalCapabilityError",
        shortMessage: "This Wallet does not support a capability that was not marked as optional."
      });
    }
  };
  Object.defineProperty(UnsupportedNonOptionalCapabilityError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5700
  });
  UnsupportedChainIdError = class UnsupportedChainIdError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: UnsupportedChainIdError.code,
        name: "UnsupportedChainIdError",
        shortMessage: "This Wallet does not support the requested chain ID."
      });
    }
  };
  Object.defineProperty(UnsupportedChainIdError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5710
  });
  DuplicateIdError = class DuplicateIdError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: DuplicateIdError.code,
        name: "DuplicateIdError",
        shortMessage: "There is already a bundle submitted with this ID."
      });
    }
  };
  Object.defineProperty(DuplicateIdError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5720
  });
  UnknownBundleIdError = class UnknownBundleIdError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: UnknownBundleIdError.code,
        name: "UnknownBundleIdError",
        shortMessage: "This bundle id is unknown / has not been submitted"
      });
    }
  };
  Object.defineProperty(UnknownBundleIdError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5730
  });
  BundleTooLargeError = class BundleTooLargeError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: BundleTooLargeError.code,
        name: "BundleTooLargeError",
        shortMessage: "The call bundle is too large for the Wallet to process."
      });
    }
  };
  Object.defineProperty(BundleTooLargeError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5740
  });
  AtomicReadyWalletRejectedUpgradeError = class AtomicReadyWalletRejectedUpgradeError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: AtomicReadyWalletRejectedUpgradeError.code,
        name: "AtomicReadyWalletRejectedUpgradeError",
        shortMessage: "The Wallet can support atomicity after an upgrade, but the user rejected the upgrade."
      });
    }
  };
  Object.defineProperty(AtomicReadyWalletRejectedUpgradeError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5750
  });
  AtomicityNotSupportedError = class AtomicityNotSupportedError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: AtomicityNotSupportedError.code,
        name: "AtomicityNotSupportedError",
        shortMessage: "The wallet does not support atomic execution but the request requires it."
      });
    }
  };
  Object.defineProperty(AtomicityNotSupportedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5760
  });
  UnknownRpcError = class UnknownRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        name: "UnknownRpcError",
        shortMessage: "An unknown RPC error occurred."
      });
    }
  };
});

// node_modules/viem/_esm/utils/errors/getContractError.js
function getContractError(err, { abi, address, args, docsPath: docsPath3, functionName, sender }) {
  const error = err instanceof RawContractError ? err : err instanceof BaseError2 ? err.walk((err2) => ("data" in err2)) || err.walk() : {};
  const { code, data, details, message, shortMessage } = error;
  const cause = (() => {
    if (err instanceof AbiDecodingZeroDataError)
      return new ContractFunctionZeroDataError({ functionName });
    if ([EXECUTION_REVERTED_ERROR_CODE, InternalRpcError.code].includes(code) && (data || details || message || shortMessage)) {
      return new ContractFunctionRevertedError({
        abi,
        data: typeof data === "object" ? data.data : data,
        functionName,
        message: error instanceof RpcRequestError ? details : shortMessage ?? message
      });
    }
    return err;
  })();
  return new ContractFunctionExecutionError(cause, {
    abi,
    args,
    contractAddress: address,
    docsPath: docsPath3,
    functionName,
    sender
  });
}
var EXECUTION_REVERTED_ERROR_CODE = 3;
var init_getContractError = __esm(() => {
  init_abi();
  init_base();
  init_contract();
  init_request();
  init_rpc();
});

// node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
function publicKeyToAddress(publicKey) {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
  return checksumAddress(`0x${address}`);
}
var init_publicKeyToAddress = __esm(() => {
  init_getAddress();
  init_keccak256();
});

// node_modules/viem/node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD, SHA256_IV;
var init__md = __esm(() => {
  init_utils2();
  HashMD = class HashMD extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE2) {
      super();
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE2;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      data = toBytes2(data);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (;blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE: isLE2 } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos;i < blockLen; i++)
        buffer[i] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0;i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE2);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor);
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
});

// node_modules/viem/node_modules/@noble/hashes/esm/sha2.js
var SHA256_K, SHA256_W, SHA256, sha256;
var init_sha2 = __esm(() => {
  init__md();
  init_utils2();
  SHA256_K = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  SHA256 = class SHA256 extends HashMD {
    constructor(outputLen = 32) {
      super(64, outputLen, 8, false);
      this.A = SHA256_IV[0] | 0;
      this.B = SHA256_IV[1] | 0;
      this.C = SHA256_IV[2] | 0;
      this.D = SHA256_IV[3] | 0;
      this.E = SHA256_IV[4] | 0;
      this.F = SHA256_IV[5] | 0;
      this.G = SHA256_IV[6] | 0;
      this.H = SHA256_IV[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0;i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16;i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0;i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  };
  sha256 = /* @__PURE__ */ createHasher(() => new SHA256);
});

// node_modules/viem/node_modules/@noble/hashes/esm/hmac.js
var HMAC, hmac = (hash2, key, message) => new HMAC(hash2, key).update(message).digest();
var init_hmac = __esm(() => {
  init_utils2();
  HMAC = class HMAC extends Hash {
    constructor(hash2, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      ahash(hash2);
      const key = toBytes2(_key);
      this.iHash = hash2.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad2 = new Uint8Array(blockLen);
      pad2.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
      for (let i = 0;i < pad2.length; i++)
        pad2[i] ^= 54;
      this.iHash.update(pad2);
      this.oHash = hash2.create();
      for (let i = 0;i < pad2.length; i++)
        pad2[i] ^= 54 ^ 92;
      this.oHash.update(pad2);
      clean(pad2);
    }
    update(buf) {
      aexists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists(this);
      abytes(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  };
  hmac.create = (hash2, key) => new HMAC(hash2, key);
});

// node_modules/viem/node_modules/@noble/curves/esm/abstract/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(item) {
  if (!isBytes2(item))
    throw new Error("Uint8Array expected");
}
function abool(title, value) {
  if (typeof value !== "boolean")
    throw new Error(title + " boolean expected, got " + value);
}
function numberToHexUnpadded(num) {
  const hex = num.toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n2 : BigInt("0x" + hex);
}
function bytesToHex2(bytes) {
  abytes2(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0;i < bytes.length; i++) {
    hex += hexes2[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === undefined || n2 === undefined) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function bytesToNumberBE(bytes) {
  return hexToNumber2(bytesToHex2(bytes));
}
function bytesToNumberLE(bytes) {
  abytes2(bytes);
  return hexToNumber2(bytesToHex2(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
  return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes2(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
function concatBytes3(...arrays) {
  let sum = 0;
  for (let i = 0;i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0;i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0;n > _0n2; n >>= _1n2, len += 1)
    ;
  return len;
}
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...b) => hmacFn(k, v, ...b);
  const reseed = (seed = u8n(0)) => {
    k = h(u8fr([0]), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8fr([1]), seed);
    v = h();
  };
  const gen2 = () => {
    if (i++ >= 1000)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = undefined;
    while (!(res = pred(gen2())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error("invalid validator function");
    const val = object[fieldName];
    if (isOptional && val === undefined)
      return;
    if (!checkVal(val, object)) {
      throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
    }
  };
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}
function memoized(fn) {
  const map = new WeakMap;
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== undefined)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}
var _0n2, _1n2, hasHexBuiltin, hexes2, asciis, isPosBig = (n) => typeof n === "bigint" && _0n2 <= n, bitMask = (n) => (_1n2 << BigInt(n)) - _1n2, u8n = (len) => new Uint8Array(len), u8fr = (arr) => Uint8Array.from(arr), validatorFns;
var init_utils3 = __esm(() => {
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n2 = /* @__PURE__ */ BigInt(0);
  _1n2 = /* @__PURE__ */ BigInt(1);
  hasHexBuiltin = typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
  hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  validatorFns = {
    bigint: (val) => typeof val === "bigint",
    function: (val) => typeof val === "function",
    boolean: (val) => typeof val === "boolean",
    string: (val) => typeof val === "string",
    stringOrUint8Array: (val) => typeof val === "string" || isBytes2(val),
    isSafeInteger: (val) => Number.isSafeInteger(val),
    array: (val) => Array.isArray(val),
    field: (val, object) => object.Fp.isValid(val),
    hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
  };
});

// node_modules/viem/node_modules/@noble/curves/esm/abstract/modular.js
function mod(a, b) {
  const result = a % b;
  return result >= _0n3 ? result : b + result;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n3) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n3)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n3)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n3, y = _1n3, u = _1n3, v = _0n3;
  while (a !== _0n3) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n3)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function sqrt3mod4(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n3) / _4n;
  const root = Fp.pow(n, p1div4);
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function sqrt5mod8(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n) / _8n;
  const n2 = Fp.mul(n, _2n2);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i = Fp.mul(Fp.mul(nv, _2n2), v);
  const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function tonelliShanks(P) {
  if (P < BigInt(3))
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n3;
  let S = 0;
  while (Q % _2n2 === _0n3) {
    Q /= _2n2;
    S++;
  }
  let Z = _2n2;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1000)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n3) / _2n2;
  return function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i++;
        t_tmp = Fp.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n3 << BigInt(M - i - 1);
      const b = Fp.pow(c, exponent);
      M = i;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  return tonelliShanks(P);
}
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject(field, opts);
}
function FpPow(Fp, num, power) {
  if (power < _0n3)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n3)
    return Fp.ONE;
  if (power === _1n3)
    return num;
  let p = Fp.ONE;
  let d = num;
  while (power > _0n3) {
    if (power & _1n3)
      p = Fp.mul(p, d);
    d = Fp.sqr(d);
    power >>= _1n3;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : undefined);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (Fp.is0(num))
      return acc;
    inverted[i] = acc;
    return Fp.mul(acc, num);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (Fp.is0(num))
      return acc;
    inverted[i] = Fp.mul(acc, inverted[i]);
    return Fp.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n3) / _2n2;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== undefined)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLen2, isLE2 = false, redef = {}) {
  if (ORDER <= _0n3)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE2,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n3,
    ONE: _1n3,
    create: (num) => mod(num, ORDER),
    isValid: (num) => {
      if (typeof num !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num);
      return _0n3 <= num && num < ORDER;
    },
    is0: (num) => num === _0n3,
    isOdd: (num) => (num & _1n3) === _1n3,
    neg: (num) => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert(num, ORDER),
    sqrt: redef.sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
    fromBytes: (bytes) => {
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      return isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    },
    invertBatch: (lst) => FpInvertBatch(f, lst),
    cmov: (a, b, c) => c ? b : a
  });
  return Object.freeze(f);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num, fieldOrder - _1n3) + _1n3;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
var _0n3, _1n3, _2n2, _3n, _4n, _5n, _8n, FIELD_FIELDS;
var init_modular = __esm(() => {
  init_utils2();
  init_utils3();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n3 = BigInt(0);
  _1n3 = BigInt(1);
  _2n2 = /* @__PURE__ */ BigInt(2);
  _3n = /* @__PURE__ */ BigInt(3);
  _4n = /* @__PURE__ */ BigInt(4);
  _5n = /* @__PURE__ */ BigInt(5);
  _8n = /* @__PURE__ */ BigInt(8);
  FIELD_FIELDS = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
});

// node_modules/viem/node_modules/@noble/curves/esm/abstract/curve.js
function constTimeNegate(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n4;
  }
  const offsetStart = window * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function wNAF(c, bits) {
  return {
    constTimeNegate,
    hasPrecomputes(elm) {
      return getW(elm) !== 1;
    },
    unsafeLadder(elm, n, p = c.ZERO) {
      let d = elm;
      while (n > _0n4) {
        if (n & _1n4)
          p = p.add(d);
        d = d.double();
        n >>= _1n4;
      }
      return p;
    },
    precomputeWindow(elm, W) {
      const { windows, windowSize } = calcWOpts(W, bits);
      const points = [];
      let p = elm;
      let base = p;
      for (let window = 0;window < windows; window++) {
        base = p;
        points.push(base);
        for (let i = 1;i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    },
    wNAF(W, precomputes, n) {
      let p = c.ZERO;
      let f = c.BASE;
      const wo = calcWOpts(W, bits);
      for (let window = 0;window < wo.windows; window++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
        n = nextN;
        if (isZero) {
          f = f.add(constTimeNegate(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(constTimeNegate(isNeg, precomputes[offset]));
        }
      }
      return { p, f };
    },
    wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
      const wo = calcWOpts(W, bits);
      for (let window = 0;window < wo.windows; window++) {
        if (n === _0n4)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      return acc;
    },
    getPrecomputes(W, P, transform) {
      let comp = pointPrecomputes.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W);
        if (W !== 1)
          pointPrecomputes.set(P, transform(comp));
      }
      return comp;
    },
    wNAFCached(P, n, transform) {
      const W = getW(P);
      return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
    },
    wNAFCachedUnsafe(P, n, transform, prev) {
      const W = getW(P);
      if (W === 1)
        return this.unsafeLadder(P, n, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
    },
    setWindowSize(P, W) {
      validateW(W, bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
  };
}
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits;i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0;j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero;j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0;j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function validateBasic(curve) {
  validateField(curve.Fp);
  validateObject(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}
var _0n4, _1n4, pointPrecomputes, pointWindowSizes;
var init_curve = __esm(() => {
  init_modular();
  init_utils3();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n4 = BigInt(0);
  _1n4 = BigInt(1);
  pointPrecomputes = new WeakMap;
  pointWindowSizes = new WeakMap;
});

// node_modules/viem/node_modules/@noble/curves/esm/abstract/weierstrass.js
function validateSigVerOpts(opts) {
  if (opts.lowS !== undefined)
    abool("lowS", opts.lowS);
  if (opts.prehash !== undefined)
    abool("prehash", opts.prehash);
}
function validatePointOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    a: "field",
    b: "field"
  }, {
    allowInfinityPoint: "boolean",
    allowedPrivateKeyLengths: "array",
    clearCofactor: "function",
    fromBytes: "function",
    isTorsionFree: "function",
    toBytes: "function",
    wrapPrivateKey: "boolean"
  });
  const { endo, Fp, a } = opts;
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error("invalid endo: CURVE.a must be 0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
    }
  }
  return Object.freeze({ ...opts });
}
function numToSizedHex(num, size2) {
  return bytesToHex2(numberToBytesBE(num, size2));
}
function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts);
  const { Fp } = CURVE;
  const Fn = Field(CURVE.n, CURVE.nBitLength);
  const toBytes3 = CURVE.toBytes || ((_c, point, _isCompressed) => {
    const a = point.toAffine();
    return concatBytes3(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
  });
  const fromBytes = CURVE.fromBytes || ((bytes) => {
    const tail = bytes.subarray(1);
    const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
    const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
    return { x, y };
  });
  function weierstrassEquation(x) {
    const { a, b } = CURVE;
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function isWithinCurveOrder(num) {
    return inRange(num, _1n5, CURVE.n);
  }
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (isBytes2(key))
        key = bytesToHex2(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("invalid private key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num;
    try {
      num = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
    } catch (error) {
      throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
    }
    if (wrapPrivateKey)
      num = mod(num, N);
    aInRange("private key", num, _1n5, N);
    return num;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("ProjectivePoint expected");
  }
  const toAffineMemo = memoized((p, iz) => {
    const { px: x, py: y, pz: z } = p;
    if (Fp.eql(z, Fp.ONE))
      return { x, y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(z);
    const ax = Fp.mul(x, iz);
    const ay = Fp.mul(y, iz);
    const zz = Fp.mul(z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x: ax, y: ay };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not FE");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });

  class Point {
    constructor(px, py, pz) {
      if (px == null || !Fp.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp.isValid(py) || Fp.is0(py))
        throw new Error("y required");
      if (pz == null || !Fp.isValid(pz))
        throw new Error("z required");
      this.px = px;
      this.py = py;
      this.pz = pz;
      Object.freeze(this);
    }
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      const is0 = (i) => Fp.eql(i, Fp.ZERO);
      if (is0(x) && is0(y))
        return Point.ZERO;
      return new Point(x, y, Fp.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static normalizeZ(points) {
      const toInv = FpInvertBatch(Fp, points.map((p) => p.pz));
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
    }
    static fromHex(hex) {
      const P = Point.fromAffine(fromBytes(ensureBytes("pointHex", hex)));
      P.assertValidity();
      return P;
    }
    static fromPrivateKey(privateKey) {
      return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    static msm(points, scalars) {
      return pippenger(Point, Fn, points, scalars);
    }
    _setWindowSize(windowSize) {
      wnaf.setWindowSize(this, windowSize);
    }
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (Fp.isOdd)
        return !Fp.isOdd(y);
      throw new Error("Field doesn't support isOdd");
    }
    equals(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    negate() {
      return new Point(this.px, Fp.neg(this.py), this.pz);
    }
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    add(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, n, Point.normalizeZ);
    }
    multiplyUnsafe(sc) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", sc, _0n5, N);
      const I = Point.ZERO;
      if (sc === _0n5)
        return I;
      if (this.is0() || sc === _1n5)
        return this;
      if (!endo2 || wnaf.hasPrecomputes(this))
        return wnaf.wNAFCachedUnsafe(this, sc, Point.normalizeZ);
      let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(sc);
      let k1p = I;
      let k2p = I;
      let d = this;
      while (k1 > _0n5 || k2 > _0n5) {
        if (k1 & _1n5)
          k1p = k1p.add(d);
        if (k2 & _1n5)
          k2p = k2p.add(d);
        d = d.double();
        k1 >>= _1n5;
        k2 >>= _1n5;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    multiply(scalar) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", scalar, _1n5, N);
      let point, fake;
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(scalar);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k2);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p, f } = this.wNAF(scalar);
        point = p;
        fake = f;
      }
      return Point.normalizeZ([point, fake])[0];
    }
    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point.BASE;
      const mul = (P, a2) => a2 === _0n5 || a2 === _1n5 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
      const sum = mul(this, a).add(mul(Q, b));
      return sum.is0() ? undefined : sum;
    }
    toAffine(iz) {
      return toAffineMemo(this, iz);
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n5)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n5)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      abool("isCompressed", isCompressed);
      this.assertValidity();
      return toBytes3(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      abool("isCompressed", isCompressed);
      return bytesToHex2(this.toRawBytes(isCompressed));
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
  const { endo, nBitLength } = CURVE;
  const wnaf = wNAF(Point, endo ? Math.ceil(nBitLength / 2) : nBitLength);
  return {
    CURVE,
    ProjectivePoint: Point,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
function validateOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
  const compressedLen = Fp.BYTES + 1;
  const uncompressedLen = 2 * Fp.BYTES + 1;
  function modN(a) {
    return mod(a, CURVE_ORDER);
  }
  function invN(a) {
    return invert(a, CURVE_ORDER);
  }
  const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine();
      const x = Fp.toBytes(a.x);
      const cat = concatBytes3;
      abool("isCompressed", isCompressed);
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
      } else {
        return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
      }
    },
    fromBytes(bytes) {
      const len = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x = bytesToNumberBE(tail);
        if (!inRange(x, _1n5, Fp.ORDER))
          throw new Error("Point is not on curve");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("Point is not on curve" + suffix);
        }
        const isYOdd = (y & _1n5) === _1n5;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (len === uncompressedLen && head === 4) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
        return { x, y };
      } else {
        const cl = compressedLen;
        const ul = uncompressedLen;
        throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
      }
    }
  });
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n5;
    return number > HALF;
  }
  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN(-s) : s;
  }
  const slcNum = (b, from, to) => bytesToNumberBE(b.slice(from, to));

  class Signature {
    constructor(r, s, recovery) {
      aInRange("r", r, _1n5, CURVE_ORDER);
      aInRange("s", s, _1n5, CURVE_ORDER);
      this.r = r;
      this.s = s;
      if (recovery != null)
        this.recovery = recovery;
      Object.freeze(this);
    }
    static fromCompact(hex) {
      const l = nByteLength;
      hex = ensureBytes("compactSignature", hex, l * 2);
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
    }
    static fromDER(hex) {
      const { r, s } = DER.toSig(ensureBytes("DER", hex));
      return new Signature(r, s);
    }
    assertValidity() {}
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r, s, recovery: rec } = this;
      const h = bits2int_modN(ensureBytes("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
      if (radj >= Fp.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R = Point.fromHex(prefix + numToSizedHex(radj, Fp.BYTES));
      const ir = invN(radj);
      const u1 = modN(-h * ir);
      const u2 = modN(s * ir);
      const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
      if (!Q)
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return hexToBytes2(this.toDERHex());
    }
    toDERHex() {
      return DER.hexFromSig(this);
    }
    toCompactRawBytes() {
      return hexToBytes2(this.toCompactHex());
    }
    toCompactHex() {
      const l = nByteLength;
      return numToSizedHex(this.r, l) + numToSizedHex(this.s, l);
    }
  }
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    randomPrivateKey: () => {
      const length = getMinHashLength(CURVE.n);
      return mapHashToField(CURVE.randomBytes(length), CURVE.n);
    },
    precompute(windowSize = 8, point = Point.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  function isProbPub(item) {
    if (typeof item === "bigint")
      return false;
    if (item instanceof Point)
      return true;
    const arr = ensureBytes("key", item);
    const len = arr.length;
    const fpl = Fp.BYTES;
    const compLen = fpl + 1;
    const uncompLen = 2 * fpl + 1;
    if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) {
      return;
    } else {
      return len === compLen || len === uncompLen;
    }
  }
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicB) === false)
      throw new Error("second arg must be public key");
    const b = Point.fromHex(publicB);
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  const bits2int = CURVE.bits2int || function(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - nBitLength;
    return delta > 0 ? num >> BigInt(delta) : num;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
    return modN(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(nBitLength);
  function int2octets(num) {
    aInRange("num < 2^" + nBitLength, num, _0n5, ORDER_MASK);
    return numberToBytesBE(num, nByteLength);
  }
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k) => (k in opts)))
      throw new Error("sign() legacy options not supported");
    const { hash: hash2, randomBytes: randomBytes2 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes("msgHash", msgHash);
    validateSigVerOpts(opts);
    if (prehash)
      msgHash = ensureBytes("prehashed msgHash", hash2(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (ent != null && ent !== false) {
      const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
      seedArgs.push(ensureBytes("extraEntropy", e));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!isWithinCurveOrder(k))
        return;
      const ik = invN(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = modN(q.x);
      if (r === _0n5)
        return;
      const s = modN(ik * modN(m + r * d));
      if (s === _0n5)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n5);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    return { seed, k2sig };
  }
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C = CURVE;
    const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
    return drbg(seed, k2sig);
  }
  Point.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes("msgHash", msgHash);
    publicKey = ensureBytes("publicKey", publicKey);
    const { lowS, prehash, format } = opts;
    validateSigVerOpts(opts);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    if (format !== undefined && format !== "compact" && format !== "der")
      throw new Error("format must be compact or der");
    const isHex2 = typeof sg === "string" || isBytes2(sg);
    const isObj = !isHex2 && !format && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex2 && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let _sig = undefined;
    let P;
    try {
      if (isObj)
        _sig = new Signature(sg.r, sg.s);
      if (isHex2) {
        try {
          if (format !== "compact")
            _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
        }
        if (!_sig && format !== "der")
          _sig = Signature.fromCompact(sg);
      }
      P = Point.fromHex(publicKey);
    } catch (error) {
      return false;
    }
    if (!_sig)
      return false;
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r, s } = _sig;
    const h = bits2int_modN(msgHash);
    const is = invN(s);
    const u1 = modN(h * is);
    const u2 = modN(r * is);
    const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
    if (!R)
      return false;
    const v = modN(R.x);
    return v === r;
  }
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign,
    verify,
    ProjectivePoint: Point,
    Signature,
    utils
  };
}
function SWUFpSqrtRatio(Fp, Z) {
  const q = Fp.ORDER;
  let l = _0n5;
  for (let o = q - _1n5;o % _2n3 === _0n5; o /= _2n3)
    l += _1n5;
  const c1 = l;
  const _2n_pow_c1_1 = _2n3 << c1 - _1n5 - _1n5;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n3;
  const c2 = (q - _1n5) / _2n_pow_c1;
  const c3 = (c2 - _1n5) / _2n3;
  const c4 = _2n_pow_c1 - _1n5;
  const c5 = _2n_pow_c1_1;
  const c6 = Fp.pow(Z, c2);
  const c7 = Fp.pow(Z, (c2 + _1n5) / _2n3);
  let sqrtRatio = (u, v) => {
    let tv1 = c6;
    let tv2 = Fp.pow(v, c4);
    let tv3 = Fp.sqr(tv2);
    tv3 = Fp.mul(tv3, v);
    let tv5 = Fp.mul(u, tv3);
    tv5 = Fp.pow(tv5, c3);
    tv5 = Fp.mul(tv5, tv2);
    tv2 = Fp.mul(tv5, v);
    tv3 = Fp.mul(tv5, u);
    let tv4 = Fp.mul(tv3, tv2);
    tv5 = Fp.pow(tv4, c5);
    let isQR = Fp.eql(tv5, Fp.ONE);
    tv2 = Fp.mul(tv3, c7);
    tv5 = Fp.mul(tv4, tv1);
    tv3 = Fp.cmov(tv2, tv3, isQR);
    tv4 = Fp.cmov(tv5, tv4, isQR);
    for (let i = c1;i > _1n5; i--) {
      let tv52 = i - _2n3;
      tv52 = _2n3 << tv52 - _1n5;
      let tvv5 = Fp.pow(tv4, tv52);
      const e1 = Fp.eql(tvv5, Fp.ONE);
      tv2 = Fp.mul(tv3, tv1);
      tv1 = Fp.mul(tv1, tv1);
      tvv5 = Fp.mul(tv4, tv1);
      tv3 = Fp.cmov(tv2, tv3, e1);
      tv4 = Fp.cmov(tvv5, tv4, e1);
    }
    return { isValid: isQR, value: tv3 };
  };
  if (Fp.ORDER % _4n2 === _3n2) {
    const c12 = (Fp.ORDER - _3n2) / _4n2;
    const c22 = Fp.sqrt(Fp.neg(Z));
    sqrtRatio = (u, v) => {
      let tv1 = Fp.sqr(v);
      const tv2 = Fp.mul(u, v);
      tv1 = Fp.mul(tv1, tv2);
      let y1 = Fp.pow(tv1, c12);
      y1 = Fp.mul(y1, tv2);
      const y2 = Fp.mul(y1, c22);
      const tv3 = Fp.mul(Fp.sqr(y1), v);
      const isQR = Fp.eql(tv3, u);
      let y = Fp.cmov(y2, y1, isQR);
      return { isValid: isQR, value: y };
    };
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp, opts) {
  validateField(Fp);
  if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
  if (!Fp.isOdd)
    throw new Error("Fp.isOdd is not implemented!");
  return (u) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
    tv1 = Fp.sqr(u);
    tv1 = Fp.mul(tv1, opts.Z);
    tv2 = Fp.sqr(tv1);
    tv2 = Fp.add(tv2, tv1);
    tv3 = Fp.add(tv2, Fp.ONE);
    tv3 = Fp.mul(tv3, opts.B);
    tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
    tv4 = Fp.mul(tv4, opts.A);
    tv2 = Fp.sqr(tv3);
    tv6 = Fp.sqr(tv4);
    tv5 = Fp.mul(tv6, opts.A);
    tv2 = Fp.add(tv2, tv5);
    tv2 = Fp.mul(tv2, tv3);
    tv6 = Fp.mul(tv6, tv4);
    tv5 = Fp.mul(tv6, opts.B);
    tv2 = Fp.add(tv2, tv5);
    x = Fp.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y = Fp.mul(tv1, u);
    y = Fp.mul(y, value);
    x = Fp.cmov(x, tv3, isValid);
    y = Fp.cmov(y, value, isValid);
    const e1 = Fp.isOdd(u) === Fp.isOdd(y);
    y = Fp.cmov(Fp.neg(y), y, e1);
    const tv4_inv = FpInvertBatch(Fp, [tv4], true)[0];
    x = Fp.mul(x, tv4_inv);
    return { x, y };
  };
}
var DERErr, DER, _0n5, _1n5, _2n3, _3n2, _4n2;
var init_weierstrass = __esm(() => {
  init_curve();
  init_modular();
  init_utils3();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  DERErr = class DERErr extends Error {
    constructor(m = "") {
      super(m);
    }
  };
  DER = {
    Err: DERErr,
    _tlv: {
      encode: (tag, data) => {
        const { Err: E } = DER;
        if (tag < 0 || tag > 256)
          throw new E("tlv.encode: wrong tag");
        if (data.length & 1)
          throw new E("tlv.encode: unpadded data");
        const dataLen = data.length / 2;
        const len = numberToHexUnpadded(dataLen);
        if (len.length / 2 & 128)
          throw new E("tlv.encode: long form length too big");
        const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
        const t = numberToHexUnpadded(tag);
        return t + lenLen + len + data;
      },
      decode(tag, data) {
        const { Err: E } = DER;
        let pos = 0;
        if (tag < 0 || tag > 256)
          throw new E("tlv.encode: wrong tag");
        if (data.length < 2 || data[pos++] !== tag)
          throw new E("tlv.decode: wrong tlv");
        const first = data[pos++];
        const isLong = !!(first & 128);
        let length = 0;
        if (!isLong)
          length = first;
        else {
          const lenLen = first & 127;
          if (!lenLen)
            throw new E("tlv.decode(long): indefinite length not supported");
          if (lenLen > 4)
            throw new E("tlv.decode(long): byte length is too big");
          const lengthBytes = data.subarray(pos, pos + lenLen);
          if (lengthBytes.length !== lenLen)
            throw new E("tlv.decode: length bytes not complete");
          if (lengthBytes[0] === 0)
            throw new E("tlv.decode(long): zero leftmost byte");
          for (const b of lengthBytes)
            length = length << 8 | b;
          pos += lenLen;
          if (length < 128)
            throw new E("tlv.decode(long): not minimal encoding");
        }
        const v = data.subarray(pos, pos + length);
        if (v.length !== length)
          throw new E("tlv.decode: wrong value length");
        return { v, l: data.subarray(pos + length) };
      }
    },
    _int: {
      encode(num) {
        const { Err: E } = DER;
        if (num < _0n5)
          throw new E("integer: negative integers are not allowed");
        let hex = numberToHexUnpadded(num);
        if (Number.parseInt(hex[0], 16) & 8)
          hex = "00" + hex;
        if (hex.length & 1)
          throw new E("unexpected DER parsing assertion: unpadded hex");
        return hex;
      },
      decode(data) {
        const { Err: E } = DER;
        if (data[0] & 128)
          throw new E("invalid signature integer: negative");
        if (data[0] === 0 && !(data[1] & 128))
          throw new E("invalid signature integer: unnecessary leading zero");
        return bytesToNumberBE(data);
      }
    },
    toSig(hex) {
      const { Err: E, _int: int, _tlv: tlv } = DER;
      const data = ensureBytes("signature", hex);
      const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
      if (seqLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
      const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
      if (sLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      return { r: int.decode(rBytes), s: int.decode(sBytes) };
    },
    hexFromSig(sig) {
      const { _tlv: tlv, _int: int } = DER;
      const rs = tlv.encode(2, int.encode(sig.r));
      const ss = tlv.encode(2, int.encode(sig.s));
      const seq = rs + ss;
      return tlv.encode(48, seq);
    }
  };
  _0n5 = BigInt(0);
  _1n5 = BigInt(1);
  _2n3 = BigInt(2);
  _3n2 = BigInt(3);
  _4n2 = BigInt(4);
});

// node_modules/viem/node_modules/@noble/curves/esm/_shortw_utils.js
function getHash(hash2) {
  return {
    hash: hash2,
    hmac: (key, ...msgs) => hmac(hash2, key, concatBytes(...msgs)),
    randomBytes
  };
}
function createCurve(curveDef, defHash) {
  const create = (hash2) => weierstrass({ ...curveDef, ...getHash(hash2) });
  return { ...create(defHash), create };
}
var init__shortw_utils = __esm(() => {
  init_hmac();
  init_utils2();
  init_weierstrass();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
});

// node_modules/viem/node_modules/@noble/curves/esm/abstract/hash-to-curve.js
function i2osp(value, length) {
  anum(value);
  anum(length);
  if (value < 0 || value >= 1 << 8 * length)
    throw new Error("invalid I2OSP input: " + value);
  const res = Array.from({ length }).fill(0);
  for (let i = length - 1;i >= 0; i--) {
    res[i] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a, b) {
  const arr = new Uint8Array(a.length);
  for (let i = 0;i < a.length; i++) {
    arr[i] = a[i] ^ b[i];
  }
  return arr;
}
function anum(item) {
  if (!Number.isSafeInteger(item))
    throw new Error("number expected");
}
function expand_message_xmd(msg, DST, lenInBytes, H) {
  abytes2(msg);
  abytes2(DST);
  anum(lenInBytes);
  if (DST.length > 255)
    DST = H(concatBytes3(utf8ToBytes2("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (lenInBytes > 65535 || ell > 255)
    throw new Error("expand_message_xmd: invalid lenInBytes");
  const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
  const Z_pad = i2osp(0, r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b = new Array(ell);
  const b_0 = H(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b[0] = H(concatBytes3(b_0, i2osp(1, 1), DST_prime));
  for (let i = 1;i <= ell; i++) {
    const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
    b[i] = H(concatBytes3(...args));
  }
  const pseudo_random_bytes = concatBytes3(...b);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k, H) {
  abytes2(msg);
  abytes2(DST);
  anum(lenInBytes);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k / 8);
    DST = H.create({ dkLen }).update(utf8ToBytes2("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
  validateObject(options, {
    DST: "stringOrUint8Array",
    p: "bigint",
    m: "isSafeInteger",
    k: "isSafeInteger",
    hash: "hash"
  });
  const { p, k, m, hash: hash2, expand, DST: _DST } = options;
  abytes2(msg);
  anum(count);
  const DST = typeof _DST === "string" ? utf8ToBytes2(_DST) : _DST;
  const log2p = p.toString(2).length;
  const L = Math.ceil((log2p + k) / 8);
  const len_in_bytes = count * m * L;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash2);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k, hash2);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u = new Array(count);
  for (let i = 0;i < count; i++) {
    const e = new Array(m);
    for (let j = 0;j < m; j++) {
      const elm_offset = L * (j + i * m);
      const tv = prb.subarray(elm_offset, elm_offset + L);
      e[j] = mod(os2ip(tv), p);
    }
    u[i] = e;
  }
  return u;
}
function isogenyMap(field, map) {
  const coeff = map.map((i) => Array.from(i).reverse());
  return (x, y) => {
    const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
    const [xd_inv, yd_inv] = FpInvertBatch(field, [xd, yd], true);
    x = field.mul(xn, xd_inv);
    y = field.mul(y, field.mul(yn, yd_inv));
    return { x, y };
  };
}
function createHasher2(Point, mapToCurve, defaults) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  function map(num) {
    return Point.fromAffine(mapToCurve(num));
  }
  function clear(initial) {
    const P = initial.clearCofactor();
    if (P.equals(Point.ZERO))
      return Point.ZERO;
    P.assertValidity();
    return P;
  }
  return {
    defaults,
    hashToCurve(msg, options) {
      const u = hash_to_field(msg, 2, { ...defaults, DST: defaults.DST, ...options });
      const u0 = map(u[0]);
      const u1 = map(u[1]);
      return clear(u0.add(u1));
    },
    encodeToCurve(msg, options) {
      const u = hash_to_field(msg, 1, { ...defaults, DST: defaults.encodeDST, ...options });
      return clear(map(u[0]));
    },
    mapToCurve(scalars) {
      if (!Array.isArray(scalars))
        throw new Error("expected array of bigints");
      for (const i of scalars)
        if (typeof i !== "bigint")
          throw new Error("expected array of bigints");
      return clear(map(scalars));
    }
  };
}
var os2ip;
var init_hash_to_curve = __esm(() => {
  init_modular();
  init_utils3();
  os2ip = bytesToNumberBE;
});

// node_modules/viem/node_modules/@noble/curves/esm/secp256k1.js
var exports_secp256k1 = {};
__export(exports_secp256k1, {
  secp256k1_hasher: () => secp256k1_hasher,
  secp256k1: () => secp256k1,
  schnorr: () => schnorr,
  hashToCurve: () => hashToCurve,
  encodeToCurve: () => encodeToCurve
});
function sqrtMod(y) {
  const P = secp256k1P;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n4, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n4, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === undefined) {
    const tagH = sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
    tagP = concatBytes3(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes3(tagP, ...messages));
}
function schnorrGetExtPubKey(priv) {
  let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
  let p = Point.fromPrivateKey(d_);
  const scalar = p.hasEvenY() ? d_ : modN(-d_);
  return { scalar, bytes: pointToBytes(p) };
}
function lift_x(x) {
  aInRange("x", x, _1n6, secp256k1P);
  const xx = modP(x * x);
  const c = modP(xx * x + BigInt(7));
  let y = sqrtMod(c);
  if (y % _2n4 !== _0n6)
    y = modP(-y);
  const p = new Point(x, y, _1n6);
  p.assertValidity();
  return p;
}
function challenge(...args) {
  return modN(num(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(privateKey) {
  return schnorrGetExtPubKey(privateKey).bytes;
}
function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
  const m = ensureBytes("message", message);
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
  const a = ensureBytes("auxRand", auxRand, 32);
  const t = numTo32b(d ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const k_ = modN(num(rand));
  if (k_ === _0n6)
    throw new Error("sign failed: k is zero");
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(numTo32b(modN(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const sig = ensureBytes("signature", signature, 64);
  const m = ensureBytes("message", message);
  const pub = ensureBytes("publicKey", publicKey, 32);
  try {
    const P = lift_x(num(pub));
    const r = num(sig.subarray(0, 32));
    if (!inRange(r, _1n6, secp256k1P))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!inRange(s, _1n6, secp256k1N))
      return false;
    const e = challenge(numTo32b(r), pointToBytes(P), m);
    const R = GmulAdd(P, s, modN(-e));
    if (!R || !R.hasEvenY() || R.toAffine().x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var secp256k1P, secp256k1N, _0n6, _1n6, _2n4, divNearest = (a, b) => (a + b / _2n4) / b, Fpk1, secp256k1, TAGGED_HASH_PREFIXES, pointToBytes = (point) => point.toRawBytes(true).slice(1), numTo32b = (n) => numberToBytesBE(n, 32), modP = (x) => mod(x, secp256k1P), modN = (x) => mod(x, secp256k1N), Point, GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b), num, schnorr, isoMap, mapSWU, secp256k1_hasher, hashToCurve, encodeToCurve;
var init_secp256k1 = __esm(() => {
  init_sha2();
  init_utils2();
  init__shortw_utils();
  init_hash_to_curve();
  init_modular();
  init_utils3();
  init_weierstrass();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
  secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
  _0n6 = BigInt(0);
  _1n6 = BigInt(1);
  _2n4 = BigInt(2);
  Fpk1 = Field(secp256k1P, undefined, undefined, { sqrt: sqrtMod });
  secp256k1 = createCurve({
    a: _0n6,
    b: BigInt(7),
    Fp: Fpk1,
    n: secp256k1N,
    Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
    Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
    h: BigInt(1),
    lowS: true,
    endo: {
      beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
      splitScalar: (k) => {
        const n = secp256k1N;
        const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
        const b1 = -_1n6 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
        const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
        const b2 = a1;
        const POW_2_128 = BigInt("0x100000000000000000000000000000000");
        const c1 = divNearest(b2 * k, n);
        const c2 = divNearest(-b1 * k, n);
        let k1 = mod(k - c1 * a1 - c2 * a2, n);
        let k2 = mod(-c1 * b1 - c2 * b2, n);
        const k1neg = k1 > POW_2_128;
        const k2neg = k2 > POW_2_128;
        if (k1neg)
          k1 = n - k1;
        if (k2neg)
          k2 = n - k2;
        if (k1 > POW_2_128 || k2 > POW_2_128) {
          throw new Error("splitScalar: Endomorphism failed, k=" + k);
        }
        return { k1neg, k1, k2neg, k2 };
      }
    }
  }, sha256);
  TAGGED_HASH_PREFIXES = {};
  Point = /* @__PURE__ */ (() => secp256k1.ProjectivePoint)();
  num = bytesToNumberBE;
  schnorr = /* @__PURE__ */ (() => ({
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    utils: {
      randomPrivateKey: secp256k1.utils.randomPrivateKey,
      lift_x,
      pointToBytes,
      numberToBytesBE,
      bytesToNumberBE,
      taggedHash,
      mod
    }
  }))();
  isoMap = /* @__PURE__ */ (() => isogenyMap(Fpk1, [
    [
      "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
      "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
      "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
      "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
    ],
    [
      "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
      "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    ],
    [
      "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
      "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
      "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
      "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
    ],
    [
      "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
      "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
      "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    ]
  ].map((i) => i.map((j) => BigInt(j)))))();
  mapSWU = /* @__PURE__ */ (() => mapToCurveSimpleSWU(Fpk1, {
    A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
    B: BigInt("1771"),
    Z: Fpk1.create(BigInt("-11"))
  }))();
  secp256k1_hasher = /* @__PURE__ */ (() => createHasher2(secp256k1.ProjectivePoint, (scalars) => {
    const { x, y } = mapSWU(Fpk1.create(scalars[0]));
    return isoMap(x, y);
  }, {
    DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
    encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
    p: Fpk1.ORDER,
    m: 1,
    k: 128,
    expand: "xmd",
    hash: sha256
  }))();
  hashToCurve = /* @__PURE__ */ (() => secp256k1_hasher.hashToCurve)();
  encodeToCurve = /* @__PURE__ */ (() => secp256k1_hasher.encodeToCurve)();
});

// node_modules/viem/_esm/utils/signature/recoverPublicKey.js
async function recoverPublicKey({ hash: hash2, signature }) {
  const hashHex = isHex(hash2) ? hash2 : toHex(hash2);
  const { secp256k1: secp256k12 } = await Promise.resolve().then(() => (init_secp256k1(), exports_secp256k1));
  const signature_ = (() => {
    if (typeof signature === "object" && "r" in signature && "s" in signature) {
      const { r, s, v, yParity } = signature;
      const yParityOrV2 = Number(yParity ?? v);
      const recoveryBit2 = toRecoveryBit(yParityOrV2);
      return new secp256k12.Signature(hexToBigInt(r), hexToBigInt(s)).addRecoveryBit(recoveryBit2);
    }
    const signatureHex = isHex(signature) ? signature : toHex(signature);
    if (size(signatureHex) !== 65)
      throw new Error("invalid signature length");
    const yParityOrV = hexToNumber(`0x${signatureHex.slice(130)}`);
    const recoveryBit = toRecoveryBit(yParityOrV);
    return secp256k12.Signature.fromCompact(signatureHex.substring(2, 130)).addRecoveryBit(recoveryBit);
  })();
  const publicKey = signature_.recoverPublicKey(hashHex.substring(2)).toHex(false);
  return `0x${publicKey}`;
}
function toRecoveryBit(yParityOrV) {
  if (yParityOrV === 0 || yParityOrV === 1)
    return yParityOrV;
  if (yParityOrV === 27)
    return 0;
  if (yParityOrV === 28)
    return 1;
  throw new Error("Invalid yParityOrV value");
}
var init_recoverPublicKey = __esm(() => {
  init_size();
  init_fromHex();
  init_toHex();
});

// node_modules/viem/_esm/utils/signature/recoverAddress.js
async function recoverAddress({ hash: hash2, signature }) {
  return publicKeyToAddress(await recoverPublicKey({ hash: hash2, signature }));
}
var init_recoverAddress = __esm(() => {
  init_publicKeyToAddress();
  init_recoverPublicKey();
});

// node_modules/viem/_esm/utils/encoding/toRlp.js
function toRlp(bytes, to = "hex") {
  const encodable = getEncodable(bytes);
  const cursor = createCursor(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (to === "hex")
    return bytesToHex(cursor.bytes);
  return cursor.bytes;
}
function getEncodable(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList(bytes.map((x) => getEncodable(x)));
  return getEncodableBytes(bytes);
}
function getEncodableList(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode } of list) {
        encode(cursor);
      }
    }
  };
}
function getEncodableBytes(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? hexToBytes(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
function getSizeOfLength(length) {
  if (length < 2 ** 8)
    return 1;
  if (length < 2 ** 16)
    return 2;
  if (length < 2 ** 24)
    return 3;
  if (length < 2 ** 32)
    return 4;
  throw new BaseError2("Length is too large.");
}
var init_toRlp = __esm(() => {
  init_base();
  init_cursor2();
  init_toBytes();
  init_toHex();
});

// node_modules/viem/_esm/utils/authorization/hashAuthorization.js
function hashAuthorization(parameters) {
  const { chainId, nonce, to } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const hash2 = keccak256(concatHex([
    "0x05",
    toRlp([
      chainId ? numberToHex(chainId) : "0x",
      address,
      nonce ? numberToHex(nonce) : "0x"
    ])
  ]));
  if (to === "bytes")
    return hexToBytes(hash2);
  return hash2;
}
var init_hashAuthorization = __esm(() => {
  init_toBytes();
  init_toHex();
  init_toRlp();
  init_keccak256();
});

// node_modules/viem/_esm/utils/authorization/recoverAuthorizationAddress.js
async function recoverAuthorizationAddress(parameters) {
  const { authorization, signature } = parameters;
  return recoverAddress({
    hash: hashAuthorization(authorization),
    signature: signature ?? authorization
  });
}
var init_recoverAuthorizationAddress = __esm(() => {
  init_recoverAddress();
  init_hashAuthorization();
});

// node_modules/viem/_esm/errors/estimateGas.js
var EstimateGasExecutionError;
var init_estimateGas = __esm(() => {
  init_formatEther();
  init_formatGwei();
  init_base();
  init_transaction();
  EstimateGasExecutionError = class EstimateGasExecutionError extends BaseError2 {
    constructor(cause, { account, docsPath: docsPath3, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
      const prettyArgs = prettyPrint({
        from: account?.address,
        to,
        value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
        data,
        gas,
        gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
        maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
        maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
        nonce
      });
      super(cause.shortMessage, {
        cause,
        docsPath: docsPath3,
        metaMessages: [
          ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
          "Estimate Gas Arguments:",
          prettyArgs
        ].filter(Boolean),
        name: "EstimateGasExecutionError"
      });
      Object.defineProperty(this, "cause", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.cause = cause;
    }
  };
});

// node_modules/viem/_esm/errors/node.js
var ExecutionRevertedError, FeeCapTooHighError, FeeCapTooLowError, NonceTooHighError, NonceTooLowError, NonceMaxValueError, InsufficientFundsError, IntrinsicGasTooHighError, IntrinsicGasTooLowError, TransactionTypeNotSupportedError, TipAboveFeeCapError, UnknownNodeError;
var init_node = __esm(() => {
  init_formatGwei();
  init_base();
  ExecutionRevertedError = class ExecutionRevertedError extends BaseError2 {
    constructor({ cause, message } = {}) {
      const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
      super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
        cause,
        name: "ExecutionRevertedError"
      });
    }
  };
  Object.defineProperty(ExecutionRevertedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 3
  });
  Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /execution reverted/
  });
  FeeCapTooHighError = class FeeCapTooHighError extends BaseError2 {
    constructor({ cause, maxFeePerGas } = {}) {
      super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, {
        cause,
        name: "FeeCapTooHighError"
      });
    }
  };
  Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
  });
  FeeCapTooLowError = class FeeCapTooLowError extends BaseError2 {
    constructor({ cause, maxFeePerGas } = {}) {
      super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)}` : ""} gwei) cannot be lower than the block base fee.`, {
        cause,
        name: "FeeCapTooLowError"
      });
    }
  };
  Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
  });
  NonceTooHighError = class NonceTooHighError extends BaseError2 {
    constructor({ cause, nonce } = {}) {
      super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is higher than the next one expected.`, { cause, name: "NonceTooHighError" });
    }
  };
  Object.defineProperty(NonceTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce too high/
  });
  NonceTooLowError = class NonceTooLowError extends BaseError2 {
    constructor({ cause, nonce } = {}) {
      super([
        `Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is lower than the current nonce of the account.`,
        "Try increasing the nonce or find the latest nonce with `getTransactionCount`."
      ].join(`
`), { cause, name: "NonceTooLowError" });
    }
  };
  Object.defineProperty(NonceTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce too low|transaction already imported|already known/
  });
  NonceMaxValueError = class NonceMaxValueError extends BaseError2 {
    constructor({ cause, nonce } = {}) {
      super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}exceeds the maximum allowed nonce.`, { cause, name: "NonceMaxValueError" });
    }
  };
  Object.defineProperty(NonceMaxValueError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce has max value/
  });
  InsufficientFundsError = class InsufficientFundsError extends BaseError2 {
    constructor({ cause } = {}) {
      super([
        "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
      ].join(`
`), {
        cause,
        metaMessages: [
          "This error could arise when the account does not have enough funds to:",
          " - pay for the total gas fee,",
          " - pay for the value to send.",
          " ",
          "The cost of the transaction is calculated as `gas * gas fee + value`, where:",
          " - `gas` is the amount of gas needed for transaction to execute,",
          " - `gas fee` is the gas fee,",
          " - `value` is the amount of ether to send to the recipient."
        ],
        name: "InsufficientFundsError"
      });
    }
  };
  Object.defineProperty(InsufficientFundsError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /insufficient funds|exceeds transaction sender account balance/
  });
  IntrinsicGasTooHighError = class IntrinsicGasTooHighError extends BaseError2 {
    constructor({ cause, gas } = {}) {
      super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, {
        cause,
        name: "IntrinsicGasTooHighError"
      });
    }
  };
  Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /intrinsic gas too high|gas limit reached/
  });
  IntrinsicGasTooLowError = class IntrinsicGasTooLowError extends BaseError2 {
    constructor({ cause, gas } = {}) {
      super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction is too low.`, {
        cause,
        name: "IntrinsicGasTooLowError"
      });
    }
  };
  Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /intrinsic gas too low/
  });
  TransactionTypeNotSupportedError = class TransactionTypeNotSupportedError extends BaseError2 {
    constructor({ cause }) {
      super("The transaction type is not supported for this chain.", {
        cause,
        name: "TransactionTypeNotSupportedError"
      });
    }
  };
  Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /transaction type not valid/
  });
  TipAboveFeeCapError = class TipAboveFeeCapError extends BaseError2 {
    constructor({ cause, maxPriorityFeePerGas, maxFeePerGas } = {}) {
      super([
        `The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas ? ` = ${formatGwei(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}).`
      ].join(`
`), {
        cause,
        name: "TipAboveFeeCapError"
      });
    }
  };
  Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
  });
  UnknownNodeError = class UnknownNodeError extends BaseError2 {
    constructor({ cause }) {
      super(`An error occurred while executing: ${cause?.shortMessage}`, {
        cause,
        name: "UnknownNodeError"
      });
    }
  };
});

// node_modules/viem/_esm/utils/errors/getNodeError.js
function getNodeError(err, args) {
  const message = (err.details || "").toLowerCase();
  const executionRevertedError = err instanceof BaseError2 ? err.walk((e) => e?.code === ExecutionRevertedError.code) : err;
  if (executionRevertedError instanceof BaseError2)
    return new ExecutionRevertedError({
      cause: err,
      message: executionRevertedError.details
    });
  if (ExecutionRevertedError.nodeMessage.test(message))
    return new ExecutionRevertedError({
      cause: err,
      message: err.details
    });
  if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce });
  if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce });
  if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce });
  if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: err });
  if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas });
  if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas });
  if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: err });
  if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas
    });
  return new UnknownNodeError({
    cause: err
  });
}
var init_getNodeError = __esm(() => {
  init_base();
  init_node();
});

// node_modules/viem/_esm/utils/errors/getEstimateGasError.js
function getEstimateGasError(err, { docsPath: docsPath3, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new EstimateGasExecutionError(cause, {
    docsPath: docsPath3,
    ...args
  });
}
var init_getEstimateGasError = __esm(() => {
  init_estimateGas();
  init_node();
  init_getNodeError();
});

// node_modules/viem/_esm/utils/formatters/extract.js
function extract(value_, { format }) {
  if (!format)
    return {};
  const value = {};
  function extract_(formatted2) {
    const keys = Object.keys(formatted2);
    for (const key of keys) {
      if (key in value_)
        value[key] = value_[key];
      if (formatted2[key] && typeof formatted2[key] === "object" && !Array.isArray(formatted2[key]))
        extract_(formatted2[key]);
    }
  }
  const formatted = format(value_ || {});
  extract_(formatted);
  return value;
}

// node_modules/viem/_esm/utils/formatters/transactionRequest.js
function formatTransactionRequest(request, _) {
  const rpcRequest = {};
  if (typeof request.authorizationList !== "undefined")
    rpcRequest.authorizationList = formatAuthorizationList(request.authorizationList);
  if (typeof request.accessList !== "undefined")
    rpcRequest.accessList = request.accessList;
  if (typeof request.blobVersionedHashes !== "undefined")
    rpcRequest.blobVersionedHashes = request.blobVersionedHashes;
  if (typeof request.blobs !== "undefined") {
    if (typeof request.blobs[0] !== "string")
      rpcRequest.blobs = request.blobs.map((x) => bytesToHex(x));
    else
      rpcRequest.blobs = request.blobs;
  }
  if (typeof request.data !== "undefined")
    rpcRequest.data = request.data;
  if (request.account)
    rpcRequest.from = request.account.address;
  if (typeof request.from !== "undefined")
    rpcRequest.from = request.from;
  if (typeof request.gas !== "undefined")
    rpcRequest.gas = numberToHex(request.gas);
  if (typeof request.gasPrice !== "undefined")
    rpcRequest.gasPrice = numberToHex(request.gasPrice);
  if (typeof request.maxFeePerBlobGas !== "undefined")
    rpcRequest.maxFeePerBlobGas = numberToHex(request.maxFeePerBlobGas);
  if (typeof request.maxFeePerGas !== "undefined")
    rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas);
  if (typeof request.maxPriorityFeePerGas !== "undefined")
    rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas);
  if (typeof request.nonce !== "undefined")
    rpcRequest.nonce = numberToHex(request.nonce);
  if (typeof request.to !== "undefined")
    rpcRequest.to = request.to;
  if (typeof request.type !== "undefined")
    rpcRequest.type = rpcTransactionType[request.type];
  if (typeof request.value !== "undefined")
    rpcRequest.value = numberToHex(request.value);
  return rpcRequest;
}
function formatAuthorizationList(authorizationList) {
  return authorizationList.map((authorization) => ({
    address: authorization.address,
    r: authorization.r ? numberToHex(BigInt(authorization.r)) : authorization.r,
    s: authorization.s ? numberToHex(BigInt(authorization.s)) : authorization.s,
    chainId: numberToHex(authorization.chainId),
    nonce: numberToHex(authorization.nonce),
    ...typeof authorization.yParity !== "undefined" ? { yParity: numberToHex(authorization.yParity) } : {},
    ...typeof authorization.v !== "undefined" && typeof authorization.yParity === "undefined" ? { v: numberToHex(authorization.v) } : {}
  }));
}
var rpcTransactionType;
var init_transactionRequest = __esm(() => {
  init_toHex();
  rpcTransactionType = {
    legacy: "0x0",
    eip2930: "0x1",
    eip1559: "0x2",
    eip4844: "0x3",
    eip7702: "0x4"
  };
});

// node_modules/viem/_esm/utils/stateOverride.js
function serializeStateMapping(stateMapping) {
  if (!stateMapping || stateMapping.length === 0)
    return;
  return stateMapping.reduce((acc, { slot, value }) => {
    if (slot.length !== 66)
      throw new InvalidBytesLengthError({
        size: slot.length,
        targetSize: 66,
        type: "hex"
      });
    if (value.length !== 66)
      throw new InvalidBytesLengthError({
        size: value.length,
        targetSize: 66,
        type: "hex"
      });
    acc[slot] = value;
    return acc;
  }, {});
}
function serializeAccountStateOverride(parameters) {
  const { balance, nonce, state, stateDiff, code } = parameters;
  const rpcAccountStateOverride = {};
  if (code !== undefined)
    rpcAccountStateOverride.code = code;
  if (balance !== undefined)
    rpcAccountStateOverride.balance = numberToHex(balance);
  if (nonce !== undefined)
    rpcAccountStateOverride.nonce = numberToHex(nonce);
  if (state !== undefined)
    rpcAccountStateOverride.state = serializeStateMapping(state);
  if (stateDiff !== undefined) {
    if (rpcAccountStateOverride.state)
      throw new StateAssignmentConflictError;
    rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff);
  }
  return rpcAccountStateOverride;
}
function serializeStateOverride(parameters) {
  if (!parameters)
    return;
  const rpcStateOverride = {};
  for (const { address, ...accountState } of parameters) {
    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address });
    if (rpcStateOverride[address])
      throw new AccountStateConflictError({ address });
    rpcStateOverride[address] = serializeAccountStateOverride(accountState);
  }
  return rpcStateOverride;
}
var init_stateOverride2 = __esm(() => {
  init_address();
  init_data();
  init_stateOverride();
  init_isAddress();
  init_toHex();
});

// node_modules/viem/_esm/constants/number.js
var maxInt8, maxInt16, maxInt24, maxInt32, maxInt40, maxInt48, maxInt56, maxInt64, maxInt72, maxInt80, maxInt88, maxInt96, maxInt104, maxInt112, maxInt120, maxInt128, maxInt136, maxInt144, maxInt152, maxInt160, maxInt168, maxInt176, maxInt184, maxInt192, maxInt200, maxInt208, maxInt216, maxInt224, maxInt232, maxInt240, maxInt248, maxInt256, minInt8, minInt16, minInt24, minInt32, minInt40, minInt48, minInt56, minInt64, minInt72, minInt80, minInt88, minInt96, minInt104, minInt112, minInt120, minInt128, minInt136, minInt144, minInt152, minInt160, minInt168, minInt176, minInt184, minInt192, minInt200, minInt208, minInt216, minInt224, minInt232, minInt240, minInt248, minInt256, maxUint8, maxUint16, maxUint24, maxUint32, maxUint40, maxUint48, maxUint56, maxUint64, maxUint72, maxUint80, maxUint88, maxUint96, maxUint104, maxUint112, maxUint120, maxUint128, maxUint136, maxUint144, maxUint152, maxUint160, maxUint168, maxUint176, maxUint184, maxUint192, maxUint200, maxUint208, maxUint216, maxUint224, maxUint232, maxUint240, maxUint248, maxUint256;
var init_number = __esm(() => {
  maxInt8 = 2n ** (8n - 1n) - 1n;
  maxInt16 = 2n ** (16n - 1n) - 1n;
  maxInt24 = 2n ** (24n - 1n) - 1n;
  maxInt32 = 2n ** (32n - 1n) - 1n;
  maxInt40 = 2n ** (40n - 1n) - 1n;
  maxInt48 = 2n ** (48n - 1n) - 1n;
  maxInt56 = 2n ** (56n - 1n) - 1n;
  maxInt64 = 2n ** (64n - 1n) - 1n;
  maxInt72 = 2n ** (72n - 1n) - 1n;
  maxInt80 = 2n ** (80n - 1n) - 1n;
  maxInt88 = 2n ** (88n - 1n) - 1n;
  maxInt96 = 2n ** (96n - 1n) - 1n;
  maxInt104 = 2n ** (104n - 1n) - 1n;
  maxInt112 = 2n ** (112n - 1n) - 1n;
  maxInt120 = 2n ** (120n - 1n) - 1n;
  maxInt128 = 2n ** (128n - 1n) - 1n;
  maxInt136 = 2n ** (136n - 1n) - 1n;
  maxInt144 = 2n ** (144n - 1n) - 1n;
  maxInt152 = 2n ** (152n - 1n) - 1n;
  maxInt160 = 2n ** (160n - 1n) - 1n;
  maxInt168 = 2n ** (168n - 1n) - 1n;
  maxInt176 = 2n ** (176n - 1n) - 1n;
  maxInt184 = 2n ** (184n - 1n) - 1n;
  maxInt192 = 2n ** (192n - 1n) - 1n;
  maxInt200 = 2n ** (200n - 1n) - 1n;
  maxInt208 = 2n ** (208n - 1n) - 1n;
  maxInt216 = 2n ** (216n - 1n) - 1n;
  maxInt224 = 2n ** (224n - 1n) - 1n;
  maxInt232 = 2n ** (232n - 1n) - 1n;
  maxInt240 = 2n ** (240n - 1n) - 1n;
  maxInt248 = 2n ** (248n - 1n) - 1n;
  maxInt256 = 2n ** (256n - 1n) - 1n;
  minInt8 = -(2n ** (8n - 1n));
  minInt16 = -(2n ** (16n - 1n));
  minInt24 = -(2n ** (24n - 1n));
  minInt32 = -(2n ** (32n - 1n));
  minInt40 = -(2n ** (40n - 1n));
  minInt48 = -(2n ** (48n - 1n));
  minInt56 = -(2n ** (56n - 1n));
  minInt64 = -(2n ** (64n - 1n));
  minInt72 = -(2n ** (72n - 1n));
  minInt80 = -(2n ** (80n - 1n));
  minInt88 = -(2n ** (88n - 1n));
  minInt96 = -(2n ** (96n - 1n));
  minInt104 = -(2n ** (104n - 1n));
  minInt112 = -(2n ** (112n - 1n));
  minInt120 = -(2n ** (120n - 1n));
  minInt128 = -(2n ** (128n - 1n));
  minInt136 = -(2n ** (136n - 1n));
  minInt144 = -(2n ** (144n - 1n));
  minInt152 = -(2n ** (152n - 1n));
  minInt160 = -(2n ** (160n - 1n));
  minInt168 = -(2n ** (168n - 1n));
  minInt176 = -(2n ** (176n - 1n));
  minInt184 = -(2n ** (184n - 1n));
  minInt192 = -(2n ** (192n - 1n));
  minInt200 = -(2n ** (200n - 1n));
  minInt208 = -(2n ** (208n - 1n));
  minInt216 = -(2n ** (216n - 1n));
  minInt224 = -(2n ** (224n - 1n));
  minInt232 = -(2n ** (232n - 1n));
  minInt240 = -(2n ** (240n - 1n));
  minInt248 = -(2n ** (248n - 1n));
  minInt256 = -(2n ** (256n - 1n));
  maxUint8 = 2n ** 8n - 1n;
  maxUint16 = 2n ** 16n - 1n;
  maxUint24 = 2n ** 24n - 1n;
  maxUint32 = 2n ** 32n - 1n;
  maxUint40 = 2n ** 40n - 1n;
  maxUint48 = 2n ** 48n - 1n;
  maxUint56 = 2n ** 56n - 1n;
  maxUint64 = 2n ** 64n - 1n;
  maxUint72 = 2n ** 72n - 1n;
  maxUint80 = 2n ** 80n - 1n;
  maxUint88 = 2n ** 88n - 1n;
  maxUint96 = 2n ** 96n - 1n;
  maxUint104 = 2n ** 104n - 1n;
  maxUint112 = 2n ** 112n - 1n;
  maxUint120 = 2n ** 120n - 1n;
  maxUint128 = 2n ** 128n - 1n;
  maxUint136 = 2n ** 136n - 1n;
  maxUint144 = 2n ** 144n - 1n;
  maxUint152 = 2n ** 152n - 1n;
  maxUint160 = 2n ** 160n - 1n;
  maxUint168 = 2n ** 168n - 1n;
  maxUint176 = 2n ** 176n - 1n;
  maxUint184 = 2n ** 184n - 1n;
  maxUint192 = 2n ** 192n - 1n;
  maxUint200 = 2n ** 200n - 1n;
  maxUint208 = 2n ** 208n - 1n;
  maxUint216 = 2n ** 216n - 1n;
  maxUint224 = 2n ** 224n - 1n;
  maxUint232 = 2n ** 232n - 1n;
  maxUint240 = 2n ** 240n - 1n;
  maxUint248 = 2n ** 248n - 1n;
  maxUint256 = 2n ** 256n - 1n;
});

// node_modules/viem/_esm/utils/transaction/assertRequest.js
function assertRequest(args) {
  const { account: account_, gasPrice, maxFeePerGas, maxPriorityFeePerGas, to } = args;
  const account = account_ ? parseAccount(account_) : undefined;
  if (account && !isAddress(account.address))
    throw new InvalidAddressError({ address: account.address });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof gasPrice !== "undefined" && (typeof maxFeePerGas !== "undefined" || typeof maxPriorityFeePerGas !== "undefined"))
    throw new FeeConflictError;
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
var init_assertRequest = __esm(() => {
  init_number();
  init_address();
  init_node();
  init_transaction();
  init_isAddress();
});

// node_modules/viem/_esm/errors/fee.js
var BaseFeeScalarError, Eip1559FeesNotSupportedError, MaxFeePerGasTooLowError;
var init_fee = __esm(() => {
  init_formatGwei();
  init_base();
  BaseFeeScalarError = class BaseFeeScalarError extends BaseError2 {
    constructor() {
      super("`baseFeeMultiplier` must be greater than 1.", {
        name: "BaseFeeScalarError"
      });
    }
  };
  Eip1559FeesNotSupportedError = class Eip1559FeesNotSupportedError extends BaseError2 {
    constructor() {
      super("Chain does not support EIP-1559 fees.", {
        name: "Eip1559FeesNotSupportedError"
      });
    }
  };
  MaxFeePerGasTooLowError = class MaxFeePerGasTooLowError extends BaseError2 {
    constructor({ maxPriorityFeePerGas }) {
      super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(maxPriorityFeePerGas)} gwei).`, { name: "MaxFeePerGasTooLowError" });
    }
  };
});

// node_modules/viem/_esm/errors/block.js
var BlockNotFoundError;
var init_block = __esm(() => {
  init_base();
  BlockNotFoundError = class BlockNotFoundError extends BaseError2 {
    constructor({ blockHash, blockNumber }) {
      let identifier = "Block";
      if (blockHash)
        identifier = `Block at hash "${blockHash}"`;
      if (blockNumber)
        identifier = `Block at number "${blockNumber}"`;
      super(`${identifier} could not be found.`, { name: "BlockNotFoundError" });
    }
  };
});

// node_modules/viem/_esm/utils/formatters/transaction.js
function formatTransaction(transaction, _) {
  const transaction_ = {
    ...transaction,
    blockHash: transaction.blockHash ? transaction.blockHash : null,
    blockNumber: transaction.blockNumber ? BigInt(transaction.blockNumber) : null,
    chainId: transaction.chainId ? hexToNumber(transaction.chainId) : undefined,
    gas: transaction.gas ? BigInt(transaction.gas) : undefined,
    gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
    maxFeePerBlobGas: transaction.maxFeePerBlobGas ? BigInt(transaction.maxFeePerBlobGas) : undefined,
    maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : undefined,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : undefined,
    nonce: transaction.nonce ? hexToNumber(transaction.nonce) : undefined,
    to: transaction.to ? transaction.to : null,
    transactionIndex: transaction.transactionIndex ? Number(transaction.transactionIndex) : null,
    type: transaction.type ? transactionType[transaction.type] : undefined,
    typeHex: transaction.type ? transaction.type : undefined,
    value: transaction.value ? BigInt(transaction.value) : undefined,
    v: transaction.v ? BigInt(transaction.v) : undefined
  };
  if (transaction.authorizationList)
    transaction_.authorizationList = formatAuthorizationList2(transaction.authorizationList);
  transaction_.yParity = (() => {
    if (transaction.yParity)
      return Number(transaction.yParity);
    if (typeof transaction_.v === "bigint") {
      if (transaction_.v === 0n || transaction_.v === 27n)
        return 0;
      if (transaction_.v === 1n || transaction_.v === 28n)
        return 1;
      if (transaction_.v >= 35n)
        return transaction_.v % 2n === 0n ? 1 : 0;
    }
    return;
  })();
  if (transaction_.type === "legacy") {
    delete transaction_.accessList;
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
    delete transaction_.yParity;
  }
  if (transaction_.type === "eip2930") {
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
  }
  if (transaction_.type === "eip1559") {
    delete transaction_.maxFeePerBlobGas;
  }
  return transaction_;
}
function formatAuthorizationList2(authorizationList) {
  return authorizationList.map((authorization) => ({
    address: authorization.address,
    chainId: Number(authorization.chainId),
    nonce: Number(authorization.nonce),
    r: authorization.r,
    s: authorization.s,
    yParity: Number(authorization.yParity)
  }));
}
var transactionType;
var init_transaction2 = __esm(() => {
  init_fromHex();
  transactionType = {
    "0x0": "legacy",
    "0x1": "eip2930",
    "0x2": "eip1559",
    "0x3": "eip4844",
    "0x4": "eip7702"
  };
});

// node_modules/viem/_esm/utils/formatters/block.js
function formatBlock(block, _) {
  const transactions = (block.transactions ?? []).map((transaction) => {
    if (typeof transaction === "string")
      return transaction;
    return formatTransaction(transaction);
  });
  return {
    ...block,
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : undefined,
    difficulty: block.difficulty ? BigInt(block.difficulty) : undefined,
    excessBlobGas: block.excessBlobGas ? BigInt(block.excessBlobGas) : undefined,
    gasLimit: block.gasLimit ? BigInt(block.gasLimit) : undefined,
    gasUsed: block.gasUsed ? BigInt(block.gasUsed) : undefined,
    hash: block.hash ? block.hash : null,
    logsBloom: block.logsBloom ? block.logsBloom : null,
    nonce: block.nonce ? block.nonce : null,
    number: block.number ? BigInt(block.number) : null,
    size: block.size ? BigInt(block.size) : undefined,
    timestamp: block.timestamp ? BigInt(block.timestamp) : undefined,
    transactions,
    totalDifficulty: block.totalDifficulty ? BigInt(block.totalDifficulty) : null
  };
}
var init_block2 = __esm(() => {
  init_transaction2();
});

// node_modules/viem/_esm/actions/public/getBlock.js
async function getBlock(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", includeTransactions: includeTransactions_ } = {}) {
  const includeTransactions = includeTransactions_ ?? false;
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  let block = null;
  if (blockHash) {
    block = await client.request({
      method: "eth_getBlockByHash",
      params: [blockHash, includeTransactions]
    }, { dedupe: true });
  } else {
    block = await client.request({
      method: "eth_getBlockByNumber",
      params: [blockNumberHex || blockTag, includeTransactions]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  if (!block)
    throw new BlockNotFoundError({ blockHash, blockNumber });
  const format = client.chain?.formatters?.block?.format || formatBlock;
  return format(block, "getBlock");
}
var init_getBlock = __esm(() => {
  init_block();
  init_toHex();
  init_block2();
});

// node_modules/viem/_esm/actions/public/getGasPrice.js
async function getGasPrice(client) {
  const gasPrice = await client.request({
    method: "eth_gasPrice"
  });
  return BigInt(gasPrice);
}

// node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
async function estimateMaxPriorityFeePerGas(client, args) {
  return internal_estimateMaxPriorityFeePerGas(client, args);
}
async function internal_estimateMaxPriorityFeePerGas(client, args) {
  const { block: block_, chain = client.chain, request } = args || {};
  try {
    const maxPriorityFeePerGas = chain?.fees?.maxPriorityFeePerGas ?? chain?.fees?.defaultPriorityFee;
    if (typeof maxPriorityFeePerGas === "function") {
      const block = block_ || await getAction(client, getBlock, "getBlock")({});
      const maxPriorityFeePerGas_ = await maxPriorityFeePerGas({
        block,
        client,
        request
      });
      if (maxPriorityFeePerGas_ === null)
        throw new Error;
      return maxPriorityFeePerGas_;
    }
    if (typeof maxPriorityFeePerGas !== "undefined")
      return maxPriorityFeePerGas;
    const maxPriorityFeePerGasHex = await client.request({
      method: "eth_maxPriorityFeePerGas"
    });
    return hexToBigInt(maxPriorityFeePerGasHex);
  } catch {
    const [block, gasPrice] = await Promise.all([
      block_ ? Promise.resolve(block_) : getAction(client, getBlock, "getBlock")({}),
      getAction(client, getGasPrice, "getGasPrice")({})
    ]);
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError;
    const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;
    if (maxPriorityFeePerGas < 0n)
      return 0n;
    return maxPriorityFeePerGas;
  }
}
var init_estimateMaxPriorityFeePerGas = __esm(() => {
  init_fee();
  init_fromHex();
  init_getBlock();
});

// node_modules/viem/_esm/actions/public/estimateFeesPerGas.js
async function estimateFeesPerGas(client, args) {
  return internal_estimateFeesPerGas(client, args);
}
async function internal_estimateFeesPerGas(client, args) {
  const { block: block_, chain = client.chain, request, type = "eip1559" } = args || {};
  const baseFeeMultiplier = await (async () => {
    if (typeof chain?.fees?.baseFeeMultiplier === "function")
      return chain.fees.baseFeeMultiplier({
        block: block_,
        client,
        request
      });
    return chain?.fees?.baseFeeMultiplier ?? 1.2;
  })();
  if (baseFeeMultiplier < 1)
    throw new BaseFeeScalarError;
  const decimals = baseFeeMultiplier.toString().split(".")[1]?.length ?? 0;
  const denominator = 10 ** decimals;
  const multiply = (base) => base * BigInt(Math.ceil(baseFeeMultiplier * denominator)) / BigInt(denominator);
  const block = block_ ? block_ : await getAction(client, getBlock, "getBlock")({});
  if (typeof chain?.fees?.estimateFeesPerGas === "function") {
    const fees = await chain.fees.estimateFeesPerGas({
      block: block_,
      client,
      multiply,
      request,
      type
    });
    if (fees !== null)
      return fees;
  }
  if (type === "eip1559") {
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError;
    const maxPriorityFeePerGas = typeof request?.maxPriorityFeePerGas === "bigint" ? request.maxPriorityFeePerGas : await internal_estimateMaxPriorityFeePerGas(client, {
      block,
      chain,
      request
    });
    const baseFeePerGas = multiply(block.baseFeePerGas);
    const maxFeePerGas = request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas;
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }
  const gasPrice = request?.gasPrice ?? multiply(await getAction(client, getGasPrice, "getGasPrice")({}));
  return {
    gasPrice
  };
}
var init_estimateFeesPerGas = __esm(() => {
  init_fee();
  init_estimateMaxPriorityFeePerGas();
  init_getBlock();
});

// node_modules/viem/_esm/actions/public/getTransactionCount.js
async function getTransactionCount(client, { address, blockTag = "latest", blockNumber }) {
  const count = await client.request({
    method: "eth_getTransactionCount",
    params: [
      address,
      typeof blockNumber === "bigint" ? numberToHex(blockNumber) : blockTag
    ]
  }, {
    dedupe: Boolean(blockNumber)
  });
  return hexToNumber(count);
}
var init_getTransactionCount = __esm(() => {
  init_fromHex();
  init_toHex();
});

// node_modules/viem/_esm/utils/blob/blobsToCommitments.js
function blobsToCommitments(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = [];
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
  return to === "bytes" ? commitments : commitments.map((x) => bytesToHex(x));
}
var init_blobsToCommitments = __esm(() => {
  init_toBytes();
  init_toHex();
});

// node_modules/viem/_esm/utils/blob/blobsToProofs.js
function blobsToProofs(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x) => hexToBytes(x)) : parameters.commitments;
  const proofs = [];
  for (let i = 0;i < blobs.length; i++) {
    const blob = blobs[i];
    const commitment = commitments[i];
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
  }
  return to === "bytes" ? proofs : proofs.map((x) => bytesToHex(x));
}
var init_blobsToProofs = __esm(() => {
  init_toBytes();
  init_toHex();
});

// node_modules/viem/node_modules/@noble/hashes/esm/sha256.js
var sha2562;
var init_sha256 = __esm(() => {
  init_sha2();
  sha2562 = sha256;
});

// node_modules/viem/_esm/utils/hash/sha256.js
function sha2563(value, to_) {
  const to = to_ || "hex";
  const bytes = sha2562(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
var init_sha2562 = __esm(() => {
  init_sha256();
  init_toBytes();
  init_toHex();
});

// node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
function commitmentToVersionedHash(parameters) {
  const { commitment, version: version3 = 1 } = parameters;
  const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
  const versionedHash = sha2563(commitment, "bytes");
  versionedHash.set([version3], 0);
  return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
}
var init_commitmentToVersionedHash = __esm(() => {
  init_toHex();
  init_sha2562();
});

// node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js
function commitmentsToVersionedHashes(parameters) {
  const { commitments, version: version3 } = parameters;
  const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
  const hashes = [];
  for (const commitment of commitments) {
    hashes.push(commitmentToVersionedHash({
      commitment,
      to,
      version: version3
    }));
  }
  return hashes;
}
var init_commitmentsToVersionedHashes = __esm(() => {
  init_commitmentToVersionedHash();
});

// node_modules/viem/_esm/constants/blob.js
var blobsPerTransaction = 6, bytesPerFieldElement = 32, fieldElementsPerBlob = 4096, bytesPerBlob, maxBytesPerTransaction;
var init_blob = __esm(() => {
  bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
  maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - 1 - 1 * fieldElementsPerBlob * blobsPerTransaction;
});

// node_modules/viem/_esm/constants/kzg.js
var versionedHashVersionKzg = 1;

// node_modules/viem/_esm/errors/blob.js
var BlobSizeTooLargeError, EmptyBlobError, InvalidVersionedHashSizeError, InvalidVersionedHashVersionError;
var init_blob2 = __esm(() => {
  init_base();
  BlobSizeTooLargeError = class BlobSizeTooLargeError extends BaseError2 {
    constructor({ maxSize, size: size2 }) {
      super("Blob size is too large.", {
        metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size2} bytes`],
        name: "BlobSizeTooLargeError"
      });
    }
  };
  EmptyBlobError = class EmptyBlobError extends BaseError2 {
    constructor() {
      super("Blob data must not be empty.", { name: "EmptyBlobError" });
    }
  };
  InvalidVersionedHashSizeError = class InvalidVersionedHashSizeError extends BaseError2 {
    constructor({ hash: hash2, size: size2 }) {
      super(`Versioned hash "${hash2}" size is invalid.`, {
        metaMessages: ["Expected: 32", `Received: ${size2}`],
        name: "InvalidVersionedHashSizeError"
      });
    }
  };
  InvalidVersionedHashVersionError = class InvalidVersionedHashVersionError extends BaseError2 {
    constructor({ hash: hash2, version: version3 }) {
      super(`Versioned hash "${hash2}" version is invalid.`, {
        metaMessages: [
          `Expected: ${versionedHashVersionKzg}`,
          `Received: ${version3}`
        ],
        name: "InvalidVersionedHashVersionError"
      });
    }
  };
});

// node_modules/viem/_esm/utils/blob/toBlobs.js
function toBlobs(parameters) {
  const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
  const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
  const size_ = size(data);
  if (!size_)
    throw new EmptyBlobError;
  if (size_ > maxBytesPerTransaction)
    throw new BlobSizeTooLargeError({
      maxSize: maxBytesPerTransaction,
      size: size_
    });
  const blobs = [];
  let active = true;
  let position = 0;
  while (active) {
    const blob = createCursor(new Uint8Array(bytesPerBlob));
    let size2 = 0;
    while (size2 < fieldElementsPerBlob) {
      const bytes = data.slice(position, position + (bytesPerFieldElement - 1));
      blob.pushByte(0);
      blob.pushBytes(bytes);
      if (bytes.length < 31) {
        blob.pushByte(128);
        active = false;
        break;
      }
      size2++;
      position += 31;
    }
    blobs.push(blob);
  }
  return to === "bytes" ? blobs.map((x) => x.bytes) : blobs.map((x) => bytesToHex(x.bytes));
}
var init_toBlobs = __esm(() => {
  init_blob();
  init_blob2();
  init_cursor2();
  init_size();
  init_toBytes();
  init_toHex();
});

// node_modules/viem/_esm/utils/blob/toBlobSidecars.js
function toBlobSidecars(parameters) {
  const { data, kzg, to } = parameters;
  const blobs = parameters.blobs ?? toBlobs({ data, to });
  const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg, to });
  const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg, to });
  const sidecars = [];
  for (let i = 0;i < blobs.length; i++)
    sidecars.push({
      blob: blobs[i],
      commitment: commitments[i],
      proof: proofs[i]
    });
  return sidecars;
}
var init_toBlobSidecars = __esm(() => {
  init_blobsToCommitments();
  init_blobsToProofs();
  init_toBlobs();
});

// node_modules/viem/_esm/utils/transaction/getTransactionType.js
function getTransactionType(transaction) {
  if (transaction.type)
    return transaction.type;
  if (typeof transaction.authorizationList !== "undefined")
    return "eip7702";
  if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined")
    return "eip4844";
  if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") {
    return "eip1559";
  }
  if (typeof transaction.gasPrice !== "undefined") {
    if (typeof transaction.accessList !== "undefined")
      return "eip2930";
    return "legacy";
  }
  throw new InvalidSerializableTransactionError({ transaction });
}
var init_getTransactionType = __esm(() => {
  init_transaction();
});

// node_modules/viem/_esm/actions/public/getChainId.js
async function getChainId(client) {
  const chainIdHex = await client.request({
    method: "eth_chainId"
  }, { dedupe: true });
  return hexToNumber(chainIdHex);
}
var init_getChainId = __esm(() => {
  init_fromHex();
});

// node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
async function prepareTransactionRequest(client, args) {
  const { account: account_ = client.account, blobs, chain, gas, kzg, nonce, nonceManager, parameters = defaultParameters, type } = args;
  const account = account_ ? parseAccount(account_) : account_;
  const request = { ...args, ...account ? { from: account?.address } : {} };
  let block;
  async function getBlock2() {
    if (block)
      return block;
    block = await getAction(client, getBlock, "getBlock")({ blockTag: "latest" });
    return block;
  }
  let chainId;
  async function getChainId2() {
    if (chainId)
      return chainId;
    if (chain)
      return chain.id;
    if (typeof args.chainId !== "undefined")
      return args.chainId;
    const chainId_ = await getAction(client, getChainId, "getChainId")({});
    chainId = chainId_;
    return chainId;
  }
  if (parameters.includes("nonce") && typeof nonce === "undefined" && account) {
    if (nonceManager) {
      const chainId2 = await getChainId2();
      request.nonce = await nonceManager.consume({
        address: account.address,
        chainId: chainId2,
        client
      });
    } else {
      request.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
        address: account.address,
        blockTag: "pending"
      });
    }
  }
  if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && blobs && kzg) {
    const commitments = blobsToCommitments({ blobs, kzg });
    if (parameters.includes("blobVersionedHashes")) {
      const versionedHashes = commitmentsToVersionedHashes({
        commitments,
        to: "hex"
      });
      request.blobVersionedHashes = versionedHashes;
    }
    if (parameters.includes("sidecars")) {
      const proofs = blobsToProofs({ blobs, commitments, kzg });
      const sidecars = toBlobSidecars({
        blobs,
        commitments,
        proofs,
        to: "hex"
      });
      request.sidecars = sidecars;
    }
  }
  if (parameters.includes("chainId"))
    request.chainId = await getChainId2();
  if ((parameters.includes("fees") || parameters.includes("type")) && typeof type === "undefined") {
    try {
      request.type = getTransactionType(request);
    } catch {
      let isEip1559Network = eip1559NetworkCache.get(client.uid);
      if (typeof isEip1559Network === "undefined") {
        const block2 = await getBlock2();
        isEip1559Network = typeof block2?.baseFeePerGas === "bigint";
        eip1559NetworkCache.set(client.uid, isEip1559Network);
      }
      request.type = isEip1559Network ? "eip1559" : "legacy";
    }
  }
  if (parameters.includes("fees")) {
    if (request.type !== "legacy" && request.type !== "eip2930") {
      if (typeof request.maxFeePerGas === "undefined" || typeof request.maxPriorityFeePerGas === "undefined") {
        const block2 = await getBlock2();
        const { maxFeePerGas, maxPriorityFeePerGas } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request
        });
        if (typeof args.maxPriorityFeePerGas === "undefined" && args.maxFeePerGas && args.maxFeePerGas < maxPriorityFeePerGas)
          throw new MaxFeePerGasTooLowError({
            maxPriorityFeePerGas
          });
        request.maxPriorityFeePerGas = maxPriorityFeePerGas;
        request.maxFeePerGas = maxFeePerGas;
      }
    } else {
      if (typeof args.maxFeePerGas !== "undefined" || typeof args.maxPriorityFeePerGas !== "undefined")
        throw new Eip1559FeesNotSupportedError;
      if (typeof args.gasPrice === "undefined") {
        const block2 = await getBlock2();
        const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request,
          type: "legacy"
        });
        request.gasPrice = gasPrice_;
      }
    }
  }
  if (parameters.includes("gas") && typeof gas === "undefined")
    request.gas = await getAction(client, estimateGas, "estimateGas")({
      ...request,
      account,
      prepare: account?.type === "local" ? [] : ["blobVersionedHashes"]
    });
  assertRequest(request);
  delete request.parameters;
  return request;
}
var defaultParameters, eip1559NetworkCache;
var init_prepareTransactionRequest = __esm(() => {
  init_estimateFeesPerGas();
  init_estimateGas2();
  init_getBlock();
  init_getTransactionCount();
  init_fee();
  init_blobsToCommitments();
  init_blobsToProofs();
  init_commitmentsToVersionedHashes();
  init_toBlobSidecars();
  init_assertRequest();
  init_getTransactionType();
  init_getChainId();
  defaultParameters = [
    "blobVersionedHashes",
    "chainId",
    "fees",
    "gas",
    "nonce",
    "type"
  ];
  eip1559NetworkCache = /* @__PURE__ */ new Map;
});

// node_modules/viem/_esm/actions/public/estimateGas.js
async function estimateGas(client, args) {
  const { account: account_ = client.account, prepare = true } = args;
  const account = account_ ? parseAccount(account_) : undefined;
  const parameters = (() => {
    if (Array.isArray(prepare))
      return prepare;
    if (account?.type !== "local")
      return ["blobVersionedHashes"];
    return;
  })();
  try {
    const { accessList, authorizationList, blobs, blobVersionedHashes, blockNumber, blockTag, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, value, stateOverride, ...rest } = prepare ? await prepareTransactionRequest(client, {
      ...args,
      parameters
    }) : args;
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    const to = await (async () => {
      if (rest.to)
        return rest.to;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`");
        });
      return;
    })();
    assertRequest(args);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      ...extract(rest, { format: chainFormat }),
      account,
      accessList,
      authorizationList,
      blobs,
      blobVersionedHashes,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value
    }, "estimateGas");
    return BigInt(await client.request({
      method: "eth_estimateGas",
      params: rpcStateOverride ? [
        request,
        block ?? client.experimental_blockTag ?? "latest",
        rpcStateOverride
      ] : block ? [request, block] : [request]
    }));
  } catch (err) {
    throw getEstimateGasError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
var init_estimateGas2 = __esm(() => {
  init_base();
  init_recoverAuthorizationAddress();
  init_toHex();
  init_getEstimateGasError();
  init_transactionRequest();
  init_stateOverride2();
  init_assertRequest();
  init_prepareTransactionRequest();
});

// node_modules/viem/_esm/actions/public/estimateContractGas.js
async function estimateContractGas(client, parameters) {
  const { abi, address, args, functionName, dataSuffix, ...request } = parameters;
  const data = encodeFunctionData({
    abi,
    args,
    functionName
  });
  try {
    const gas = await getAction(client, estimateGas, "estimateGas")({
      data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...request
    });
    return gas;
  } catch (error) {
    const account = request.account ? parseAccount(request.account) : undefined;
    throw getContractError(error, {
      abi,
      address,
      args,
      docsPath: "/docs/contract/estimateContractGas",
      functionName,
      sender: account?.address
    });
  }
}
var init_estimateContractGas = __esm(() => {
  init_encodeFunctionData();
  init_getContractError();
  init_estimateGas2();
});

// node_modules/viem/_esm/utils/address/isAddressEqual.js
function isAddressEqual(a, b) {
  if (!isAddress(a, { strict: false }))
    throw new InvalidAddressError({ address: a });
  if (!isAddress(b, { strict: false }))
    throw new InvalidAddressError({ address: b });
  return a.toLowerCase() === b.toLowerCase();
}
var init_isAddressEqual = __esm(() => {
  init_address();
  init_isAddress();
});

// node_modules/viem/_esm/utils/abi/decodeEventLog.js
function decodeEventLog(parameters) {
  const { abi, data, strict: strict_, topics } = parameters;
  const strict = strict_ ?? true;
  const [signature, ...argTopics] = topics;
  if (!signature)
    throw new AbiEventSignatureEmptyTopicsError({ docsPath: docsPath3 });
  const abiItem = abi.find((x) => x.type === "event" && signature === toEventSelector(formatAbiItem2(x)));
  if (!(abiItem && ("name" in abiItem)) || abiItem.type !== "event")
    throw new AbiEventSignatureNotFoundError(signature, { docsPath: docsPath3 });
  const { name, inputs } = abiItem;
  const isUnnamed = inputs?.some((x) => !(("name" in x) && x.name));
  const args = isUnnamed ? [] : {};
  const indexedInputs = inputs.map((x, i) => [x, i]).filter(([x]) => ("indexed" in x) && x.indexed);
  for (let i = 0;i < indexedInputs.length; i++) {
    const [param, argIndex] = indexedInputs[i];
    const topic = argTopics[i];
    if (!topic)
      throw new DecodeLogTopicsMismatch({
        abiItem,
        param
      });
    args[isUnnamed ? argIndex : param.name || argIndex] = decodeTopic({
      param,
      value: topic
    });
  }
  const nonIndexedInputs = inputs.filter((x) => !(("indexed" in x) && x.indexed));
  if (nonIndexedInputs.length > 0) {
    if (data && data !== "0x") {
      try {
        const decodedData = decodeAbiParameters(nonIndexedInputs, data);
        if (decodedData) {
          if (isUnnamed)
            for (let i = 0;i < inputs.length; i++)
              args[i] = args[i] ?? decodedData.shift();
          else
            for (let i = 0;i < nonIndexedInputs.length; i++)
              args[nonIndexedInputs[i].name] = decodedData[i];
        }
      } catch (err) {
        if (strict) {
          if (err instanceof AbiDecodingDataSizeTooSmallError || err instanceof PositionOutOfBoundsError)
            throw new DecodeLogDataMismatch({
              abiItem,
              data,
              params: nonIndexedInputs,
              size: size(data)
            });
          throw err;
        }
      }
    } else if (strict) {
      throw new DecodeLogDataMismatch({
        abiItem,
        data: "0x",
        params: nonIndexedInputs,
        size: 0
      });
    }
  }
  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : undefined
  };
}
function decodeTopic({ param, value }) {
  if (param.type === "string" || param.type === "bytes" || param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    return value;
  const decodedArg = decodeAbiParameters([param], value) || [];
  return decodedArg[0];
}
var docsPath3 = "/docs/contract/decodeEventLog";
var init_decodeEventLog = __esm(() => {
  init_abi();
  init_cursor();
  init_size();
  init_toEventSelector();
  init_decodeAbiParameters();
  init_formatAbiItem2();
});

// node_modules/viem/_esm/utils/abi/parseEventLogs.js
function parseEventLogs(parameters) {
  const { abi, args, logs, strict = true } = parameters;
  const eventName = (() => {
    if (!parameters.eventName)
      return;
    if (Array.isArray(parameters.eventName))
      return parameters.eventName;
    return [parameters.eventName];
  })();
  return logs.map((log) => {
    try {
      const abiItem = abi.find((abiItem2) => abiItem2.type === "event" && log.topics[0] === toEventSelector(abiItem2));
      if (!abiItem)
        return null;
      const event = decodeEventLog({
        ...log,
        abi: [abiItem],
        strict
      });
      if (eventName && !eventName.includes(event.eventName))
        return null;
      if (!includesArgs({
        args: event.args,
        inputs: abiItem.inputs,
        matchArgs: args
      }))
        return null;
      return { ...event, ...log };
    } catch (err) {
      let eventName2;
      let isUnnamed;
      if (err instanceof AbiEventSignatureNotFoundError)
        return null;
      if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
        if (strict)
          return null;
        eventName2 = err.abiItem.name;
        isUnnamed = err.abiItem.inputs?.some((x) => !(("name" in x) && x.name));
      }
      return { ...log, args: isUnnamed ? [] : {}, eventName: eventName2 };
    }
  }).filter(Boolean);
}
function includesArgs(parameters) {
  const { args, inputs, matchArgs } = parameters;
  if (!matchArgs)
    return true;
  if (!args)
    return false;
  function isEqual(input, value, arg) {
    try {
      if (input.type === "address")
        return isAddressEqual(value, arg);
      if (input.type === "string" || input.type === "bytes")
        return keccak256(toBytes(value)) === arg;
      return value === arg;
    } catch {
      return false;
    }
  }
  if (Array.isArray(args) && Array.isArray(matchArgs)) {
    return matchArgs.every((value, index) => {
      if (value === null || value === undefined)
        return true;
      const input = inputs[index];
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual(input, value2, args[index]));
    });
  }
  if (typeof args === "object" && !Array.isArray(args) && typeof matchArgs === "object" && !Array.isArray(matchArgs))
    return Object.entries(matchArgs).every(([key, value]) => {
      if (value === null || value === undefined)
        return true;
      const input = inputs.find((input2) => input2.name === key);
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual(input, value2, args[key]));
    });
  return false;
}
var init_parseEventLogs = __esm(() => {
  init_abi();
  init_isAddressEqual();
  init_toBytes();
  init_keccak256();
  init_toEventSelector();
  init_decodeEventLog();
});

// node_modules/viem/_esm/utils/formatters/log.js
function formatLog(log, { args, eventName } = {}) {
  return {
    ...log,
    blockHash: log.blockHash ? log.blockHash : null,
    blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
    logIndex: log.logIndex ? Number(log.logIndex) : null,
    transactionHash: log.transactionHash ? log.transactionHash : null,
    transactionIndex: log.transactionIndex ? Number(log.transactionIndex) : null,
    ...eventName ? { args, eventName } : {}
  };
}

// node_modules/viem/_esm/actions/public/getLogs.js
async function getLogs(client, { address, blockHash, fromBlock, toBlock, event, events: events_, args, strict: strict_ } = {}) {
  const strict = strict_ ?? false;
  const events = events_ ?? (event ? [event] : undefined);
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args: events_ ? undefined : args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  let logs;
  if (blockHash) {
    logs = await client.request({
      method: "eth_getLogs",
      params: [{ address, topics, blockHash }]
    });
  } else {
    logs = await client.request({
      method: "eth_getLogs",
      params: [
        {
          address,
          topics,
          fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock
        }
      ]
    });
  }
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!events)
    return formattedLogs;
  return parseEventLogs({
    abi: events,
    args,
    logs: formattedLogs,
    strict
  });
}
var init_getLogs = __esm(() => {
  init_encodeEventTopics();
  init_parseEventLogs();
  init_toHex();
});

// node_modules/viem/_esm/actions/public/getContractEvents.js
async function getContractEvents(client, parameters) {
  const { abi, address, args, blockHash, eventName, fromBlock, toBlock, strict } = parameters;
  const event = eventName ? getAbiItem({ abi, name: eventName }) : undefined;
  const events = !event ? abi.filter((x) => x.type === "event") : undefined;
  return getAction(client, getLogs, "getLogs")({
    address,
    args,
    blockHash,
    event,
    events,
    fromBlock,
    toBlock,
    strict
  });
}
var init_getContractEvents = __esm(() => {
  init_getAbiItem();
  init_getLogs();
});

// node_modules/viem/_esm/utils/abi/decodeFunctionResult.js
function decodeFunctionResult(parameters) {
  const { abi, args, functionName, data } = parameters;
  let abiItem = abi[0];
  if (functionName) {
    const item = getAbiItem({ abi, args, name: functionName });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath4 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(undefined, { docsPath: docsPath4 });
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath4 });
  const values = decodeAbiParameters(abiItem.outputs, data);
  if (values && values.length > 1)
    return values;
  if (values && values.length === 1)
    return values[0];
  return;
}
var docsPath4 = "/docs/contract/decodeFunctionResult";
var init_decodeFunctionResult = __esm(() => {
  init_abi();
  init_decodeAbiParameters();
  init_getAbiItem();
});

// node_modules/ox/node_modules/@noble/curves/esm/abstract/utils.js
function isBytes3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes3(item) {
  if (!isBytes3(item))
    throw new Error("Uint8Array expected");
}
function abool2(title, value) {
  if (typeof value !== "boolean")
    throw new Error(title + " boolean expected, got " + value);
}
function numberToHexUnpadded2(num2) {
  const hex = num2.toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber3(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n7 : BigInt("0x" + hex);
}
function bytesToHex3(bytes) {
  abytes3(bytes);
  if (hasHexBuiltin2)
    return bytes.toHex();
  let hex = "";
  for (let i = 0;i < bytes.length; i++) {
    hex += hexes3[bytes[i]];
  }
  return hex;
}
function asciiToBase162(ch) {
  if (ch >= asciis2._0 && ch <= asciis2._9)
    return ch - asciis2._0;
  if (ch >= asciis2.A && ch <= asciis2.F)
    return ch - (asciis2.A - 10);
  if (ch >= asciis2.a && ch <= asciis2.f)
    return ch - (asciis2.a - 10);
  return;
}
function hexToBytes3(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin2)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
    const n1 = asciiToBase162(hex.charCodeAt(hi));
    const n2 = asciiToBase162(hex.charCodeAt(hi + 1));
    if (n1 === undefined || n2 === undefined) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function bytesToNumberBE2(bytes) {
  return hexToNumber3(bytesToHex3(bytes));
}
function bytesToNumberLE2(bytes) {
  abytes3(bytes);
  return hexToNumber3(bytesToHex3(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE2(n, len) {
  return hexToBytes3(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE2(n, len) {
  return numberToBytesBE2(n, len).reverse();
}
function ensureBytes2(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes3(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes3(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
function concatBytes4(...arrays) {
  let sum = 0;
  for (let i = 0;i < arrays.length; i++) {
    const a = arrays[i];
    abytes3(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0;i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function inRange2(n, min, max) {
  return isPosBig2(n) && isPosBig2(min) && isPosBig2(max) && min <= n && n < max;
}
function aInRange2(title, n, min, max) {
  if (!inRange2(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen2(n) {
  let len;
  for (len = 0;n > _0n7; n >>= _1n7, len += 1)
    ;
  return len;
}
function createHmacDrbg2(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v = u8n2(hashLen);
  let k = u8n2(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...b) => hmacFn(k, v, ...b);
  const reseed = (seed = u8n2(0)) => {
    k = h(u8fr2([0]), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8fr2([1]), seed);
    v = h();
  };
  const gen2 = () => {
    if (i++ >= 1000)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes4(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = undefined;
    while (!(res = pred(gen2())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject2(object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns2[type];
    if (typeof checkVal !== "function")
      throw new Error("invalid validator function");
    const val = object[fieldName];
    if (isOptional && val === undefined)
      return;
    if (!checkVal(val, object)) {
      throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
    }
  };
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}
function memoized2(fn) {
  const map = new WeakMap;
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== undefined)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}
var _0n7, _1n7, hasHexBuiltin2, hexes3, asciis2, isPosBig2 = (n) => typeof n === "bigint" && _0n7 <= n, bitMask2 = (n) => (_1n7 << BigInt(n)) - _1n7, u8n2 = (len) => new Uint8Array(len), u8fr2 = (arr) => Uint8Array.from(arr), validatorFns2;
var init_utils4 = __esm(() => {
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n7 = /* @__PURE__ */ BigInt(0);
  _1n7 = /* @__PURE__ */ BigInt(1);
  hasHexBuiltin2 = typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
  hexes3 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  asciis2 = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  validatorFns2 = {
    bigint: (val) => typeof val === "bigint",
    function: (val) => typeof val === "function",
    boolean: (val) => typeof val === "boolean",
    string: (val) => typeof val === "string",
    stringOrUint8Array: (val) => typeof val === "string" || isBytes3(val),
    isSafeInteger: (val) => Number.isSafeInteger(val),
    array: (val) => Array.isArray(val),
    field: (val, object) => object.Fp.isValid(val),
    hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
  };
});

// node_modules/ox/_esm/core/version.js
var version3 = "0.1.1";

// node_modules/ox/_esm/core/internal/errors.js
function getVersion() {
  return version3;
}
var init_errors2 = () => {};

// node_modules/ox/_esm/core/Errors.js
function walk2(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause)
    return walk2(err.cause, fn);
  return fn ? null : err;
}
var BaseError3;
var init_Errors = __esm(() => {
  init_errors2();
  BaseError3 = class BaseError3 extends Error {
    constructor(shortMessage, options = {}) {
      const details = (() => {
        if (options.cause instanceof BaseError3) {
          if (options.cause.details)
            return options.cause.details;
          if (options.cause.shortMessage)
            return options.cause.shortMessage;
        }
        if (options.cause && "details" in options.cause && typeof options.cause.details === "string")
          return options.cause.details;
        if (options.cause?.message)
          return options.cause.message;
        return options.details;
      })();
      const docsPath5 = (() => {
        if (options.cause instanceof BaseError3)
          return options.cause.docsPath || options.docsPath;
        return options.docsPath;
      })();
      const docsBaseUrl = "https://oxlib.sh";
      const docs = `${docsBaseUrl}${docsPath5 ?? ""}`;
      const message = [
        shortMessage || "An error occurred.",
        ...options.metaMessages ? ["", ...options.metaMessages] : [],
        ...details || docsPath5 ? [
          "",
          details ? `Details: ${details}` : undefined,
          docsPath5 ? `See: ${docs}` : undefined
        ] : []
      ].filter((x) => typeof x === "string").join(`
`);
      super(message, options.cause ? { cause: options.cause } : undefined);
      Object.defineProperty(this, "details", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "docs", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "docsPath", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "shortMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "cause", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "BaseError"
      });
      Object.defineProperty(this, "version", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: `ox@${getVersion()}`
      });
      this.cause = options.cause;
      this.details = details;
      this.docs = docs;
      this.docsPath = docsPath5;
      this.shortMessage = shortMessage;
    }
    walk(fn) {
      return walk2(this, fn);
    }
  };
});

// node_modules/ox/_esm/core/internal/bytes.js
function assertSize2(bytes, size_) {
  if (size2(bytes) > size_)
    throw new SizeOverflowError2({
      givenSize: size2(bytes),
      maxSize: size_
    });
}
function assertStartOffset2(value, start) {
  if (typeof start === "number" && start > 0 && start > size2(value) - 1)
    throw new SliceOffsetOutOfBoundsError2({
      offset: start,
      position: "start",
      size: size2(value)
    });
}
function assertEndOffset2(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size2(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError2({
      offset: end,
      position: "end",
      size: size2(value)
    });
  }
}
function charCodeToBase162(char) {
  if (char >= charCodeMap2.zero && char <= charCodeMap2.nine)
    return char - charCodeMap2.zero;
  if (char >= charCodeMap2.A && char <= charCodeMap2.F)
    return char - (charCodeMap2.A - 10);
  if (char >= charCodeMap2.a && char <= charCodeMap2.f)
    return char - (charCodeMap2.a - 10);
  return;
}
function pad2(bytes, options = {}) {
  const { dir, size: size3 = 32 } = options;
  if (size3 === 0)
    return bytes;
  if (bytes.length > size3)
    throw new SizeExceedsPaddingSizeError2({
      size: bytes.length,
      targetSize: size3,
      type: "Bytes"
    });
  const paddedBytes = new Uint8Array(size3);
  for (let i = 0;i < size3; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size3 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
function trim2(value, options = {}) {
  const { dir = "left" } = options;
  let data = value;
  let sliceLength = 0;
  for (let i = 0;i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  return data;
}
var charCodeMap2;
var init_bytes = __esm(() => {
  init_Bytes();
  charCodeMap2 = {
    zero: 48,
    nine: 57,
    A: 65,
    F: 70,
    a: 97,
    f: 102
  };
});

// node_modules/ox/_esm/core/internal/hex.js
function assertSize3(hex, size_) {
  if (size3(hex) > size_)
    throw new SizeOverflowError3({
      givenSize: size3(hex),
      maxSize: size_
    });
}
function assertStartOffset3(value, start) {
  if (typeof start === "number" && start > 0 && start > size3(value) - 1)
    throw new SliceOffsetOutOfBoundsError3({
      offset: start,
      position: "start",
      size: size3(value)
    });
}
function assertEndOffset3(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size3(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError3({
      offset: end,
      position: "end",
      size: size3(value)
    });
  }
}
function pad3(hex_, options = {}) {
  const { dir, size: size4 = 32 } = options;
  if (size4 === 0)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size4 * 2)
    throw new SizeExceedsPaddingSizeError3({
      size: Math.ceil(hex.length / 2),
      targetSize: size4,
      type: "Hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size4 * 2, "0")}`;
}
function trim3(value, options = {}) {
  const { dir = "left" } = options;
  let data = value.replace("0x", "");
  let sliceLength = 0;
  for (let i = 0;i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (data === "0")
    return "0x";
  if (dir === "right" && data.length % 2 === 1)
    return `0x${data}0`;
  return `0x${data}`;
}
var init_hex = __esm(() => {
  init_Hex();
});

// node_modules/ox/_esm/core/Json.js
function stringify2(value, replacer, space) {
  return JSON.stringify(value, (key, value2) => {
    if (typeof replacer === "function")
      return replacer(key, value2);
    if (typeof value2 === "bigint")
      return value2.toString() + bigIntSuffix;
    return value2;
  }, space);
}
var bigIntSuffix = "#__bigint";

// node_modules/ox/_esm/core/Bytes.js
function assert(value) {
  if (value instanceof Uint8Array)
    return;
  if (!value)
    throw new InvalidBytesTypeError(value);
  if (typeof value !== "object")
    throw new InvalidBytesTypeError(value);
  if (!("BYTES_PER_ELEMENT" in value))
    throw new InvalidBytesTypeError(value);
  if (value.BYTES_PER_ELEMENT !== 1 || value.constructor.name !== "Uint8Array")
    throw new InvalidBytesTypeError(value);
}
function from(value) {
  if (value instanceof Uint8Array)
    return value;
  if (typeof value === "string")
    return fromHex(value);
  return fromArray(value);
}
function fromArray(value) {
  return value instanceof Uint8Array ? value : new Uint8Array(value);
}
function fromHex(value, options = {}) {
  const { size: size4 } = options;
  let hex = value;
  if (size4) {
    assertSize3(value, size4);
    hex = padRight(value, size4);
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index = 0, j = 0;index < length; index++) {
    const nibbleLeft = charCodeToBase162(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase162(hexString.charCodeAt(j++));
    if (nibbleLeft === undefined || nibbleRight === undefined) {
      throw new BaseError3(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index] = nibbleLeft * 16 + nibbleRight;
  }
  return bytes;
}
function fromString(value, options = {}) {
  const { size: size4 } = options;
  const bytes = encoder3.encode(value);
  if (typeof size4 === "number") {
    assertSize2(bytes, size4);
    return padRight2(bytes, size4);
  }
  return bytes;
}
function padRight2(value, size4) {
  return pad2(value, { dir: "right", size: size4 });
}
function size2(value) {
  return value.length;
}
function slice2(value, start, end, options = {}) {
  const { strict } = options;
  assertStartOffset2(value, start);
  const value_ = value.slice(start, end);
  if (strict)
    assertEndOffset2(value_, start, end);
  return value_;
}
function toBigInt2(bytes, options = {}) {
  const { size: size4 } = options;
  if (typeof size4 !== "undefined")
    assertSize2(bytes, size4);
  const hex = fromBytes(bytes, options);
  return toBigInt(hex, options);
}
function toBoolean(bytes, options = {}) {
  const { size: size4 } = options;
  let bytes_ = bytes;
  if (typeof size4 !== "undefined") {
    assertSize2(bytes_, size4);
    bytes_ = trimLeft(bytes_);
  }
  if (bytes_.length > 1 || bytes_[0] > 1)
    throw new InvalidBytesBooleanError2(bytes_);
  return Boolean(bytes_[0]);
}
function toNumber2(bytes, options = {}) {
  const { size: size4 } = options;
  if (typeof size4 !== "undefined")
    assertSize2(bytes, size4);
  const hex = fromBytes(bytes, options);
  return toNumber(hex, options);
}
function toString(bytes, options = {}) {
  const { size: size4 } = options;
  let bytes_ = bytes;
  if (typeof size4 !== "undefined") {
    assertSize2(bytes_, size4);
    bytes_ = trimRight(bytes_);
  }
  return decoder.decode(bytes_);
}
function trimLeft(value) {
  return trim2(value, { dir: "left" });
}
function trimRight(value) {
  return trim2(value, { dir: "right" });
}
function validate(value) {
  try {
    assert(value);
    return true;
  } catch {
    return false;
  }
}
var decoder, encoder3, InvalidBytesBooleanError2, InvalidBytesTypeError, SizeOverflowError2, SliceOffsetOutOfBoundsError2, SizeExceedsPaddingSizeError2;
var init_Bytes = __esm(() => {
  init_Errors();
  init_Hex();
  init_bytes();
  init_hex();
  decoder = /* @__PURE__ */ new TextDecoder;
  encoder3 = /* @__PURE__ */ new TextEncoder;
  InvalidBytesBooleanError2 = class InvalidBytesBooleanError2 extends BaseError3 {
    constructor(bytes) {
      super(`Bytes value \`${bytes}\` is not a valid boolean.`, {
        metaMessages: [
          "The bytes array must contain a single byte of either a `0` or `1` value."
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Bytes.InvalidBytesBooleanError"
      });
    }
  };
  InvalidBytesTypeError = class InvalidBytesTypeError extends BaseError3 {
    constructor(value) {
      super(`Value \`${typeof value === "object" ? stringify2(value) : value}\` of type \`${typeof value}\` is an invalid Bytes value.`, {
        metaMessages: ["Bytes values must be of type `Bytes`."]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Bytes.InvalidBytesTypeError"
      });
    }
  };
  SizeOverflowError2 = class SizeOverflowError2 extends BaseError3 {
    constructor({ givenSize, maxSize }) {
      super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Bytes.SizeOverflowError"
      });
    }
  };
  SliceOffsetOutOfBoundsError2 = class SliceOffsetOutOfBoundsError2 extends BaseError3 {
    constructor({ offset, position, size: size4 }) {
      super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size4}\`).`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Bytes.SliceOffsetOutOfBoundsError"
      });
    }
  };
  SizeExceedsPaddingSizeError2 = class SizeExceedsPaddingSizeError2 extends BaseError3 {
    constructor({ size: size4, targetSize, type }) {
      super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size4}\`) exceeds padding size (\`${targetSize}\`).`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Bytes.SizeExceedsPaddingSizeError"
      });
    }
  };
});

// node_modules/ox/_esm/core/Hex.js
function assert2(value, options = {}) {
  const { strict = false } = options;
  if (!value)
    throw new InvalidHexTypeError(value);
  if (typeof value !== "string")
    throw new InvalidHexTypeError(value);
  if (strict) {
    if (!/^0x[0-9a-fA-F]*$/.test(value))
      throw new InvalidHexValueError(value);
  }
  if (!value.startsWith("0x"))
    throw new InvalidHexValueError(value);
}
function concat2(...values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
function from2(value) {
  if (value instanceof Uint8Array)
    return fromBytes(value);
  if (Array.isArray(value))
    return fromBytes(new Uint8Array(value));
  return value;
}
function fromBoolean(value, options = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof options.size === "number") {
    assertSize3(hex, options.size);
    return padLeft(hex, options.size);
  }
  return hex;
}
function fromBytes(value, options = {}) {
  let string = "";
  for (let i = 0;i < value.length; i++)
    string += hexes4[value[i]];
  const hex = `0x${string}`;
  if (typeof options.size === "number") {
    assertSize3(hex, options.size);
    return padRight(hex, options.size);
  }
  return hex;
}
function fromNumber(value, options = {}) {
  const { signed, size: size4 } = options;
  const value_ = BigInt(value);
  let maxValue;
  if (size4) {
    if (signed)
      maxValue = (1n << BigInt(size4) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size4) * 8n) - 1n;
  } else if (typeof value === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value_ > maxValue || value_ < minValue) {
    const suffix = typeof value === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError2({
      max: maxValue ? `${maxValue}${suffix}` : undefined,
      min: `${minValue}${suffix}`,
      signed,
      size: size4,
      value: `${value}${suffix}`
    });
  }
  const stringValue = (signed && value_ < 0 ? (1n << BigInt(size4 * 8)) + BigInt(value_) : value_).toString(16);
  const hex = `0x${stringValue}`;
  if (size4)
    return padLeft(hex, size4);
  return hex;
}
function fromString2(value, options = {}) {
  return fromBytes(encoder4.encode(value), options);
}
function padLeft(value, size4) {
  return pad3(value, { dir: "left", size: size4 });
}
function padRight(value, size4) {
  return pad3(value, { dir: "right", size: size4 });
}
function slice3(value, start, end, options = {}) {
  const { strict } = options;
  assertStartOffset3(value, start);
  const value_ = `0x${value.replace("0x", "").slice((start ?? 0) * 2, (end ?? value.length) * 2)}`;
  if (strict)
    assertEndOffset3(value_, start, end);
  return value_;
}
function size3(value) {
  return Math.ceil((value.length - 2) / 2);
}
function trimLeft2(value) {
  return trim3(value, { dir: "left" });
}
function toBigInt(hex, options = {}) {
  const { signed } = options;
  if (options.size)
    assertSize3(hex, options.size);
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size4 = (hex.length - 2) / 2;
  const max_unsigned = (1n << BigInt(size4) * 8n) - 1n;
  const max_signed = max_unsigned >> 1n;
  if (value <= max_signed)
    return value;
  return value - max_unsigned - 1n;
}
function toNumber(hex, options = {}) {
  const { signed, size: size4 } = options;
  if (!signed && !size4)
    return Number(hex);
  return Number(toBigInt(hex, options));
}
function validate2(value, options = {}) {
  const { strict = false } = options;
  try {
    assert2(value, { strict });
    return true;
  } catch {
    return false;
  }
}
var encoder4, hexes4, IntegerOutOfRangeError2, InvalidHexTypeError, InvalidHexValueError, SizeOverflowError3, SliceOffsetOutOfBoundsError3, SizeExceedsPaddingSizeError3;
var init_Hex = __esm(() => {
  init_Errors();
  init_hex();
  encoder4 = /* @__PURE__ */ new TextEncoder;
  hexes4 = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
  IntegerOutOfRangeError2 = class IntegerOutOfRangeError2 extends BaseError3 {
    constructor({ max, min, signed, size: size4, value }) {
      super(`Number \`${value}\` is not in safe${size4 ? ` ${size4 * 8}-bit` : ""}${signed ? " signed" : " unsigned"} integer range ${max ? `(\`${min}\` to \`${max}\`)` : `(above \`${min}\`)`}`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Hex.IntegerOutOfRangeError"
      });
    }
  };
  InvalidHexTypeError = class InvalidHexTypeError extends BaseError3 {
    constructor(value) {
      super(`Value \`${typeof value === "object" ? stringify2(value) : value}\` of type \`${typeof value}\` is an invalid hex type.`, {
        metaMessages: ['Hex types must be represented as `"0x${string}"`.']
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Hex.InvalidHexTypeError"
      });
    }
  };
  InvalidHexValueError = class InvalidHexValueError extends BaseError3 {
    constructor(value) {
      super(`Value \`${value}\` is an invalid hex value.`, {
        metaMessages: [
          'Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).'
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Hex.InvalidHexValueError"
      });
    }
  };
  SizeOverflowError3 = class SizeOverflowError3 extends BaseError3 {
    constructor({ givenSize, maxSize }) {
      super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Hex.SizeOverflowError"
      });
    }
  };
  SliceOffsetOutOfBoundsError3 = class SliceOffsetOutOfBoundsError3 extends BaseError3 {
    constructor({ offset, position, size: size4 }) {
      super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size4}\`).`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Hex.SliceOffsetOutOfBoundsError"
      });
    }
  };
  SizeExceedsPaddingSizeError3 = class SizeExceedsPaddingSizeError3 extends BaseError3 {
    constructor({ size: size4, targetSize, type }) {
      super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size4}\`) exceeds padding size (\`${targetSize}\`).`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Hex.SizeExceedsPaddingSizeError"
      });
    }
  };
});

// node_modules/ox/_esm/core/Withdrawal.js
function toRpc(withdrawal) {
  return {
    address: withdrawal.address,
    amount: fromNumber(withdrawal.amount),
    index: fromNumber(withdrawal.index),
    validatorIndex: fromNumber(withdrawal.validatorIndex)
  };
}
var init_Withdrawal = __esm(() => {
  init_Hex();
});

// node_modules/ox/_esm/core/BlockOverrides.js
function toRpc2(blockOverrides) {
  return {
    ...typeof blockOverrides.baseFeePerGas === "bigint" && {
      baseFeePerGas: fromNumber(blockOverrides.baseFeePerGas)
    },
    ...typeof blockOverrides.blobBaseFee === "bigint" && {
      blobBaseFee: fromNumber(blockOverrides.blobBaseFee)
    },
    ...typeof blockOverrides.feeRecipient === "string" && {
      feeRecipient: blockOverrides.feeRecipient
    },
    ...typeof blockOverrides.gasLimit === "bigint" && {
      gasLimit: fromNumber(blockOverrides.gasLimit)
    },
    ...typeof blockOverrides.number === "bigint" && {
      number: fromNumber(blockOverrides.number)
    },
    ...typeof blockOverrides.prevRandao === "bigint" && {
      prevRandao: fromNumber(blockOverrides.prevRandao)
    },
    ...typeof blockOverrides.time === "bigint" && {
      time: fromNumber(blockOverrides.time)
    },
    ...blockOverrides.withdrawals && {
      withdrawals: blockOverrides.withdrawals.map(toRpc)
    }
  };
}
var init_BlockOverrides = __esm(() => {
  init_Hex();
  init_Withdrawal();
});

// node_modules/viem/_esm/constants/abis.js
var multicall3Abi, batchGatewayAbi, universalResolverErrors, universalResolverResolveAbi, universalResolverReverseAbi, textResolverAbi, addressResolverAbi, erc1271Abi, erc6492SignatureValidatorAbi;
var init_abis = __esm(() => {
  multicall3Abi = [
    {
      inputs: [
        {
          components: [
            {
              name: "target",
              type: "address"
            },
            {
              name: "allowFailure",
              type: "bool"
            },
            {
              name: "callData",
              type: "bytes"
            }
          ],
          name: "calls",
          type: "tuple[]"
        }
      ],
      name: "aggregate3",
      outputs: [
        {
          components: [
            {
              name: "success",
              type: "bool"
            },
            {
              name: "returnData",
              type: "bytes"
            }
          ],
          name: "returnData",
          type: "tuple[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getCurrentBlockTimestamp",
      outputs: [
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ];
  batchGatewayAbi = [
    {
      name: "query",
      type: "function",
      stateMutability: "view",
      inputs: [
        {
          type: "tuple[]",
          name: "queries",
          components: [
            {
              type: "address",
              name: "sender"
            },
            {
              type: "string[]",
              name: "urls"
            },
            {
              type: "bytes",
              name: "data"
            }
          ]
        }
      ],
      outputs: [
        {
          type: "bool[]",
          name: "failures"
        },
        {
          type: "bytes[]",
          name: "responses"
        }
      ]
    },
    {
      name: "HttpError",
      type: "error",
      inputs: [
        {
          type: "uint16",
          name: "status"
        },
        {
          type: "string",
          name: "message"
        }
      ]
    }
  ];
  universalResolverErrors = [
    {
      inputs: [
        {
          name: "dns",
          type: "bytes"
        }
      ],
      name: "DNSDecodingFailed",
      type: "error"
    },
    {
      inputs: [
        {
          name: "ens",
          type: "string"
        }
      ],
      name: "DNSEncodingFailed",
      type: "error"
    },
    {
      inputs: [],
      name: "EmptyAddress",
      type: "error"
    },
    {
      inputs: [
        {
          name: "status",
          type: "uint16"
        },
        {
          name: "message",
          type: "string"
        }
      ],
      name: "HttpError",
      type: "error"
    },
    {
      inputs: [],
      name: "InvalidBatchGatewayResponse",
      type: "error"
    },
    {
      inputs: [
        {
          name: "errorData",
          type: "bytes"
        }
      ],
      name: "ResolverError",
      type: "error"
    },
    {
      inputs: [
        {
          name: "name",
          type: "bytes"
        },
        {
          name: "resolver",
          type: "address"
        }
      ],
      name: "ResolverNotContract",
      type: "error"
    },
    {
      inputs: [
        {
          name: "name",
          type: "bytes"
        }
      ],
      name: "ResolverNotFound",
      type: "error"
    },
    {
      inputs: [
        {
          name: "primary",
          type: "string"
        },
        {
          name: "primaryAddress",
          type: "bytes"
        }
      ],
      name: "ReverseAddressMismatch",
      type: "error"
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "selector",
          type: "bytes4"
        }
      ],
      name: "UnsupportedResolverProfile",
      type: "error"
    }
  ];
  universalResolverResolveAbi = [
    ...universalResolverErrors,
    {
      name: "resolveWithGateways",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "name", type: "bytes" },
        { name: "data", type: "bytes" },
        { name: "gateways", type: "string[]" }
      ],
      outputs: [
        { name: "", type: "bytes" },
        { name: "address", type: "address" }
      ]
    }
  ];
  universalResolverReverseAbi = [
    ...universalResolverErrors,
    {
      name: "reverseWithGateways",
      type: "function",
      stateMutability: "view",
      inputs: [
        { type: "bytes", name: "reverseName" },
        { type: "uint256", name: "coinType" },
        { type: "string[]", name: "gateways" }
      ],
      outputs: [
        { type: "string", name: "resolvedName" },
        { type: "address", name: "resolver" },
        { type: "address", name: "reverseResolver" }
      ]
    }
  ];
  textResolverAbi = [
    {
      name: "text",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "name", type: "bytes32" },
        { name: "key", type: "string" }
      ],
      outputs: [{ name: "", type: "string" }]
    }
  ];
  addressResolverAbi = [
    {
      name: "addr",
      type: "function",
      stateMutability: "view",
      inputs: [{ name: "name", type: "bytes32" }],
      outputs: [{ name: "", type: "address" }]
    },
    {
      name: "addr",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "name", type: "bytes32" },
        { name: "coinType", type: "uint256" }
      ],
      outputs: [{ name: "", type: "bytes" }]
    }
  ];
  erc1271Abi = [
    {
      name: "isValidSignature",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "hash", type: "bytes32" },
        { name: "signature", type: "bytes" }
      ],
      outputs: [{ name: "", type: "bytes4" }]
    }
  ];
  erc6492SignatureValidatorAbi = [
    {
      inputs: [
        {
          name: "_signer",
          type: "address"
        },
        {
          name: "_hash",
          type: "bytes32"
        },
        {
          name: "_signature",
          type: "bytes"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      inputs: [
        {
          name: "_signer",
          type: "address"
        },
        {
          name: "_hash",
          type: "bytes32"
        },
        {
          name: "_signature",
          type: "bytes"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function",
      name: "isValidSig"
    }
  ];
});

// node_modules/viem/_esm/constants/contract.js
var aggregate3Signature = "0x82ad56cb";

// node_modules/viem/_esm/constants/contracts.js
var deploylessCallViaBytecodeBytecode = "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe", deploylessCallViaFactoryBytecode = "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe", erc6492SignatureValidatorByteCode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572", multicall3Bytecode = "0x608060405234801561001057600080fd5b506115b9806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e14610325578063bce38bd714610350578063c3077fa914610380578063ee82ac5e146103b2576100f3565b80634d2301cc1461026257806372425d9d1461029f57806382ad56cb146102ca57806386d516e8146102fa576100f3565b80633408e470116100c65780633408e470146101af578063399542e9146101da5780633e64a6961461020c57806342cbb15c14610237576100f3565b80630f28c97d146100f8578063174dea7114610123578063252dba421461015357806327e86d6e14610184575b600080fd5b34801561010457600080fd5b5061010d6103ef565b60405161011a9190610c0a565b60405180910390f35b61013d60048036038101906101389190610c94565b6103f7565b60405161014a9190610e94565b60405180910390f35b61016d60048036038101906101689190610f0c565b610615565b60405161017b92919061101b565b60405180910390f35b34801561019057600080fd5b506101996107ab565b6040516101a69190611064565b60405180910390f35b3480156101bb57600080fd5b506101c46107b7565b6040516101d19190610c0a565b60405180910390f35b6101f460048036038101906101ef91906110ab565b6107bf565b6040516102039392919061110b565b60405180910390f35b34801561021857600080fd5b506102216107e1565b60405161022e9190610c0a565b60405180910390f35b34801561024357600080fd5b5061024c6107e9565b6040516102599190610c0a565b60405180910390f35b34801561026e57600080fd5b50610289600480360381019061028491906111a7565b6107f1565b6040516102969190610c0a565b60405180910390f35b3480156102ab57600080fd5b506102b4610812565b6040516102c19190610c0a565b60405180910390f35b6102e460048036038101906102df919061122a565b61081a565b6040516102f19190610e94565b60405180910390f35b34801561030657600080fd5b5061030f6109e4565b60405161031c9190610c0a565b60405180910390f35b34801561033157600080fd5b5061033a6109ec565b6040516103479190611286565b60405180910390f35b61036a600480360381019061036591906110ab565b6109f4565b6040516103779190610e94565b60405180910390f35b61039a60048036038101906103959190610f0c565b610ba6565b6040516103a99392919061110b565b60405180910390f35b3480156103be57600080fd5b506103d960048036038101906103d491906112cd565b610bca565b6040516103e69190611064565b60405180910390f35b600042905090565b60606000808484905090508067ffffffffffffffff81111561041c5761041b6112fa565b5b60405190808252806020026020018201604052801561045557816020015b610442610bd5565b81526020019060019003908161043a5790505b5092503660005b828110156105c957600085828151811061047957610478611329565b5b6020026020010151905087878381811061049657610495611329565b5b90506020028101906104a89190611367565b925060008360400135905080860195508360000160208101906104cb91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16818580606001906104f2919061138f565b604051610500929190611431565b60006040518083038185875af1925050503d806000811461053d576040519150601f19603f3d011682016040523d82523d6000602084013e610542565b606091505b5083600001846020018290528215151515815250505081516020850135176105bc577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b826001019250505061045c565b5082341461060c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610603906114a7565b60405180910390fd5b50505092915050565b6000606043915060008484905090508067ffffffffffffffff81111561063e5761063d6112fa565b5b60405190808252806020026020018201604052801561067157816020015b606081526020019060019003908161065c5790505b5091503660005b828110156107a157600087878381811061069557610694611329565b5b90506020028101906106a791906114c7565b92508260000160208101906106bc91906111a7565b73ffffffffffffffffffffffffffffffffffffffff168380602001906106e2919061138f565b6040516106f0929190611431565b6000604051808303816000865af19150503d806000811461072d576040519150601f19603f3d011682016040523d82523d6000602084013e610732565b606091505b5086848151811061074657610745611329565b5b60200260200101819052819250505080610795576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078c9061153b565b60405180910390fd5b81600101915050610678565b5050509250929050565b60006001430340905090565b600046905090565b6000806060439250434091506107d68686866109f4565b905093509350939050565b600048905090565b600043905090565b60008173ffffffffffffffffffffffffffffffffffffffff16319050919050565b600044905090565b606060008383905090508067ffffffffffffffff81111561083e5761083d6112fa565b5b60405190808252806020026020018201604052801561087757816020015b610864610bd5565b81526020019060019003908161085c5790505b5091503660005b828110156109db57600084828151811061089b5761089a611329565b5b602002602001015190508686838181106108b8576108b7611329565b5b90506020028101906108ca919061155b565b92508260000160208101906108df91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060400190610905919061138f565b604051610913929190611431565b6000604051808303816000865af19150503d8060008114610950576040519150601f19603f3d011682016040523d82523d6000602084013e610955565b606091505b5082600001836020018290528215151515815250505080516020840135176109cf577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b8160010191505061087e565b50505092915050565b600045905090565b600041905090565b606060008383905090508067ffffffffffffffff811115610a1857610a176112fa565b5b604051908082528060200260200182016040528015610a5157816020015b610a3e610bd5565b815260200190600190039081610a365790505b5091503660005b82811015610b9c576000848281518110610a7557610a74611329565b5b60200260200101519050868683818110610a9257610a91611329565b5b9050602002810190610aa491906114c7565b9250826000016020810190610ab991906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060200190610adf919061138f565b604051610aed929190611431565b6000604051808303816000865af19150503d8060008114610b2a576040519150601f19603f3d011682016040523d82523d6000602084013e610b2f565b606091505b508260000183602001829052821515151581525050508715610b90578060000151610b8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b869061153b565b60405180910390fd5b5b81600101915050610a58565b5050509392505050565b6000806060610bb7600186866107bf565b8093508194508295505050509250925092565b600081409050919050565b6040518060400160405280600015158152602001606081525090565b6000819050919050565b610c0481610bf1565b82525050565b6000602082019050610c1f6000830184610bfb565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610c5457610c53610c2f565b5b8235905067ffffffffffffffff811115610c7157610c70610c34565b5b602083019150836020820283011115610c8d57610c8c610c39565b5b9250929050565b60008060208385031215610cab57610caa610c25565b5b600083013567ffffffffffffffff811115610cc957610cc8610c2a565b5b610cd585828601610c3e565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b60008115159050919050565b610d2281610d0d565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d62578082015181840152602081019050610d47565b83811115610d71576000848401525b50505050565b6000601f19601f8301169050919050565b6000610d9382610d28565b610d9d8185610d33565b9350610dad818560208601610d44565b610db681610d77565b840191505092915050565b6000604083016000830151610dd96000860182610d19565b5060208301518482036020860152610df18282610d88565b9150508091505092915050565b6000610e0a8383610dc1565b905092915050565b6000602082019050919050565b6000610e2a82610ce1565b610e348185610cec565b935083602082028501610e4685610cfd565b8060005b85811015610e825784840389528151610e638582610dfe565b9450610e6e83610e12565b925060208a01995050600181019050610e4a565b50829750879550505050505092915050565b60006020820190508181036000830152610eae8184610e1f565b905092915050565b60008083601f840112610ecc57610ecb610c2f565b5b8235905067ffffffffffffffff811115610ee957610ee8610c34565b5b602083019150836020820283011115610f0557610f04610c39565b5b9250929050565b60008060208385031215610f2357610f22610c25565b5b600083013567ffffffffffffffff811115610f4157610f40610c2a565b5b610f4d85828601610eb6565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000610f918383610d88565b905092915050565b6000602082019050919050565b6000610fb182610f59565b610fbb8185610f64565b935083602082028501610fcd85610f75565b8060005b858110156110095784840389528151610fea8582610f85565b9450610ff583610f99565b925060208a01995050600181019050610fd1565b50829750879550505050505092915050565b60006040820190506110306000830185610bfb565b81810360208301526110428184610fa6565b90509392505050565b6000819050919050565b61105e8161104b565b82525050565b60006020820190506110796000830184611055565b92915050565b61108881610d0d565b811461109357600080fd5b50565b6000813590506110a58161107f565b92915050565b6000806000604084860312156110c4576110c3610c25565b5b60006110d286828701611096565b935050602084013567ffffffffffffffff8111156110f3576110f2610c2a565b5b6110ff86828701610eb6565b92509250509250925092565b60006060820190506111206000830186610bfb565b61112d6020830185611055565b818103604083015261113f8184610e1f565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061117482611149565b9050919050565b61118481611169565b811461118f57600080fd5b50565b6000813590506111a18161117b565b92915050565b6000602082840312156111bd576111bc610c25565b5b60006111cb84828501611192565b91505092915050565b60008083601f8401126111ea576111e9610c2f565b5b8235905067ffffffffffffffff81111561120757611206610c34565b5b60208301915083602082028301111561122357611222610c39565b5b9250929050565b6000806020838503121561124157611240610c25565b5b600083013567ffffffffffffffff81111561125f5761125e610c2a565b5b61126b858286016111d4565b92509250509250929050565b61128081611169565b82525050565b600060208201905061129b6000830184611277565b92915050565b6112aa81610bf1565b81146112b557600080fd5b50565b6000813590506112c7816112a1565b92915050565b6000602082840312156112e3576112e2610c25565b5b60006112f1848285016112b8565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600080fd5b600080fd5b600080fd5b60008235600160800383360303811261138357611382611358565b5b80830191505092915050565b600080833560016020038436030381126113ac576113ab611358565b5b80840192508235915067ffffffffffffffff8211156113ce576113cd61135d565b5b6020830192506001820236038313156113ea576113e9611362565b5b509250929050565b600081905092915050565b82818337600083830152505050565b600061141883856113f2565b93506114258385846113fd565b82840190509392505050565b600061143e82848661140c565b91508190509392505050565b600082825260208201905092915050565b7f4d756c746963616c6c333a2076616c7565206d69736d61746368000000000000600082015250565b6000611491601a8361144a565b915061149c8261145b565b602082019050919050565b600060208201905081810360008301526114c081611484565b9050919050565b6000823560016040038336030381126114e3576114e2611358565b5b80830191505092915050565b7f4d756c746963616c6c333a2063616c6c206661696c6564000000000000000000600082015250565b600061152560178361144a565b9150611530826114ef565b602082019050919050565b6000602082019050818103600083015261155481611518565b9050919050565b60008235600160600383360303811261157757611576611358565b5b8083019150509291505056fea264697066735822122020c1bc9aacf8e4a6507193432a895a8e77094f45a1395583f07b24e860ef06cd64736f6c634300080c0033";

// node_modules/viem/_esm/errors/chain.js
var ChainDoesNotSupportContract, ChainMismatchError, ChainNotFoundError, ClientChainNotConfiguredError, InvalidChainIdError;
var init_chain = __esm(() => {
  init_base();
  ChainDoesNotSupportContract = class ChainDoesNotSupportContract extends BaseError2 {
    constructor({ blockNumber, chain, contract }) {
      super(`Chain "${chain.name}" does not support contract "${contract.name}".`, {
        metaMessages: [
          "This could be due to any of the following:",
          ...blockNumber && contract.blockCreated && contract.blockCreated > blockNumber ? [
            `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`
          ] : [
            `- The chain does not have the contract "${contract.name}" configured.`
          ]
        ],
        name: "ChainDoesNotSupportContract"
      });
    }
  };
  ChainMismatchError = class ChainMismatchError extends BaseError2 {
    constructor({ chain, currentChainId }) {
      super(`The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} – ${chain.name}).`, {
        metaMessages: [
          `Current Chain ID:  ${currentChainId}`,
          `Expected Chain ID: ${chain.id} – ${chain.name}`
        ],
        name: "ChainMismatchError"
      });
    }
  };
  ChainNotFoundError = class ChainNotFoundError extends BaseError2 {
    constructor() {
      super([
        "No chain was provided to the request.",
        "Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient."
      ].join(`
`), {
        name: "ChainNotFoundError"
      });
    }
  };
  ClientChainNotConfiguredError = class ClientChainNotConfiguredError extends BaseError2 {
    constructor() {
      super("No chain was provided to the Client.", {
        name: "ClientChainNotConfiguredError"
      });
    }
  };
  InvalidChainIdError = class InvalidChainIdError extends BaseError2 {
    constructor({ chainId }) {
      super(typeof chainId === "number" ? `Chain ID "${chainId}" is invalid.` : "Chain ID is invalid.", { name: "InvalidChainIdError" });
    }
  };
});

// node_modules/viem/_esm/utils/abi/encodeDeployData.js
function encodeDeployData(parameters) {
  const { abi, args, bytecode } = parameters;
  if (!args || args.length === 0)
    return bytecode;
  const description = abi.find((x) => ("type" in x) && x.type === "constructor");
  if (!description)
    throw new AbiConstructorNotFoundError({ docsPath: docsPath5 });
  if (!("inputs" in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  const data = encodeAbiParameters(description.inputs, args);
  return concatHex([bytecode, data]);
}
var docsPath5 = "/docs/contract/encodeDeployData";
var init_encodeDeployData = __esm(() => {
  init_abi();
  init_encodeAbiParameters();
});

// node_modules/viem/_esm/utils/chain/getChainContractAddress.js
function getChainContractAddress({ blockNumber, chain, contract: name }) {
  const contract = chain?.contracts?.[name];
  if (!contract)
    throw new ChainDoesNotSupportContract({
      chain,
      contract: { name }
    });
  if (blockNumber && contract.blockCreated && contract.blockCreated > blockNumber)
    throw new ChainDoesNotSupportContract({
      blockNumber,
      chain,
      contract: {
        name,
        blockCreated: contract.blockCreated
      }
    });
  return contract.address;
}
var init_getChainContractAddress = __esm(() => {
  init_chain();
});

// node_modules/viem/_esm/utils/errors/getCallError.js
function getCallError(err, { docsPath: docsPath6, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new CallExecutionError(cause, {
    docsPath: docsPath6,
    ...args
  });
}
var init_getCallError = __esm(() => {
  init_contract();
  init_node();
  init_getNodeError();
});

// node_modules/viem/_esm/utils/promise/withResolvers.js
function withResolvers() {
  let resolve = () => {
    return;
  };
  let reject = () => {
    return;
  };
  const promise = new Promise((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  return { promise, resolve, reject };
}

// node_modules/viem/_esm/utils/promise/createBatchScheduler.js
function createBatchScheduler({ fn, id, shouldSplitBatch, wait = 0, sort }) {
  const exec = async () => {
    const scheduler = getScheduler();
    flush();
    const args = scheduler.map(({ args: args2 }) => args2);
    if (args.length === 0)
      return;
    fn(args).then((data) => {
      if (sort && Array.isArray(data))
        data.sort(sort);
      for (let i = 0;i < scheduler.length; i++) {
        const { resolve } = scheduler[i];
        resolve?.([data[i], data]);
      }
    }).catch((err) => {
      for (let i = 0;i < scheduler.length; i++) {
        const { reject } = scheduler[i];
        reject?.(err);
      }
    });
  };
  const flush = () => schedulerCache.delete(id);
  const getBatchedArgs = () => getScheduler().map(({ args }) => args);
  const getScheduler = () => schedulerCache.get(id) || [];
  const setScheduler = (item) => schedulerCache.set(id, [...getScheduler(), item]);
  return {
    flush,
    async schedule(args) {
      const { promise, resolve, reject } = withResolvers();
      const split2 = shouldSplitBatch?.([...getBatchedArgs(), args]);
      if (split2)
        exec();
      const hasActiveScheduler = getScheduler().length > 0;
      if (hasActiveScheduler) {
        setScheduler({ args, resolve, reject });
        return promise;
      }
      setScheduler({ args, resolve, reject });
      setTimeout(exec, wait);
      return promise;
    }
  };
}
var schedulerCache;
var init_createBatchScheduler = __esm(() => {
  schedulerCache = /* @__PURE__ */ new Map;
});

// node_modules/viem/_esm/errors/ccip.js
var OffchainLookupError, OffchainLookupResponseMalformedError, OffchainLookupSenderMismatchError;
var init_ccip = __esm(() => {
  init_base();
  OffchainLookupError = class OffchainLookupError extends BaseError2 {
    constructor({ callbackSelector, cause, data, extraData, sender, urls }) {
      super(cause.shortMessage || "An error occurred while fetching for an offchain result.", {
        cause,
        metaMessages: [
          ...cause.metaMessages || [],
          cause.metaMessages?.length ? "" : [],
          "Offchain Gateway Call:",
          urls && [
            "  Gateway URL(s):",
            ...urls.map((url) => `    ${getUrl(url)}`)
          ],
          `  Sender: ${sender}`,
          `  Data: ${data}`,
          `  Callback selector: ${callbackSelector}`,
          `  Extra data: ${extraData}`
        ].flat(),
        name: "OffchainLookupError"
      });
    }
  };
  OffchainLookupResponseMalformedError = class OffchainLookupResponseMalformedError extends BaseError2 {
    constructor({ result, url }) {
      super("Offchain gateway response is malformed. Response data must be a hex value.", {
        metaMessages: [
          `Gateway URL: ${getUrl(url)}`,
          `Response: ${stringify(result)}`
        ],
        name: "OffchainLookupResponseMalformedError"
      });
    }
  };
  OffchainLookupSenderMismatchError = class OffchainLookupSenderMismatchError extends BaseError2 {
    constructor({ sender, to }) {
      super("Reverted sender address does not match target contract address (`to`).", {
        metaMessages: [
          `Contract address: ${to}`,
          `OffchainLookup sender address: ${sender}`
        ],
        name: "OffchainLookupSenderMismatchError"
      });
    }
  };
});

// node_modules/viem/_esm/utils/abi/decodeFunctionData.js
function decodeFunctionData(parameters) {
  const { abi, data } = parameters;
  const signature = slice(data, 0, 4);
  const description = abi.find((x) => x.type === "function" && signature === toFunctionSelector(formatAbiItem2(x)));
  if (!description)
    throw new AbiFunctionSignatureNotFoundError(signature, {
      docsPath: "/docs/contract/decodeFunctionData"
    });
  return {
    functionName: description.name,
    args: "inputs" in description && description.inputs && description.inputs.length > 0 ? decodeAbiParameters(description.inputs, slice(data, 4)) : undefined
  };
}
var init_decodeFunctionData = __esm(() => {
  init_abi();
  init_slice();
  init_toFunctionSelector();
  init_decodeAbiParameters();
  init_formatAbiItem2();
});

// node_modules/viem/_esm/utils/abi/encodeErrorResult.js
function encodeErrorResult(parameters) {
  const { abi, errorName, args } = parameters;
  let abiItem = abi[0];
  if (errorName) {
    const item = getAbiItem({ abi, args, name: errorName });
    if (!item)
      throw new AbiErrorNotFoundError(errorName, { docsPath: docsPath6 });
    abiItem = item;
  }
  if (abiItem.type !== "error")
    throw new AbiErrorNotFoundError(undefined, { docsPath: docsPath6 });
  const definition = formatAbiItem2(abiItem);
  const signature = toFunctionSelector(definition);
  let data = "0x";
  if (args && args.length > 0) {
    if (!abiItem.inputs)
      throw new AbiErrorInputsNotFoundError(abiItem.name, { docsPath: docsPath6 });
    data = encodeAbiParameters(abiItem.inputs, args);
  }
  return concatHex([signature, data]);
}
var docsPath6 = "/docs/contract/encodeErrorResult";
var init_encodeErrorResult = __esm(() => {
  init_abi();
  init_toFunctionSelector();
  init_encodeAbiParameters();
  init_formatAbiItem2();
  init_getAbiItem();
});

// node_modules/viem/_esm/utils/abi/encodeFunctionResult.js
function encodeFunctionResult(parameters) {
  const { abi, functionName, result } = parameters;
  let abiItem = abi[0];
  if (functionName) {
    const item = getAbiItem({ abi, name: functionName });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath7 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(undefined, { docsPath: docsPath7 });
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath7 });
  const values = (() => {
    if (abiItem.outputs.length === 0)
      return [];
    if (abiItem.outputs.length === 1)
      return [result];
    if (Array.isArray(result))
      return result;
    throw new InvalidArrayError(result);
  })();
  return encodeAbiParameters(abiItem.outputs, values);
}
var docsPath7 = "/docs/contract/encodeFunctionResult";
var init_encodeFunctionResult = __esm(() => {
  init_abi();
  init_encodeAbiParameters();
  init_getAbiItem();
});

// node_modules/viem/_esm/utils/ens/localBatchGatewayRequest.js
async function localBatchGatewayRequest(parameters) {
  const { data, ccipRequest } = parameters;
  const { args: [queries] } = decodeFunctionData({ abi: batchGatewayAbi, data });
  const failures = [];
  const responses = [];
  await Promise.all(queries.map(async (query, i) => {
    try {
      responses[i] = query.urls.includes(localBatchGatewayUrl) ? await localBatchGatewayRequest({ data: query.data, ccipRequest }) : await ccipRequest(query);
      failures[i] = false;
    } catch (err) {
      failures[i] = true;
      responses[i] = encodeError(err);
    }
  }));
  return encodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: "query",
    result: [failures, responses]
  });
}
function encodeError(error) {
  if (error.name === "HttpRequestError" && error.status)
    return encodeErrorResult({
      abi: batchGatewayAbi,
      errorName: "HttpError",
      args: [error.status, error.shortMessage]
    });
  return encodeErrorResult({
    abi: [solidityError],
    errorName: "Error",
    args: ["shortMessage" in error ? error.shortMessage : error.message]
  });
}
var localBatchGatewayUrl = "x-batch-gateway:true";
var init_localBatchGatewayRequest = __esm(() => {
  init_abis();
  init_solidity();
  init_decodeFunctionData();
  init_encodeErrorResult();
  init_encodeFunctionResult();
});

// node_modules/viem/_esm/utils/ccip.js
var exports_ccip = {};
__export(exports_ccip, {
  offchainLookupSignature: () => offchainLookupSignature,
  offchainLookupAbiItem: () => offchainLookupAbiItem,
  offchainLookup: () => offchainLookup,
  ccipRequest: () => ccipRequest
});
async function offchainLookup(client, { blockNumber, blockTag, data, to }) {
  const { args } = decodeErrorResult({
    data,
    abi: [offchainLookupAbiItem]
  });
  const [sender, urls, callData, callbackSelector, extraData] = args;
  const { ccipRead } = client;
  const ccipRequest_ = ccipRead && typeof ccipRead?.request === "function" ? ccipRead.request : ccipRequest;
  try {
    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to });
    const result = urls.includes(localBatchGatewayUrl) ? await localBatchGatewayRequest({
      data: callData,
      ccipRequest: ccipRequest_
    }) : await ccipRequest_({ data: callData, sender, urls });
    const { data: data_ } = await call(client, {
      blockNumber,
      blockTag,
      data: concat([
        callbackSelector,
        encodeAbiParameters([{ type: "bytes" }, { type: "bytes" }], [result, extraData])
      ]),
      to
    });
    return data_;
  } catch (err) {
    throw new OffchainLookupError({
      callbackSelector,
      cause: err,
      data,
      extraData,
      sender,
      urls
    });
  }
}
async function ccipRequest({ data, sender, urls }) {
  let error = new Error("An unknown error occurred.");
  for (let i = 0;i < urls.length; i++) {
    const url = urls[i];
    const method = url.includes("{data}") ? "GET" : "POST";
    const body = method === "POST" ? { data, sender } : undefined;
    const headers = method === "POST" ? { "Content-Type": "application/json" } : {};
    try {
      const response = await fetch(url.replace("{sender}", sender.toLowerCase()).replace("{data}", data), {
        body: JSON.stringify(body),
        headers,
        method
      });
      let result;
      if (response.headers.get("Content-Type")?.startsWith("application/json")) {
        result = (await response.json()).data;
      } else {
        result = await response.text();
      }
      if (!response.ok) {
        error = new HttpRequestError({
          body,
          details: result?.error ? stringify(result.error) : response.statusText,
          headers: response.headers,
          status: response.status,
          url
        });
        continue;
      }
      if (!isHex(result)) {
        error = new OffchainLookupResponseMalformedError({
          result,
          url
        });
        continue;
      }
      return result;
    } catch (err) {
      error = new HttpRequestError({
        body,
        details: err.message,
        url
      });
    }
  }
  throw error;
}
var offchainLookupSignature = "0x556f1830", offchainLookupAbiItem;
var init_ccip2 = __esm(() => {
  init_call();
  init_ccip();
  init_request();
  init_decodeErrorResult();
  init_encodeAbiParameters();
  init_isAddressEqual();
  init_localBatchGatewayRequest();
  offchainLookupAbiItem = {
    name: "OffchainLookup",
    type: "error",
    inputs: [
      {
        name: "sender",
        type: "address"
      },
      {
        name: "urls",
        type: "string[]"
      },
      {
        name: "callData",
        type: "bytes"
      },
      {
        name: "callbackFunction",
        type: "bytes4"
      },
      {
        name: "extraData",
        type: "bytes"
      }
    ]
  };
});

// node_modules/viem/_esm/actions/public/call.js
async function call(client, args) {
  const { account: account_ = client.account, authorizationList, batch = Boolean(client.batch?.multicall), blockNumber, blockTag = client.experimental_blockTag ?? "latest", accessList, blobs, blockOverrides, code, data: data_, factory, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride, ...rest } = args;
  const account = account_ ? parseAccount(account_) : undefined;
  if (code && (factory || factoryData))
    throw new BaseError2("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
  if (code && to)
    throw new BaseError2("Cannot provide both `code` & `to` as parameters.");
  const deploylessCallViaBytecode = code && data_;
  const deploylessCallViaFactory = factory && factoryData && to && data_;
  const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory;
  const data = (() => {
    if (deploylessCallViaBytecode)
      return toDeploylessCallViaBytecodeData({
        code,
        data: data_
      });
    if (deploylessCallViaFactory)
      return toDeploylessCallViaFactoryData({
        data: data_,
        factory,
        factoryData,
        to
      });
    return data_;
  })();
  try {
    assertRequest(args);
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const rpcBlockOverrides = blockOverrides ? toRpc2(blockOverrides) : undefined;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      ...extract(rest, { format: chainFormat }),
      accessList,
      account,
      authorizationList,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to: deploylessCall ? undefined : to,
      value
    }, "call");
    if (batch && shouldPerformMulticall({ request }) && !rpcStateOverride && !rpcBlockOverrides) {
      try {
        return await scheduleMulticall(client, {
          ...request,
          blockNumber,
          blockTag
        });
      } catch (err) {
        if (!(err instanceof ClientChainNotConfiguredError) && !(err instanceof ChainDoesNotSupportContract))
          throw err;
      }
    }
    const params = (() => {
      const base = [
        request,
        block
      ];
      if (rpcStateOverride && rpcBlockOverrides)
        return [...base, rpcStateOverride, rpcBlockOverrides];
      if (rpcStateOverride)
        return [...base, rpcStateOverride];
      if (rpcBlockOverrides)
        return [...base, {}, rpcBlockOverrides];
      return base;
    })();
    const response = await client.request({
      method: "eth_call",
      params
    });
    if (response === "0x")
      return { data: undefined };
    return { data: response };
  } catch (err) {
    const data2 = getRevertErrorData(err);
    const { offchainLookup: offchainLookup2, offchainLookupSignature: offchainLookupSignature2 } = await Promise.resolve().then(() => (init_ccip2(), exports_ccip));
    if (client.ccipRead !== false && data2?.slice(0, 10) === offchainLookupSignature2 && to)
      return { data: await offchainLookup2(client, { data: data2, to }) };
    if (deploylessCall && data2?.slice(0, 10) === "0x101bb98d")
      throw new CounterfactualDeploymentFailedError({ factory });
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
function shouldPerformMulticall({ request }) {
  const { data, to, ...request_ } = request;
  if (!data)
    return false;
  if (data.startsWith(aggregate3Signature))
    return false;
  if (!to)
    return false;
  if (Object.values(request_).filter((x) => typeof x !== "undefined").length > 0)
    return false;
  return true;
}
async function scheduleMulticall(client, args) {
  const { batchSize = 1024, deployless = false, wait = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const { blockNumber, blockTag = client.experimental_blockTag ?? "latest", data, to } = args;
  const multicallAddress = (() => {
    if (deployless)
      return null;
    if (args.multicallAddress)
      return args.multicallAddress;
    if (client.chain) {
      return getChainContractAddress({
        blockNumber,
        chain: client.chain,
        contract: "multicall3"
      });
    }
    throw new ClientChainNotConfiguredError;
  })();
  const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : undefined;
  const block = blockNumberHex || blockTag;
  const { schedule } = createBatchScheduler({
    id: `${client.uid}.${block}`,
    wait,
    shouldSplitBatch(args2) {
      const size4 = args2.reduce((size5, { data: data2 }) => size5 + (data2.length - 2), 0);
      return size4 > batchSize * 2;
    },
    fn: async (requests) => {
      const calls = requests.map((request) => ({
        allowFailure: true,
        callData: request.data,
        target: request.to
      }));
      const calldata = encodeFunctionData({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3"
      });
      const data2 = await client.request({
        method: "eth_call",
        params: [
          {
            ...multicallAddress === null ? {
              data: toDeploylessCallViaBytecodeData({
                code: multicall3Bytecode,
                data: calldata
              })
            } : { to: multicallAddress, data: calldata }
          },
          block
        ]
      });
      return decodeFunctionResult({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3",
        data: data2 || "0x"
      });
    }
  });
  const [{ returnData, success }] = await schedule({ data, to });
  if (!success)
    throw new RawContractError({ data: returnData });
  if (returnData === "0x")
    return { data: undefined };
  return { data: returnData };
}
function toDeploylessCallViaBytecodeData(parameters) {
  const { code, data } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(bytes, bytes)"]),
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [code, data]
  });
}
function toDeploylessCallViaFactoryData(parameters) {
  const { data, factory, factoryData, to } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(address, bytes, address, bytes)"]),
    bytecode: deploylessCallViaFactoryBytecode,
    args: [to, data, factory, factoryData]
  });
}
function getRevertErrorData(err) {
  if (!(err instanceof BaseError2))
    return;
  const error = err.walk();
  return typeof error?.data === "object" ? error.data?.data : error.data;
}
var init_call = __esm(() => {
  init_exports();
  init_BlockOverrides();
  init_abis();
  init_base();
  init_chain();
  init_contract();
  init_decodeFunctionResult();
  init_encodeDeployData();
  init_encodeFunctionData();
  init_getChainContractAddress();
  init_toHex();
  init_getCallError();
  init_transactionRequest();
  init_createBatchScheduler();
  init_stateOverride2();
  init_assertRequest();
});

// node_modules/viem/_esm/actions/public/readContract.js
async function readContract(client, parameters) {
  const { abi, address, args, functionName, ...rest } = parameters;
  const calldata = encodeFunctionData({
    abi,
    args,
    functionName
  });
  try {
    const { data } = await getAction(client, call, "call")({
      ...rest,
      data: calldata,
      to: address
    });
    return decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || "0x"
    });
  } catch (error) {
    throw getContractError(error, {
      abi,
      address,
      args,
      docsPath: "/docs/contract/readContract",
      functionName
    });
  }
}
var init_readContract = __esm(() => {
  init_decodeFunctionResult();
  init_encodeFunctionData();
  init_getContractError();
  init_call();
});

// node_modules/viem/_esm/actions/public/simulateContract.js
async function simulateContract(client, parameters) {
  const { abi, address, args, dataSuffix, functionName, ...callRequest } = parameters;
  const account = callRequest.account ? parseAccount(callRequest.account) : client.account;
  const calldata = encodeFunctionData({ abi, args, functionName });
  try {
    const { data } = await getAction(client, call, "call")({
      batch: false,
      data: `${calldata}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...callRequest,
      account
    });
    const result = decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || "0x"
    });
    const minimizedAbi = abi.filter((abiItem) => ("name" in abiItem) && abiItem.name === parameters.functionName);
    return {
      result,
      request: {
        abi: minimizedAbi,
        address,
        args,
        dataSuffix,
        functionName,
        ...callRequest,
        account
      }
    };
  } catch (error) {
    throw getContractError(error, {
      abi,
      address,
      args,
      docsPath: "/docs/contract/simulateContract",
      functionName,
      sender: account?.address
    });
  }
}
var init_simulateContract = __esm(() => {
  init_decodeFunctionResult();
  init_encodeFunctionData();
  init_getContractError();
  init_call();
});

// node_modules/viem/_esm/utils/observe.js
function observe(observerId, callbacks, fn) {
  const callbackId = ++callbackCount;
  const getListeners = () => listenersCache.get(observerId) || [];
  const unsubscribe = () => {
    const listeners2 = getListeners();
    listenersCache.set(observerId, listeners2.filter((cb) => cb.id !== callbackId));
  };
  const unwatch = () => {
    const listeners2 = getListeners();
    if (!listeners2.some((cb) => cb.id === callbackId))
      return;
    const cleanup2 = cleanupCache.get(observerId);
    if (listeners2.length === 1 && cleanup2) {
      const p = cleanup2();
      if (p instanceof Promise)
        p.catch(() => {});
    }
    unsubscribe();
  };
  const listeners = getListeners();
  listenersCache.set(observerId, [
    ...listeners,
    { id: callbackId, fns: callbacks }
  ]);
  if (listeners && listeners.length > 0)
    return unwatch;
  const emit = {};
  for (const key in callbacks) {
    emit[key] = (...args) => {
      const listeners2 = getListeners();
      if (listeners2.length === 0)
        return;
      for (const listener of listeners2)
        listener.fns[key]?.(...args);
    };
  }
  const cleanup = fn(emit);
  if (typeof cleanup === "function")
    cleanupCache.set(observerId, cleanup);
  return unwatch;
}
var listenersCache, cleanupCache, callbackCount = 0;
var init_observe = __esm(() => {
  listenersCache = /* @__PURE__ */ new Map;
  cleanupCache = /* @__PURE__ */ new Map;
});

// node_modules/viem/_esm/utils/wait.js
async function wait(time) {
  return new Promise((res) => setTimeout(res, time));
}

// node_modules/viem/_esm/utils/poll.js
function poll(fn, { emitOnBegin, initialWaitTime, interval }) {
  let active = true;
  const unwatch = () => active = false;
  const watch = async () => {
    let data;
    if (emitOnBegin)
      data = await fn({ unpoll: unwatch });
    const initialWait = await initialWaitTime?.(data) ?? interval;
    await wait(initialWait);
    const poll2 = async () => {
      if (!active)
        return;
      await fn({ unpoll: unwatch });
      await wait(interval);
      poll2();
    };
    poll2();
  };
  watch();
  return unwatch;
}
var init_poll = () => {};

// node_modules/viem/_esm/utils/promise/withCache.js
function getCache(cacheKey) {
  const buildCache = (cacheKey2, cache) => ({
    clear: () => cache.delete(cacheKey2),
    get: () => cache.get(cacheKey2),
    set: (data) => cache.set(cacheKey2, data)
  });
  const promise = buildCache(cacheKey, promiseCache);
  const response = buildCache(cacheKey, responseCache);
  return {
    clear: () => {
      promise.clear();
      response.clear();
    },
    promise,
    response
  };
}
async function withCache(fn, { cacheKey, cacheTime = Number.POSITIVE_INFINITY }) {
  const cache = getCache(cacheKey);
  const response = cache.response.get();
  if (response && cacheTime > 0) {
    const age = Date.now() - response.created.getTime();
    if (age < cacheTime)
      return response.data;
  }
  let promise = cache.promise.get();
  if (!promise) {
    promise = fn();
    cache.promise.set(promise);
  }
  try {
    const data = await promise;
    cache.response.set({ created: new Date, data });
    return data;
  } finally {
    cache.promise.clear();
  }
}
var promiseCache, responseCache;
var init_withCache = __esm(() => {
  promiseCache = /* @__PURE__ */ new Map;
  responseCache = /* @__PURE__ */ new Map;
});

// node_modules/viem/_esm/actions/public/getBlockNumber.js
async function getBlockNumber(client, { cacheTime = client.cacheTime } = {}) {
  const blockNumberHex = await withCache(() => client.request({
    method: "eth_blockNumber"
  }), { cacheKey: cacheKey(client.uid), cacheTime });
  return BigInt(blockNumberHex);
}
var cacheKey = (id) => `blockNumber.${id}`;
var init_getBlockNumber = __esm(() => {
  init_withCache();
});

// node_modules/viem/_esm/actions/public/getFilterChanges.js
async function getFilterChanges(_client, { filter }) {
  const strict = "strict" in filter && filter.strict;
  const logs = await filter.request({
    method: "eth_getFilterChanges",
    params: [filter.id]
  });
  if (typeof logs[0] === "string")
    return logs;
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!("abi" in filter) || !filter.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict
  });
}
var init_getFilterChanges = __esm(() => {
  init_parseEventLogs();
});

// node_modules/viem/_esm/actions/public/uninstallFilter.js
async function uninstallFilter(_client, { filter }) {
  return filter.request({
    method: "eth_uninstallFilter",
    params: [filter.id]
  });
}

// node_modules/viem/_esm/actions/public/watchContractEvent.js
function watchContractEvent(client, parameters) {
  const { abi, address, args, batch = true, eventName, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ } = parameters;
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const pollContractEvent = () => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== undefined)
        previousBlockNumber = fromBlock - 1n;
      let filter;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter = await getAction(client, createContractEventFilter, "createContractEventFilter")({
              abi,
              address,
              args,
              eventName,
              strict,
              fromBlock
            });
          } catch {}
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber < blockNumber) {
              logs = await getAction(client, getContractEvents, "getContractEvents")({
                abi,
                address,
                args,
                eventName,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber,
                strict
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  };
  const subscribeContractEvent = () => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict
    ]);
    let active = true;
    let unsubscribe = () => active = false;
    return observe(observerId, { onLogs, onError }, (emit) => {
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const topics = eventName ? encodeEventTopics({
            abi,
            eventName,
            args
          }) : [];
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["logs", { address, topics }],
            onData(data) {
              if (!active)
                return;
              const log = data.result;
              try {
                const { eventName: eventName2, args: args2 } = decodeEventLog({
                  abi,
                  data: log.data,
                  topics: log.topics,
                  strict: strict_
                });
                const formatted = formatLog(log, {
                  args: args2,
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              } catch (err) {
                let eventName2;
                let isUnnamed;
                if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                  if (strict_)
                    return;
                  eventName2 = err.abiItem.name;
                  isUnnamed = err.abiItem.inputs?.some((x) => !(("name" in x) && x.name));
                }
                const formatted = formatLog(log, {
                  args: isUnnamed ? [] : {},
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              }
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  };
  return enablePolling ? pollContractEvent() : subscribeContractEvent();
}
var init_watchContractEvent = __esm(() => {
  init_abi();
  init_rpc();
  init_decodeEventLog();
  init_encodeEventTopics();
  init_observe();
  init_poll();
  init_createContractEventFilter();
  init_getBlockNumber();
  init_getContractEvents();
  init_getFilterChanges();
});

// node_modules/viem/_esm/errors/account.js
var AccountNotFoundError, AccountTypeNotSupportedError;
var init_account = __esm(() => {
  init_base();
  AccountNotFoundError = class AccountNotFoundError extends BaseError2 {
    constructor({ docsPath: docsPath8 } = {}) {
      super([
        "Could not find an Account to execute with this Action.",
        "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client."
      ].join(`
`), {
        docsPath: docsPath8,
        docsSlug: "account",
        name: "AccountNotFoundError"
      });
    }
  };
  AccountTypeNotSupportedError = class AccountTypeNotSupportedError extends BaseError2 {
    constructor({ docsPath: docsPath8, metaMessages, type }) {
      super(`Account type "${type}" is not supported.`, {
        docsPath: docsPath8,
        metaMessages,
        name: "AccountTypeNotSupportedError"
      });
    }
  };
});

// node_modules/viem/_esm/utils/chain/assertCurrentChain.js
function assertCurrentChain({ chain, currentChainId }) {
  if (!chain)
    throw new ChainNotFoundError;
  if (currentChainId !== chain.id)
    throw new ChainMismatchError({ chain, currentChainId });
}
var init_assertCurrentChain = __esm(() => {
  init_chain();
});

// node_modules/viem/_esm/utils/errors/getTransactionError.js
function getTransactionError(err, { docsPath: docsPath8, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new TransactionExecutionError(cause, {
    docsPath: docsPath8,
    ...args
  });
}
var init_getTransactionError = __esm(() => {
  init_node();
  init_transaction();
  init_getNodeError();
});

// node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
async function sendRawTransaction(client, { serializedTransaction }) {
  return client.request({
    method: "eth_sendRawTransaction",
    params: [serializedTransaction]
  }, { retryCount: 0 });
}

// node_modules/viem/_esm/actions/wallet/sendTransaction.js
async function sendTransaction(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, accessList, authorizationList, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, type, value, ...rest } = parameters;
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransaction"
    });
  const account = account_ ? parseAccount(account_) : null;
  try {
    assertRequest(parameters);
    const to = await (async () => {
      if (parameters.to)
        return parameters.to;
      if (parameters.to === null)
        return;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`.");
        });
      return;
    })();
    if (account?.type === "json-rpc" || account === null) {
      let chainId;
      if (chain !== null) {
        chainId = await getAction(client, getChainId, "getChainId")({});
        assertCurrentChain({
          currentChainId: chainId,
          chain
        });
      }
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        ...extract(rest, { format: chainFormat }),
        accessList,
        account,
        authorizationList,
        blobs,
        chainId,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        type,
        value
      }, "sendTransaction");
      const isWalletNamespaceSupported = supportsWalletNamespace.get(client.uid);
      const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
      try {
        return await client.request({
          method,
          params: [request]
        }, { retryCount: 0 });
      } catch (e) {
        if (isWalletNamespaceSupported === false)
          throw e;
        const error = e;
        if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") {
          return await client.request({
            method: "wallet_sendTransaction",
            params: [request]
          }, { retryCount: 0 }).then((hash2) => {
            supportsWalletNamespace.set(client.uid, true);
            return hash2;
          }).catch((e2) => {
            const walletNamespaceError = e2;
            if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
              supportsWalletNamespace.set(client.uid, false);
              throw error;
            }
            throw walletNamespaceError;
          });
        }
        throw error;
      }
    }
    if (account?.type === "local") {
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager: account.nonceManager,
        parameters: [...defaultParameters, "sidecars"],
        type,
        value,
        ...rest,
        to
      });
      const serializer = chain?.serializers?.transaction;
      const serializedTransaction = await account.signTransaction(request, {
        serializer
      });
      return await getAction(client, sendRawTransaction, "sendRawTransaction")({
        serializedTransaction
      });
    }
    if (account?.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/actions/wallet/sendTransaction",
      type: account?.type
    });
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || undefined
    });
  }
}
var supportsWalletNamespace;
var init_sendTransaction = __esm(() => {
  init_account();
  init_base();
  init_recoverAuthorizationAddress();
  init_assertCurrentChain();
  init_getTransactionError();
  init_transactionRequest();
  init_lru();
  init_assertRequest();
  init_getChainId();
  init_prepareTransactionRequest();
  supportsWalletNamespace = new LruMap(128);
});

// node_modules/viem/_esm/actions/wallet/writeContract.js
async function writeContract(client, parameters) {
  return writeContract.internal(client, sendTransaction, "sendTransaction", parameters);
}
var init_writeContract = __esm(() => {
  init_account();
  init_encodeFunctionData();
  init_getContractError();
  init_sendTransaction();
  (function(writeContract2) {
    async function internal(client, actionFn, name, parameters) {
      const { abi, account: account_ = client.account, address, args, dataSuffix, functionName, ...request } = parameters;
      if (typeof account_ === "undefined")
        throw new AccountNotFoundError({
          docsPath: "/docs/contract/writeContract"
        });
      const account = account_ ? parseAccount(account_) : null;
      const data = encodeFunctionData({
        abi,
        args,
        functionName
      });
      try {
        return await getAction(client, actionFn, name)({
          data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
          to: address,
          account,
          ...request
        });
      } catch (error) {
        throw getContractError(error, {
          abi,
          address,
          args,
          docsPath: "/docs/contract/writeContract",
          functionName,
          sender: account?.address
        });
      }
    }
    writeContract2.internal = internal;
  })(writeContract || (writeContract = {}));
});

// node_modules/viem/_esm/errors/calls.js
var BundleFailedError;
var init_calls = __esm(() => {
  init_base();
  BundleFailedError = class BundleFailedError extends BaseError2 {
    constructor(result) {
      super(`Call bundle failed with status: ${result.statusCode}`, {
        name: "BundleFailedError"
      });
      Object.defineProperty(this, "result", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.result = result;
    }
  };
});

// node_modules/viem/_esm/utils/promise/withRetry.js
function withRetry(fn, { delay: delay_ = 100, retryCount = 2, shouldRetry = () => true } = {}) {
  return new Promise((resolve, reject) => {
    const attemptRetry = async ({ count = 0 } = {}) => {
      const retry = async ({ error }) => {
        const delay = typeof delay_ === "function" ? delay_({ count, error }) : delay_;
        if (delay)
          await wait(delay);
        attemptRetry({ count: count + 1 });
      };
      try {
        const data = await fn();
        resolve(data);
      } catch (err) {
        if (count < retryCount && await shouldRetry({ count, error: err }))
          return retry({ error: err });
        reject(err);
      }
    };
    attemptRetry();
  });
}
var init_withRetry = () => {};

// node_modules/viem/_esm/utils/formatters/transactionReceipt.js
function formatTransactionReceipt(transactionReceipt, _) {
  const receipt = {
    ...transactionReceipt,
    blockNumber: transactionReceipt.blockNumber ? BigInt(transactionReceipt.blockNumber) : null,
    contractAddress: transactionReceipt.contractAddress ? transactionReceipt.contractAddress : null,
    cumulativeGasUsed: transactionReceipt.cumulativeGasUsed ? BigInt(transactionReceipt.cumulativeGasUsed) : null,
    effectiveGasPrice: transactionReceipt.effectiveGasPrice ? BigInt(transactionReceipt.effectiveGasPrice) : null,
    gasUsed: transactionReceipt.gasUsed ? BigInt(transactionReceipt.gasUsed) : null,
    logs: transactionReceipt.logs ? transactionReceipt.logs.map((log) => formatLog(log)) : null,
    to: transactionReceipt.to ? transactionReceipt.to : null,
    transactionIndex: transactionReceipt.transactionIndex ? hexToNumber(transactionReceipt.transactionIndex) : null,
    status: transactionReceipt.status ? receiptStatuses[transactionReceipt.status] : null,
    type: transactionReceipt.type ? transactionType[transactionReceipt.type] || transactionReceipt.type : null
  };
  if (transactionReceipt.blobGasPrice)
    receipt.blobGasPrice = BigInt(transactionReceipt.blobGasPrice);
  if (transactionReceipt.blobGasUsed)
    receipt.blobGasUsed = BigInt(transactionReceipt.blobGasUsed);
  return receipt;
}
var receiptStatuses;
var init_transactionReceipt = __esm(() => {
  init_fromHex();
  init_transaction2();
  receiptStatuses = {
    "0x0": "reverted",
    "0x1": "success"
  };
});

// node_modules/viem/_esm/actions/wallet/sendCalls.js
async function sendCalls(client, parameters) {
  const { account: account_ = client.account, capabilities, chain = client.chain, experimental_fallback, experimental_fallbackDelay = 32, forceAtomic = false, id, version: version4 = "2.0.0" } = parameters;
  const account = account_ ? parseAccount(account_) : null;
  const calls = parameters.calls.map((call_) => {
    const call2 = call_;
    const data = call2.abi ? encodeFunctionData({
      abi: call2.abi,
      functionName: call2.functionName,
      args: call2.args
    }) : call2.data;
    return {
      data: call2.dataSuffix && data ? concat([data, call2.dataSuffix]) : data,
      to: call2.to,
      value: call2.value ? numberToHex(call2.value) : undefined
    };
  });
  try {
    const response = await client.request({
      method: "wallet_sendCalls",
      params: [
        {
          atomicRequired: forceAtomic,
          calls,
          capabilities,
          chainId: numberToHex(chain.id),
          from: account?.address,
          id,
          version: version4
        }
      ]
    }, { retryCount: 0 });
    if (typeof response === "string")
      return { id: response };
    return response;
  } catch (err) {
    const error = err;
    if (experimental_fallback && (error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError" || error.name === "UnknownRpcError" || error.details.toLowerCase().includes("does not exist / is not available") || error.details.toLowerCase().includes("missing or invalid. request()") || error.details.toLowerCase().includes("did not match any variant of untagged enum") || error.details.toLowerCase().includes("account upgraded to unsupported contract") || error.details.toLowerCase().includes("eip-7702 not supported") || error.details.toLowerCase().includes("unsupported wc_ method") || error.details.toLowerCase().includes("feature toggled misconfigured") || error.details.toLowerCase().includes("jsonrpcengine: response has no error or result for request"))) {
      if (capabilities) {
        const hasNonOptionalCapability = Object.values(capabilities).some((capability) => !capability.optional);
        if (hasNonOptionalCapability) {
          const message = "non-optional `capabilities` are not supported on fallback to `eth_sendTransaction`.";
          throw new UnsupportedNonOptionalCapabilityError(new BaseError2(message, {
            details: message
          }));
        }
      }
      if (forceAtomic && calls.length > 1) {
        const message = "`forceAtomic` is not supported on fallback to `eth_sendTransaction`.";
        throw new AtomicityNotSupportedError(new BaseError2(message, {
          details: message
        }));
      }
      const promises = [];
      for (const call2 of calls) {
        const promise = sendTransaction(client, {
          account,
          chain,
          data: call2.data,
          to: call2.to,
          value: call2.value ? hexToBigInt(call2.value) : undefined
        });
        promises.push(promise);
        if (experimental_fallbackDelay > 0)
          await new Promise((resolve) => setTimeout(resolve, experimental_fallbackDelay));
      }
      const results = await Promise.allSettled(promises);
      if (results.every((r) => r.status === "rejected"))
        throw results[0].reason;
      const hashes = results.map((result) => {
        if (result.status === "fulfilled")
          return result.value;
        return fallbackTransactionErrorMagicIdentifier;
      });
      return {
        id: concat([
          ...hashes,
          numberToHex(chain.id, { size: 32 }),
          fallbackMagicIdentifier
        ])
      };
    }
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain
    });
  }
}
var fallbackMagicIdentifier = "0x5792579257925792579257925792579257925792579257925792579257925792", fallbackTransactionErrorMagicIdentifier;
var init_sendCalls = __esm(() => {
  init_base();
  init_rpc();
  init_encodeFunctionData();
  init_fromHex();
  init_toHex();
  init_getTransactionError();
  init_sendTransaction();
  fallbackTransactionErrorMagicIdentifier = numberToHex(0, {
    size: 32
  });
});

// node_modules/viem/_esm/actions/wallet/getCallsStatus.js
async function getCallsStatus(client, parameters) {
  async function getStatus(id) {
    const isTransactions = id.endsWith(fallbackMagicIdentifier.slice(2));
    if (isTransactions) {
      const chainId2 = trim(sliceHex(id, -64, -32));
      const hashes = sliceHex(id, 0, -64).slice(2).match(/.{1,64}/g);
      const receipts2 = await Promise.all(hashes.map((hash2) => fallbackTransactionErrorMagicIdentifier.slice(2) !== hash2 ? client.request({
        method: "eth_getTransactionReceipt",
        params: [`0x${hash2}`]
      }, { dedupe: true }) : undefined));
      const status2 = (() => {
        if (receipts2.some((r) => r === null))
          return 100;
        if (receipts2.every((r) => r?.status === "0x1"))
          return 200;
        if (receipts2.every((r) => r?.status === "0x0"))
          return 500;
        return 600;
      })();
      return {
        atomic: false,
        chainId: hexToNumber(chainId2),
        receipts: receipts2.filter(Boolean),
        status: status2,
        version: "2.0.0"
      };
    }
    return client.request({
      method: "wallet_getCallsStatus",
      params: [id]
    });
  }
  const { atomic = false, chainId, receipts, version: version4 = "2.0.0", ...response } = await getStatus(parameters.id);
  const [status, statusCode] = (() => {
    const statusCode2 = response.status;
    if (statusCode2 >= 100 && statusCode2 < 200)
      return ["pending", statusCode2];
    if (statusCode2 >= 200 && statusCode2 < 300)
      return ["success", statusCode2];
    if (statusCode2 >= 300 && statusCode2 < 700)
      return ["failure", statusCode2];
    if (statusCode2 === "CONFIRMED")
      return ["success", 200];
    if (statusCode2 === "PENDING")
      return ["pending", 100];
    return [undefined, statusCode2];
  })();
  return {
    ...response,
    atomic,
    chainId: chainId ? hexToNumber(chainId) : undefined,
    receipts: receipts?.map((receipt) => ({
      ...receipt,
      blockNumber: hexToBigInt(receipt.blockNumber),
      gasUsed: hexToBigInt(receipt.gasUsed),
      status: receiptStatuses[receipt.status]
    })) ?? [],
    statusCode,
    status,
    version: version4
  };
}
var init_getCallsStatus = __esm(() => {
  init_slice();
  init_fromHex();
  init_transactionReceipt();
  init_sendCalls();
});

// node_modules/viem/_esm/actions/wallet/waitForCallsStatus.js
async function waitForCallsStatus(client, parameters) {
  const {
    id,
    pollingInterval = client.pollingInterval,
    status = ({ statusCode }) => statusCode === 200 || statusCode >= 300,
    retryCount = 4,
    retryDelay = ({ count }) => ~~(1 << count) * 200,
    timeout = 60000,
    throwOnFailure = false
  } = parameters;
  const observerId = stringify(["waitForCallsStatus", client.uid, id]);
  const { promise, resolve, reject } = withResolvers();
  let timer;
  const unobserve = observe(observerId, { resolve, reject }, (emit) => {
    const unpoll = poll(async () => {
      const done = (fn) => {
        clearTimeout(timer);
        unpoll();
        fn();
        unobserve();
      };
      try {
        const result = await withRetry(async () => {
          const result2 = await getAction(client, getCallsStatus, "getCallsStatus")({ id });
          if (throwOnFailure && result2.status === "failure")
            throw new BundleFailedError(result2);
          return result2;
        }, {
          retryCount,
          delay: retryDelay
        });
        if (!status(result))
          return;
        done(() => emit.resolve(result));
      } catch (error) {
        done(() => emit.reject(error));
      }
    }, {
      interval: pollingInterval,
      emitOnBegin: true
    });
    return unpoll;
  });
  timer = timeout ? setTimeout(() => {
    unobserve();
    clearTimeout(timer);
    reject(new WaitForCallsStatusTimeoutError({ id }));
  }, timeout) : undefined;
  return await promise;
}
var WaitForCallsStatusTimeoutError;
var init_waitForCallsStatus = __esm(() => {
  init_base();
  init_calls();
  init_observe();
  init_poll();
  init_withRetry();
  init_getCallsStatus();
  WaitForCallsStatusTimeoutError = class WaitForCallsStatusTimeoutError extends BaseError2 {
    constructor({ id }) {
      super(`Timed out while waiting for call bundle with id "${id}" to be confirmed.`, { name: "WaitForCallsStatusTimeoutError" });
    }
  };
});

// node_modules/viem/_esm/utils/uid.js
function uid(length = 11) {
  if (!buffer || index + length > size4 * 2) {
    buffer = "";
    index = 0;
    for (let i = 0;i < size4; i++) {
      buffer += (256 + Math.random() * 256 | 0).toString(16).substring(1);
    }
  }
  return buffer.substring(index, index++ + length);
}
var size4 = 256, index, buffer;
var init_uid = __esm(() => {
  index = size4;
});

// node_modules/viem/_esm/clients/createClient.js
function createClient(parameters) {
  const { batch, chain, ccipRead, key = "base", name = "Base Client", type = "base" } = parameters;
  const experimental_blockTag = parameters.experimental_blockTag ?? (typeof chain?.experimental_preconfirmationTime === "number" ? "pending" : undefined);
  const blockTime = chain?.blockTime ?? 12000;
  const defaultPollingInterval = Math.min(Math.max(Math.floor(blockTime / 2), 500), 4000);
  const pollingInterval = parameters.pollingInterval ?? defaultPollingInterval;
  const cacheTime = parameters.cacheTime ?? pollingInterval;
  const account = parameters.account ? parseAccount(parameters.account) : undefined;
  const { config, request, value } = parameters.transport({
    chain,
    pollingInterval
  });
  const transport = { ...config, ...value };
  const client = {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    key,
    name,
    pollingInterval,
    request,
    transport,
    type,
    uid: uid(),
    ...experimental_blockTag ? { experimental_blockTag } : {}
  };
  function extend(base) {
    return (extendFn) => {
      const extended = extendFn(base);
      for (const key2 in client)
        delete extended[key2];
      const combined = { ...base, ...extended };
      return Object.assign(combined, { extend: extend(combined) });
    };
  }
  return Object.assign(client, { extend: extend(client) });
}
var init_createClient = __esm(() => {
  init_uid();
});

// node_modules/viem/_esm/utils/ens/errors.js
function isNullUniversalResolverError(err) {
  if (!(err instanceof BaseError2))
    return false;
  const cause = err.walk((e) => e instanceof ContractFunctionRevertedError);
  if (!(cause instanceof ContractFunctionRevertedError))
    return false;
  if (cause.data?.errorName === "HttpError")
    return true;
  if (cause.data?.errorName === "ResolverError")
    return true;
  if (cause.data?.errorName === "ResolverNotContract")
    return true;
  if (cause.data?.errorName === "ResolverNotFound")
    return true;
  if (cause.data?.errorName === "ReverseAddressMismatch")
    return true;
  if (cause.data?.errorName === "UnsupportedResolverProfile")
    return true;
  return false;
}
var init_errors3 = __esm(() => {
  init_base();
  init_contract();
});

// node_modules/viem/_esm/utils/ens/encodedLabelToLabelhash.js
function encodedLabelToLabelhash(label) {
  if (label.length !== 66)
    return null;
  if (label.indexOf("[") !== 0)
    return null;
  if (label.indexOf("]") !== 65)
    return null;
  const hash2 = `0x${label.slice(1, 65)}`;
  if (!isHex(hash2))
    return null;
  return hash2;
}
var init_encodedLabelToLabelhash = () => {};

// node_modules/viem/_esm/utils/ens/namehash.js
function namehash(name) {
  let result = new Uint8Array(32).fill(0);
  if (!name)
    return bytesToHex(result);
  const labels = name.split(".");
  for (let i = labels.length - 1;i >= 0; i -= 1) {
    const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i]);
    const hashed = hashFromEncodedLabel ? toBytes(hashFromEncodedLabel) : keccak256(stringToBytes(labels[i]), "bytes");
    result = keccak256(concat([result, hashed]), "bytes");
  }
  return bytesToHex(result);
}
var init_namehash = __esm(() => {
  init_toBytes();
  init_toHex();
  init_keccak256();
  init_encodedLabelToLabelhash();
});

// node_modules/viem/_esm/utils/ens/encodeLabelhash.js
function encodeLabelhash(hash2) {
  return `[${hash2.slice(2)}]`;
}

// node_modules/viem/_esm/utils/ens/labelhash.js
function labelhash(label) {
  const result = new Uint8Array(32).fill(0);
  if (!label)
    return bytesToHex(result);
  return encodedLabelToLabelhash(label) || keccak256(stringToBytes(label));
}
var init_labelhash = __esm(() => {
  init_toBytes();
  init_toHex();
  init_keccak256();
  init_encodedLabelToLabelhash();
});

// node_modules/viem/_esm/utils/ens/packetToBytes.js
function packetToBytes(packet) {
  const value = packet.replace(/^\.|\.$/gm, "");
  if (value.length === 0)
    return new Uint8Array(1);
  const bytes = new Uint8Array(stringToBytes(value).byteLength + 2);
  let offset = 0;
  const list = value.split(".");
  for (let i = 0;i < list.length; i++) {
    let encoded = stringToBytes(list[i]);
    if (encoded.byteLength > 255)
      encoded = stringToBytes(encodeLabelhash(labelhash(list[i])));
    bytes[offset] = encoded.length;
    bytes.set(encoded, offset + 1);
    offset += encoded.length + 1;
  }
  if (bytes.byteLength !== offset + 1)
    return bytes.slice(0, offset + 1);
  return bytes;
}
var init_packetToBytes = __esm(() => {
  init_toBytes();
  init_labelhash();
});

// node_modules/viem/_esm/actions/ens/getEnsAddress.js
async function getEnsAddress(client, parameters) {
  const { blockNumber, blockTag, coinType, name, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    return null;
  const args = (() => {
    if (coinType != null)
      return [namehash(name), BigInt(coinType)];
    return [namehash(name)];
  })();
  try {
    const functionData = encodeFunctionData({
      abi: addressResolverAbi,
      functionName: "addr",
      args
    });
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      functionName: "resolveWithGateways",
      args: [
        toHex(packetToBytes(name)),
        functionData,
        gatewayUrls ?? [localBatchGatewayUrl]
      ],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const address = decodeFunctionResult({
      abi: addressResolverAbi,
      args,
      functionName: "addr",
      data: res[0]
    });
    if (address === "0x")
      return null;
    if (trim(address) === "0x00")
      return null;
    return address;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
var init_getEnsAddress = __esm(() => {
  init_abis();
  init_decodeFunctionResult();
  init_encodeFunctionData();
  init_getChainContractAddress();
  init_toHex();
  init_errors3();
  init_localBatchGatewayRequest();
  init_namehash();
  init_packetToBytes();
  init_readContract();
});

// node_modules/viem/_esm/errors/ens.js
var EnsAvatarInvalidMetadataError, EnsAvatarInvalidNftUriError, EnsAvatarUriResolutionError, EnsAvatarUnsupportedNamespaceError;
var init_ens = __esm(() => {
  init_base();
  EnsAvatarInvalidMetadataError = class EnsAvatarInvalidMetadataError extends BaseError2 {
    constructor({ data }) {
      super("Unable to extract image from metadata. The metadata may be malformed or invalid.", {
        metaMessages: [
          "- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
          "",
          `Provided data: ${JSON.stringify(data)}`
        ],
        name: "EnsAvatarInvalidMetadataError"
      });
    }
  };
  EnsAvatarInvalidNftUriError = class EnsAvatarInvalidNftUriError extends BaseError2 {
    constructor({ reason }) {
      super(`ENS NFT avatar URI is invalid. ${reason}`, {
        name: "EnsAvatarInvalidNftUriError"
      });
    }
  };
  EnsAvatarUriResolutionError = class EnsAvatarUriResolutionError extends BaseError2 {
    constructor({ uri }) {
      super(`Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`, { name: "EnsAvatarUriResolutionError" });
    }
  };
  EnsAvatarUnsupportedNamespaceError = class EnsAvatarUnsupportedNamespaceError extends BaseError2 {
    constructor({ namespace }) {
      super(`ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`, { name: "EnsAvatarUnsupportedNamespaceError" });
    }
  };
});

// node_modules/viem/_esm/utils/ens/avatar/utils.js
async function isImageUri(uri) {
  try {
    const res = await fetch(uri, { method: "HEAD" });
    if (res.status === 200) {
      const contentType = res.headers.get("content-type");
      return contentType?.startsWith("image/");
    }
    return false;
  } catch (error) {
    if (typeof error === "object" && typeof error.response !== "undefined") {
      return false;
    }
    if (!Object.hasOwn(globalThis, "Image"))
      return false;
    return new Promise((resolve) => {
      const img = new Image;
      img.onload = () => {
        resolve(true);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = uri;
    });
  }
}
function getGateway(custom, defaultGateway) {
  if (!custom)
    return defaultGateway;
  if (custom.endsWith("/"))
    return custom.slice(0, -1);
  return custom;
}
function resolveAvatarUri({ uri, gatewayUrls }) {
  const isEncoded = base64Regex.test(uri);
  if (isEncoded)
    return { uri, isOnChain: true, isEncoded };
  const ipfsGateway = getGateway(gatewayUrls?.ipfs, "https://ipfs.io");
  const arweaveGateway = getGateway(gatewayUrls?.arweave, "https://arweave.net");
  const networkRegexMatch = uri.match(networkRegex);
  const { protocol, subpath, target, subtarget = "" } = networkRegexMatch?.groups || {};
  const isIPNS = protocol === "ipns:/" || subpath === "ipns/";
  const isIPFS = protocol === "ipfs:/" || subpath === "ipfs/" || ipfsHashRegex.test(uri);
  if (uri.startsWith("http") && !isIPNS && !isIPFS) {
    let replacedUri = uri;
    if (gatewayUrls?.arweave)
      replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
    return { uri: replacedUri, isOnChain: false, isEncoded: false };
  }
  if ((isIPNS || isIPFS) && target) {
    return {
      uri: `${ipfsGateway}/${isIPNS ? "ipns" : "ipfs"}/${target}${subtarget}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  if (protocol === "ar:/" && target) {
    return {
      uri: `${arweaveGateway}/${target}${subtarget || ""}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  let parsedUri = uri.replace(dataURIRegex, "");
  if (parsedUri.startsWith("<svg")) {
    parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
  }
  if (parsedUri.startsWith("data:") || parsedUri.startsWith("{")) {
    return {
      uri: parsedUri,
      isOnChain: true,
      isEncoded: false
    };
  }
  throw new EnsAvatarUriResolutionError({ uri });
}
function getJsonImage(data) {
  if (typeof data !== "object" || !("image" in data) && !("image_url" in data) && !("image_data" in data)) {
    throw new EnsAvatarInvalidMetadataError({ data });
  }
  return data.image || data.image_url || data.image_data;
}
async function getMetadataAvatarUri({ gatewayUrls, uri }) {
  try {
    const res = await fetch(uri).then((res2) => res2.json());
    const image = await parseAvatarUri({
      gatewayUrls,
      uri: getJsonImage(res)
    });
    return image;
  } catch {
    throw new EnsAvatarUriResolutionError({ uri });
  }
}
async function parseAvatarUri({ gatewayUrls, uri }) {
  const { uri: resolvedURI, isOnChain } = resolveAvatarUri({ uri, gatewayUrls });
  if (isOnChain)
    return resolvedURI;
  const isImage = await isImageUri(resolvedURI);
  if (isImage)
    return resolvedURI;
  throw new EnsAvatarUriResolutionError({ uri });
}
function parseNftUri(uri_) {
  let uri = uri_;
  if (uri.startsWith("did:nft:")) {
    uri = uri.replace("did:nft:", "").replace(/_/g, "/");
  }
  const [reference, asset_namespace, tokenID] = uri.split("/");
  const [eip_namespace, chainID] = reference.split(":");
  const [erc_namespace, contractAddress] = asset_namespace.split(":");
  if (!eip_namespace || eip_namespace.toLowerCase() !== "eip155")
    throw new EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
  if (!chainID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
  if (!contractAddress)
    throw new EnsAvatarInvalidNftUriError({
      reason: "Contract address not found"
    });
  if (!tokenID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
  if (!erc_namespace)
    throw new EnsAvatarInvalidNftUriError({ reason: "ERC namespace not found" });
  return {
    chainID: Number.parseInt(chainID, 10),
    namespace: erc_namespace.toLowerCase(),
    contractAddress,
    tokenID
  };
}
async function getNftTokenUri(client, { nft }) {
  if (nft.namespace === "erc721") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "tokenURI",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "tokenId", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "tokenURI",
      args: [BigInt(nft.tokenID)]
    });
  }
  if (nft.namespace === "erc1155") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "uri",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "_id", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "uri",
      args: [BigInt(nft.tokenID)]
    });
  }
  throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
}
var networkRegex, ipfsHashRegex, base64Regex, dataURIRegex;
var init_utils5 = __esm(() => {
  init_readContract();
  init_ens();
  networkRegex = /(?<protocol>https?:\/\/[^/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
  ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
  base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
  dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
});

// node_modules/viem/_esm/utils/ens/avatar/parseAvatarRecord.js
async function parseAvatarRecord(client, { gatewayUrls, record }) {
  if (/eip155:/i.test(record))
    return parseNftAvatarUri(client, { gatewayUrls, record });
  return parseAvatarUri({ uri: record, gatewayUrls });
}
async function parseNftAvatarUri(client, { gatewayUrls, record }) {
  const nft = parseNftUri(record);
  const nftUri = await getNftTokenUri(client, { nft });
  const { uri: resolvedNftUri, isOnChain, isEncoded } = resolveAvatarUri({ uri: nftUri, gatewayUrls });
  if (isOnChain && (resolvedNftUri.includes("data:application/json;base64,") || resolvedNftUri.startsWith("{"))) {
    const encodedJson = isEncoded ? atob(resolvedNftUri.replace("data:application/json;base64,", "")) : resolvedNftUri;
    const decoded = JSON.parse(encodedJson);
    return parseAvatarUri({ uri: getJsonImage(decoded), gatewayUrls });
  }
  let uriTokenId = nft.tokenID;
  if (nft.namespace === "erc1155")
    uriTokenId = uriTokenId.replace("0x", "").padStart(64, "0");
  return getMetadataAvatarUri({
    gatewayUrls,
    uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId)
  });
}
var init_parseAvatarRecord = __esm(() => {
  init_utils5();
});

// node_modules/viem/_esm/actions/ens/getEnsText.js
async function getEnsText(client, parameters) {
  const { blockNumber, blockTag, key, name, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    return null;
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      args: [
        toHex(packetToBytes(name)),
        encodeFunctionData({
          abi: textResolverAbi,
          functionName: "text",
          args: [namehash(name), key]
        }),
        gatewayUrls ?? [localBatchGatewayUrl]
      ],
      functionName: "resolveWithGateways",
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const record = decodeFunctionResult({
      abi: textResolverAbi,
      functionName: "text",
      data: res[0]
    });
    return record === "" ? null : record;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
var init_getEnsText = __esm(() => {
  init_abis();
  init_decodeFunctionResult();
  init_encodeFunctionData();
  init_getChainContractAddress();
  init_toHex();
  init_errors3();
  init_localBatchGatewayRequest();
  init_namehash();
  init_packetToBytes();
  init_readContract();
});

// node_modules/viem/_esm/actions/ens/getEnsAvatar.js
async function getEnsAvatar(client, { blockNumber, blockTag, assetGatewayUrls, name, gatewayUrls, strict, universalResolverAddress }) {
  const record = await getAction(client, getEnsText, "getEnsText")({
    blockNumber,
    blockTag,
    key: "avatar",
    name,
    universalResolverAddress,
    gatewayUrls,
    strict
  });
  if (!record)
    return null;
  try {
    return await parseAvatarRecord(client, {
      record,
      gatewayUrls: assetGatewayUrls
    });
  } catch {
    return null;
  }
}
var init_getEnsAvatar = __esm(() => {
  init_parseAvatarRecord();
  init_getEnsText();
});

// node_modules/viem/_esm/actions/ens/getEnsName.js
async function getEnsName(client, parameters) {
  const { address, blockNumber, blockTag, coinType = 60n, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverReverseAbi,
      args: [address, coinType, gatewayUrls ?? [localBatchGatewayUrl]],
      functionName: "reverseWithGateways",
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const [name] = await readContractAction(readContractParameters);
    return name || null;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
var init_getEnsName = __esm(() => {
  init_abis();
  init_getChainContractAddress();
  init_errors3();
  init_localBatchGatewayRequest();
  init_readContract();
});

// node_modules/viem/_esm/actions/ens/getEnsResolver.js
async function getEnsResolver(client, parameters) {
  const { blockNumber, blockTag, name } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    throw new Error(`${name} is not a valid ENS TLD (${tlds?.join(", ")}) for chain "${chain.name}" (id: ${chain.id}).`);
  const [resolverAddress] = await getAction(client, readContract, "readContract")({
    address: universalResolverAddress,
    abi: [
      {
        inputs: [{ type: "bytes" }],
        name: "findResolver",
        outputs: [
          { type: "address" },
          { type: "bytes32" },
          { type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
      }
    ],
    functionName: "findResolver",
    args: [toHex(packetToBytes(name))],
    blockNumber,
    blockTag
  });
  return resolverAddress;
}
var init_getEnsResolver = __esm(() => {
  init_getChainContractAddress();
  init_toHex();
  init_packetToBytes();
  init_readContract();
});

// node_modules/viem/_esm/actions/public/createAccessList.js
async function createAccessList(client, args) {
  const { account: account_ = client.account, blockNumber, blockTag = "latest", blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, to, value, ...rest } = args;
  const account = account_ ? parseAccount(account_) : undefined;
  try {
    assertRequest(args);
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      ...extract(rest, { format: chainFormat }),
      account,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to,
      value
    }, "createAccessList");
    const response = await client.request({
      method: "eth_createAccessList",
      params: [request, block]
    });
    return {
      accessList: response.accessList,
      gasUsed: BigInt(response.gasUsed)
    };
  } catch (err) {
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
var init_createAccessList = __esm(() => {
  init_toHex();
  init_getCallError();
  init_transactionRequest();
  init_assertRequest();
});

// node_modules/viem/_esm/actions/public/createBlockFilter.js
async function createBlockFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newBlockFilter"
  });
  const id = await client.request({
    method: "eth_newBlockFilter"
  });
  return { id, request: getRequest(id), type: "block" };
}
var init_createBlockFilter = () => {};

// node_modules/viem/_esm/actions/public/createEventFilter.js
async function createEventFilter(client, { address, args, event, events: events_, fromBlock, strict, toBlock } = {}) {
  const events = events_ ?? (event ? [event] : undefined);
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        ...topics.length ? { topics } : {}
      }
    ]
  });
  return {
    abi: events,
    args,
    eventName: event ? event.name : undefined,
    fromBlock,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    toBlock,
    type: "event"
  };
}
var init_createEventFilter = __esm(() => {
  init_encodeEventTopics();
  init_toHex();
});

// node_modules/viem/_esm/actions/public/createPendingTransactionFilter.js
async function createPendingTransactionFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newPendingTransactionFilter"
  });
  const id = await client.request({
    method: "eth_newPendingTransactionFilter"
  });
  return { id, request: getRequest(id), type: "transaction" };
}
var init_createPendingTransactionFilter = () => {};

// node_modules/viem/_esm/actions/public/getBalance.js
async function getBalance(client, { address, blockNumber, blockTag = client.experimental_blockTag ?? "latest" }) {
  const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : undefined;
  const balance = await client.request({
    method: "eth_getBalance",
    params: [address, blockNumberHex || blockTag]
  });
  return BigInt(balance);
}
var init_getBalance = __esm(() => {
  init_toHex();
});

// node_modules/viem/_esm/actions/public/getBlobBaseFee.js
async function getBlobBaseFee(client) {
  const baseFee = await client.request({
    method: "eth_blobBaseFee"
  });
  return BigInt(baseFee);
}

// node_modules/viem/_esm/actions/public/getBlockTransactionCount.js
async function getBlockTransactionCount(client, { blockHash, blockNumber, blockTag = "latest" } = {}) {
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  let count;
  if (blockHash) {
    count = await client.request({
      method: "eth_getBlockTransactionCountByHash",
      params: [blockHash]
    }, { dedupe: true });
  } else {
    count = await client.request({
      method: "eth_getBlockTransactionCountByNumber",
      params: [blockNumberHex || blockTag]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  return hexToNumber(count);
}
var init_getBlockTransactionCount = __esm(() => {
  init_fromHex();
  init_toHex();
});

// node_modules/viem/_esm/actions/public/getCode.js
async function getCode(client, { address, blockNumber, blockTag = "latest" }) {
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  const hex = await client.request({
    method: "eth_getCode",
    params: [address, blockNumberHex || blockTag]
  }, { dedupe: Boolean(blockNumberHex) });
  if (hex === "0x")
    return;
  return hex;
}
var init_getCode = __esm(() => {
  init_toHex();
});

// node_modules/viem/_esm/errors/eip712.js
var Eip712DomainNotFoundError;
var init_eip712 = __esm(() => {
  init_base();
  Eip712DomainNotFoundError = class Eip712DomainNotFoundError extends BaseError2 {
    constructor({ address }) {
      super(`No EIP-712 domain found on contract "${address}".`, {
        metaMessages: [
          "Ensure that:",
          `- The contract is deployed at the address "${address}".`,
          "- `eip712Domain()` function exists on the contract.",
          "- `eip712Domain()` function matches signature to ERC-5267 specification."
        ],
        name: "Eip712DomainNotFoundError"
      });
    }
  };
});

// node_modules/viem/_esm/actions/public/getEip712Domain.js
async function getEip712Domain(client, parameters) {
  const { address, factory, factoryData } = parameters;
  try {
    const [fields, name, version4, chainId, verifyingContract, salt, extensions] = await getAction(client, readContract, "readContract")({
      abi,
      address,
      functionName: "eip712Domain",
      factory,
      factoryData
    });
    return {
      domain: {
        name,
        version: version4,
        chainId: Number(chainId),
        verifyingContract,
        salt
      },
      extensions,
      fields
    };
  } catch (e) {
    const error = e;
    if (error.name === "ContractFunctionExecutionError" && error.cause.name === "ContractFunctionZeroDataError") {
      throw new Eip712DomainNotFoundError({ address });
    }
    throw error;
  }
}
var abi;
var init_getEip712Domain = __esm(() => {
  init_eip712();
  init_readContract();
  abi = [
    {
      inputs: [],
      name: "eip712Domain",
      outputs: [
        { name: "fields", type: "bytes1" },
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
        { name: "extensions", type: "uint256[]" }
      ],
      stateMutability: "view",
      type: "function"
    }
  ];
});

// node_modules/viem/_esm/utils/formatters/feeHistory.js
function formatFeeHistory(feeHistory) {
  return {
    baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
    gasUsedRatio: feeHistory.gasUsedRatio,
    oldestBlock: BigInt(feeHistory.oldestBlock),
    reward: feeHistory.reward?.map((reward) => reward.map((value) => BigInt(value)))
  };
}

// node_modules/viem/_esm/actions/public/getFeeHistory.js
async function getFeeHistory(client, { blockCount, blockNumber, blockTag = "latest", rewardPercentiles }) {
  const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : undefined;
  const feeHistory = await client.request({
    method: "eth_feeHistory",
    params: [
      numberToHex(blockCount),
      blockNumberHex || blockTag,
      rewardPercentiles
    ]
  }, { dedupe: Boolean(blockNumberHex) });
  return formatFeeHistory(feeHistory);
}
var init_getFeeHistory = __esm(() => {
  init_toHex();
});

// node_modules/viem/_esm/actions/public/getFilterLogs.js
async function getFilterLogs(_client, { filter }) {
  const strict = filter.strict ?? false;
  const logs = await filter.request({
    method: "eth_getFilterLogs",
    params: [filter.id]
  });
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!filter.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict
  });
}
var init_getFilterLogs = __esm(() => {
  init_parseEventLogs();
});

// node_modules/viem/_esm/utils/transaction/assertTransaction.js
function assertTransactionEIP7702(transaction) {
  const { authorizationList } = transaction;
  if (authorizationList) {
    for (const authorization of authorizationList) {
      const { chainId } = authorization;
      const address = authorization.address;
      if (!isAddress(address))
        throw new InvalidAddressError({ address });
      if (chainId < 0)
        throw new InvalidChainIdError({ chainId });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP4844(transaction) {
  const { blobVersionedHashes } = transaction;
  if (blobVersionedHashes) {
    if (blobVersionedHashes.length === 0)
      throw new EmptyBlobError;
    for (const hash2 of blobVersionedHashes) {
      const size_ = size(hash2);
      const version4 = hexToNumber(slice(hash2, 0, 1));
      if (size_ !== 32)
        throw new InvalidVersionedHashSizeError({ hash: hash2, size: size_ });
      if (version4 !== versionedHashVersionKzg)
        throw new InvalidVersionedHashVersionError({
          hash: hash2,
          version: version4
        });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP1559(transaction) {
  const { chainId, maxPriorityFeePerGas, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
function assertTransactionEIP2930(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
function assertTransactionLegacy(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof chainId !== "undefined" && chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
var init_assertTransaction = __esm(() => {
  init_number();
  init_address();
  init_base();
  init_blob2();
  init_chain();
  init_node();
  init_isAddress();
  init_size();
  init_slice();
  init_fromHex();
});

// node_modules/viem/_esm/utils/transaction/serializeAccessList.js
function serializeAccessList(accessList) {
  if (!accessList || accessList.length === 0)
    return [];
  const serializedAccessList = [];
  for (let i = 0;i < accessList.length; i++) {
    const { address, storageKeys } = accessList[i];
    for (let j = 0;j < storageKeys.length; j++) {
      if (storageKeys[j].length - 2 !== 64) {
        throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] });
      }
    }
    if (!isAddress(address, { strict: false })) {
      throw new InvalidAddressError({ address });
    }
    serializedAccessList.push([address, storageKeys]);
  }
  return serializedAccessList;
}
var init_serializeAccessList = __esm(() => {
  init_address();
  init_transaction();
  init_isAddress();
});

// node_modules/viem/_esm/utils/transaction/serializeTransaction.js
function serializeTransaction(transaction, signature) {
  const type = getTransactionType(transaction);
  if (type === "eip1559")
    return serializeTransactionEIP1559(transaction, signature);
  if (type === "eip2930")
    return serializeTransactionEIP2930(transaction, signature);
  if (type === "eip4844")
    return serializeTransactionEIP4844(transaction, signature);
  if (type === "eip7702")
    return serializeTransactionEIP7702(transaction, signature);
  return serializeTransactionLegacy(transaction, signature);
}
function serializeTransactionEIP7702(transaction, signature) {
  const { authorizationList, chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP7702(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedAuthorizationList = serializeAuthorizationList(authorizationList);
  return concatHex([
    "0x04",
    toRlp([
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : "0x",
      maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
      maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
      gas ? numberToHex(gas) : "0x",
      to ?? "0x",
      value ? numberToHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      serializedAuthorizationList,
      ...toYParitySignatureArray(transaction, signature)
    ])
  ]);
}
function serializeTransactionEIP4844(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP4844(transaction);
  let blobVersionedHashes = transaction.blobVersionedHashes;
  let sidecars = transaction.sidecars;
  if (transaction.blobs && (typeof blobVersionedHashes === "undefined" || typeof sidecars === "undefined")) {
    const blobs2 = typeof transaction.blobs[0] === "string" ? transaction.blobs : transaction.blobs.map((x) => bytesToHex(x));
    const kzg = transaction.kzg;
    const commitments2 = blobsToCommitments({
      blobs: blobs2,
      kzg
    });
    if (typeof blobVersionedHashes === "undefined")
      blobVersionedHashes = commitmentsToVersionedHashes({
        commitments: commitments2
      });
    if (typeof sidecars === "undefined") {
      const proofs2 = blobsToProofs({ blobs: blobs2, commitments: commitments2, kzg });
      sidecars = toBlobSidecars({ blobs: blobs2, commitments: commitments2, proofs: proofs2 });
    }
  }
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    maxFeePerBlobGas ? numberToHex(maxFeePerBlobGas) : "0x",
    blobVersionedHashes ?? [],
    ...toYParitySignatureArray(transaction, signature)
  ];
  const blobs = [];
  const commitments = [];
  const proofs = [];
  if (sidecars)
    for (let i = 0;i < sidecars.length; i++) {
      const { blob, commitment, proof } = sidecars[i];
      blobs.push(blob);
      commitments.push(commitment);
      proofs.push(proof);
    }
  return concatHex([
    "0x03",
    sidecars ? toRlp([serializedTransaction, blobs, commitments, proofs]) : toRlp(serializedTransaction)
  ]);
}
function serializeTransactionEIP1559(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP1559(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x02",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionEIP2930(transaction, signature) {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } = transaction;
  assertTransactionEIP2930(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    gasPrice ? numberToHex(gasPrice) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x01",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionLegacy(transaction, signature) {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction;
  assertTransactionLegacy(transaction);
  let serializedTransaction = [
    nonce ? numberToHex(nonce) : "0x",
    gasPrice ? numberToHex(gasPrice) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x"
  ];
  if (signature) {
    const v = (() => {
      if (signature.v >= 35n) {
        const inferredChainId = (signature.v - 35n) / 2n;
        if (inferredChainId > 0)
          return signature.v;
        return 27n + (signature.v === 35n ? 0n : 1n);
      }
      if (chainId > 0)
        return BigInt(chainId * 2) + BigInt(35n + signature.v - 27n);
      const v2 = 27n + (signature.v === 27n ? 0n : 1n);
      if (signature.v !== v2)
        throw new InvalidLegacyVError({ v: signature.v });
      return v2;
    })();
    const r = trim(signature.r);
    const s = trim(signature.s);
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(v),
      r === "0x00" ? "0x" : r,
      s === "0x00" ? "0x" : s
    ];
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(chainId),
      "0x",
      "0x"
    ];
  }
  return toRlp(serializedTransaction);
}
function toYParitySignatureArray(transaction, signature_) {
  const signature = signature_ ?? transaction;
  const { v, yParity } = signature;
  if (typeof signature.r === "undefined")
    return [];
  if (typeof signature.s === "undefined")
    return [];
  if (typeof v === "undefined" && typeof yParity === "undefined")
    return [];
  const r = trim(signature.r);
  const s = trim(signature.s);
  const yParity_ = (() => {
    if (typeof yParity === "number")
      return yParity ? numberToHex(1) : "0x";
    if (v === 0n)
      return "0x";
    if (v === 1n)
      return numberToHex(1);
    return v === 27n ? "0x" : numberToHex(1);
  })();
  return [yParity_, r === "0x00" ? "0x" : r, s === "0x00" ? "0x" : s];
}
var init_serializeTransaction = __esm(() => {
  init_transaction();
  init_serializeAuthorizationList();
  init_blobsToCommitments();
  init_blobsToProofs();
  init_commitmentsToVersionedHashes();
  init_toBlobSidecars();
  init_toHex();
  init_toRlp();
  init_assertTransaction();
  init_getTransactionType();
  init_serializeAccessList();
});

// node_modules/viem/_esm/utils/authorization/serializeAuthorizationList.js
function serializeAuthorizationList(authorizationList) {
  if (!authorizationList || authorizationList.length === 0)
    return [];
  const serializedAuthorizationList = [];
  for (const authorization of authorizationList) {
    const { chainId, nonce, ...signature } = authorization;
    const contractAddress = authorization.address;
    serializedAuthorizationList.push([
      chainId ? toHex(chainId) : "0x",
      contractAddress,
      nonce ? toHex(nonce) : "0x",
      ...toYParitySignatureArray({}, signature)
    ]);
  }
  return serializedAuthorizationList;
}
var init_serializeAuthorizationList = __esm(() => {
  init_toHex();
  init_serializeTransaction();
});

// node_modules/viem/_esm/utils/authorization/verifyAuthorization.js
async function verifyAuthorization({ address, authorization, signature }) {
  return isAddressEqual(getAddress(address), await recoverAuthorizationAddress({
    authorization,
    signature
  }));
}
var init_verifyAuthorization = __esm(() => {
  init_getAddress();
  init_isAddressEqual();
  init_recoverAuthorizationAddress();
});

// node_modules/viem/_esm/utils/promise/withDedupe.js
function withDedupe(fn, { enabled = true, id }) {
  if (!enabled || !id)
    return fn();
  if (promiseCache2.get(id))
    return promiseCache2.get(id);
  const promise = fn().finally(() => promiseCache2.delete(id));
  promiseCache2.set(id, promise);
  return promise;
}
var promiseCache2;
var init_withDedupe = __esm(() => {
  init_lru();
  promiseCache2 = /* @__PURE__ */ new LruMap(8192);
});

// node_modules/viem/_esm/utils/buildRequest.js
function buildRequest(request, options = {}) {
  return async (args, overrideOptions = {}) => {
    const { dedupe = false, methods, retryDelay = 150, retryCount = 3, uid: uid2 } = {
      ...options,
      ...overrideOptions
    };
    const { method } = args;
    if (methods?.exclude?.includes(method))
      throw new MethodNotSupportedRpcError(new Error("method not supported"), {
        method
      });
    if (methods?.include && !methods.include.includes(method))
      throw new MethodNotSupportedRpcError(new Error("method not supported"), {
        method
      });
    const requestId = dedupe ? stringToHex(`${uid2}.${stringify(args)}`) : undefined;
    return withDedupe(() => withRetry(async () => {
      try {
        return await request(args);
      } catch (err_) {
        const err = err_;
        switch (err.code) {
          case ParseRpcError.code:
            throw new ParseRpcError(err);
          case InvalidRequestRpcError.code:
            throw new InvalidRequestRpcError(err);
          case MethodNotFoundRpcError.code:
            throw new MethodNotFoundRpcError(err, { method: args.method });
          case InvalidParamsRpcError.code:
            throw new InvalidParamsRpcError(err);
          case InternalRpcError.code:
            throw new InternalRpcError(err);
          case InvalidInputRpcError.code:
            throw new InvalidInputRpcError(err);
          case ResourceNotFoundRpcError.code:
            throw new ResourceNotFoundRpcError(err);
          case ResourceUnavailableRpcError.code:
            throw new ResourceUnavailableRpcError(err);
          case TransactionRejectedRpcError.code:
            throw new TransactionRejectedRpcError(err);
          case MethodNotSupportedRpcError.code:
            throw new MethodNotSupportedRpcError(err, {
              method: args.method
            });
          case LimitExceededRpcError.code:
            throw new LimitExceededRpcError(err);
          case JsonRpcVersionUnsupportedError.code:
            throw new JsonRpcVersionUnsupportedError(err);
          case UserRejectedRequestError.code:
            throw new UserRejectedRequestError(err);
          case UnauthorizedProviderError.code:
            throw new UnauthorizedProviderError(err);
          case UnsupportedProviderMethodError.code:
            throw new UnsupportedProviderMethodError(err);
          case ProviderDisconnectedError.code:
            throw new ProviderDisconnectedError(err);
          case ChainDisconnectedError.code:
            throw new ChainDisconnectedError(err);
          case SwitchChainError.code:
            throw new SwitchChainError(err);
          case UnsupportedNonOptionalCapabilityError.code:
            throw new UnsupportedNonOptionalCapabilityError(err);
          case UnsupportedChainIdError.code:
            throw new UnsupportedChainIdError(err);
          case DuplicateIdError.code:
            throw new DuplicateIdError(err);
          case UnknownBundleIdError.code:
            throw new UnknownBundleIdError(err);
          case BundleTooLargeError.code:
            throw new BundleTooLargeError(err);
          case AtomicReadyWalletRejectedUpgradeError.code:
            throw new AtomicReadyWalletRejectedUpgradeError(err);
          case AtomicityNotSupportedError.code:
            throw new AtomicityNotSupportedError(err);
          case 5000:
            throw new UserRejectedRequestError(err);
          default:
            if (err_ instanceof BaseError2)
              throw err_;
            throw new UnknownRpcError(err);
        }
      }
    }, {
      delay: ({ count, error }) => {
        if (error && error instanceof HttpRequestError) {
          const retryAfter = error?.headers?.get("Retry-After");
          if (retryAfter?.match(/\d/))
            return Number.parseInt(retryAfter, 10) * 1000;
        }
        return ~~(1 << count) * retryDelay;
      },
      retryCount,
      shouldRetry: ({ error }) => shouldRetry(error)
    }), { enabled: dedupe, id: requestId });
  };
}
function shouldRetry(error) {
  if ("code" in error && typeof error.code === "number") {
    if (error.code === -1)
      return true;
    if (error.code === LimitExceededRpcError.code)
      return true;
    if (error.code === InternalRpcError.code)
      return true;
    return false;
  }
  if (error instanceof HttpRequestError && error.status) {
    if (error.status === 403)
      return true;
    if (error.status === 408)
      return true;
    if (error.status === 413)
      return true;
    if (error.status === 429)
      return true;
    if (error.status === 500)
      return true;
    if (error.status === 502)
      return true;
    if (error.status === 503)
      return true;
    if (error.status === 504)
      return true;
    return false;
  }
  return true;
}
var init_buildRequest = __esm(() => {
  init_base();
  init_request();
  init_rpc();
  init_toHex();
  init_withDedupe();
  init_withRetry();
});

// node_modules/viem/_esm/utils/chain/defineChain.js
function defineChain(chain) {
  return {
    formatters: undefined,
    fees: undefined,
    serializers: undefined,
    ...chain
  };
}

// node_modules/viem/_esm/utils/promise/withTimeout.js
function withTimeout(fn, { errorInstance = new Error("timed out"), timeout, signal }) {
  return new Promise((resolve, reject) => {
    (async () => {
      let timeoutId;
      try {
        const controller = new AbortController;
        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort();
            } else {
              reject(errorInstance);
            }
          }, timeout);
        }
        resolve(await fn({ signal: controller?.signal || null }));
      } catch (err) {
        if (err?.name === "AbortError")
          reject(errorInstance);
        reject(err);
      } finally {
        clearTimeout(timeoutId);
      }
    })();
  });
}

// node_modules/viem/_esm/utils/rpc/id.js
function createIdStore() {
  return {
    current: 0,
    take() {
      return this.current++;
    },
    reset() {
      this.current = 0;
    }
  };
}
var idCache;
var init_id = __esm(() => {
  idCache = /* @__PURE__ */ createIdStore();
});

// node_modules/viem/_esm/utils/rpc/http.js
function getHttpRpcClient(url, options = {}) {
  return {
    async request(params) {
      const { body, fetchFn = options.fetchFn ?? fetch, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 1e4 } = params;
      const fetchOptions = {
        ...options.fetchOptions ?? {},
        ...params.fetchOptions ?? {}
      };
      const { headers, method, signal: signal_ } = fetchOptions;
      try {
        const response = await withTimeout(async ({ signal }) => {
          const init = {
            ...fetchOptions,
            body: Array.isArray(body) ? stringify(body.map((body2) => ({
              jsonrpc: "2.0",
              id: body2.id ?? idCache.take(),
              ...body2
            }))) : stringify({
              jsonrpc: "2.0",
              id: body.id ?? idCache.take(),
              ...body
            }),
            headers: {
              "Content-Type": "application/json",
              ...headers
            },
            method: method || "POST",
            signal: signal_ || (timeout > 0 ? signal : null)
          };
          const request = new Request(url, init);
          const args = await onRequest?.(request, init) ?? { ...init, url };
          const response2 = await fetchFn(args.url ?? url, args);
          return response2;
        }, {
          errorInstance: new TimeoutError({ body, url }),
          timeout,
          signal: true
        });
        if (onResponse)
          await onResponse(response);
        let data;
        if (response.headers.get("Content-Type")?.startsWith("application/json"))
          data = await response.json();
        else {
          data = await response.text();
          try {
            data = JSON.parse(data || "{}");
          } catch (err) {
            if (response.ok)
              throw err;
            data = { error: data };
          }
        }
        if (!response.ok) {
          throw new HttpRequestError({
            body,
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url
          });
        }
        return data;
      } catch (err) {
        if (err instanceof HttpRequestError)
          throw err;
        if (err instanceof TimeoutError)
          throw err;
        throw new HttpRequestError({
          body,
          cause: err,
          url
        });
      }
    }
  };
}
var init_http = __esm(() => {
  init_request();
  init_id();
});

// node_modules/viem/_esm/constants/strings.js
var presignMessagePrefix = `\x19Ethereum Signed Message:
`;

// node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}
var init_toPrefixedMessage = __esm(() => {
  init_size();
  init_toHex();
});

// node_modules/viem/_esm/utils/signature/hashMessage.js
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}
var init_hashMessage = __esm(() => {
  init_keccak256();
  init_toPrefixedMessage();
});

// node_modules/viem/_esm/errors/typedData.js
var InvalidDomainError, InvalidPrimaryTypeError, InvalidStructTypeError;
var init_typedData = __esm(() => {
  init_base();
  InvalidDomainError = class InvalidDomainError extends BaseError2 {
    constructor({ domain }) {
      super(`Invalid domain "${stringify(domain)}".`, {
        metaMessages: ["Must be a valid EIP-712 domain."]
      });
    }
  };
  InvalidPrimaryTypeError = class InvalidPrimaryTypeError extends BaseError2 {
    constructor({ primaryType, types }) {
      super(`Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types))}\`.`, {
        docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
        metaMessages: ["Check that the primary type is a key in `types`."]
      });
    }
  };
  InvalidStructTypeError = class InvalidStructTypeError extends BaseError2 {
    constructor({ type }) {
      super(`Struct type "${type}" is invalid.`, {
        metaMessages: ["Struct type must not be a Solidity type."],
        name: "InvalidStructTypeError"
      });
    }
  };
});

// node_modules/viem/_esm/utils/typedData.js
function serializeTypedData(parameters) {
  const { domain: domain_, message: message_, primaryType, types } = parameters;
  const normalizeData = (struct, data_) => {
    const data = { ...data_ };
    for (const param of struct) {
      const { name, type } = param;
      if (type === "address")
        data[name] = data[name].toLowerCase();
    }
    return data;
  };
  const domain = (() => {
    if (!types.EIP712Domain)
      return {};
    if (!domain_)
      return {};
    return normalizeData(types.EIP712Domain, domain_);
  })();
  const message = (() => {
    if (primaryType === "EIP712Domain")
      return;
    return normalizeData(types[primaryType], message_);
  })();
  return stringify({ domain, message, primaryType, types });
}
function validateTypedData(parameters) {
  const { domain, message, primaryType, types } = parameters;
  const validateData = (struct, data) => {
    for (const param of struct) {
      const { name, type } = param;
      const value = data[name];
      const integerMatch = type.match(integerRegex2);
      if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
        const [_type, base, size_] = integerMatch;
        numberToHex(value, {
          signed: base === "int",
          size: Number.parseInt(size_, 10) / 8
        });
      }
      if (type === "address" && typeof value === "string" && !isAddress(value))
        throw new InvalidAddressError({ address: value });
      const bytesMatch = type.match(bytesRegex2);
      if (bytesMatch) {
        const [_type, size_] = bytesMatch;
        if (size_ && size(value) !== Number.parseInt(size_, 10))
          throw new BytesSizeMismatchError({
            expectedSize: Number.parseInt(size_, 10),
            givenSize: size(value)
          });
      }
      const struct2 = types[type];
      if (struct2) {
        validateReference(type);
        validateData(struct2, value);
      }
    }
  };
  if (types.EIP712Domain && domain) {
    if (typeof domain !== "object")
      throw new InvalidDomainError({ domain });
    validateData(types.EIP712Domain, domain);
  }
  if (primaryType !== "EIP712Domain") {
    if (types[primaryType])
      validateData(types[primaryType], message);
    else
      throw new InvalidPrimaryTypeError({ primaryType, types });
  }
}
function getTypesForEIP712Domain({ domain }) {
  return [
    typeof domain?.name === "string" && { name: "name", type: "string" },
    domain?.version && { name: "version", type: "string" },
    (typeof domain?.chainId === "number" || typeof domain?.chainId === "bigint") && {
      name: "chainId",
      type: "uint256"
    },
    domain?.verifyingContract && {
      name: "verifyingContract",
      type: "address"
    },
    domain?.salt && { name: "salt", type: "bytes32" }
  ].filter(Boolean);
}
function validateReference(type) {
  if (type === "address" || type === "bool" || type === "string" || type.startsWith("bytes") || type.startsWith("uint") || type.startsWith("int"))
    throw new InvalidStructTypeError({ type });
}
var init_typedData2 = __esm(() => {
  init_abi();
  init_address();
  init_typedData();
  init_isAddress();
  init_size();
  init_toHex();
  init_regex2();
});

// node_modules/viem/_esm/utils/signature/hashTypedData.js
function hashTypedData(parameters) {
  const { domain = {}, message, primaryType } = parameters;
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({
    domain,
    message,
    primaryType,
    types
  });
  const parts = ["0x1901"];
  if (domain)
    parts.push(hashDomain({
      domain,
      types
    }));
  if (primaryType !== "EIP712Domain")
    parts.push(hashStruct({
      data: message,
      primaryType,
      types
    }));
  return keccak256(concat(parts));
}
function hashDomain({ domain, types }) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types
  });
}
function hashStruct({ data, primaryType, types }) {
  const encoded = encodeData({
    data,
    primaryType,
    types
  });
  return keccak256(encoded);
}
function encodeData({ data, primaryType, types }) {
  const encodedTypes = [{ type: "bytes32" }];
  const encodedValues = [hashType({ primaryType, types })];
  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name]
    });
    encodedTypes.push(type);
    encodedValues.push(value);
  }
  return encodeAbiParameters(encodedTypes, encodedValues);
}
function hashType({ primaryType, types }) {
  const encodedHashType = toHex(encodeType({ primaryType, types }));
  return keccak256(encodedHashType);
}
function encodeType({ primaryType, types }) {
  let result = "";
  const unsortedDeps = findTypeDependencies({ primaryType, types });
  unsortedDeps.delete(primaryType);
  const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type: t }) => `${t} ${name}`).join(",")})`;
  }
  return result;
}
function findTypeDependencies({ primaryType: primaryType_, types }, results = new Set) {
  const match = primaryType_.match(/^\w*/u);
  const primaryType = match?.[0];
  if (results.has(primaryType) || types[primaryType] === undefined) {
    return results;
  }
  results.add(primaryType);
  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results);
  }
  return results;
}
function encodeField({ types, name, type, value }) {
  if (types[type] !== undefined) {
    return [
      { type: "bytes32" },
      keccak256(encodeData({ data: value, primaryType: type, types }))
    ];
  }
  if (type === "bytes") {
    const prepend = value.length % 2 ? "0" : "";
    value = `0x${prepend + value.slice(2)}`;
    return [{ type: "bytes32" }, keccak256(value)];
  }
  if (type === "string")
    return [{ type: "bytes32" }, keccak256(toHex(value))];
  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["));
    const typeValuePairs = value.map((item) => encodeField({
      name,
      type: parsedType,
      types,
      value: item
    }));
    return [
      { type: "bytes32" },
      keccak256(encodeAbiParameters(typeValuePairs.map(([t]) => t), typeValuePairs.map(([, v]) => v)))
    ];
  }
  return [{ type }, value];
}
var init_hashTypedData = __esm(() => {
  init_encodeAbiParameters();
  init_toHex();
  init_keccak256();
  init_typedData2();
});

// node_modules/ox/_esm/core/internal/lru.js
var LruMap2;
var init_lru2 = __esm(() => {
  LruMap2 = class LruMap2 extends Map {
    constructor(size5) {
      super();
      Object.defineProperty(this, "maxSize", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.maxSize = size5;
    }
    get(key) {
      const value = super.get(key);
      if (super.has(key) && value !== undefined) {
        this.delete(key);
        super.set(key, value);
      }
      return value;
    }
    set(key, value) {
      super.set(key, value);
      if (this.maxSize && this.size > this.maxSize) {
        const firstKey = this.keys().next().value;
        if (firstKey)
          this.delete(firstKey);
      }
      return this;
    }
  };
});

// node_modules/ox/_esm/core/Caches.js
var caches, checksum;
var init_Caches = __esm(() => {
  init_lru2();
  caches = {
    checksum: /* @__PURE__ */ new LruMap2(8192)
  };
  checksum = caches.checksum;
});

// node_modules/ox/node_modules/@noble/hashes/esm/cryptoNode.js
import * as nc2 from "node:crypto";
var crypto3;
var init_cryptoNode2 = __esm(() => {
  crypto3 = nc2 && typeof nc2 === "object" && "webcrypto" in nc2 ? nc2.webcrypto : nc2 && typeof nc2 === "object" && ("randomBytes" in nc2) ? nc2 : undefined;
});

// node_modules/ox/node_modules/@noble/hashes/esm/utils.js
function isBytes4(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber2(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes4(b, ...lengths) {
  if (!isBytes4(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash2(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  anumber2(h.outputLen);
  anumber2(h.blockLen);
}
function aexists2(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput2(out, instance) {
  abytes4(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function u322(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean2(...arrays) {
  for (let i = 0;i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr2(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function byteSwap2(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap322(arr) {
  for (let i = 0;i < arr.length; i++) {
    arr[i] = byteSwap2(arr[i]);
  }
  return arr;
}
function utf8ToBytes3(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes3(data) {
  if (typeof data === "string")
    data = utf8ToBytes3(data);
  abytes4(data);
  return data;
}
function concatBytes5(...arrays) {
  let sum = 0;
  for (let i = 0;i < arrays.length; i++) {
    const a = arrays[i];
    abytes4(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad4 = 0;i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad4);
    pad4 += a.length;
  }
  return res;
}

class Hash2 {
}
function createHasher3(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes3(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes2(bytesLength = 32) {
  if (crypto3 && typeof crypto3.getRandomValues === "function") {
    return crypto3.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto3 && typeof crypto3.randomBytes === "function") {
    return Uint8Array.from(crypto3.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}
var isLE2, swap32IfBE2;
var init_utils6 = __esm(() => {
  init_cryptoNode2();
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  isLE2 = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
  swap32IfBE2 = isLE2 ? (u) => u : byteSwap322;
});

// node_modules/ox/node_modules/@noble/hashes/esm/_md.js
function setBigUint642(view, byteOffset, value, isLE3) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE3);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE3 ? 4 : 0;
  const l = isLE3 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE3);
  view.setUint32(byteOffset + l, wl, isLE3);
}
function Chi2(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj2(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD2, SHA256_IV2;
var init__md2 = __esm(() => {
  init_utils6();
  HashMD2 = class HashMD2 extends Hash2 {
    constructor(blockLen, outputLen, padOffset, isLE3) {
      super();
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE3;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView2(this.buffer);
    }
    update(data) {
      aexists2(this);
      data = toBytes3(data);
      abytes4(data);
      const { view, buffer: buffer2, blockLen } = this;
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView2(data);
          for (;blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer2.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists2(this);
      aoutput2(out, this);
      this.finished = true;
      const { buffer: buffer2, view, blockLen, isLE: isLE3 } = this;
      let { pos } = this;
      buffer2[pos++] = 128;
      clean2(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos;i < blockLen; i++)
        buffer2[i] = 0;
      setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE3);
      this.process(view, 0);
      const oview = createView2(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0;i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE3);
    }
    digest() {
      const { buffer: buffer2, outputLen } = this;
      this.digestInto(buffer2);
      const res = buffer2.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor);
      to.set(...this.get());
      const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen)
        to.buffer.set(buffer2);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  SHA256_IV2 = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
});

// node_modules/ox/node_modules/@noble/hashes/esm/_u64.js
function fromBig2(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK642), l: Number(n >> _32n2 & U32_MASK642) };
  return { h: Number(n >> _32n2 & U32_MASK642) | 0, l: Number(n & U32_MASK642) | 0 };
}
function split2(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0;i < len; i++) {
    const { h, l } = fromBig2(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var U32_MASK642, _32n2, rotlSH2 = (h, l, s) => h << s | l >>> 32 - s, rotlSL2 = (h, l, s) => l << s | h >>> 32 - s, rotlBH2 = (h, l, s) => l << s - 32 | h >>> 64 - s, rotlBL2 = (h, l, s) => h << s - 32 | l >>> 64 - s;
var init__u642 = __esm(() => {
  U32_MASK642 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
  _32n2 = /* @__PURE__ */ BigInt(32);
});

// node_modules/ox/node_modules/@noble/hashes/esm/sha3.js
function keccakP2(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds;round < 24; round++) {
    for (let x = 0;x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0;x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH2(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL2(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0;y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0;t < 24; t++) {
      const shift = SHA3_ROTL2[t];
      const Th = rotlH2(curH, curL, shift);
      const Tl = rotlL2(curH, curL, shift);
      const PI = SHA3_PI2[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0;y < 50; y += 10) {
      for (let x = 0;x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0;x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H2[round];
    s[1] ^= SHA3_IOTA_L2[round];
  }
  clean2(B);
}
var _0n8, _1n8, _2n5, _7n2, _256n2, _0x71n2, SHA3_PI2, SHA3_ROTL2, _SHA3_IOTA2, IOTAS2, SHA3_IOTA_H2, SHA3_IOTA_L2, rotlH2 = (h, l, s) => s > 32 ? rotlBH2(h, l, s) : rotlSH2(h, l, s), rotlL2 = (h, l, s) => s > 32 ? rotlBL2(h, l, s) : rotlSL2(h, l, s), Keccak2, gen2 = (suffix, blockLen, outputLen) => createHasher3(() => new Keccak2(blockLen, suffix, outputLen)), keccak_2562;
var init_sha32 = __esm(() => {
  init__u642();
  init_utils6();
  _0n8 = BigInt(0);
  _1n8 = BigInt(1);
  _2n5 = BigInt(2);
  _7n2 = BigInt(7);
  _256n2 = BigInt(256);
  _0x71n2 = BigInt(113);
  SHA3_PI2 = [];
  SHA3_ROTL2 = [];
  _SHA3_IOTA2 = [];
  for (let round = 0, R = _1n8, x = 1, y = 0;round < 24; round++) {
    [x, y] = [y, (2 * x + 3 * y) % 5];
    SHA3_PI2.push(2 * (5 * y + x));
    SHA3_ROTL2.push((round + 1) * (round + 2) / 2 % 64);
    let t = _0n8;
    for (let j = 0;j < 7; j++) {
      R = (R << _1n8 ^ (R >> _7n2) * _0x71n2) % _256n2;
      if (R & _2n5)
        t ^= _1n8 << (_1n8 << /* @__PURE__ */ BigInt(j)) - _1n8;
    }
    _SHA3_IOTA2.push(t);
  }
  IOTAS2 = split2(_SHA3_IOTA2, true);
  SHA3_IOTA_H2 = IOTAS2[0];
  SHA3_IOTA_L2 = IOTAS2[1];
  Keccak2 = class Keccak2 extends Hash2 {
    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
      super();
      this.pos = 0;
      this.posOut = 0;
      this.finished = false;
      this.destroyed = false;
      this.enableXOF = false;
      this.blockLen = blockLen;
      this.suffix = suffix;
      this.outputLen = outputLen;
      this.enableXOF = enableXOF;
      this.rounds = rounds;
      anumber2(outputLen);
      if (!(0 < blockLen && blockLen < 200))
        throw new Error("only keccak-f1600 function is supported");
      this.state = new Uint8Array(200);
      this.state32 = u322(this.state);
    }
    clone() {
      return this._cloneInto();
    }
    keccak() {
      swap32IfBE2(this.state32);
      keccakP2(this.state32, this.rounds);
      swap32IfBE2(this.state32);
      this.posOut = 0;
      this.pos = 0;
    }
    update(data) {
      aexists2(this);
      data = toBytes3(data);
      abytes4(data);
      const { blockLen, state } = this;
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        for (let i = 0;i < take; i++)
          state[this.pos++] ^= data[pos++];
        if (this.pos === blockLen)
          this.keccak();
      }
      return this;
    }
    finish() {
      if (this.finished)
        return;
      this.finished = true;
      const { state, suffix, pos, blockLen } = this;
      state[pos] ^= suffix;
      if ((suffix & 128) !== 0 && pos === blockLen - 1)
        this.keccak();
      state[blockLen - 1] ^= 128;
      this.keccak();
    }
    writeInto(out) {
      aexists2(this, false);
      abytes4(out);
      this.finish();
      const bufferOut = this.state;
      const { blockLen } = this;
      for (let pos = 0, len = out.length;pos < len; ) {
        if (this.posOut >= blockLen)
          this.keccak();
        const take = Math.min(blockLen - this.posOut, len - pos);
        out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
        this.posOut += take;
        pos += take;
      }
      return out;
    }
    xofInto(out) {
      if (!this.enableXOF)
        throw new Error("XOF is not possible for this instance");
      return this.writeInto(out);
    }
    xof(bytes) {
      anumber2(bytes);
      return this.xofInto(new Uint8Array(bytes));
    }
    digestInto(out) {
      aoutput2(out, this);
      if (this.finished)
        throw new Error("digest() was already called");
      this.writeInto(out);
      this.destroy();
      return out;
    }
    digest() {
      return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
      this.destroyed = true;
      clean2(this.state);
    }
    _cloneInto(to) {
      const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
      to || (to = new Keccak2(blockLen, suffix, outputLen, enableXOF, rounds));
      to.state32.set(this.state32);
      to.pos = this.pos;
      to.posOut = this.posOut;
      to.finished = this.finished;
      to.rounds = rounds;
      to.suffix = suffix;
      to.outputLen = outputLen;
      to.enableXOF = enableXOF;
      to.destroyed = this.destroyed;
      return to;
    }
  };
  keccak_2562 = /* @__PURE__ */ (() => gen2(1, 136, 256 / 8))();
});

// node_modules/ox/node_modules/@noble/hashes/esm/sha2.js
var SHA256_K2, SHA256_W2, SHA2562, sha2564;
var init_sha22 = __esm(() => {
  init__md2();
  init_utils6();
  SHA256_K2 = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  SHA256_W2 = /* @__PURE__ */ new Uint32Array(64);
  SHA2562 = class SHA2562 extends HashMD2 {
    constructor(outputLen = 32) {
      super(64, outputLen, 8, false);
      this.A = SHA256_IV2[0] | 0;
      this.B = SHA256_IV2[1] | 0;
      this.C = SHA256_IV2[2] | 0;
      this.D = SHA256_IV2[3] | 0;
      this.E = SHA256_IV2[4] | 0;
      this.F = SHA256_IV2[5] | 0;
      this.G = SHA256_IV2[6] | 0;
      this.H = SHA256_IV2[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0;i < 16; i++, offset += 4)
        SHA256_W2[i] = view.getUint32(offset, false);
      for (let i = 16;i < 64; i++) {
        const W15 = SHA256_W2[i - 15];
        const W2 = SHA256_W2[i - 2];
        const s0 = rotr2(W15, 7) ^ rotr2(W15, 18) ^ W15 >>> 3;
        const s1 = rotr2(W2, 17) ^ rotr2(W2, 19) ^ W2 >>> 10;
        SHA256_W2[i] = s1 + SHA256_W2[i - 7] + s0 + SHA256_W2[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0;i < 64; i++) {
        const sigma1 = rotr2(E, 6) ^ rotr2(E, 11) ^ rotr2(E, 25);
        const T1 = H + sigma1 + Chi2(E, F, G) + SHA256_K2[i] + SHA256_W2[i] | 0;
        const sigma0 = rotr2(A, 2) ^ rotr2(A, 13) ^ rotr2(A, 22);
        const T2 = sigma0 + Maj2(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean2(SHA256_W2);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean2(this.buffer);
    }
  };
  sha2564 = /* @__PURE__ */ createHasher3(() => new SHA2562);
});

// node_modules/ox/_esm/core/Hash.js
function keccak2562(value, options = {}) {
  const { as = typeof value === "string" ? "Hex" : "Bytes" } = options;
  const bytes = keccak_2562(from(value));
  if (as === "Bytes")
    return bytes;
  return fromBytes(bytes);
}
var init_Hash = __esm(() => {
  init_sha32();
  init_Bytes();
  init_Hex();
});

// node_modules/ox/_esm/core/PublicKey.js
function assert3(publicKey, options = {}) {
  const { compressed } = options;
  const { prefix, x, y } = publicKey;
  if (compressed === false || typeof x === "bigint" && typeof y === "bigint") {
    if (prefix !== 4)
      throw new InvalidPrefixError({
        prefix,
        cause: new InvalidUncompressedPrefixError
      });
    return;
  }
  if (compressed === true || typeof x === "bigint" && typeof y === "undefined") {
    if (prefix !== 3 && prefix !== 2)
      throw new InvalidPrefixError({
        prefix,
        cause: new InvalidCompressedPrefixError
      });
    return;
  }
  throw new InvalidError({ publicKey });
}
function from3(value) {
  const publicKey = (() => {
    if (validate2(value))
      return fromHex2(value);
    if (validate(value))
      return fromBytes2(value);
    const { prefix, x, y } = value;
    if (typeof x === "bigint" && typeof y === "bigint")
      return { prefix: prefix ?? 4, x, y };
    return { prefix, x };
  })();
  assert3(publicKey);
  return publicKey;
}
function fromBytes2(publicKey) {
  return fromHex2(fromBytes(publicKey));
}
function fromHex2(publicKey) {
  if (publicKey.length !== 132 && publicKey.length !== 130 && publicKey.length !== 68)
    throw new InvalidSerializedSizeError({ publicKey });
  if (publicKey.length === 130) {
    const x2 = BigInt(slice3(publicKey, 0, 32));
    const y = BigInt(slice3(publicKey, 32, 64));
    return {
      prefix: 4,
      x: x2,
      y
    };
  }
  if (publicKey.length === 132) {
    const prefix2 = Number(slice3(publicKey, 0, 1));
    const x2 = BigInt(slice3(publicKey, 1, 33));
    const y = BigInt(slice3(publicKey, 33, 65));
    return {
      prefix: prefix2,
      x: x2,
      y
    };
  }
  const prefix = Number(slice3(publicKey, 0, 1));
  const x = BigInt(slice3(publicKey, 1, 33));
  return {
    prefix,
    x
  };
}
function toHex2(publicKey, options = {}) {
  assert3(publicKey);
  const { prefix, x, y } = publicKey;
  const { includePrefix = true } = options;
  const publicKey_ = concat2(includePrefix ? fromNumber(prefix, { size: 1 }) : "0x", fromNumber(x, { size: 32 }), typeof y === "bigint" ? fromNumber(y, { size: 32 }) : "0x");
  return publicKey_;
}
var InvalidError, InvalidPrefixError, InvalidCompressedPrefixError, InvalidUncompressedPrefixError, InvalidSerializedSizeError;
var init_PublicKey = __esm(() => {
  init_Bytes();
  init_Errors();
  init_Hex();
  InvalidError = class InvalidError extends BaseError3 {
    constructor({ publicKey }) {
      super(`Value \`${stringify2(publicKey)}\` is not a valid public key.`, {
        metaMessages: [
          "Public key must contain:",
          "- an `x` and `prefix` value (compressed)",
          "- an `x`, `y`, and `prefix` value (uncompressed)"
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "PublicKey.InvalidError"
      });
    }
  };
  InvalidPrefixError = class InvalidPrefixError extends BaseError3 {
    constructor({ prefix, cause }) {
      super(`Prefix "${prefix}" is invalid.`, {
        cause
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "PublicKey.InvalidPrefixError"
      });
    }
  };
  InvalidCompressedPrefixError = class InvalidCompressedPrefixError extends BaseError3 {
    constructor() {
      super("Prefix must be 2 or 3 for compressed public keys.");
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "PublicKey.InvalidCompressedPrefixError"
      });
    }
  };
  InvalidUncompressedPrefixError = class InvalidUncompressedPrefixError extends BaseError3 {
    constructor() {
      super("Prefix must be 4 for uncompressed public keys.");
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "PublicKey.InvalidUncompressedPrefixError"
      });
    }
  };
  InvalidSerializedSizeError = class InvalidSerializedSizeError extends BaseError3 {
    constructor({ publicKey }) {
      super(`Value \`${publicKey}\` is an invalid public key size.`, {
        metaMessages: [
          "Expected: 33 bytes (compressed + prefix), 64 bytes (uncompressed) or 65 bytes (uncompressed + prefix).",
          `Received ${size3(from2(publicKey))} bytes.`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "PublicKey.InvalidSerializedSizeError"
      });
    }
  };
});

// node_modules/ox/_esm/core/Address.js
function assert4(value, options = {}) {
  const { strict = true } = options;
  if (!addressRegex2.test(value))
    throw new InvalidAddressError2({
      address: value,
      cause: new InvalidInputError
    });
  if (strict) {
    if (value.toLowerCase() === value)
      return;
    if (checksum2(value) !== value)
      throw new InvalidAddressError2({
        address: value,
        cause: new InvalidChecksumError
      });
  }
}
function checksum2(address) {
  if (checksum.has(address))
    return checksum.get(address);
  assert4(address, { strict: false });
  const hexAddress = address.substring(2).toLowerCase();
  const hash2 = keccak2562(fromString(hexAddress), { as: "Bytes" });
  const characters = hexAddress.split("");
  for (let i = 0;i < 40; i += 2) {
    if (hash2[i >> 1] >> 4 >= 8 && characters[i]) {
      characters[i] = characters[i].toUpperCase();
    }
    if ((hash2[i >> 1] & 15) >= 8 && characters[i + 1]) {
      characters[i + 1] = characters[i + 1].toUpperCase();
    }
  }
  const result = `0x${characters.join("")}`;
  checksum.set(address, result);
  return result;
}
function from4(address, options = {}) {
  const { checksum: checksumVal = false } = options;
  assert4(address);
  if (checksumVal)
    return checksum2(address);
  return address;
}
function fromPublicKey(publicKey, options = {}) {
  const address = keccak2562(`0x${toHex2(publicKey).slice(4)}`).substring(26);
  return from4(`0x${address}`, options);
}
function validate3(address, options = {}) {
  const { strict = true } = options ?? {};
  try {
    assert4(address, { strict });
    return true;
  } catch {
    return false;
  }
}
var addressRegex2, InvalidAddressError2, InvalidInputError, InvalidChecksumError;
var init_Address = __esm(() => {
  init_Bytes();
  init_Caches();
  init_Errors();
  init_Hash();
  init_PublicKey();
  addressRegex2 = /^0x[a-fA-F0-9]{40}$/;
  InvalidAddressError2 = class InvalidAddressError2 extends BaseError3 {
    constructor({ address, cause }) {
      super(`Address "${address}" is invalid.`, {
        cause
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Address.InvalidAddressError"
      });
    }
  };
  InvalidInputError = class InvalidInputError extends BaseError3 {
    constructor() {
      super("Address is not a 20 byte (40 hexadecimal character) value.");
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Address.InvalidInputError"
      });
    }
  };
  InvalidChecksumError = class InvalidChecksumError extends BaseError3 {
    constructor() {
      super("Address does not match its checksum counterpart.");
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Address.InvalidChecksumError"
      });
    }
  };
});

// node_modules/ox/_esm/core/Solidity.js
var arrayRegex, bytesRegex3, integerRegex3, maxInt82, maxInt162, maxInt242, maxInt322, maxInt402, maxInt482, maxInt562, maxInt642, maxInt722, maxInt802, maxInt882, maxInt962, maxInt1042, maxInt1122, maxInt1202, maxInt1282, maxInt1362, maxInt1442, maxInt1522, maxInt1602, maxInt1682, maxInt1762, maxInt1842, maxInt1922, maxInt2002, maxInt2082, maxInt2162, maxInt2242, maxInt2322, maxInt2402, maxInt2482, maxInt2562, minInt82, minInt162, minInt242, minInt322, minInt402, minInt482, minInt562, minInt642, minInt722, minInt802, minInt882, minInt962, minInt1042, minInt1122, minInt1202, minInt1282, minInt1362, minInt1442, minInt1522, minInt1602, minInt1682, minInt1762, minInt1842, minInt1922, minInt2002, minInt2082, minInt2162, minInt2242, minInt2322, minInt2402, minInt2482, minInt2562, maxUint82, maxUint162, maxUint242, maxUint322, maxUint402, maxUint482, maxUint562, maxUint642, maxUint722, maxUint802, maxUint882, maxUint962, maxUint1042, maxUint1122, maxUint1202, maxUint1282, maxUint1362, maxUint1442, maxUint1522, maxUint1602, maxUint1682, maxUint1762, maxUint1842, maxUint1922, maxUint2002, maxUint2082, maxUint2162, maxUint2242, maxUint2322, maxUint2402, maxUint2482, maxUint2562;
var init_Solidity = __esm(() => {
  arrayRegex = /^(.*)\[([0-9]*)\]$/;
  bytesRegex3 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
  integerRegex3 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
  maxInt82 = 2n ** (8n - 1n) - 1n;
  maxInt162 = 2n ** (16n - 1n) - 1n;
  maxInt242 = 2n ** (24n - 1n) - 1n;
  maxInt322 = 2n ** (32n - 1n) - 1n;
  maxInt402 = 2n ** (40n - 1n) - 1n;
  maxInt482 = 2n ** (48n - 1n) - 1n;
  maxInt562 = 2n ** (56n - 1n) - 1n;
  maxInt642 = 2n ** (64n - 1n) - 1n;
  maxInt722 = 2n ** (72n - 1n) - 1n;
  maxInt802 = 2n ** (80n - 1n) - 1n;
  maxInt882 = 2n ** (88n - 1n) - 1n;
  maxInt962 = 2n ** (96n - 1n) - 1n;
  maxInt1042 = 2n ** (104n - 1n) - 1n;
  maxInt1122 = 2n ** (112n - 1n) - 1n;
  maxInt1202 = 2n ** (120n - 1n) - 1n;
  maxInt1282 = 2n ** (128n - 1n) - 1n;
  maxInt1362 = 2n ** (136n - 1n) - 1n;
  maxInt1442 = 2n ** (144n - 1n) - 1n;
  maxInt1522 = 2n ** (152n - 1n) - 1n;
  maxInt1602 = 2n ** (160n - 1n) - 1n;
  maxInt1682 = 2n ** (168n - 1n) - 1n;
  maxInt1762 = 2n ** (176n - 1n) - 1n;
  maxInt1842 = 2n ** (184n - 1n) - 1n;
  maxInt1922 = 2n ** (192n - 1n) - 1n;
  maxInt2002 = 2n ** (200n - 1n) - 1n;
  maxInt2082 = 2n ** (208n - 1n) - 1n;
  maxInt2162 = 2n ** (216n - 1n) - 1n;
  maxInt2242 = 2n ** (224n - 1n) - 1n;
  maxInt2322 = 2n ** (232n - 1n) - 1n;
  maxInt2402 = 2n ** (240n - 1n) - 1n;
  maxInt2482 = 2n ** (248n - 1n) - 1n;
  maxInt2562 = 2n ** (256n - 1n) - 1n;
  minInt82 = -(2n ** (8n - 1n));
  minInt162 = -(2n ** (16n - 1n));
  minInt242 = -(2n ** (24n - 1n));
  minInt322 = -(2n ** (32n - 1n));
  minInt402 = -(2n ** (40n - 1n));
  minInt482 = -(2n ** (48n - 1n));
  minInt562 = -(2n ** (56n - 1n));
  minInt642 = -(2n ** (64n - 1n));
  minInt722 = -(2n ** (72n - 1n));
  minInt802 = -(2n ** (80n - 1n));
  minInt882 = -(2n ** (88n - 1n));
  minInt962 = -(2n ** (96n - 1n));
  minInt1042 = -(2n ** (104n - 1n));
  minInt1122 = -(2n ** (112n - 1n));
  minInt1202 = -(2n ** (120n - 1n));
  minInt1282 = -(2n ** (128n - 1n));
  minInt1362 = -(2n ** (136n - 1n));
  minInt1442 = -(2n ** (144n - 1n));
  minInt1522 = -(2n ** (152n - 1n));
  minInt1602 = -(2n ** (160n - 1n));
  minInt1682 = -(2n ** (168n - 1n));
  minInt1762 = -(2n ** (176n - 1n));
  minInt1842 = -(2n ** (184n - 1n));
  minInt1922 = -(2n ** (192n - 1n));
  minInt2002 = -(2n ** (200n - 1n));
  minInt2082 = -(2n ** (208n - 1n));
  minInt2162 = -(2n ** (216n - 1n));
  minInt2242 = -(2n ** (224n - 1n));
  minInt2322 = -(2n ** (232n - 1n));
  minInt2402 = -(2n ** (240n - 1n));
  minInt2482 = -(2n ** (248n - 1n));
  minInt2562 = -(2n ** (256n - 1n));
  maxUint82 = 2n ** 8n - 1n;
  maxUint162 = 2n ** 16n - 1n;
  maxUint242 = 2n ** 24n - 1n;
  maxUint322 = 2n ** 32n - 1n;
  maxUint402 = 2n ** 40n - 1n;
  maxUint482 = 2n ** 48n - 1n;
  maxUint562 = 2n ** 56n - 1n;
  maxUint642 = 2n ** 64n - 1n;
  maxUint722 = 2n ** 72n - 1n;
  maxUint802 = 2n ** 80n - 1n;
  maxUint882 = 2n ** 88n - 1n;
  maxUint962 = 2n ** 96n - 1n;
  maxUint1042 = 2n ** 104n - 1n;
  maxUint1122 = 2n ** 112n - 1n;
  maxUint1202 = 2n ** 120n - 1n;
  maxUint1282 = 2n ** 128n - 1n;
  maxUint1362 = 2n ** 136n - 1n;
  maxUint1442 = 2n ** 144n - 1n;
  maxUint1522 = 2n ** 152n - 1n;
  maxUint1602 = 2n ** 160n - 1n;
  maxUint1682 = 2n ** 168n - 1n;
  maxUint1762 = 2n ** 176n - 1n;
  maxUint1842 = 2n ** 184n - 1n;
  maxUint1922 = 2n ** 192n - 1n;
  maxUint2002 = 2n ** 200n - 1n;
  maxUint2082 = 2n ** 208n - 1n;
  maxUint2162 = 2n ** 216n - 1n;
  maxUint2242 = 2n ** 224n - 1n;
  maxUint2322 = 2n ** 232n - 1n;
  maxUint2402 = 2n ** 240n - 1n;
  maxUint2482 = 2n ** 248n - 1n;
  maxUint2562 = 2n ** 256n - 1n;
});

// node_modules/ox/_esm/core/internal/abiParameters.js
function decodeParameter2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, staticPosition } = options;
  const arrayComponents = getArrayComponents2(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return decodeArray2(cursor, { ...param, type }, { checksumAddress: checksumAddress2, length, staticPosition });
  }
  if (param.type === "tuple")
    return decodeTuple2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition
    });
  if (param.type === "address")
    return decodeAddress2(cursor, { checksum: checksumAddress2 });
  if (param.type === "bool")
    return decodeBool2(cursor);
  if (param.type.startsWith("bytes"))
    return decodeBytes2(cursor, param, { staticPosition });
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return decodeNumber2(cursor, param);
  if (param.type === "string")
    return decodeString2(cursor, { staticPosition });
  throw new InvalidTypeError(param.type);
}
function decodeAddress2(cursor, options = {}) {
  const { checksum: checksum3 = false } = options;
  const value = cursor.readBytes(32);
  const wrap = (address) => checksum3 ? checksum2(address) : address;
  return [wrap(fromBytes(slice2(value, -20))), 32];
}
function decodeArray2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, length, staticPosition } = options;
  if (!length) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    const startOfData = start + sizeOfLength2;
    cursor.setPosition(start);
    const length2 = toNumber2(cursor.readBytes(sizeOfLength2));
    const dynamicChild = hasDynamicChild2(param);
    let consumed2 = 0;
    const value2 = [];
    for (let i = 0;i < length2; ++i) {
      cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
      const [data, consumed_] = decodeParameter2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition: startOfData
      });
      consumed2 += consumed_;
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  if (hasDynamicChild2(param)) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    const value2 = [];
    for (let i = 0;i < length; ++i) {
      cursor.setPosition(start + i * 32);
      const [data] = decodeParameter2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition: start
      });
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  let consumed = 0;
  const value = [];
  for (let i = 0;i < length; ++i) {
    const [data, consumed_] = decodeParameter2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition: staticPosition + consumed
    });
    consumed += consumed_;
    value.push(data);
  }
  return [value, consumed];
}
function decodeBool2(cursor) {
  return [toBoolean(cursor.readBytes(32), { size: 32 }), 32];
}
function decodeBytes2(cursor, param, { staticPosition }) {
  const [_, size5] = param.type.split("bytes");
  if (!size5) {
    const offset = toNumber2(cursor.readBytes(32));
    cursor.setPosition(staticPosition + offset);
    const length = toNumber2(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["0x", 32];
    }
    const data = cursor.readBytes(length);
    cursor.setPosition(staticPosition + 32);
    return [fromBytes(data), 32];
  }
  const value = fromBytes(cursor.readBytes(Number.parseInt(size5, 10), 32));
  return [value, 32];
}
function decodeNumber2(cursor, param) {
  const signed = param.type.startsWith("int");
  const size5 = Number.parseInt(param.type.split("int")[1] || "256", 10);
  const value = cursor.readBytes(32);
  return [
    size5 > 48 ? toBigInt2(value, { signed }) : toNumber2(value, { signed }),
    32
  ];
}
function decodeTuple2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, staticPosition } = options;
  const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
  const value = hasUnnamedChild ? [] : {};
  let consumed = 0;
  if (hasDynamicChild2(param)) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    for (let i = 0;i < param.components.length; ++i) {
      const component = param.components[i];
      cursor.setPosition(start + consumed);
      const [data, consumed_] = decodeParameter2(cursor, component, {
        checksumAddress: checksumAddress2,
        staticPosition: start
      });
      consumed += consumed_;
      value[hasUnnamedChild ? i : component?.name] = data;
    }
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  for (let i = 0;i < param.components.length; ++i) {
    const component = param.components[i];
    const [data, consumed_] = decodeParameter2(cursor, component, {
      checksumAddress: checksumAddress2,
      staticPosition
    });
    value[hasUnnamedChild ? i : component?.name] = data;
    consumed += consumed_;
  }
  return [value, consumed];
}
function decodeString2(cursor, { staticPosition }) {
  const offset = toNumber2(cursor.readBytes(32));
  const start = staticPosition + offset;
  cursor.setPosition(start);
  const length = toNumber2(cursor.readBytes(32));
  if (length === 0) {
    cursor.setPosition(staticPosition + 32);
    return ["", 32];
  }
  const data = cursor.readBytes(length, 32);
  const value = toString(trimLeft(data));
  cursor.setPosition(staticPosition + 32);
  return [value, 32];
}
function prepareParameters({ checksumAddress: checksumAddress2, parameters, values }) {
  const preparedParameters = [];
  for (let i = 0;i < parameters.length; i++) {
    preparedParameters.push(prepareParameter({
      checksumAddress: checksumAddress2,
      parameter: parameters[i],
      value: values[i]
    }));
  }
  return preparedParameters;
}
function prepareParameter({ checksumAddress: checksumAddress2 = false, parameter: parameter_, value }) {
  const parameter = parameter_;
  const arrayComponents = getArrayComponents2(parameter.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray2(value, {
      checksumAddress: checksumAddress2,
      length,
      parameter: {
        ...parameter,
        type
      }
    });
  }
  if (parameter.type === "tuple") {
    return encodeTuple2(value, {
      checksumAddress: checksumAddress2,
      parameter
    });
  }
  if (parameter.type === "address") {
    return encodeAddress2(value, {
      checksum: checksumAddress2
    });
  }
  if (parameter.type === "bool") {
    return encodeBoolean(value);
  }
  if (parameter.type.startsWith("uint") || parameter.type.startsWith("int")) {
    const signed = parameter.type.startsWith("int");
    const [, , size5 = "256"] = integerRegex3.exec(parameter.type) ?? [];
    return encodeNumber2(value, {
      signed,
      size: Number(size5)
    });
  }
  if (parameter.type.startsWith("bytes")) {
    return encodeBytes2(value, { type: parameter.type });
  }
  if (parameter.type === "string") {
    return encodeString2(value);
  }
  throw new InvalidTypeError(parameter.type);
}
function encode(preparedParameters) {
  let staticSize = 0;
  for (let i = 0;i < preparedParameters.length; i++) {
    const { dynamic, encoded } = preparedParameters[i];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size3(encoded);
  }
  const staticParameters = [];
  const dynamicParameters = [];
  let dynamicSize = 0;
  for (let i = 0;i < preparedParameters.length; i++) {
    const { dynamic, encoded } = preparedParameters[i];
    if (dynamic) {
      staticParameters.push(fromNumber(staticSize + dynamicSize, { size: 32 }));
      dynamicParameters.push(encoded);
      dynamicSize += size3(encoded);
    } else {
      staticParameters.push(encoded);
    }
  }
  return concat2(...staticParameters, ...dynamicParameters);
}
function encodeAddress2(value, options) {
  const { checksum: checksum3 = false } = options;
  assert4(value, { strict: checksum3 });
  return {
    dynamic: false,
    encoded: padLeft(value.toLowerCase())
  };
}
function encodeArray2(value, options) {
  const { checksumAddress: checksumAddress2, length, parameter } = options;
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError2(value);
  if (!dynamic && value.length !== length)
    throw new ArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${parameter.type}[${length}]`
    });
  let dynamicChild = false;
  const preparedParameters = [];
  for (let i = 0;i < value.length; i++) {
    const preparedParam = prepareParameter({
      checksumAddress: checksumAddress2,
      parameter,
      value: value[i]
    });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParameters.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encode(preparedParameters);
    if (dynamic) {
      const length2 = fromNumber(preparedParameters.length, { size: 32 });
      return {
        dynamic: true,
        encoded: preparedParameters.length > 0 ? concat2(length2, data) : length2
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concat2(...preparedParameters.map(({ encoded }) => encoded))
  };
}
function encodeBytes2(value, { type }) {
  const [, parametersize] = type.split("bytes");
  const bytesSize = size3(value);
  if (!parametersize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padRight(value_, Math.ceil((value.length - 2) / 2 / 32) * 32);
    return {
      dynamic: true,
      encoded: concat2(padLeft(fromNumber(bytesSize, { size: 32 })), value_)
    };
  }
  if (bytesSize !== Number.parseInt(parametersize, 10))
    throw new BytesSizeMismatchError2({
      expectedSize: Number.parseInt(parametersize, 10),
      value
    });
  return { dynamic: false, encoded: padRight(value) };
}
function encodeBoolean(value) {
  if (typeof value !== "boolean")
    throw new BaseError3(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padLeft(fromBoolean(value)) };
}
function encodeNumber2(value, { signed, size: size5 }) {
  if (typeof size5 === "number") {
    const max = 2n ** (BigInt(size5) - (signed ? 1n : 0n)) - 1n;
    const min = signed ? -max - 1n : 0n;
    if (value > max || value < min)
      throw new IntegerOutOfRangeError2({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size5 / 8,
        value: value.toString()
      });
  }
  return {
    dynamic: false,
    encoded: fromNumber(value, {
      size: 32,
      signed
    })
  };
}
function encodeString2(value) {
  const hexValue = fromString2(value);
  const partsLength = Math.ceil(size3(hexValue) / 32);
  const parts = [];
  for (let i = 0;i < partsLength; i++) {
    parts.push(padRight(slice3(hexValue, i * 32, (i + 1) * 32)));
  }
  return {
    dynamic: true,
    encoded: concat2(padRight(fromNumber(size3(hexValue), { size: 32 })), ...parts)
  };
}
function encodeTuple2(value, options) {
  const { checksumAddress: checksumAddress2, parameter } = options;
  let dynamic = false;
  const preparedParameters = [];
  for (let i = 0;i < parameter.components.length; i++) {
    const param_ = parameter.components[i];
    const index2 = Array.isArray(value) ? i : param_.name;
    const preparedParam = prepareParameter({
      checksumAddress: checksumAddress2,
      parameter: param_,
      value: value[index2]
    });
    preparedParameters.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encode(preparedParameters) : concat2(...preparedParameters.map(({ encoded }) => encoded))
  };
}
function getArrayComponents2(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? [matches[2] ? Number(matches[2]) : null, matches[1]] : undefined;
}
function hasDynamicChild2(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild2);
  const arrayComponents = getArrayComponents2(param.type);
  if (arrayComponents && hasDynamicChild2({
    ...param,
    type: arrayComponents[1]
  }))
    return true;
  return false;
}
var sizeOfLength2 = 32, sizeOfOffset2 = 32;
var init_abiParameters = __esm(() => {
  init_AbiParameters();
  init_Address();
  init_Bytes();
  init_Errors();
  init_Hex();
  init_Solidity();
});

// node_modules/ox/_esm/core/internal/cursor.js
function create(bytes, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor2);
  cursor.bytes = bytes;
  cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  cursor.positionReadCount = new Map;
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
var staticCursor2, NegativeOffsetError2, PositionOutOfBoundsError2, RecursiveReadLimitExceededError2;
var init_cursor3 = __esm(() => {
  init_Errors();
  staticCursor2 = {
    bytes: new Uint8Array,
    dataView: new DataView(new ArrayBuffer(0)),
    position: 0,
    positionReadCount: new Map,
    recursiveReadCount: 0,
    recursiveReadLimit: Number.POSITIVE_INFINITY,
    assertReadLimit() {
      if (this.recursiveReadCount >= this.recursiveReadLimit)
        throw new RecursiveReadLimitExceededError2({
          count: this.recursiveReadCount + 1,
          limit: this.recursiveReadLimit
        });
    },
    assertPosition(position) {
      if (position < 0 || position > this.bytes.length - 1)
        throw new PositionOutOfBoundsError2({
          length: this.bytes.length,
          position
        });
    },
    decrementPosition(offset) {
      if (offset < 0)
        throw new NegativeOffsetError2({ offset });
      const position = this.position - offset;
      this.assertPosition(position);
      this.position = position;
    },
    getReadCount(position) {
      return this.positionReadCount.get(position || this.position) || 0;
    },
    incrementPosition(offset) {
      if (offset < 0)
        throw new NegativeOffsetError2({ offset });
      const position = this.position + offset;
      this.assertPosition(position);
      this.position = position;
    },
    inspectByte(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position);
      return this.bytes[position];
    },
    inspectBytes(length, position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + length - 1);
      return this.bytes.subarray(position, position + length);
    },
    inspectUint8(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position);
      return this.bytes[position];
    },
    inspectUint16(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 1);
      return this.dataView.getUint16(position);
    },
    inspectUint24(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 2);
      return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
    },
    inspectUint32(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 3);
      return this.dataView.getUint32(position);
    },
    pushByte(byte) {
      this.assertPosition(this.position);
      this.bytes[this.position] = byte;
      this.position++;
    },
    pushBytes(bytes) {
      this.assertPosition(this.position + bytes.length - 1);
      this.bytes.set(bytes, this.position);
      this.position += bytes.length;
    },
    pushUint8(value) {
      this.assertPosition(this.position);
      this.bytes[this.position] = value;
      this.position++;
    },
    pushUint16(value) {
      this.assertPosition(this.position + 1);
      this.dataView.setUint16(this.position, value);
      this.position += 2;
    },
    pushUint24(value) {
      this.assertPosition(this.position + 2);
      this.dataView.setUint16(this.position, value >> 8);
      this.dataView.setUint8(this.position + 2, value & ~4294967040);
      this.position += 3;
    },
    pushUint32(value) {
      this.assertPosition(this.position + 3);
      this.dataView.setUint32(this.position, value);
      this.position += 4;
    },
    readByte() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectByte();
      this.position++;
      return value;
    },
    readBytes(length, size5) {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectBytes(length);
      this.position += size5 ?? length;
      return value;
    },
    readUint8() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint8();
      this.position += 1;
      return value;
    },
    readUint16() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint16();
      this.position += 2;
      return value;
    },
    readUint24() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint24();
      this.position += 3;
      return value;
    },
    readUint32() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint32();
      this.position += 4;
      return value;
    },
    get remaining() {
      return this.bytes.length - this.position;
    },
    setPosition(position) {
      const oldPosition = this.position;
      this.assertPosition(position);
      this.position = position;
      return () => this.position = oldPosition;
    },
    _touch() {
      if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
        return;
      const count = this.getReadCount();
      this.positionReadCount.set(this.position, count + 1);
      if (count > 0)
        this.recursiveReadCount++;
    }
  };
  NegativeOffsetError2 = class NegativeOffsetError2 extends BaseError3 {
    constructor({ offset }) {
      super(`Offset \`${offset}\` cannot be negative.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Cursor.NegativeOffsetError"
      });
    }
  };
  PositionOutOfBoundsError2 = class PositionOutOfBoundsError2 extends BaseError3 {
    constructor({ length, position }) {
      super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Cursor.PositionOutOfBoundsError"
      });
    }
  };
  RecursiveReadLimitExceededError2 = class RecursiveReadLimitExceededError2 extends BaseError3 {
    constructor({ count, limit }) {
      super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Cursor.RecursiveReadLimitExceededError"
      });
    }
  };
});

// node_modules/ox/_esm/core/AbiParameters.js
function decode(parameters, data, options = {}) {
  const { as = "Array", checksumAddress: checksumAddress2 = false } = options;
  const bytes = typeof data === "string" ? fromHex(data) : data;
  const cursor = create(bytes);
  if (size2(bytes) === 0 && parameters.length > 0)
    throw new ZeroDataError;
  if (size2(bytes) && size2(bytes) < 32)
    throw new DataSizeTooSmallError({
      data: typeof data === "string" ? data : fromBytes(data),
      parameters,
      size: size2(bytes)
    });
  let consumed = 0;
  const values = as === "Array" ? [] : {};
  for (let i = 0;i < parameters.length; ++i) {
    const param = parameters[i];
    cursor.setPosition(consumed);
    const [data2, consumed_] = decodeParameter2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition: 0
    });
    consumed += consumed_;
    if (as === "Array")
      values.push(data2);
    else
      values[param.name ?? i] = data2;
  }
  return values;
}
function encode2(parameters, values, options) {
  const { checksumAddress: checksumAddress2 = false } = options ?? {};
  if (parameters.length !== values.length)
    throw new LengthMismatchError({
      expectedLength: parameters.length,
      givenLength: values.length
    });
  const preparedParameters = prepareParameters({
    checksumAddress: checksumAddress2,
    parameters,
    values
  });
  const data = encode(preparedParameters);
  if (data.length === 0)
    return "0x";
  return data;
}
function encodePacked(types, values) {
  if (types.length !== values.length)
    throw new LengthMismatchError({
      expectedLength: types.length,
      givenLength: values.length
    });
  const data = [];
  for (let i = 0;i < types.length; i++) {
    const type = types[i];
    const value = values[i];
    data.push(encodePacked.encode(type, value));
  }
  return concat2(...data);
}
function from5(parameters) {
  if (Array.isArray(parameters) && typeof parameters[0] === "string")
    return parseAbiParameters(parameters);
  if (typeof parameters === "string")
    return parseAbiParameters(parameters);
  return parameters;
}
var DataSizeTooSmallError, ZeroDataError, ArrayLengthMismatchError, BytesSizeMismatchError2, LengthMismatchError, InvalidArrayError2, InvalidTypeError;
var init_AbiParameters = __esm(() => {
  init_exports();
  init_Address();
  init_Bytes();
  init_Errors();
  init_Hex();
  init_abiParameters();
  init_cursor3();
  init_Solidity();
  (function(encodePacked2) {
    function encode3(type, value, isArray = false) {
      if (type === "address") {
        const address = value;
        assert4(address);
        return padLeft(address.toLowerCase(), isArray ? 32 : 0);
      }
      if (type === "string")
        return fromString2(value);
      if (type === "bytes")
        return value;
      if (type === "bool")
        return padLeft(fromBoolean(value), isArray ? 32 : 1);
      const intMatch = type.match(integerRegex3);
      if (intMatch) {
        const [_type, baseType, bits = "256"] = intMatch;
        const size5 = Number.parseInt(bits, 10) / 8;
        return fromNumber(value, {
          size: isArray ? 32 : size5,
          signed: baseType === "int"
        });
      }
      const bytesMatch = type.match(bytesRegex3);
      if (bytesMatch) {
        const [_type, size5] = bytesMatch;
        if (Number.parseInt(size5, 10) !== (value.length - 2) / 2)
          throw new BytesSizeMismatchError2({
            expectedSize: Number.parseInt(size5, 10),
            value
          });
        return padRight(value, isArray ? 32 : 0);
      }
      const arrayMatch = type.match(arrayRegex);
      if (arrayMatch && Array.isArray(value)) {
        const [_type, childType] = arrayMatch;
        const data = [];
        for (let i = 0;i < value.length; i++) {
          data.push(encode3(childType, value[i], true));
        }
        if (data.length === 0)
          return "0x";
        return concat2(...data);
      }
      throw new InvalidTypeError(type);
    }
    encodePacked2.encode = encode3;
  })(encodePacked || (encodePacked = {}));
  DataSizeTooSmallError = class DataSizeTooSmallError extends BaseError3 {
    constructor({ data, parameters, size: size5 }) {
      super(`Data size of ${size5} bytes is too small for given parameters.`, {
        metaMessages: [
          `Params: (${formatAbiParameters(parameters)})`,
          `Data:   ${data} (${size5} bytes)`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiParameters.DataSizeTooSmallError"
      });
    }
  };
  ZeroDataError = class ZeroDataError extends BaseError3 {
    constructor() {
      super('Cannot decode zero data ("0x") with ABI parameters.');
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiParameters.ZeroDataError"
      });
    }
  };
  ArrayLengthMismatchError = class ArrayLengthMismatchError extends BaseError3 {
    constructor({ expectedLength, givenLength, type }) {
      super(`Array length mismatch for type \`${type}\`. Expected: \`${expectedLength}\`. Given: \`${givenLength}\`.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiParameters.ArrayLengthMismatchError"
      });
    }
  };
  BytesSizeMismatchError2 = class BytesSizeMismatchError2 extends BaseError3 {
    constructor({ expectedSize, value }) {
      super(`Size of bytes "${value}" (bytes${size3(value)}) does not match expected size (bytes${expectedSize}).`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiParameters.BytesSizeMismatchError"
      });
    }
  };
  LengthMismatchError = class LengthMismatchError extends BaseError3 {
    constructor({ expectedLength, givenLength }) {
      super([
        "ABI encoding parameters/values length mismatch.",
        `Expected length (parameters): ${expectedLength}`,
        `Given length (values): ${givenLength}`
      ].join(`
`));
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiParameters.LengthMismatchError"
      });
    }
  };
  InvalidArrayError2 = class InvalidArrayError2 extends BaseError3 {
    constructor(value) {
      super(`Value \`${value}\` is not a valid array.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiParameters.InvalidArrayError"
      });
    }
  };
  InvalidTypeError = class InvalidTypeError extends BaseError3 {
    constructor(type) {
      super(`Type \`${type}\` is not a valid ABI Type.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiParameters.InvalidTypeError"
      });
    }
  };
});

// node_modules/ox/_esm/core/Rlp.js
function from6(value, options) {
  const { as } = options;
  const encodable = getEncodable2(value);
  const cursor = create(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (as === "Hex")
    return fromBytes(cursor.bytes);
  return cursor.bytes;
}
function fromHex3(hex, options = {}) {
  const { as = "Hex" } = options;
  return from6(hex, { as });
}
function getEncodable2(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList2(bytes.map((x) => getEncodable2(x)));
  return getEncodableBytes2(bytes);
}
function getEncodableList2(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength2(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode: encode3 } of list) {
        encode3(cursor);
      }
    }
  };
}
function getEncodableBytes2(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? fromHex(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength2(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
function getSizeOfLength2(length) {
  if (length < 2 ** 8)
    return 1;
  if (length < 2 ** 16)
    return 2;
  if (length < 2 ** 24)
    return 3;
  if (length < 2 ** 32)
    return 4;
  throw new BaseError3("Length is too large.");
}
var init_Rlp = __esm(() => {
  init_Bytes();
  init_Errors();
  init_Hex();
  init_cursor3();
});

// node_modules/ox/node_modules/@noble/hashes/esm/hmac.js
var HMAC2, hmac2 = (hash2, key, message) => new HMAC2(hash2, key).update(message).digest();
var init_hmac2 = __esm(() => {
  init_utils6();
  HMAC2 = class HMAC2 extends Hash2 {
    constructor(hash2, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      ahash2(hash2);
      const key = toBytes3(_key);
      this.iHash = hash2.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad4 = new Uint8Array(blockLen);
      pad4.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
      for (let i = 0;i < pad4.length; i++)
        pad4[i] ^= 54;
      this.iHash.update(pad4);
      this.oHash = hash2.create();
      for (let i = 0;i < pad4.length; i++)
        pad4[i] ^= 54 ^ 92;
      this.oHash.update(pad4);
      clean2(pad4);
    }
    update(buf) {
      aexists2(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists2(this);
      abytes4(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  };
  hmac2.create = (hash2, key) => new HMAC2(hash2, key);
});

// node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js
function mod2(a, b) {
  const result = a % b;
  return result >= _0n9 ? result : b + result;
}
function pow22(x, power, modulo) {
  let res = x;
  while (power-- > _0n9) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert2(number, modulo) {
  if (number === _0n9)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n9)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod2(number, modulo);
  let b = modulo;
  let x = _0n9, y = _1n9, u = _1n9, v = _0n9;
  while (a !== _0n9) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n9)
    throw new Error("invert: does not exist");
  return mod2(x, modulo);
}
function sqrt3mod42(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n9) / _4n3;
  const root = Fp.pow(n, p1div4);
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function sqrt5mod82(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n2) / _8n2;
  const n2 = Fp.mul(n, _2n6);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i = Fp.mul(Fp.mul(nv, _2n6), v);
  const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function tonelliShanks2(P) {
  if (P < BigInt(3))
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n9;
  let S = 0;
  while (Q % _2n6 === _0n9) {
    Q /= _2n6;
    S++;
  }
  let Z = _2n6;
  const _Fp = Field2(P);
  while (FpLegendre2(_Fp, Z) === 1) {
    if (Z++ > 1000)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod42;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n9) / _2n6;
  return function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre2(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i++;
        t_tmp = Fp.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n9 << BigInt(M - i - 1);
      const b = Fp.pow(c, exponent);
      M = i;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  };
}
function FpSqrt2(P) {
  if (P % _4n3 === _3n3)
    return sqrt3mod42;
  if (P % _8n2 === _5n2)
    return sqrt5mod82;
  return tonelliShanks2(P);
}
function validateField2(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS2.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject2(field, opts);
}
function FpPow2(Fp, num2, power) {
  if (power < _0n9)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n9)
    return Fp.ONE;
  if (power === _1n9)
    return num2;
  let p = Fp.ONE;
  let d = num2;
  while (power > _0n9) {
    if (power & _1n9)
      p = Fp.mul(p, d);
    d = Fp.sqr(d);
    power >>= _1n9;
  }
  return p;
}
function FpInvertBatch2(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : undefined);
  const multipliedAcc = nums.reduce((acc, num2, i) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i] = acc;
    return Fp.mul(acc, num2);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num2, i) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i] = Fp.mul(acc, inverted[i]);
    return Fp.mul(acc, num2);
  }, invertedAcc);
  return inverted;
}
function FpLegendre2(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n9) / _2n6;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength2(n, nBitLength) {
  if (nBitLength !== undefined)
    anumber2(nBitLength);
  const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field2(ORDER, bitLen3, isLE3 = false, redef = {}) {
  if (ORDER <= _0n9)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength2(ORDER, bitLen3);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE3,
    BITS,
    BYTES,
    MASK: bitMask2(BITS),
    ZERO: _0n9,
    ONE: _1n9,
    create: (num2) => mod2(num2, ORDER),
    isValid: (num2) => {
      if (typeof num2 !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num2);
      return _0n9 <= num2 && num2 < ORDER;
    },
    is0: (num2) => num2 === _0n9,
    isOdd: (num2) => (num2 & _1n9) === _1n9,
    neg: (num2) => mod2(-num2, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num2) => mod2(num2 * num2, ORDER),
    add: (lhs, rhs) => mod2(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod2(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod2(lhs * rhs, ORDER),
    pow: (num2, power) => FpPow2(f, num2, power),
    div: (lhs, rhs) => mod2(lhs * invert2(rhs, ORDER), ORDER),
    sqrN: (num2) => num2 * num2,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num2) => invert2(num2, ORDER),
    sqrt: redef.sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt2(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: (num2) => isLE3 ? numberToBytesLE2(num2, BYTES) : numberToBytesBE2(num2, BYTES),
    fromBytes: (bytes) => {
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      return isLE3 ? bytesToNumberLE2(bytes) : bytesToNumberBE2(bytes);
    },
    invertBatch: (lst) => FpInvertBatch2(f, lst),
    cmov: (a, b, c) => c ? b : a
  });
  return Object.freeze(f);
}
function getFieldBytesLength2(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength2(fieldOrder) {
  const length = getFieldBytesLength2(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField2(key, fieldOrder, isLE3 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength2(fieldOrder);
  const minLen = getMinHashLength2(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num2 = isLE3 ? bytesToNumberLE2(key) : bytesToNumberBE2(key);
  const reduced = mod2(num2, fieldOrder - _1n9) + _1n9;
  return isLE3 ? numberToBytesLE2(reduced, fieldLen) : numberToBytesBE2(reduced, fieldLen);
}
var _0n9, _1n9, _2n6, _3n3, _4n3, _5n2, _8n2, FIELD_FIELDS2;
var init_modular2 = __esm(() => {
  init_utils6();
  init_utils4();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n9 = BigInt(0);
  _1n9 = BigInt(1);
  _2n6 = /* @__PURE__ */ BigInt(2);
  _3n3 = /* @__PURE__ */ BigInt(3);
  _4n3 = /* @__PURE__ */ BigInt(4);
  _5n2 = /* @__PURE__ */ BigInt(5);
  _8n2 = /* @__PURE__ */ BigInt(8);
  FIELD_FIELDS2 = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
});

// node_modules/ox/node_modules/@noble/curves/esm/abstract/curve.js
function constTimeNegate2(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function validateW2(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts2(W, scalarBits) {
  validateW2(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask2(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets2(n, window, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n10;
  }
  const offsetStart = window * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints2(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars2(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
function getW2(P) {
  return pointWindowSizes2.get(P) || 1;
}
function wNAF2(c, bits) {
  return {
    constTimeNegate: constTimeNegate2,
    hasPrecomputes(elm) {
      return getW2(elm) !== 1;
    },
    unsafeLadder(elm, n, p = c.ZERO) {
      let d = elm;
      while (n > _0n10) {
        if (n & _1n10)
          p = p.add(d);
        d = d.double();
        n >>= _1n10;
      }
      return p;
    },
    precomputeWindow(elm, W) {
      const { windows, windowSize } = calcWOpts2(W, bits);
      const points = [];
      let p = elm;
      let base = p;
      for (let window = 0;window < windows; window++) {
        base = p;
        points.push(base);
        for (let i = 1;i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    },
    wNAF(W, precomputes, n) {
      let p = c.ZERO;
      let f = c.BASE;
      const wo = calcWOpts2(W, bits);
      for (let window = 0;window < wo.windows; window++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets2(n, window, wo);
        n = nextN;
        if (isZero) {
          f = f.add(constTimeNegate2(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(constTimeNegate2(isNeg, precomputes[offset]));
        }
      }
      return { p, f };
    },
    wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
      const wo = calcWOpts2(W, bits);
      for (let window = 0;window < wo.windows; window++) {
        if (n === _0n10)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets2(n, window, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      return acc;
    },
    getPrecomputes(W, P, transform) {
      let comp = pointPrecomputes2.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W);
        if (W !== 1)
          pointPrecomputes2.set(P, transform(comp));
      }
      return comp;
    },
    wNAFCached(P, n, transform) {
      const W = getW2(P);
      return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
    },
    wNAFCachedUnsafe(P, n, transform, prev) {
      const W = getW2(P);
      if (W === 1)
        return this.unsafeLadder(P, n, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
    },
    setWindowSize(P, W) {
      validateW2(W, bits);
      pointWindowSizes2.set(P, W);
      pointPrecomputes2.delete(P);
    }
  };
}
function pippenger2(c, fieldN, points, scalars) {
  validateMSMPoints2(points, c);
  validateMSMScalars2(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen2(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask2(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits;i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0;j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero;j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0;j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function validateBasic2(curve) {
  validateField2(curve.Fp);
  validateObject2(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength2(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}
var _0n10, _1n10, pointPrecomputes2, pointWindowSizes2;
var init_curve2 = __esm(() => {
  init_modular2();
  init_utils4();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n10 = BigInt(0);
  _1n10 = BigInt(1);
  pointPrecomputes2 = new WeakMap;
  pointWindowSizes2 = new WeakMap;
});

// node_modules/ox/node_modules/@noble/curves/esm/abstract/weierstrass.js
function validateSigVerOpts2(opts) {
  if (opts.lowS !== undefined)
    abool2("lowS", opts.lowS);
  if (opts.prehash !== undefined)
    abool2("prehash", opts.prehash);
}
function validatePointOpts2(curve) {
  const opts = validateBasic2(curve);
  validateObject2(opts, {
    a: "field",
    b: "field"
  }, {
    allowInfinityPoint: "boolean",
    allowedPrivateKeyLengths: "array",
    clearCofactor: "function",
    fromBytes: "function",
    isTorsionFree: "function",
    toBytes: "function",
    wrapPrivateKey: "boolean"
  });
  const { endo, Fp, a } = opts;
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error("invalid endo: CURVE.a must be 0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
    }
  }
  return Object.freeze({ ...opts });
}
function numToSizedHex2(num2, size5) {
  return bytesToHex3(numberToBytesBE2(num2, size5));
}
function weierstrassPoints2(opts) {
  const CURVE = validatePointOpts2(opts);
  const { Fp } = CURVE;
  const Fn = Field2(CURVE.n, CURVE.nBitLength);
  const toBytes4 = CURVE.toBytes || ((_c, point, _isCompressed) => {
    const a = point.toAffine();
    return concatBytes4(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
  });
  const fromBytes3 = CURVE.fromBytes || ((bytes) => {
    const tail = bytes.subarray(1);
    const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
    const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
    return { x, y };
  });
  function weierstrassEquation(x) {
    const { a, b } = CURVE;
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n4), _4n4);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function isWithinCurveOrder(num2) {
    return inRange2(num2, _1n11, CURVE.n);
  }
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (isBytes3(key))
        key = bytesToHex3(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("invalid private key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num2;
    try {
      num2 = typeof key === "bigint" ? key : bytesToNumberBE2(ensureBytes2("private key", key, nByteLength));
    } catch (error) {
      throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
    }
    if (wrapPrivateKey)
      num2 = mod2(num2, N);
    aInRange2("private key", num2, _1n11, N);
    return num2;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("ProjectivePoint expected");
  }
  const toAffineMemo = memoized2((p, iz) => {
    const { px: x, py: y, pz: z } = p;
    if (Fp.eql(z, Fp.ONE))
      return { x, y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(z);
    const ax = Fp.mul(x, iz);
    const ay = Fp.mul(y, iz);
    const zz = Fp.mul(z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x: ax, y: ay };
  });
  const assertValidMemo = memoized2((p) => {
    if (p.is0()) {
      if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not FE");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });

  class Point2 {
    constructor(px, py, pz) {
      if (px == null || !Fp.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp.isValid(py) || Fp.is0(py))
        throw new Error("y required");
      if (pz == null || !Fp.isValid(pz))
        throw new Error("z required");
      this.px = px;
      this.py = py;
      this.pz = pz;
      Object.freeze(this);
    }
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point2)
        throw new Error("projective point not allowed");
      const is0 = (i) => Fp.eql(i, Fp.ZERO);
      if (is0(x) && is0(y))
        return Point2.ZERO;
      return new Point2(x, y, Fp.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static normalizeZ(points) {
      const toInv = FpInvertBatch2(Fp, points.map((p) => p.pz));
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point2.fromAffine);
    }
    static fromHex(hex) {
      const P = Point2.fromAffine(fromBytes3(ensureBytes2("pointHex", hex)));
      P.assertValidity();
      return P;
    }
    static fromPrivateKey(privateKey) {
      return Point2.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    static msm(points, scalars) {
      return pippenger2(Point2, Fn, points, scalars);
    }
    _setWindowSize(windowSize) {
      wnaf.setWindowSize(this, windowSize);
    }
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (Fp.isOdd)
        return !Fp.isOdd(y);
      throw new Error("Field doesn't support isOdd");
    }
    equals(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    negate() {
      return new Point2(this.px, Fp.neg(this.py), this.pz);
    }
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n4);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point2(X3, Y3, Z3);
    }
    add(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n4);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point2(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point2.ZERO);
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, n, Point2.normalizeZ);
    }
    multiplyUnsafe(sc) {
      const { endo: endo2, n: N } = CURVE;
      aInRange2("scalar", sc, _0n11, N);
      const I = Point2.ZERO;
      if (sc === _0n11)
        return I;
      if (this.is0() || sc === _1n11)
        return this;
      if (!endo2 || wnaf.hasPrecomputes(this))
        return wnaf.wNAFCachedUnsafe(this, sc, Point2.normalizeZ);
      let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(sc);
      let k1p = I;
      let k2p = I;
      let d = this;
      while (k1 > _0n11 || k2 > _0n11) {
        if (k1 & _1n11)
          k1p = k1p.add(d);
        if (k2 & _1n11)
          k2p = k2p.add(d);
        d = d.double();
        k1 >>= _1n11;
        k2 >>= _1n11;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    multiply(scalar) {
      const { endo: endo2, n: N } = CURVE;
      aInRange2("scalar", scalar, _1n11, N);
      let point, fake;
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(scalar);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k2);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p, f } = this.wNAF(scalar);
        point = p;
        fake = f;
      }
      return Point2.normalizeZ([point, fake])[0];
    }
    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point2.BASE;
      const mul = (P, a2) => a2 === _0n11 || a2 === _1n11 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
      const sum = mul(this, a).add(mul(Q, b));
      return sum.is0() ? undefined : sum;
    }
    toAffine(iz) {
      return toAffineMemo(this, iz);
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n11)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point2, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n11)
        return this;
      if (clearCofactor)
        return clearCofactor(Point2, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      abool2("isCompressed", isCompressed);
      this.assertValidity();
      return toBytes4(Point2, this, isCompressed);
    }
    toHex(isCompressed = true) {
      abool2("isCompressed", isCompressed);
      return bytesToHex3(this.toRawBytes(isCompressed));
    }
  }
  Point2.BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point2.ZERO = new Point2(Fp.ZERO, Fp.ONE, Fp.ZERO);
  const { endo, nBitLength } = CURVE;
  const wnaf = wNAF2(Point2, endo ? Math.ceil(nBitLength / 2) : nBitLength);
  return {
    CURVE,
    ProjectivePoint: Point2,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
function validateOpts2(curve) {
  const opts = validateBasic2(curve);
  validateObject2(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
function weierstrass2(curveDef) {
  const CURVE = validateOpts2(curveDef);
  const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
  const compressedLen = Fp.BYTES + 1;
  const uncompressedLen = 2 * Fp.BYTES + 1;
  function modN2(a) {
    return mod2(a, CURVE_ORDER);
  }
  function invN(a) {
    return invert2(a, CURVE_ORDER);
  }
  const { ProjectivePoint: Point2, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints2({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine();
      const x = Fp.toBytes(a.x);
      const cat = concatBytes4;
      abool2("isCompressed", isCompressed);
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
      } else {
        return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
      }
    },
    fromBytes(bytes) {
      const len = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x = bytesToNumberBE2(tail);
        if (!inRange2(x, _1n11, Fp.ORDER))
          throw new Error("Point is not on curve");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("Point is not on curve" + suffix);
        }
        const isYOdd = (y & _1n11) === _1n11;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (len === uncompressedLen && head === 4) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
        return { x, y };
      } else {
        const cl = compressedLen;
        const ul = uncompressedLen;
        throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
      }
    }
  });
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n11;
    return number > HALF;
  }
  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN2(-s) : s;
  }
  const slcNum = (b, from7, to) => bytesToNumberBE2(b.slice(from7, to));

  class Signature {
    constructor(r, s, recovery) {
      aInRange2("r", r, _1n11, CURVE_ORDER);
      aInRange2("s", s, _1n11, CURVE_ORDER);
      this.r = r;
      this.s = s;
      if (recovery != null)
        this.recovery = recovery;
      Object.freeze(this);
    }
    static fromCompact(hex) {
      const l = nByteLength;
      hex = ensureBytes2("compactSignature", hex, l * 2);
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
    }
    static fromDER(hex) {
      const { r, s } = DER2.toSig(ensureBytes2("DER", hex));
      return new Signature(r, s);
    }
    assertValidity() {}
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r, s, recovery: rec } = this;
      const h = bits2int_modN(ensureBytes2("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
      if (radj >= Fp.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R = Point2.fromHex(prefix + numToSizedHex2(radj, Fp.BYTES));
      const ir = invN(radj);
      const u1 = modN2(-h * ir);
      const u2 = modN2(s * ir);
      const Q = Point2.BASE.multiplyAndAddUnsafe(R, u1, u2);
      if (!Q)
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN2(-this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return hexToBytes3(this.toDERHex());
    }
    toDERHex() {
      return DER2.hexFromSig(this);
    }
    toCompactRawBytes() {
      return hexToBytes3(this.toCompactHex());
    }
    toCompactHex() {
      const l = nByteLength;
      return numToSizedHex2(this.r, l) + numToSizedHex2(this.s, l);
    }
  }
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    randomPrivateKey: () => {
      const length = getMinHashLength2(CURVE.n);
      return mapHashToField2(CURVE.randomBytes(length), CURVE.n);
    },
    precompute(windowSize = 8, point = Point2.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point2.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  function isProbPub(item) {
    if (typeof item === "bigint")
      return false;
    if (item instanceof Point2)
      return true;
    const arr = ensureBytes2("key", item);
    const len = arr.length;
    const fpl = Fp.BYTES;
    const compLen = fpl + 1;
    const uncompLen = 2 * fpl + 1;
    if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) {
      return;
    } else {
      return len === compLen || len === uncompLen;
    }
  }
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicB) === false)
      throw new Error("second arg must be public key");
    const b = Point2.fromHex(publicB);
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  const bits2int = CURVE.bits2int || function(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num2 = bytesToNumberBE2(bytes);
    const delta = bytes.length * 8 - nBitLength;
    return delta > 0 ? num2 >> BigInt(delta) : num2;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
    return modN2(bits2int(bytes));
  };
  const ORDER_MASK = bitMask2(nBitLength);
  function int2octets(num2) {
    aInRange2("num < 2^" + nBitLength, num2, _0n11, ORDER_MASK);
    return numberToBytesBE2(num2, nByteLength);
  }
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k) => (k in opts)))
      throw new Error("sign() legacy options not supported");
    const { hash: hash2, randomBytes: randomBytes3 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes2("msgHash", msgHash);
    validateSigVerOpts2(opts);
    if (prehash)
      msgHash = ensureBytes2("prehashed msgHash", hash2(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (ent != null && ent !== false) {
      const e = ent === true ? randomBytes3(Fp.BYTES) : ent;
      seedArgs.push(ensureBytes2("extraEntropy", e));
    }
    const seed = concatBytes4(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!isWithinCurveOrder(k))
        return;
      const ik = invN(k);
      const q = Point2.BASE.multiply(k).toAffine();
      const r = modN2(q.x);
      if (r === _0n11)
        return;
      const s = modN2(ik * modN2(m + r * d));
      if (s === _0n11)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n11);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    return { seed, k2sig };
  }
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C = CURVE;
    const drbg = createHmacDrbg2(C.hash.outputLen, C.nByteLength, C.hmac);
    return drbg(seed, k2sig);
  }
  Point2.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes2("msgHash", msgHash);
    publicKey = ensureBytes2("publicKey", publicKey);
    const { lowS, prehash, format } = opts;
    validateSigVerOpts2(opts);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    if (format !== undefined && format !== "compact" && format !== "der")
      throw new Error("format must be compact or der");
    const isHex2 = typeof sg === "string" || isBytes3(sg);
    const isObj = !isHex2 && !format && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex2 && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let _sig = undefined;
    let P;
    try {
      if (isObj)
        _sig = new Signature(sg.r, sg.s);
      if (isHex2) {
        try {
          if (format !== "compact")
            _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER2.Err))
            throw derError;
        }
        if (!_sig && format !== "der")
          _sig = Signature.fromCompact(sg);
      }
      P = Point2.fromHex(publicKey);
    } catch (error) {
      return false;
    }
    if (!_sig)
      return false;
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r, s } = _sig;
    const h = bits2int_modN(msgHash);
    const is = invN(s);
    const u1 = modN2(h * is);
    const u2 = modN2(r * is);
    const R = Point2.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
    if (!R)
      return false;
    const v = modN2(R.x);
    return v === r;
  }
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign,
    verify,
    ProjectivePoint: Point2,
    Signature,
    utils
  };
}
var DERErr2, DER2, _0n11, _1n11, _2n7, _3n4, _4n4;
var init_weierstrass2 = __esm(() => {
  init_curve2();
  init_modular2();
  init_utils4();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  DERErr2 = class DERErr2 extends Error {
    constructor(m = "") {
      super(m);
    }
  };
  DER2 = {
    Err: DERErr2,
    _tlv: {
      encode: (tag, data) => {
        const { Err: E } = DER2;
        if (tag < 0 || tag > 256)
          throw new E("tlv.encode: wrong tag");
        if (data.length & 1)
          throw new E("tlv.encode: unpadded data");
        const dataLen = data.length / 2;
        const len = numberToHexUnpadded2(dataLen);
        if (len.length / 2 & 128)
          throw new E("tlv.encode: long form length too big");
        const lenLen = dataLen > 127 ? numberToHexUnpadded2(len.length / 2 | 128) : "";
        const t = numberToHexUnpadded2(tag);
        return t + lenLen + len + data;
      },
      decode(tag, data) {
        const { Err: E } = DER2;
        let pos = 0;
        if (tag < 0 || tag > 256)
          throw new E("tlv.encode: wrong tag");
        if (data.length < 2 || data[pos++] !== tag)
          throw new E("tlv.decode: wrong tlv");
        const first = data[pos++];
        const isLong = !!(first & 128);
        let length = 0;
        if (!isLong)
          length = first;
        else {
          const lenLen = first & 127;
          if (!lenLen)
            throw new E("tlv.decode(long): indefinite length not supported");
          if (lenLen > 4)
            throw new E("tlv.decode(long): byte length is too big");
          const lengthBytes = data.subarray(pos, pos + lenLen);
          if (lengthBytes.length !== lenLen)
            throw new E("tlv.decode: length bytes not complete");
          if (lengthBytes[0] === 0)
            throw new E("tlv.decode(long): zero leftmost byte");
          for (const b of lengthBytes)
            length = length << 8 | b;
          pos += lenLen;
          if (length < 128)
            throw new E("tlv.decode(long): not minimal encoding");
        }
        const v = data.subarray(pos, pos + length);
        if (v.length !== length)
          throw new E("tlv.decode: wrong value length");
        return { v, l: data.subarray(pos + length) };
      }
    },
    _int: {
      encode(num2) {
        const { Err: E } = DER2;
        if (num2 < _0n11)
          throw new E("integer: negative integers are not allowed");
        let hex = numberToHexUnpadded2(num2);
        if (Number.parseInt(hex[0], 16) & 8)
          hex = "00" + hex;
        if (hex.length & 1)
          throw new E("unexpected DER parsing assertion: unpadded hex");
        return hex;
      },
      decode(data) {
        const { Err: E } = DER2;
        if (data[0] & 128)
          throw new E("invalid signature integer: negative");
        if (data[0] === 0 && !(data[1] & 128))
          throw new E("invalid signature integer: unnecessary leading zero");
        return bytesToNumberBE2(data);
      }
    },
    toSig(hex) {
      const { Err: E, _int: int, _tlv: tlv } = DER2;
      const data = ensureBytes2("signature", hex);
      const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
      if (seqLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
      const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
      if (sLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      return { r: int.decode(rBytes), s: int.decode(sBytes) };
    },
    hexFromSig(sig) {
      const { _tlv: tlv, _int: int } = DER2;
      const rs = tlv.encode(2, int.encode(sig.r));
      const ss = tlv.encode(2, int.encode(sig.s));
      const seq = rs + ss;
      return tlv.encode(48, seq);
    }
  };
  _0n11 = BigInt(0);
  _1n11 = BigInt(1);
  _2n7 = BigInt(2);
  _3n4 = BigInt(3);
  _4n4 = BigInt(4);
});

// node_modules/ox/node_modules/@noble/curves/esm/_shortw_utils.js
function getHash2(hash2) {
  return {
    hash: hash2,
    hmac: (key, ...msgs) => hmac2(hash2, key, concatBytes5(...msgs)),
    randomBytes: randomBytes2
  };
}
function createCurve2(curveDef, defHash) {
  const create2 = (hash2) => weierstrass2({ ...curveDef, ...getHash2(hash2) });
  return { ...create2(defHash), create: create2 };
}
var init__shortw_utils2 = __esm(() => {
  init_hmac2();
  init_utils6();
  init_weierstrass2();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
});

// node_modules/ox/node_modules/@noble/curves/esm/secp256k1.js
function sqrtMod2(y) {
  const P = secp256k1P2;
  const _3n5 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow22(b3, _3n5, P) * b3 % P;
  const b9 = pow22(b6, _3n5, P) * b3 % P;
  const b11 = pow22(b9, _2n8, P) * b2 % P;
  const b22 = pow22(b11, _11n, P) * b11 % P;
  const b44 = pow22(b22, _22n, P) * b22 % P;
  const b88 = pow22(b44, _44n, P) * b44 % P;
  const b176 = pow22(b88, _88n, P) * b88 % P;
  const b220 = pow22(b176, _44n, P) * b44 % P;
  const b223 = pow22(b220, _3n5, P) * b3 % P;
  const t1 = pow22(b223, _23n, P) * b22 % P;
  const t2 = pow22(t1, _6n, P) * b2 % P;
  const root = pow22(t2, _2n8, P);
  if (!Fpk12.eql(Fpk12.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var secp256k1P2, secp256k1N2, _0n12, _1n12, _2n8, divNearest2 = (a, b) => (a + b / _2n8) / b, Fpk12, secp256k12;
var init_secp256k12 = __esm(() => {
  init_sha22();
  init__shortw_utils2();
  init_modular2();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  secp256k1P2 = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
  secp256k1N2 = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
  _0n12 = BigInt(0);
  _1n12 = BigInt(1);
  _2n8 = BigInt(2);
  Fpk12 = Field2(secp256k1P2, undefined, undefined, { sqrt: sqrtMod2 });
  secp256k12 = createCurve2({
    a: _0n12,
    b: BigInt(7),
    Fp: Fpk12,
    n: secp256k1N2,
    Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
    Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
    h: BigInt(1),
    lowS: true,
    endo: {
      beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
      splitScalar: (k) => {
        const n = secp256k1N2;
        const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
        const b1 = -_1n12 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
        const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
        const b2 = a1;
        const POW_2_128 = BigInt("0x100000000000000000000000000000000");
        const c1 = divNearest2(b2 * k, n);
        const c2 = divNearest2(-b1 * k, n);
        let k1 = mod2(k - c1 * a1 - c2 * a2, n);
        let k2 = mod2(-c1 * b1 - c2 * b2, n);
        const k1neg = k1 > POW_2_128;
        const k2neg = k2 > POW_2_128;
        if (k1neg)
          k1 = n - k1;
        if (k2neg)
          k2 = n - k2;
        if (k1 > POW_2_128 || k2 > POW_2_128) {
          throw new Error("splitScalar: Endomorphism failed, k=" + k);
        }
        return { k1neg, k1, k2neg, k2 };
      }
    }
  }, sha2564);
});

// node_modules/ox/_esm/core/Signature.js
function assert5(signature, options = {}) {
  const { recovered } = options;
  if (typeof signature.r === "undefined")
    throw new MissingPropertiesError({ signature });
  if (typeof signature.s === "undefined")
    throw new MissingPropertiesError({ signature });
  if (recovered && typeof signature.yParity === "undefined")
    throw new MissingPropertiesError({ signature });
  if (signature.r < 0n || signature.r > maxUint2562)
    throw new InvalidRError({ value: signature.r });
  if (signature.s < 0n || signature.s > maxUint2562)
    throw new InvalidSError({ value: signature.s });
  if (typeof signature.yParity === "number" && signature.yParity !== 0 && signature.yParity !== 1)
    throw new InvalidYParityError({ value: signature.yParity });
}
function fromBytes3(signature) {
  return fromHex4(fromBytes(signature));
}
function fromHex4(signature) {
  if (signature.length !== 130 && signature.length !== 132)
    throw new InvalidSerializedSizeError2({ signature });
  const r = BigInt(slice3(signature, 0, 32));
  const s = BigInt(slice3(signature, 32, 64));
  const yParity = (() => {
    const yParity2 = Number(`0x${signature.slice(130)}`);
    if (Number.isNaN(yParity2))
      return;
    try {
      return vToYParity(yParity2);
    } catch {
      throw new InvalidYParityError({ value: yParity2 });
    }
  })();
  if (typeof yParity === "undefined")
    return {
      r,
      s
    };
  return {
    r,
    s,
    yParity
  };
}
function extract2(value) {
  if (typeof value.r === "undefined")
    return;
  if (typeof value.s === "undefined")
    return;
  return from7(value);
}
function from7(signature) {
  const signature_ = (() => {
    if (typeof signature === "string")
      return fromHex4(signature);
    if (signature instanceof Uint8Array)
      return fromBytes3(signature);
    if (typeof signature.r === "string")
      return fromRpc2(signature);
    if (signature.v)
      return fromLegacy(signature);
    return {
      r: signature.r,
      s: signature.s,
      ...typeof signature.yParity !== "undefined" ? { yParity: signature.yParity } : {}
    };
  })();
  assert5(signature_);
  return signature_;
}
function fromLegacy(signature) {
  return {
    r: signature.r,
    s: signature.s,
    yParity: vToYParity(signature.v)
  };
}
function fromRpc2(signature) {
  const yParity = (() => {
    const v = signature.v ? Number(signature.v) : undefined;
    let yParity2 = signature.yParity ? Number(signature.yParity) : undefined;
    if (typeof v === "number" && typeof yParity2 !== "number")
      yParity2 = vToYParity(v);
    if (typeof yParity2 !== "number")
      throw new InvalidYParityError({ value: signature.yParity });
    return yParity2;
  })();
  return {
    r: BigInt(signature.r),
    s: BigInt(signature.s),
    yParity
  };
}
function toTuple(signature) {
  const { r, s, yParity } = signature;
  return [
    yParity ? "0x01" : "0x",
    r === 0n ? "0x" : trimLeft2(fromNumber(r)),
    s === 0n ? "0x" : trimLeft2(fromNumber(s))
  ];
}
function vToYParity(v) {
  if (v === 0 || v === 27)
    return 0;
  if (v === 1 || v === 28)
    return 1;
  if (v >= 35)
    return v % 2 === 0 ? 1 : 0;
  throw new InvalidVError({ value: v });
}
var InvalidSerializedSizeError2, MissingPropertiesError, InvalidRError, InvalidSError, InvalidYParityError, InvalidVError;
var init_Signature = __esm(() => {
  init_Errors();
  init_Hex();
  init_Solidity();
  InvalidSerializedSizeError2 = class InvalidSerializedSizeError2 extends BaseError3 {
    constructor({ signature }) {
      super(`Value \`${signature}\` is an invalid signature size.`, {
        metaMessages: [
          "Expected: 64 bytes or 65 bytes.",
          `Received ${size3(from2(signature))} bytes.`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Signature.InvalidSerializedSizeError"
      });
    }
  };
  MissingPropertiesError = class MissingPropertiesError extends BaseError3 {
    constructor({ signature }) {
      super(`Signature \`${stringify2(signature)}\` is missing either an \`r\`, \`s\`, or \`yParity\` property.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Signature.MissingPropertiesError"
      });
    }
  };
  InvalidRError = class InvalidRError extends BaseError3 {
    constructor({ value }) {
      super(`Value \`${value}\` is an invalid r value. r must be a positive integer less than 2^256.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Signature.InvalidRError"
      });
    }
  };
  InvalidSError = class InvalidSError extends BaseError3 {
    constructor({ value }) {
      super(`Value \`${value}\` is an invalid s value. s must be a positive integer less than 2^256.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Signature.InvalidSError"
      });
    }
  };
  InvalidYParityError = class InvalidYParityError extends BaseError3 {
    constructor({ value }) {
      super(`Value \`${value}\` is an invalid y-parity value. Y-parity must be 0 or 1.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Signature.InvalidYParityError"
      });
    }
  };
  InvalidVError = class InvalidVError extends BaseError3 {
    constructor({ value }) {
      super(`Value \`${value}\` is an invalid v value. v must be 27, 28 or >=35.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "Signature.InvalidVError"
      });
    }
  };
});

// node_modules/ox/_esm/core/Authorization.js
function from8(authorization, options = {}) {
  if (typeof authorization.chainId === "string")
    return fromRpc3(authorization);
  return { ...authorization, ...options.signature };
}
function fromRpc3(authorization) {
  const { address, chainId, nonce } = authorization;
  const signature = extract2(authorization);
  return {
    address,
    chainId: Number(chainId),
    nonce: BigInt(nonce),
    ...signature
  };
}
function getSignPayload(authorization) {
  return hash2(authorization, { presign: true });
}
function hash2(authorization, options = {}) {
  const { presign } = options;
  return keccak2562(concat2("0x05", fromHex3(toTuple2(presign ? {
    address: authorization.address,
    chainId: authorization.chainId,
    nonce: authorization.nonce
  } : authorization))));
}
function toTuple2(authorization) {
  const { address, chainId, nonce } = authorization;
  const signature = extract2(authorization);
  return [
    chainId ? fromNumber(chainId) : "0x",
    address,
    nonce ? fromNumber(nonce) : "0x",
    ...signature ? toTuple(signature) : []
  ];
}
var init_Authorization = __esm(() => {
  init_Hash();
  init_Hex();
  init_Rlp();
  init_Signature();
});

// node_modules/ox/_esm/core/Secp256k1.js
function recoverAddress2(options) {
  return fromPublicKey(recoverPublicKey2(options));
}
function recoverPublicKey2(options) {
  const { payload, signature } = options;
  const { r, s, yParity } = signature;
  const signature_ = new secp256k12.Signature(BigInt(r), BigInt(s)).addRecoveryBit(yParity);
  const point = signature_.recoverPublicKey(from2(payload).substring(2));
  return from3(point);
}
var init_Secp256k1 = __esm(() => {
  init_secp256k12();
  init_Address();
  init_Hex();
  init_PublicKey();
});

// node_modules/ox/_esm/erc8010/SignatureErc8010.js
var exports_SignatureErc8010 = {};
__export(exports_SignatureErc8010, {
  wrap: () => wrap,
  validate: () => validate4,
  unwrap: () => unwrap,
  suffixParameters: () => suffixParameters,
  magicBytes: () => magicBytes,
  from: () => from9,
  assert: () => assert6,
  InvalidWrappedSignatureError: () => InvalidWrappedSignatureError
});
function assert6(value) {
  if (typeof value === "string") {
    if (slice3(value, -32) !== magicBytes)
      throw new InvalidWrappedSignatureError(value);
  } else
    assert5(value.authorization);
}
function from9(value) {
  if (typeof value === "string")
    return unwrap(value);
  return value;
}
function unwrap(wrapped) {
  assert6(wrapped);
  const suffixLength = toNumber(slice3(wrapped, -64, -32));
  const suffix = slice3(wrapped, -suffixLength - 64, -64);
  const signature = slice3(wrapped, 0, -suffixLength - 64);
  const [auth, to, data] = decode(suffixParameters, suffix);
  const authorization = from8({
    address: auth.delegation,
    chainId: Number(auth.chainId),
    nonce: auth.nonce,
    yParity: auth.yParity,
    r: auth.r,
    s: auth.s
  });
  return {
    authorization,
    signature,
    ...data && data !== "0x" ? { data, to } : {}
  };
}
function wrap(value) {
  const { data, signature } = value;
  assert6(value);
  const self = recoverAddress2({
    payload: getSignPayload(value.authorization),
    signature: from7(value.authorization)
  });
  const suffix = encode2(suffixParameters, [
    {
      ...value.authorization,
      delegation: value.authorization.address,
      chainId: BigInt(value.authorization.chainId)
    },
    value.to ?? self,
    data ?? "0x"
  ]);
  const suffixLength = fromNumber(size3(suffix), { size: 32 });
  return concat2(signature, suffix, suffixLength, magicBytes);
}
function validate4(value) {
  try {
    assert6(value);
    return true;
  } catch {
    return false;
  }
}
var magicBytes = "0x8010801080108010801080108010801080108010801080108010801080108010", suffixParameters, InvalidWrappedSignatureError;
var init_SignatureErc8010 = __esm(() => {
  init_AbiParameters();
  init_Authorization();
  init_Errors();
  init_Hex();
  init_Secp256k1();
  init_Signature();
  suffixParameters = from5("(uint256 chainId, address delegation, uint256 nonce, uint8 yParity, uint256 r, uint256 s), address to, bytes data");
  InvalidWrappedSignatureError = class InvalidWrappedSignatureError extends BaseError3 {
    constructor(wrapped) {
      super(`Value \`${wrapped}\` is an invalid ERC-8010 wrapped signature.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "SignatureErc8010.InvalidWrappedSignatureError"
      });
    }
  };
});

// node_modules/ox/_esm/erc8010/index.js
var init_erc8010 = __esm(() => {
  init_SignatureErc8010();
});

// node_modules/viem/_esm/errors/unit.js
var InvalidDecimalNumberError;
var init_unit2 = __esm(() => {
  init_base();
  InvalidDecimalNumberError = class InvalidDecimalNumberError extends BaseError2 {
    constructor({ value }) {
      super(`Number \`${value}\` is not a valid decimal number.`, {
        name: "InvalidDecimalNumberError"
      });
    }
  };
});

// node_modules/viem/_esm/utils/unit/parseUnits.js
function parseUnits(value, decimals) {
  if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
    throw new InvalidDecimalNumberError({ value });
  let [integer, fraction = "0"] = value.split(".");
  const negative = integer.startsWith("-");
  if (negative)
    integer = integer.slice(1);
  fraction = fraction.replace(/(0+)$/, "");
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1)
      integer = `${BigInt(integer) + 1n}`;
    fraction = "";
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals)
    ];
    const rounded = Math.round(Number(`${unit}.${right}`));
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
    else
      fraction = `${left}${rounded}`;
    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }
    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }
  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}
var init_parseUnits = __esm(() => {
  init_unit2();
});

// node_modules/viem/_esm/utils/unit/parseEther.js
function parseEther(ether, unit = "wei") {
  return parseUnits(ether, etherUnits[unit]);
}
var init_parseEther = __esm(() => {
  init_unit();
  init_parseUnits();
});

// node_modules/viem/_esm/utils/index.js
var init_utils7 = __esm(() => {
  init_fromHex();
  init_toHex();
});

// node_modules/viem/_esm/utils/formatters/proof.js
function formatStorageProof(storageProof) {
  return storageProof.map((proof) => ({
    ...proof,
    value: BigInt(proof.value)
  }));
}
function formatProof(proof) {
  return {
    ...proof,
    balance: proof.balance ? BigInt(proof.balance) : undefined,
    nonce: proof.nonce ? hexToNumber(proof.nonce) : undefined,
    storageProof: proof.storageProof ? formatStorageProof(proof.storageProof) : undefined
  };
}
var init_proof = __esm(() => {
  init_utils7();
});

// node_modules/viem/_esm/actions/public/getProof.js
async function getProof(client, { address, blockNumber, blockTag: blockTag_, storageKeys }) {
  const blockTag = blockTag_ ?? "latest";
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  const proof = await client.request({
    method: "eth_getProof",
    params: [address, storageKeys, blockNumberHex || blockTag]
  });
  return formatProof(proof);
}
var init_getProof = __esm(() => {
  init_toHex();
  init_proof();
});

// node_modules/viem/_esm/actions/public/getStorageAt.js
async function getStorageAt(client, { address, blockNumber, blockTag = "latest", slot }) {
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  const data = await client.request({
    method: "eth_getStorageAt",
    params: [address, slot, blockNumberHex || blockTag]
  });
  return data;
}
var init_getStorageAt = __esm(() => {
  init_toHex();
});

// node_modules/viem/_esm/actions/public/getTransaction.js
async function getTransaction(client, { blockHash, blockNumber, blockTag: blockTag_, hash: hash3, index: index2 }) {
  const blockTag = blockTag_ || "latest";
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  let transaction = null;
  if (hash3) {
    transaction = await client.request({
      method: "eth_getTransactionByHash",
      params: [hash3]
    }, { dedupe: true });
  } else if (blockHash) {
    transaction = await client.request({
      method: "eth_getTransactionByBlockHashAndIndex",
      params: [blockHash, numberToHex(index2)]
    }, { dedupe: true });
  } else if (blockNumberHex || blockTag) {
    transaction = await client.request({
      method: "eth_getTransactionByBlockNumberAndIndex",
      params: [blockNumberHex || blockTag, numberToHex(index2)]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash: hash3,
      index: index2
    });
  const format = client.chain?.formatters?.transaction?.format || formatTransaction;
  return format(transaction, "getTransaction");
}
var init_getTransaction = __esm(() => {
  init_transaction();
  init_toHex();
  init_transaction2();
});

// node_modules/viem/_esm/actions/public/getTransactionConfirmations.js
async function getTransactionConfirmations(client, { hash: hash3, transactionReceipt }) {
  const [blockNumber, transaction] = await Promise.all([
    getAction(client, getBlockNumber, "getBlockNumber")({}),
    hash3 ? getAction(client, getTransaction, "getTransaction")({ hash: hash3 }) : undefined
  ]);
  const transactionBlockNumber = transactionReceipt?.blockNumber || transaction?.blockNumber;
  if (!transactionBlockNumber)
    return 0n;
  return blockNumber - transactionBlockNumber + 1n;
}
var init_getTransactionConfirmations = __esm(() => {
  init_getBlockNumber();
  init_getTransaction();
});

// node_modules/viem/_esm/actions/public/getTransactionReceipt.js
async function getTransactionReceipt(client, { hash: hash3 }) {
  const receipt = await client.request({
    method: "eth_getTransactionReceipt",
    params: [hash3]
  }, { dedupe: true });
  if (!receipt)
    throw new TransactionReceiptNotFoundError({ hash: hash3 });
  const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  return format(receipt, "getTransactionReceipt");
}
var init_getTransactionReceipt = __esm(() => {
  init_transaction();
  init_transactionReceipt();
});

// node_modules/viem/_esm/actions/public/multicall.js
async function multicall(client, parameters) {
  const { account, authorizationList, allowFailure = true, blockNumber, blockOverrides, blockTag, stateOverride } = parameters;
  const contracts = parameters.contracts;
  const { batchSize = parameters.batchSize ?? 1024, deployless = parameters.deployless ?? false } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const multicallAddress = (() => {
    if (parameters.multicallAddress)
      return parameters.multicallAddress;
    if (deployless)
      return null;
    if (client.chain) {
      return getChainContractAddress({
        blockNumber,
        chain: client.chain,
        contract: "multicall3"
      });
    }
    throw new Error("client chain not configured. multicallAddress is required.");
  })();
  const chunkedCalls = [[]];
  let currentChunk = 0;
  let currentChunkSize = 0;
  for (let i = 0;i < contracts.length; i++) {
    const { abi: abi2, address, args, functionName } = contracts[i];
    try {
      const callData = encodeFunctionData({ abi: abi2, args, functionName });
      currentChunkSize += (callData.length - 2) / 2;
      if (batchSize > 0 && currentChunkSize > batchSize && chunkedCalls[currentChunk].length > 0) {
        currentChunk++;
        currentChunkSize = (callData.length - 2) / 2;
        chunkedCalls[currentChunk] = [];
      }
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData,
          target: address
        }
      ];
    } catch (err) {
      const error = getContractError(err, {
        abi: abi2,
        address,
        args,
        docsPath: "/docs/contract/multicall",
        functionName,
        sender: account
      });
      if (!allowFailure)
        throw error;
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData: "0x",
          target: address
        }
      ];
    }
  }
  const aggregate3Results = await Promise.allSettled(chunkedCalls.map((calls) => getAction(client, readContract, "readContract")({
    ...multicallAddress === null ? { code: multicall3Bytecode } : { address: multicallAddress },
    abi: multicall3Abi,
    account,
    args: [calls],
    authorizationList,
    blockNumber,
    blockOverrides,
    blockTag,
    functionName: "aggregate3",
    stateOverride
  })));
  const results = [];
  for (let i = 0;i < aggregate3Results.length; i++) {
    const result = aggregate3Results[i];
    if (result.status === "rejected") {
      if (!allowFailure)
        throw result.reason;
      for (let j = 0;j < chunkedCalls[i].length; j++) {
        results.push({
          status: "failure",
          error: result.reason,
          result: undefined
        });
      }
      continue;
    }
    const aggregate3Result = result.value;
    for (let j = 0;j < aggregate3Result.length; j++) {
      const { returnData, success } = aggregate3Result[j];
      const { callData } = chunkedCalls[i][j];
      const { abi: abi2, address, functionName, args } = contracts[results.length];
      try {
        if (callData === "0x")
          throw new AbiDecodingZeroDataError;
        if (!success)
          throw new RawContractError({ data: returnData });
        const result2 = decodeFunctionResult({
          abi: abi2,
          args,
          data: returnData,
          functionName
        });
        results.push(allowFailure ? { result: result2, status: "success" } : result2);
      } catch (err) {
        const error = getContractError(err, {
          abi: abi2,
          address,
          args,
          docsPath: "/docs/contract/multicall",
          functionName
        });
        if (!allowFailure)
          throw error;
        results.push({ error, result: undefined, status: "failure" });
      }
    }
  }
  if (results.length !== contracts.length)
    throw new BaseError2("multicall results mismatch");
  return results;
}
var init_multicall = __esm(() => {
  init_abis();
  init_abi();
  init_base();
  init_contract();
  init_decodeFunctionResult();
  init_encodeFunctionData();
  init_getChainContractAddress();
  init_getContractError();
  init_readContract();
});

// node_modules/viem/_esm/actions/public/simulateBlocks.js
async function simulateBlocks(client, parameters) {
  const { blockNumber, blockTag = client.experimental_blockTag ?? "latest", blocks, returnFullTransactions, traceTransfers, validation } = parameters;
  try {
    const blockStateCalls = [];
    for (const block2 of blocks) {
      const blockOverrides = block2.blockOverrides ? toRpc2(block2.blockOverrides) : undefined;
      const calls = block2.calls.map((call_) => {
        const call2 = call_;
        const account = call2.account ? parseAccount(call2.account) : undefined;
        const data = call2.abi ? encodeFunctionData(call2) : call2.data;
        const request = {
          ...call2,
          account,
          data: call2.dataSuffix ? concat([data || "0x", call2.dataSuffix]) : data,
          from: call2.from ?? account?.address
        };
        assertRequest(request);
        return formatTransactionRequest(request);
      });
      const stateOverrides = block2.stateOverrides ? serializeStateOverride(block2.stateOverrides) : undefined;
      blockStateCalls.push({
        blockOverrides,
        calls,
        stateOverrides
      });
    }
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const result = await client.request({
      method: "eth_simulateV1",
      params: [
        { blockStateCalls, returnFullTransactions, traceTransfers, validation },
        block
      ]
    });
    return result.map((block2, i) => ({
      ...formatBlock(block2),
      calls: block2.calls.map((call2, j) => {
        const { abi: abi2, args, functionName, to } = blocks[i].calls[j];
        const data = call2.error?.data ?? call2.returnData;
        const gasUsed = BigInt(call2.gasUsed);
        const logs = call2.logs?.map((log) => formatLog(log));
        const status = call2.status === "0x1" ? "success" : "failure";
        const result2 = abi2 && status === "success" && data !== "0x" ? decodeFunctionResult({
          abi: abi2,
          data,
          functionName
        }) : null;
        const error = (() => {
          if (status === "success")
            return;
          let error2;
          if (call2.error?.data === "0x")
            error2 = new AbiDecodingZeroDataError;
          else if (call2.error)
            error2 = new RawContractError(call2.error);
          if (!error2)
            return;
          return getContractError(error2, {
            abi: abi2 ?? [],
            address: to ?? "0x",
            args,
            functionName: functionName ?? "<unknown>"
          });
        })();
        return {
          data,
          gasUsed,
          logs,
          status,
          ...status === "success" ? {
            result: result2
          } : {
            error
          }
        };
      })
    }));
  } catch (e) {
    const cause = e;
    const error = getNodeError(cause, {});
    if (error instanceof UnknownNodeError)
      throw cause;
    throw error;
  }
}
var init_simulateBlocks = __esm(() => {
  init_BlockOverrides();
  init_abi();
  init_contract();
  init_node();
  init_decodeFunctionResult();
  init_encodeFunctionData();
  init_toHex();
  init_getContractError();
  init_getNodeError();
  init_block2();
  init_transactionRequest();
  init_stateOverride2();
  init_assertRequest();
});

// node_modules/ox/_esm/core/internal/abiItem.js
function normalizeSignature2(signature) {
  let active = true;
  let current = "";
  let level = 0;
  let result = "";
  let valid = false;
  for (let i = 0;i < signature.length; i++) {
    const char = signature[i];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level++;
    if (char === ")")
      level--;
    if (!active)
      continue;
    if (level === 0) {
      if (char === " " && ["event", "function", "error", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError3("Unable to normalize signature.");
  return result;
}
function isArgOfType2(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return validate3(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index2) => {
          return isArgOfType2(Object.values(arg)[index2], component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
        return argType === "number" || argType === "bigint";
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === "string" || arg instanceof Uint8Array;
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return Array.isArray(arg) && arg.every((x) => isArgOfType2(x, {
          ...abiParameter,
          type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
        }));
      }
      return false;
    }
  }
}
function getAmbiguousTypes2(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
      return getAmbiguousTypes2(sourceParameter.components, targetParameter.components, args[parameterIndex]);
    const types = [sourceParameter.type, targetParameter.type];
    const ambiguous = (() => {
      if (types.includes("address") && types.includes("bytes20"))
        return true;
      if (types.includes("address") && types.includes("string"))
        return validate3(args[parameterIndex], {
          strict: false
        });
      if (types.includes("address") && types.includes("bytes"))
        return validate3(args[parameterIndex], {
          strict: false
        });
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
var init_abiItem2 = __esm(() => {
  init_Address();
  init_Errors();
});

// node_modules/ox/_esm/core/AbiItem.js
function from10(abiItem, options = {}) {
  const { prepare = true } = options;
  const item = (() => {
    if (Array.isArray(abiItem))
      return parseAbiItem(abiItem);
    if (typeof abiItem === "string")
      return parseAbiItem(abiItem);
    return abiItem;
  })();
  return {
    ...item,
    ...prepare ? { hash: getSignatureHash(item) } : {}
  };
}
function fromAbi(abi2, name, options) {
  const { args = [], prepare = true } = options ?? {};
  const isSelector = validate2(name, { strict: false });
  const abiItems = abi2.filter((abiItem2) => {
    if (isSelector) {
      if (abiItem2.type === "function" || abiItem2.type === "error")
        return getSelector(abiItem2) === slice3(name, 0, 4);
      if (abiItem2.type === "event")
        return getSignatureHash(abiItem2) === name;
      return false;
    }
    return "name" in abiItem2 && abiItem2.name === name;
  });
  if (abiItems.length === 0)
    throw new NotFoundError({ name });
  if (abiItems.length === 1)
    return {
      ...abiItems[0],
      ...prepare ? { hash: getSignatureHash(abiItems[0]) } : {}
    };
  let matchedAbiItem;
  for (const abiItem2 of abiItems) {
    if (!("inputs" in abiItem2))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem2.inputs || abiItem2.inputs.length === 0)
        return {
          ...abiItem2,
          ...prepare ? { hash: getSignatureHash(abiItem2) } : {}
        };
      continue;
    }
    if (!abiItem2.inputs)
      continue;
    if (abiItem2.inputs.length === 0)
      continue;
    if (abiItem2.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index2) => {
      const abiParameter = "inputs" in abiItem2 && abiItem2.inputs[index2];
      if (!abiParameter)
        return false;
      return isArgOfType2(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes2(abiItem2.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AmbiguityError({
            abiItem: abiItem2,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem2;
    }
  }
  const abiItem = (() => {
    if (matchedAbiItem)
      return matchedAbiItem;
    const [abiItem2, ...overloads] = abiItems;
    return { ...abiItem2, overloads };
  })();
  if (!abiItem)
    throw new NotFoundError({ name });
  return {
    ...abiItem,
    ...prepare ? { hash: getSignatureHash(abiItem) } : {}
  };
}
function getSelector(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  return slice3(getSignatureHash(abiItem), 0, 4);
}
function getSignature(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  const signature = (() => {
    if (typeof abiItem === "string")
      return abiItem;
    return formatAbiItem(abiItem);
  })();
  return normalizeSignature2(signature);
}
function getSignatureHash(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  if (typeof abiItem !== "string" && "hash" in abiItem && abiItem.hash)
    return abiItem.hash;
  return keccak2562(fromString2(getSignature(abiItem)));
}
var AmbiguityError, NotFoundError;
var init_AbiItem = __esm(() => {
  init_exports();
  init_Errors();
  init_Hash();
  init_Hex();
  init_abiItem2();
  AmbiguityError = class AmbiguityError extends BaseError3 {
    constructor(x, y) {
      super("Found ambiguous types in overloaded ABI Items.", {
        metaMessages: [
          `\`${x.type}\` in \`${normalizeSignature2(formatAbiItem(x.abiItem))}\`, and`,
          `\`${y.type}\` in \`${normalizeSignature2(formatAbiItem(y.abiItem))}\``,
          "",
          "These types encode differently and cannot be distinguished at runtime.",
          "Remove one of the ambiguous items in the ABI."
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiItem.AmbiguityError"
      });
    }
  };
  NotFoundError = class NotFoundError extends BaseError3 {
    constructor({ name, data, type = "item" }) {
      const selector = (() => {
        if (name)
          return ` with name "${name}"`;
        if (data)
          return ` with data "${data}"`;
        return "";
      })();
      super(`ABI ${type}${selector} not found.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiItem.NotFoundError"
      });
    }
  };
});

// node_modules/ox/_esm/core/AbiConstructor.js
function encode3(...parameters) {
  const [abiConstructor, options] = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, options2] = parameters;
      return [fromAbi2(abi2), options2];
    }
    return parameters;
  })();
  const { bytecode, args } = options;
  return concat2(bytecode, abiConstructor.inputs?.length && args?.length ? encode2(abiConstructor.inputs, args) : "0x");
}
function from11(abiConstructor) {
  return from10(abiConstructor);
}
function fromAbi2(abi2) {
  const item = abi2.find((item2) => item2.type === "constructor");
  if (!item)
    throw new NotFoundError({ name: "constructor" });
  return item;
}
var init_AbiConstructor = __esm(() => {
  init_AbiItem();
  init_AbiParameters();
  init_Hex();
});

// node_modules/ox/_esm/core/AbiFunction.js
function encodeData2(...parameters) {
  const [abiFunction, args = []] = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name, args3] = parameters;
      return [fromAbi3(abi2, name, { args: args3 }), args3];
    }
    const [abiFunction2, args2] = parameters;
    return [abiFunction2, args2];
  })();
  const { overloads } = abiFunction;
  const item = overloads ? fromAbi3([abiFunction, ...overloads], abiFunction.name, {
    args
  }) : abiFunction;
  const selector = getSelector2(item);
  const data = args.length > 0 ? encode2(item.inputs, args) : undefined;
  return data ? concat2(selector, data) : selector;
}
function from12(abiFunction, options = {}) {
  return from10(abiFunction, options);
}
function fromAbi3(abi2, name, options) {
  const item = fromAbi(abi2, name, options);
  if (item.type !== "function")
    throw new NotFoundError({ name, type: "function" });
  return item;
}
function getSelector2(abiItem) {
  return getSelector(abiItem);
}
var init_AbiFunction = __esm(() => {
  init_AbiItem();
  init_AbiParameters();
  init_Hex();
});

// node_modules/viem/_esm/constants/address.js
var ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", zeroAddress = "0x0000000000000000000000000000000000000000";

// node_modules/viem/_esm/actions/public/simulateCalls.js
async function simulateCalls(client, parameters) {
  const { blockNumber, blockTag, calls, stateOverrides, traceAssetChanges, traceTransfers, validation } = parameters;
  const account = parameters.account ? parseAccount(parameters.account) : undefined;
  if (traceAssetChanges && !account)
    throw new BaseError2("`account` is required when `traceAssetChanges` is true");
  const getBalanceData = account ? encode3(from11("constructor(bytes, bytes)"), {
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [
      getBalanceCode,
      encodeData2(from12("function getBalance(address)"), [account.address])
    ]
  }) : undefined;
  const assetAddresses = traceAssetChanges ? await Promise.all(parameters.calls.map(async (call2) => {
    if (!call2.data && !call2.abi)
      return;
    const { accessList } = await createAccessList(client, {
      account: account.address,
      ...call2,
      data: call2.abi ? encodeFunctionData(call2) : call2.data
    });
    return accessList.map(({ address, storageKeys }) => storageKeys.length > 0 ? address : null);
  })).then((x) => x.flat().filter(Boolean)) : [];
  const blocks = await simulateBlocks(client, {
    blockNumber,
    blockTag,
    blocks: [
      ...traceAssetChanges ? [
        {
          calls: [{ data: getBalanceData }],
          stateOverrides
        },
        {
          calls: assetAddresses.map((address, i) => ({
            abi: [
              from12("function balanceOf(address) returns (uint256)")
            ],
            functionName: "balanceOf",
            args: [account.address],
            to: address,
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        }
      ] : [],
      {
        calls: [...calls, {}].map((call2) => ({
          ...call2,
          from: account?.address
        })),
        stateOverrides
      },
      ...traceAssetChanges ? [
        {
          calls: [{ data: getBalanceData }]
        },
        {
          calls: assetAddresses.map((address, i) => ({
            abi: [
              from12("function balanceOf(address) returns (uint256)")
            ],
            functionName: "balanceOf",
            args: [account.address],
            to: address,
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        },
        {
          calls: assetAddresses.map((address, i) => ({
            to: address,
            abi: [
              from12("function decimals() returns (uint256)")
            ],
            functionName: "decimals",
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        },
        {
          calls: assetAddresses.map((address, i) => ({
            to: address,
            abi: [
              from12("function tokenURI(uint256) returns (string)")
            ],
            functionName: "tokenURI",
            args: [0n],
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        },
        {
          calls: assetAddresses.map((address, i) => ({
            to: address,
            abi: [from12("function symbol() returns (string)")],
            functionName: "symbol",
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        }
      ] : []
    ],
    traceTransfers,
    validation
  });
  const block_results = traceAssetChanges ? blocks[2] : blocks[0];
  const [block_ethPre, block_assetsPre, , block_ethPost, block_assetsPost, block_decimals, block_tokenURI, block_symbols] = traceAssetChanges ? blocks : [];
  const { calls: block_calls, ...block } = block_results;
  const results = block_calls.slice(0, -1) ?? [];
  const ethPre = block_ethPre?.calls ?? [];
  const assetsPre = block_assetsPre?.calls ?? [];
  const balancesPre = [...ethPre, ...assetsPre].map((call2) => call2.status === "success" ? hexToBigInt(call2.data) : null);
  const ethPost = block_ethPost?.calls ?? [];
  const assetsPost = block_assetsPost?.calls ?? [];
  const balancesPost = [...ethPost, ...assetsPost].map((call2) => call2.status === "success" ? hexToBigInt(call2.data) : null);
  const decimals = (block_decimals?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
  const symbols = (block_symbols?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
  const tokenURI = (block_tokenURI?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
  const changes = [];
  for (const [i, balancePost] of balancesPost.entries()) {
    const balancePre = balancesPre[i];
    if (typeof balancePost !== "bigint")
      continue;
    if (typeof balancePre !== "bigint")
      continue;
    const decimals_ = decimals[i - 1];
    const symbol_ = symbols[i - 1];
    const tokenURI_ = tokenURI[i - 1];
    const token = (() => {
      if (i === 0)
        return {
          address: ethAddress,
          decimals: 18,
          symbol: "ETH"
        };
      return {
        address: assetAddresses[i - 1],
        decimals: tokenURI_ || decimals_ ? Number(decimals_ ?? 1) : undefined,
        symbol: symbol_ ?? undefined
      };
    })();
    if (changes.some((change) => change.token.address === token.address))
      continue;
    changes.push({
      token,
      value: {
        pre: balancePre,
        post: balancePost,
        diff: balancePost - balancePre
      }
    });
  }
  return {
    assetChanges: changes,
    block,
    results
  };
}
var getBalanceCode = "0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033";
var init_simulateCalls = __esm(() => {
  init_AbiConstructor();
  init_AbiFunction();
  init_base();
  init_encodeFunctionData();
  init_utils7();
  init_createAccessList();
  init_simulateBlocks();
});

// node_modules/ox/_esm/erc6492/SignatureErc6492.js
var exports_SignatureErc6492 = {};
__export(exports_SignatureErc6492, {
  wrap: () => wrap2,
  validate: () => validate5,
  unwrap: () => unwrap2,
  universalSignatureValidatorBytecode: () => universalSignatureValidatorBytecode,
  universalSignatureValidatorAbi: () => universalSignatureValidatorAbi,
  magicBytes: () => magicBytes2,
  from: () => from13,
  assert: () => assert7,
  InvalidWrappedSignatureError: () => InvalidWrappedSignatureError2
});
function assert7(wrapped) {
  if (slice3(wrapped, -32) !== magicBytes2)
    throw new InvalidWrappedSignatureError2(wrapped);
}
function from13(wrapped) {
  if (typeof wrapped === "string")
    return unwrap2(wrapped);
  return wrapped;
}
function unwrap2(wrapped) {
  assert7(wrapped);
  const [to, data, signature] = decode(from5("address, bytes, bytes"), wrapped);
  return { data, signature, to };
}
function wrap2(value) {
  const { data, signature, to } = value;
  return concat2(encode2(from5("address, bytes, bytes"), [
    to,
    data,
    signature
  ]), magicBytes2);
}
function validate5(wrapped) {
  try {
    assert7(wrapped);
    return true;
  } catch {
    return false;
  }
}
var magicBytes2 = "0x6492649264926492649264926492649264926492649264926492649264926492", universalSignatureValidatorBytecode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572", universalSignatureValidatorAbi, InvalidWrappedSignatureError2;
var init_SignatureErc6492 = __esm(() => {
  init_AbiParameters();
  init_Errors();
  init_Hex();
  universalSignatureValidatorAbi = [
    {
      inputs: [
        {
          name: "_signer",
          type: "address"
        },
        {
          name: "_hash",
          type: "bytes32"
        },
        {
          name: "_signature",
          type: "bytes"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      inputs: [
        {
          name: "_signer",
          type: "address"
        },
        {
          name: "_hash",
          type: "bytes32"
        },
        {
          name: "_signature",
          type: "bytes"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function",
      name: "isValidSig"
    }
  ];
  InvalidWrappedSignatureError2 = class InvalidWrappedSignatureError2 extends BaseError3 {
    constructor(wrapped) {
      super(`Value \`${wrapped}\` is an invalid ERC-6492 wrapped signature.`);
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "SignatureErc6492.InvalidWrappedSignatureError"
      });
    }
  };
});

// node_modules/ox/_esm/erc6492/index.js
var init_erc6492 = __esm(() => {
  init_SignatureErc6492();
});

// node_modules/viem/_esm/utils/signature/serializeSignature.js
function serializeSignature({ r, s, to = "hex", v, yParity }) {
  const yParity_ = (() => {
    if (yParity === 0 || yParity === 1)
      return yParity;
    if (v && (v === 27n || v === 28n || v >= 35n))
      return v % 2n === 0n ? 1 : 0;
    throw new Error("Invalid `v` or `yParity` value");
  })();
  const signature = `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
  if (to === "hex")
    return signature;
  return hexToBytes(signature);
}
var init_serializeSignature = __esm(() => {
  init_secp256k1();
  init_fromHex();
  init_toBytes();
});

// node_modules/viem/_esm/actions/public/verifyHash.js
async function verifyHash(client, parameters) {
  const { address, hash: hash3, erc6492VerifierAddress: verifierAddress = parameters.universalSignatureVerifierAddress ?? client.chain?.contracts?.erc6492Verifier?.address, multicallAddress = parameters.multicallAddress ?? client.chain?.contracts?.multicall3?.address } = parameters;
  const signature = (() => {
    const signature2 = parameters.signature;
    if (isHex(signature2))
      return signature2;
    if (typeof signature2 === "object" && "r" in signature2 && "s" in signature2)
      return serializeSignature(signature2);
    return bytesToHex(signature2);
  })();
  try {
    if (exports_SignatureErc8010.validate(signature))
      return await verifyErc8010(client, {
        ...parameters,
        multicallAddress,
        signature
      });
    return await verifyErc6492(client, {
      ...parameters,
      verifierAddress,
      signature
    });
  } catch (error) {
    try {
      const verified = isAddressEqual(getAddress(address), await recoverAddress({ hash: hash3, signature }));
      if (verified)
        return true;
    } catch {}
    if (error instanceof VerificationError) {
      return false;
    }
    throw error;
  }
}
async function verifyErc8010(client, parameters) {
  const { address, blockNumber, blockTag, hash: hash3, multicallAddress } = parameters;
  const { authorization: authorization_ox, data: initData, signature, to } = exports_SignatureErc8010.unwrap(parameters.signature);
  const code = await getCode(client, {
    address,
    blockNumber,
    blockTag
  });
  if (code === concatHex(["0xef0100", authorization_ox.address]))
    return await verifyErc1271(client, {
      address,
      blockNumber,
      blockTag,
      hash: hash3,
      signature
    });
  const authorization = {
    address: authorization_ox.address,
    chainId: Number(authorization_ox.chainId),
    nonce: Number(authorization_ox.nonce),
    r: numberToHex(authorization_ox.r, { size: 32 }),
    s: numberToHex(authorization_ox.s, { size: 32 }),
    yParity: authorization_ox.yParity
  };
  const valid = await verifyAuthorization({
    address,
    authorization
  });
  if (!valid)
    throw new VerificationError;
  const results = await getAction(client, readContract, "readContract")({
    ...multicallAddress ? { address: multicallAddress } : { code: multicall3Bytecode },
    authorizationList: [authorization],
    abi: multicall3Abi,
    blockNumber,
    blockTag: "pending",
    functionName: "aggregate3",
    args: [
      [
        ...initData ? [
          {
            allowFailure: true,
            target: to ?? address,
            callData: initData
          }
        ] : [],
        {
          allowFailure: true,
          target: address,
          callData: encodeFunctionData({
            abi: erc1271Abi,
            functionName: "isValidSignature",
            args: [hash3, signature]
          })
        }
      ]
    ]
  });
  const data = results[results.length - 1]?.returnData;
  if (data?.startsWith("0x1626ba7e"))
    return true;
  throw new VerificationError;
}
async function verifyErc6492(client, parameters) {
  const { address, factory, factoryData, hash: hash3, signature, verifierAddress, ...rest } = parameters;
  const wrappedSignature = await (async () => {
    if (!factory && !factoryData)
      return signature;
    if (exports_SignatureErc6492.validate(signature))
      return signature;
    return exports_SignatureErc6492.wrap({
      data: factoryData,
      signature,
      to: factory
    });
  })();
  const args = verifierAddress ? {
    to: verifierAddress,
    data: encodeFunctionData({
      abi: erc6492SignatureValidatorAbi,
      functionName: "isValidSig",
      args: [address, hash3, wrappedSignature]
    }),
    ...rest
  } : {
    data: encodeDeployData({
      abi: erc6492SignatureValidatorAbi,
      args: [address, hash3, wrappedSignature],
      bytecode: erc6492SignatureValidatorByteCode
    }),
    ...rest
  };
  const { data } = await getAction(client, call, "call")(args).catch((error) => {
    if (error instanceof CallExecutionError)
      throw new VerificationError;
    throw error;
  });
  if (hexToBool(data ?? "0x0"))
    return true;
  throw new VerificationError;
}
async function verifyErc1271(client, parameters) {
  const { address, blockNumber, blockTag, hash: hash3, signature } = parameters;
  const result = await getAction(client, readContract, "readContract")({
    address,
    abi: erc1271Abi,
    args: [hash3, signature],
    blockNumber,
    blockTag,
    functionName: "isValidSignature"
  }).catch((error) => {
    if (error instanceof ContractFunctionExecutionError)
      throw new VerificationError;
    throw error;
  });
  if (result.startsWith("0x1626ba7e"))
    return true;
  throw new VerificationError;
}
var VerificationError;
var init_verifyHash = __esm(() => {
  init_erc6492();
  init_erc8010();
  init_abis();
  init_contract();
  init_encodeDeployData();
  init_encodeFunctionData();
  init_getAddress();
  init_isAddressEqual();
  init_verifyAuthorization();
  init_fromHex();
  init_toHex();
  init_recoverAddress();
  init_serializeSignature();
  init_call();
  init_getCode();
  init_readContract();
  VerificationError = class VerificationError extends Error {
  };
});

// node_modules/viem/_esm/actions/public/verifyMessage.js
async function verifyMessage(client, { address, message, factory, factoryData, signature, ...callRequest }) {
  const hash3 = hashMessage(message);
  return verifyHash(client, {
    address,
    factory,
    factoryData,
    hash: hash3,
    signature,
    ...callRequest
  });
}
var init_verifyMessage = __esm(() => {
  init_hashMessage();
  init_verifyHash();
});

// node_modules/viem/_esm/actions/public/verifyTypedData.js
async function verifyTypedData(client, parameters) {
  const { address, factory, factoryData, signature, message, primaryType, types, domain, ...callRequest } = parameters;
  const hash3 = hashTypedData({ message, primaryType, types, domain });
  return verifyHash(client, {
    address,
    factory,
    factoryData,
    hash: hash3,
    signature,
    ...callRequest
  });
}
var init_verifyTypedData = __esm(() => {
  init_hashTypedData();
  init_verifyHash();
});

// node_modules/viem/_esm/actions/public/watchBlockNumber.js
function watchBlockNumber(client, { emitOnBegin = false, emitMissed = false, onBlockNumber, onError, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  let prevBlockNumber;
  const pollBlockNumber = () => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed,
      pollingInterval
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => poll(async () => {
      try {
        const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({ cacheTime: 0 });
        if (prevBlockNumber !== undefined) {
          if (blockNumber === prevBlockNumber)
            return;
          if (blockNumber - prevBlockNumber > 1 && emitMissed) {
            for (let i = prevBlockNumber + 1n;i < blockNumber; i++) {
              emit.onBlockNumber(i, prevBlockNumber);
              prevBlockNumber = i;
            }
          }
        }
        if (prevBlockNumber === undefined || blockNumber > prevBlockNumber) {
          emit.onBlockNumber(blockNumber, prevBlockNumber);
          prevBlockNumber = blockNumber;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  };
  const subscribeBlockNumber = () => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => {
      let active = true;
      let unsubscribe = () => active = false;
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["newHeads"],
            onData(data) {
              if (!active)
                return;
              const blockNumber = hexToBigInt(data.result?.number);
              emit.onBlockNumber(blockNumber, prevBlockNumber);
              prevBlockNumber = blockNumber;
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  };
  return enablePolling ? pollBlockNumber() : subscribeBlockNumber();
}
var init_watchBlockNumber = __esm(() => {
  init_fromHex();
  init_observe();
  init_poll();
  init_getBlockNumber();
});

// node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js
async function waitForTransactionReceipt(client, parameters) {
  const {
    checkReplacement = true,
    confirmations = 1,
    hash: hash3,
    onReplaced,
    retryCount = 6,
    retryDelay = ({ count }) => ~~(1 << count) * 200,
    timeout = 180000
  } = parameters;
  const observerId = stringify(["waitForTransactionReceipt", client.uid, hash3]);
  const pollingInterval = (() => {
    if (parameters.pollingInterval)
      return parameters.pollingInterval;
    if (client.chain?.experimental_preconfirmationTime)
      return client.chain.experimental_preconfirmationTime;
    return client.pollingInterval;
  })();
  let transaction;
  let replacedTransaction;
  let receipt;
  let retrying = false;
  let _unobserve;
  let _unwatch;
  const { promise, resolve, reject } = withResolvers();
  const timer = timeout ? setTimeout(() => {
    _unwatch?.();
    _unobserve?.();
    reject(new WaitForTransactionReceiptTimeoutError({ hash: hash3 }));
  }, timeout) : undefined;
  _unobserve = observe(observerId, { onReplaced, resolve, reject }, async (emit) => {
    receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 }).catch(() => {
      return;
    });
    if (receipt && confirmations <= 1) {
      clearTimeout(timer);
      emit.resolve(receipt);
      _unobserve?.();
      return;
    }
    _unwatch = getAction(client, watchBlockNumber, "watchBlockNumber")({
      emitMissed: true,
      emitOnBegin: true,
      poll: true,
      pollingInterval,
      async onBlockNumber(blockNumber_) {
        const done = (fn) => {
          clearTimeout(timer);
          _unwatch?.();
          fn();
          _unobserve?.();
        };
        let blockNumber = blockNumber_;
        if (retrying)
          return;
        try {
          if (receipt) {
            if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
              return;
            done(() => emit.resolve(receipt));
            return;
          }
          if (checkReplacement && !transaction) {
            retrying = true;
            await withRetry(async () => {
              transaction = await getAction(client, getTransaction, "getTransaction")({ hash: hash3 });
              if (transaction.blockNumber)
                blockNumber = transaction.blockNumber;
            }, {
              delay: retryDelay,
              retryCount
            });
            retrying = false;
          }
          receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 });
          if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
            return;
          done(() => emit.resolve(receipt));
        } catch (err) {
          if (err instanceof TransactionNotFoundError || err instanceof TransactionReceiptNotFoundError) {
            if (!transaction) {
              retrying = false;
              return;
            }
            try {
              replacedTransaction = transaction;
              retrying = true;
              const block = await withRetry(() => getAction(client, getBlock, "getBlock")({
                blockNumber,
                includeTransactions: true
              }), {
                delay: retryDelay,
                retryCount,
                shouldRetry: ({ error }) => error instanceof BlockNotFoundError
              });
              retrying = false;
              const replacementTransaction = block.transactions.find(({ from: from14, nonce }) => from14 === replacedTransaction.from && nonce === replacedTransaction.nonce);
              if (!replacementTransaction)
                return;
              receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({
                hash: replacementTransaction.hash
              });
              if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
                return;
              let reason = "replaced";
              if (replacementTransaction.to === replacedTransaction.to && replacementTransaction.value === replacedTransaction.value && replacementTransaction.input === replacedTransaction.input) {
                reason = "repriced";
              } else if (replacementTransaction.from === replacementTransaction.to && replacementTransaction.value === 0n) {
                reason = "cancelled";
              }
              done(() => {
                emit.onReplaced?.({
                  reason,
                  replacedTransaction,
                  transaction: replacementTransaction,
                  transactionReceipt: receipt
                });
                emit.resolve(receipt);
              });
            } catch (err_) {
              done(() => emit.reject(err_));
            }
          } else {
            done(() => emit.reject(err));
          }
        }
      }
    });
  });
  return promise;
}
var init_waitForTransactionReceipt = __esm(() => {
  init_block();
  init_transaction();
  init_observe();
  init_withRetry();
  init_getBlock();
  init_getTransaction();
  init_getTransactionReceipt();
  init_watchBlockNumber();
});

// node_modules/viem/_esm/actions/public/watchBlocks.js
function watchBlocks(client, { blockTag = client.experimental_blockTag ?? "latest", emitMissed = false, emitOnBegin = false, onBlock, onError, includeTransactions: includeTransactions_, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const includeTransactions = includeTransactions_ ?? false;
  let prevBlock;
  const pollBlocks = () => {
    const observerId = stringify([
      "watchBlocks",
      client.uid,
      blockTag,
      emitMissed,
      emitOnBegin,
      includeTransactions,
      pollingInterval
    ]);
    return observe(observerId, { onBlock, onError }, (emit) => poll(async () => {
      try {
        const block = await getAction(client, getBlock, "getBlock")({
          blockTag,
          includeTransactions
        });
        if (block.number !== null && prevBlock?.number != null) {
          if (block.number === prevBlock.number)
            return;
          if (block.number - prevBlock.number > 1 && emitMissed) {
            for (let i = prevBlock?.number + 1n;i < block.number; i++) {
              const block2 = await getAction(client, getBlock, "getBlock")({
                blockNumber: i,
                includeTransactions
              });
              emit.onBlock(block2, prevBlock);
              prevBlock = block2;
            }
          }
        }
        if (prevBlock?.number == null || blockTag === "pending" && block?.number == null || block.number !== null && block.number > prevBlock.number) {
          emit.onBlock(block, prevBlock);
          prevBlock = block;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  };
  const subscribeBlocks = () => {
    let active = true;
    let emitFetched = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        if (emitOnBegin) {
          getAction(client, getBlock, "getBlock")({
            blockTag,
            includeTransactions
          }).then((block) => {
            if (!active)
              return;
            if (!emitFetched)
              return;
            onBlock(block, undefined);
            emitFetched = false;
          }).catch(onError);
        }
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["newHeads"],
          async onData(data) {
            if (!active)
              return;
            const block = await getAction(client, getBlock, "getBlock")({
              blockNumber: data.result?.number,
              includeTransactions
            }).catch(() => {});
            if (!active)
              return;
            onBlock(block, prevBlock);
            emitFetched = false;
            prevBlock = block;
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollBlocks() : subscribeBlocks();
}
var init_watchBlocks = __esm(() => {
  init_observe();
  init_poll();
  init_getBlock();
});

// node_modules/viem/_esm/actions/public/watchEvent.js
function watchEvent(client, { address, args, batch = true, event, events, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const strict = strict_ ?? false;
  const pollEvent = () => {
    const observerId = stringify([
      "watchEvent",
      address,
      args,
      batch,
      client.uid,
      event,
      pollingInterval,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== undefined)
        previousBlockNumber = fromBlock - 1n;
      let filter;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter = await getAction(client, createEventFilter, "createEventFilter")({
              address,
              args,
              event,
              events,
              strict,
              fromBlock
            });
          } catch {}
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber !== blockNumber) {
              logs = await getAction(client, getLogs, "getLogs")({
                address,
                args,
                event,
                events,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  };
  const subscribeEvent = () => {
    let active = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const events_ = events ?? (event ? [event] : undefined);
        let topics = [];
        if (events_) {
          const encoded = events_.flatMap((event2) => encodeEventTopics({
            abi: [event2],
            eventName: event2.name,
            args
          }));
          topics = [encoded];
          if (event)
            topics = topics[0];
        }
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["logs", { address, topics }],
          onData(data) {
            if (!active)
              return;
            const log = data.result;
            try {
              const { eventName, args: args2 } = decodeEventLog({
                abi: events_ ?? [],
                data: log.data,
                topics: log.topics,
                strict
              });
              const formatted = formatLog(log, { args: args2, eventName });
              onLogs([formatted]);
            } catch (err) {
              let eventName;
              let isUnnamed;
              if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                if (strict_)
                  return;
                eventName = err.abiItem.name;
                isUnnamed = err.abiItem.inputs?.some((x) => !(("name" in x) && x.name));
              }
              const formatted = formatLog(log, {
                args: isUnnamed ? [] : {},
                eventName
              });
              onLogs([formatted]);
            }
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollEvent() : subscribeEvent();
}
var init_watchEvent = __esm(() => {
  init_abi();
  init_rpc();
  init_decodeEventLog();
  init_encodeEventTopics();
  init_observe();
  init_poll();
  init_createEventFilter();
  init_getBlockNumber();
  init_getFilterChanges();
  init_getLogs();
});

// node_modules/viem/_esm/actions/public/watchPendingTransactions.js
function watchPendingTransactions(client, { batch = true, onError, onTransactions, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = typeof poll_ !== "undefined" ? poll_ : client.transport.type !== "webSocket" && client.transport.type !== "ipc";
  const pollPendingTransactions = () => {
    const observerId = stringify([
      "watchPendingTransactions",
      client.uid,
      batch,
      pollingInterval
    ]);
    return observe(observerId, { onTransactions, onError }, (emit) => {
      let filter;
      const unwatch = poll(async () => {
        try {
          if (!filter) {
            try {
              filter = await getAction(client, createPendingTransactionFilter, "createPendingTransactionFilter")({});
              return;
            } catch (err) {
              unwatch();
              throw err;
            }
          }
          const hashes = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          if (hashes.length === 0)
            return;
          if (batch)
            emit.onTransactions(hashes);
          else
            for (const hash3 of hashes)
              emit.onTransactions([hash3]);
        } catch (err) {
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  };
  const subscribePendingTransactions = () => {
    let active = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
          params: ["newPendingTransactions"],
          onData(data) {
            if (!active)
              return;
            const transaction = data.result;
            onTransactions([transaction]);
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollPendingTransactions() : subscribePendingTransactions();
}
var init_watchPendingTransactions = __esm(() => {
  init_observe();
  init_poll();
  init_createPendingTransactionFilter();
  init_getFilterChanges();
});

// node_modules/viem/_esm/utils/siwe/parseSiweMessage.js
function parseSiweMessage(message) {
  const { scheme, statement, ...prefix } = message.match(prefixRegex)?.groups ?? {};
  const { chainId, expirationTime, issuedAt, notBefore, requestId, ...suffix } = message.match(suffixRegex)?.groups ?? {};
  const resources = message.split("Resources:")[1]?.split(`
- `).slice(1);
  return {
    ...prefix,
    ...suffix,
    ...chainId ? { chainId: Number(chainId) } : {},
    ...expirationTime ? { expirationTime: new Date(expirationTime) } : {},
    ...issuedAt ? { issuedAt: new Date(issuedAt) } : {},
    ...notBefore ? { notBefore: new Date(notBefore) } : {},
    ...requestId ? { requestId } : {},
    ...resources ? { resources } : {},
    ...scheme ? { scheme } : {},
    ...statement ? { statement } : {}
  };
}
var prefixRegex, suffixRegex;
var init_parseSiweMessage = __esm(() => {
  prefixRegex = /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/;
  suffixRegex = /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/;
});

// node_modules/viem/_esm/utils/siwe/validateSiweMessage.js
function validateSiweMessage(parameters) {
  const { address, domain, message, nonce, scheme, time = new Date } = parameters;
  if (domain && message.domain !== domain)
    return false;
  if (nonce && message.nonce !== nonce)
    return false;
  if (scheme && message.scheme !== scheme)
    return false;
  if (message.expirationTime && time >= message.expirationTime)
    return false;
  if (message.notBefore && time < message.notBefore)
    return false;
  try {
    if (!message.address)
      return false;
    if (!isAddress(message.address, { strict: false }))
      return false;
    if (address && !isAddressEqual(message.address, address))
      return false;
  } catch {
    return false;
  }
  return true;
}
var init_validateSiweMessage = __esm(() => {
  init_isAddress();
  init_isAddressEqual();
});

// node_modules/viem/_esm/actions/siwe/verifySiweMessage.js
async function verifySiweMessage(client, parameters) {
  const { address, domain, message, nonce, scheme, signature, time = new Date, ...callRequest } = parameters;
  const parsed = parseSiweMessage(message);
  if (!parsed.address)
    return false;
  const isValid = validateSiweMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time
  });
  if (!isValid)
    return false;
  const hash3 = hashMessage(message);
  return verifyHash(client, {
    address: parsed.address,
    hash: hash3,
    signature,
    ...callRequest
  });
}
var init_verifySiweMessage = __esm(() => {
  init_hashMessage();
  init_parseSiweMessage();
  init_validateSiweMessage();
  init_verifyHash();
});

// node_modules/viem/_esm/actions/wallet/sendRawTransactionSync.js
async function sendRawTransactionSync(client, { serializedTransaction, throwOnReceiptRevert, timeout }) {
  const receipt = await client.request({
    method: "eth_sendRawTransactionSync",
    params: timeout ? [serializedTransaction, numberToHex(timeout)] : [serializedTransaction]
  }, { retryCount: 0 });
  const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  const formatted = format(receipt);
  if (formatted.status === "reverted" && throwOnReceiptRevert)
    throw new TransactionReceiptRevertedError({ receipt: formatted });
  return formatted;
}
var init_sendRawTransactionSync = __esm(() => {
  init_transaction();
  init_transactionReceipt();
  init_utils7();
});

// node_modules/viem/_esm/clients/decorators/public.js
function publicActions(client) {
  return {
    call: (args) => call(client, args),
    createAccessList: (args) => createAccessList(client, args),
    createBlockFilter: () => createBlockFilter(client),
    createContractEventFilter: (args) => createContractEventFilter(client, args),
    createEventFilter: (args) => createEventFilter(client, args),
    createPendingTransactionFilter: () => createPendingTransactionFilter(client),
    estimateContractGas: (args) => estimateContractGas(client, args),
    estimateGas: (args) => estimateGas(client, args),
    getBalance: (args) => getBalance(client, args),
    getBlobBaseFee: () => getBlobBaseFee(client),
    getBlock: (args) => getBlock(client, args),
    getBlockNumber: (args) => getBlockNumber(client, args),
    getBlockTransactionCount: (args) => getBlockTransactionCount(client, args),
    getBytecode: (args) => getCode(client, args),
    getChainId: () => getChainId(client),
    getCode: (args) => getCode(client, args),
    getContractEvents: (args) => getContractEvents(client, args),
    getEip712Domain: (args) => getEip712Domain(client, args),
    getEnsAddress: (args) => getEnsAddress(client, args),
    getEnsAvatar: (args) => getEnsAvatar(client, args),
    getEnsName: (args) => getEnsName(client, args),
    getEnsResolver: (args) => getEnsResolver(client, args),
    getEnsText: (args) => getEnsText(client, args),
    getFeeHistory: (args) => getFeeHistory(client, args),
    estimateFeesPerGas: (args) => estimateFeesPerGas(client, args),
    getFilterChanges: (args) => getFilterChanges(client, args),
    getFilterLogs: (args) => getFilterLogs(client, args),
    getGasPrice: () => getGasPrice(client),
    getLogs: (args) => getLogs(client, args),
    getProof: (args) => getProof(client, args),
    estimateMaxPriorityFeePerGas: (args) => estimateMaxPriorityFeePerGas(client, args),
    getStorageAt: (args) => getStorageAt(client, args),
    getTransaction: (args) => getTransaction(client, args),
    getTransactionConfirmations: (args) => getTransactionConfirmations(client, args),
    getTransactionCount: (args) => getTransactionCount(client, args),
    getTransactionReceipt: (args) => getTransactionReceipt(client, args),
    multicall: (args) => multicall(client, args),
    prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
    readContract: (args) => readContract(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
    simulate: (args) => simulateBlocks(client, args),
    simulateBlocks: (args) => simulateBlocks(client, args),
    simulateCalls: (args) => simulateCalls(client, args),
    simulateContract: (args) => simulateContract(client, args),
    verifyHash: (args) => verifyHash(client, args),
    verifyMessage: (args) => verifyMessage(client, args),
    verifySiweMessage: (args) => verifySiweMessage(client, args),
    verifyTypedData: (args) => verifyTypedData(client, args),
    uninstallFilter: (args) => uninstallFilter(client, args),
    waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
    watchBlocks: (args) => watchBlocks(client, args),
    watchBlockNumber: (args) => watchBlockNumber(client, args),
    watchContractEvent: (args) => watchContractEvent(client, args),
    watchEvent: (args) => watchEvent(client, args),
    watchPendingTransactions: (args) => watchPendingTransactions(client, args)
  };
}
var init_public = __esm(() => {
  init_getEnsAddress();
  init_getEnsAvatar();
  init_getEnsName();
  init_getEnsResolver();
  init_getEnsText();
  init_call();
  init_createAccessList();
  init_createBlockFilter();
  init_createContractEventFilter();
  init_createEventFilter();
  init_createPendingTransactionFilter();
  init_estimateContractGas();
  init_estimateFeesPerGas();
  init_estimateGas2();
  init_estimateMaxPriorityFeePerGas();
  init_getBalance();
  init_getBlock();
  init_getBlockNumber();
  init_getBlockTransactionCount();
  init_getChainId();
  init_getCode();
  init_getContractEvents();
  init_getEip712Domain();
  init_getFeeHistory();
  init_getFilterChanges();
  init_getFilterLogs();
  init_getLogs();
  init_getProof();
  init_getStorageAt();
  init_getTransaction();
  init_getTransactionConfirmations();
  init_getTransactionCount();
  init_getTransactionReceipt();
  init_multicall();
  init_readContract();
  init_simulateBlocks();
  init_simulateCalls();
  init_simulateContract();
  init_verifyHash();
  init_verifyMessage();
  init_verifyTypedData();
  init_waitForTransactionReceipt();
  init_watchBlockNumber();
  init_watchBlocks();
  init_watchContractEvent();
  init_watchEvent();
  init_watchPendingTransactions();
  init_verifySiweMessage();
  init_prepareTransactionRequest();
  init_sendRawTransactionSync();
});

// node_modules/viem/_esm/clients/createPublicClient.js
function createPublicClient(parameters) {
  const { key = "public", name = "Public Client" } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: "publicClient"
  });
  return client.extend(publicActions);
}
var init_createPublicClient = __esm(() => {
  init_createClient();
  init_public();
});

// node_modules/viem/_esm/actions/wallet/addChain.js
async function addChain(client, { chain }) {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain;
  await client.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers ? Object.values(blockExplorers).map(({ url }) => url) : undefined
      }
    ]
  }, { dedupe: true, retryCount: 0 });
}
var init_addChain = __esm(() => {
  init_toHex();
});

// node_modules/viem/_esm/actions/wallet/deployContract.js
function deployContract(walletClient, parameters) {
  const { abi: abi2, args, bytecode, ...request } = parameters;
  const calldata = encodeDeployData({ abi: abi2, args, bytecode });
  return sendTransaction(walletClient, {
    ...request,
    ...request.authorizationList ? { to: null } : {},
    data: calldata
  });
}
var init_deployContract = __esm(() => {
  init_encodeDeployData();
  init_sendTransaction();
});

// node_modules/viem/_esm/actions/wallet/getAddresses.js
async function getAddresses(client) {
  if (client.account?.type === "local")
    return [client.account.address];
  const addresses = await client.request({ method: "eth_accounts" }, { dedupe: true });
  return addresses.map((address) => checksumAddress(address));
}
var init_getAddresses = __esm(() => {
  init_getAddress();
});

// node_modules/viem/_esm/actions/wallet/getCapabilities.js
async function getCapabilities(client, parameters = {}) {
  const { account = client.account, chainId } = parameters;
  const account_ = account ? parseAccount(account) : undefined;
  const params = chainId ? [account_?.address, [numberToHex(chainId)]] : [account_?.address];
  const capabilities_raw = await client.request({
    method: "wallet_getCapabilities",
    params
  });
  const capabilities = {};
  for (const [chainId2, capabilities_] of Object.entries(capabilities_raw)) {
    capabilities[Number(chainId2)] = {};
    for (let [key, value] of Object.entries(capabilities_)) {
      if (key === "addSubAccount")
        key = "unstable_addSubAccount";
      capabilities[Number(chainId2)][key] = value;
    }
  }
  return typeof chainId === "number" ? capabilities[chainId] : capabilities;
}
var init_getCapabilities = __esm(() => {
  init_toHex();
});

// node_modules/viem/_esm/actions/wallet/getPermissions.js
async function getPermissions(client) {
  const permissions = await client.request({ method: "wallet_getPermissions" }, { dedupe: true });
  return permissions;
}

// node_modules/viem/_esm/actions/wallet/prepareAuthorization.js
async function prepareAuthorization(client, parameters) {
  const { account: account_ = client.account, chainId, nonce } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/eip7702/prepareAuthorization"
    });
  const account = parseAccount(account_);
  const executor = (() => {
    if (!parameters.executor)
      return;
    if (parameters.executor === "self")
      return parameters.executor;
    return parseAccount(parameters.executor);
  })();
  const authorization = {
    address: parameters.contractAddress ?? parameters.address,
    chainId,
    nonce
  };
  if (typeof authorization.chainId === "undefined")
    authorization.chainId = client.chain?.id ?? await getAction(client, getChainId, "getChainId")({});
  if (typeof authorization.nonce === "undefined") {
    authorization.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
      address: account.address,
      blockTag: "pending"
    });
    if (executor === "self" || executor?.address && isAddressEqual(executor.address, account.address))
      authorization.nonce += 1;
  }
  return authorization;
}
var init_prepareAuthorization = __esm(() => {
  init_account();
  init_isAddressEqual();
  init_getChainId();
  init_getTransactionCount();
});

// node_modules/viem/_esm/actions/wallet/requestAddresses.js
async function requestAddresses(client) {
  const addresses = await client.request({ method: "eth_requestAccounts" }, { dedupe: true, retryCount: 0 });
  return addresses.map((address) => getAddress(address));
}
var init_requestAddresses = __esm(() => {
  init_getAddress();
});

// node_modules/viem/_esm/actions/wallet/requestPermissions.js
async function requestPermissions(client, permissions) {
  return client.request({
    method: "wallet_requestPermissions",
    params: [permissions]
  }, { retryCount: 0 });
}

// node_modules/viem/_esm/actions/wallet/sendCallsSync.js
async function sendCallsSync(client, parameters) {
  const { chain = client.chain } = parameters;
  const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5000);
  const result = await sendCalls(client, parameters);
  const status = await waitForCallsStatus(client, {
    ...parameters,
    id: result.id,
    timeout
  });
  return status;
}
var init_sendCallsSync = __esm(() => {
  init_sendCalls();
  init_waitForCallsStatus();
});

// node_modules/viem/_esm/actions/wallet/sendTransactionSync.js
async function sendTransactionSync(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, accessList, authorizationList, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, pollingInterval, throwOnReceiptRevert, type, value, ...rest } = parameters;
  const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5000);
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransactionSync"
    });
  const account = account_ ? parseAccount(account_) : null;
  try {
    assertRequest(parameters);
    const to = await (async () => {
      if (parameters.to)
        return parameters.to;
      if (parameters.to === null)
        return;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`.");
        });
      return;
    })();
    if (account?.type === "json-rpc" || account === null) {
      let chainId;
      if (chain !== null) {
        chainId = await getAction(client, getChainId, "getChainId")({});
        assertCurrentChain({
          currentChainId: chainId,
          chain
        });
      }
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        ...extract(rest, { format: chainFormat }),
        accessList,
        account,
        authorizationList,
        blobs,
        chainId,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        type,
        value
      }, "sendTransaction");
      const isWalletNamespaceSupported = supportsWalletNamespace2.get(client.uid);
      const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
      const hash3 = await (async () => {
        try {
          return await client.request({
            method,
            params: [request]
          }, { retryCount: 0 });
        } catch (e) {
          if (isWalletNamespaceSupported === false)
            throw e;
          const error = e;
          if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") {
            return await client.request({
              method: "wallet_sendTransaction",
              params: [request]
            }, { retryCount: 0 }).then((hash4) => {
              supportsWalletNamespace2.set(client.uid, true);
              return hash4;
            }).catch((e2) => {
              const walletNamespaceError = e2;
              if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
                supportsWalletNamespace2.set(client.uid, false);
                throw error;
              }
              throw walletNamespaceError;
            });
          }
          throw error;
        }
      })();
      const receipt = await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({
        checkReplacement: false,
        hash: hash3,
        pollingInterval,
        timeout
      });
      if (throwOnReceiptRevert && receipt.status === "reverted")
        throw new TransactionReceiptRevertedError({ receipt });
      return receipt;
    }
    if (account?.type === "local") {
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager: account.nonceManager,
        parameters: [...defaultParameters, "sidecars"],
        type,
        value,
        ...rest,
        to
      });
      const serializer = chain?.serializers?.transaction;
      const serializedTransaction = await account.signTransaction(request, {
        serializer
      });
      return await getAction(client, sendRawTransactionSync, "sendRawTransactionSync")({
        serializedTransaction,
        throwOnReceiptRevert
      });
    }
    if (account?.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/actions/wallet/sendTransactionSync",
      type: account?.type
    });
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || undefined
    });
  }
}
var supportsWalletNamespace2;
var init_sendTransactionSync = __esm(() => {
  init_account();
  init_base();
  init_transaction();
  init_recoverAuthorizationAddress();
  init_assertCurrentChain();
  init_getTransactionError();
  init_transactionRequest();
  init_lru();
  init_assertRequest();
  init_getChainId();
  init_waitForTransactionReceipt();
  init_prepareTransactionRequest();
  init_sendRawTransactionSync();
  supportsWalletNamespace2 = new LruMap(128);
});

// node_modules/viem/_esm/actions/wallet/showCallsStatus.js
async function showCallsStatus(client, parameters) {
  const { id } = parameters;
  await client.request({
    method: "wallet_showCallsStatus",
    params: [id]
  });
  return;
}

// node_modules/viem/_esm/actions/wallet/signAuthorization.js
async function signAuthorization(client, parameters) {
  const { account: account_ = client.account } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/eip7702/signAuthorization"
    });
  const account = parseAccount(account_);
  if (!account.signAuthorization)
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/eip7702/signAuthorization",
      metaMessages: [
        "The `signAuthorization` Action does not support JSON-RPC Accounts."
      ],
      type: account.type
    });
  const authorization = await prepareAuthorization(client, parameters);
  return account.signAuthorization(authorization);
}
var init_signAuthorization = __esm(() => {
  init_account();
  init_prepareAuthorization();
});

// node_modules/viem/_esm/actions/wallet/signMessage.js
async function signMessage(client, { account: account_ = client.account, message }) {
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signMessage"
    });
  const account = parseAccount(account_);
  if (account.signMessage)
    return account.signMessage({ message });
  const message_ = (() => {
    if (typeof message === "string")
      return stringToHex(message);
    if (message.raw instanceof Uint8Array)
      return toHex(message.raw);
    return message.raw;
  })();
  return client.request({
    method: "personal_sign",
    params: [message_, account.address]
  }, { retryCount: 0 });
}
var init_signMessage = __esm(() => {
  init_account();
  init_toHex();
});

// node_modules/viem/_esm/actions/wallet/signTransaction.js
async function signTransaction(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, ...transaction } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTransaction"
    });
  const account = parseAccount(account_);
  assertRequest({
    account,
    ...parameters
  });
  const chainId = await getAction(client, getChainId, "getChainId")({});
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain
    });
  const formatters = chain?.formatters || client.chain?.formatters;
  const format = formatters?.transactionRequest?.format || formatTransactionRequest;
  if (account.signTransaction)
    return account.signTransaction({
      ...transaction,
      chainId
    }, { serializer: client.chain?.serializers?.transaction });
  return await client.request({
    method: "eth_signTransaction",
    params: [
      {
        ...format({
          ...transaction,
          account
        }, "signTransaction"),
        chainId: numberToHex(chainId),
        from: account.address
      }
    ]
  }, { retryCount: 0 });
}
var init_signTransaction = __esm(() => {
  init_account();
  init_assertCurrentChain();
  init_toHex();
  init_transactionRequest();
  init_assertRequest();
  init_getChainId();
});

// node_modules/viem/_esm/actions/wallet/signTypedData.js
async function signTypedData(client, parameters) {
  const { account: account_ = client.account, domain, message, primaryType } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTypedData"
    });
  const account = parseAccount(account_);
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({ domain, message, primaryType, types });
  if (account.signTypedData)
    return account.signTypedData({ domain, message, primaryType, types });
  const typedData = serializeTypedData({ domain, message, primaryType, types });
  return client.request({
    method: "eth_signTypedData_v4",
    params: [account.address, typedData]
  }, { retryCount: 0 });
}
var init_signTypedData = __esm(() => {
  init_account();
  init_typedData2();
});

// node_modules/viem/_esm/actions/wallet/switchChain.js
async function switchChain(client, { id }) {
  await client.request({
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: numberToHex(id)
      }
    ]
  }, { retryCount: 0 });
}
var init_switchChain = __esm(() => {
  init_toHex();
});

// node_modules/viem/_esm/actions/wallet/watchAsset.js
async function watchAsset(client, params) {
  const added = await client.request({
    method: "wallet_watchAsset",
    params
  }, { retryCount: 0 });
  return added;
}

// node_modules/viem/_esm/actions/wallet/writeContractSync.js
async function writeContractSync(client, parameters) {
  return writeContract.internal(client, sendTransactionSync, "sendTransactionSync", parameters);
}
var init_writeContractSync = __esm(() => {
  init_sendTransactionSync();
  init_writeContract();
});

// node_modules/viem/_esm/clients/decorators/wallet.js
function walletActions(client) {
  return {
    addChain: (args) => addChain(client, args),
    deployContract: (args) => deployContract(client, args),
    getAddresses: () => getAddresses(client),
    getCallsStatus: (args) => getCallsStatus(client, args),
    getCapabilities: (args) => getCapabilities(client, args),
    getChainId: () => getChainId(client),
    getPermissions: () => getPermissions(client),
    prepareAuthorization: (args) => prepareAuthorization(client, args),
    prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
    requestAddresses: () => requestAddresses(client),
    requestPermissions: (args) => requestPermissions(client, args),
    sendCalls: (args) => sendCalls(client, args),
    sendCallsSync: (args) => sendCallsSync(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
    sendTransaction: (args) => sendTransaction(client, args),
    sendTransactionSync: (args) => sendTransactionSync(client, args),
    showCallsStatus: (args) => showCallsStatus(client, args),
    signAuthorization: (args) => signAuthorization(client, args),
    signMessage: (args) => signMessage(client, args),
    signTransaction: (args) => signTransaction(client, args),
    signTypedData: (args) => signTypedData(client, args),
    switchChain: (args) => switchChain(client, args),
    waitForCallsStatus: (args) => waitForCallsStatus(client, args),
    watchAsset: (args) => watchAsset(client, args),
    writeContract: (args) => writeContract(client, args),
    writeContractSync: (args) => writeContractSync(client, args)
  };
}
var init_wallet = __esm(() => {
  init_getChainId();
  init_addChain();
  init_deployContract();
  init_getAddresses();
  init_getCallsStatus();
  init_getCapabilities();
  init_prepareAuthorization();
  init_prepareTransactionRequest();
  init_requestAddresses();
  init_sendCalls();
  init_sendCallsSync();
  init_sendRawTransactionSync();
  init_sendTransaction();
  init_sendTransactionSync();
  init_signAuthorization();
  init_signMessage();
  init_signTransaction();
  init_signTypedData();
  init_switchChain();
  init_waitForCallsStatus();
  init_writeContract();
  init_writeContractSync();
});

// node_modules/viem/_esm/clients/createWalletClient.js
function createWalletClient(parameters) {
  const { key = "wallet", name = "Wallet Client", transport } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    transport,
    type: "walletClient"
  });
  return client.extend(walletActions);
}
var init_createWalletClient = __esm(() => {
  init_createClient();
  init_wallet();
});

// node_modules/viem/_esm/clients/transports/createTransport.js
function createTransport({ key, methods, name, request, retryCount = 3, retryDelay = 150, timeout, type }, value) {
  const uid2 = uid();
  return {
    config: {
      key,
      methods,
      name,
      request,
      retryCount,
      retryDelay,
      timeout,
      type
    },
    request: buildRequest(request, { methods, retryCount, retryDelay, uid: uid2 }),
    value
  };
}
var init_createTransport = __esm(() => {
  init_buildRequest();
  init_uid();
});

// node_modules/viem/_esm/errors/transport.js
var UrlRequiredError;
var init_transport = __esm(() => {
  init_base();
  UrlRequiredError = class UrlRequiredError extends BaseError2 {
    constructor() {
      super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", {
        docsPath: "/docs/clients/intro",
        name: "UrlRequiredError"
      });
    }
  };
});

// node_modules/viem/_esm/clients/transports/http.js
function http(url, config = {}) {
  const { batch, fetchFn, fetchOptions, key = "http", methods, name = "HTTP JSON-RPC", onFetchRequest, onFetchResponse, retryDelay, raw } = config;
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const { batchSize = 1000, wait: wait2 = 0 } = typeof batch === "object" ? batch : {};
    const retryCount = config.retryCount ?? retryCount_;
    const timeout = timeout_ ?? config.timeout ?? 1e4;
    const url_ = url || chain?.rpcUrls.default.http[0];
    if (!url_)
      throw new UrlRequiredError;
    const rpcClient = getHttpRpcClient(url_, {
      fetchFn,
      fetchOptions,
      onRequest: onFetchRequest,
      onResponse: onFetchResponse,
      timeout
    });
    return createTransport({
      key,
      methods,
      name,
      async request({ method, params }) {
        const body = { method, params };
        const { schedule } = createBatchScheduler({
          id: url_,
          wait: wait2,
          shouldSplitBatch(requests) {
            return requests.length > batchSize;
          },
          fn: (body2) => rpcClient.request({
            body: body2
          }),
          sort: (a, b) => a.id - b.id
        });
        const fn = async (body2) => batch ? schedule(body2) : [
          await rpcClient.request({
            body: body2
          })
        ];
        const [{ error, result }] = await fn(body);
        if (raw)
          return { error, result };
        if (error)
          throw new RpcRequestError({
            body,
            error,
            url: url_
          });
        return result;
      },
      retryCount,
      retryDelay,
      timeout,
      type: "http"
    }, {
      fetchOptions,
      url: url_
    });
  };
}
var init_http2 = __esm(() => {
  init_request();
  init_transport();
  init_createBatchScheduler();
  init_http();
  init_createTransport();
});

// node_modules/viem/_esm/index.js
var init__esm = __esm(() => {
  init_createPublicClient();
  init_createWalletClient();
  init_http2();
  init_formatEther();
  init_parseEther();
});

// node_modules/viem/_esm/accounts/toAccount.js
function toAccount(source) {
  if (typeof source === "string") {
    if (!isAddress(source, { strict: false }))
      throw new InvalidAddressError({ address: source });
    return {
      address: source,
      type: "json-rpc"
    };
  }
  if (!isAddress(source.address, { strict: false }))
    throw new InvalidAddressError({ address: source.address });
  return {
    address: source.address,
    nonceManager: source.nonceManager,
    sign: source.sign,
    signAuthorization: source.signAuthorization,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    source: "custom",
    type: "local"
  };
}
var init_toAccount = __esm(() => {
  init_address();
  init_isAddress();
});

// node_modules/viem/_esm/accounts/utils/sign.js
async function sign({ hash: hash3, privateKey, to = "object" }) {
  const { r, s, recovery } = secp256k1.sign(hash3.slice(2), privateKey.slice(2), {
    lowS: true,
    extraEntropy: isHex(extraEntropy, { strict: false }) ? hexToBytes(extraEntropy) : extraEntropy
  });
  const signature = {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v: recovery ? 28n : 27n,
    yParity: recovery
  };
  return (() => {
    if (to === "bytes" || to === "hex")
      return serializeSignature({ ...signature, to });
    return signature;
  })();
}
var extraEntropy = false;
var init_sign = __esm(() => {
  init_secp256k1();
  init_toBytes();
  init_toHex();
  init_serializeSignature();
});

// node_modules/viem/_esm/accounts/utils/signAuthorization.js
async function signAuthorization2(parameters) {
  const { chainId, nonce, privateKey, to = "object" } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const signature = await sign({
    hash: hashAuthorization({ address, chainId, nonce }),
    privateKey,
    to
  });
  if (to === "object")
    return {
      address,
      chainId,
      nonce,
      ...signature
    };
  return signature;
}
var init_signAuthorization2 = __esm(() => {
  init_hashAuthorization();
  init_sign();
});

// node_modules/viem/_esm/accounts/utils/signMessage.js
async function signMessage2({ message, privateKey }) {
  return await sign({ hash: hashMessage(message), privateKey, to: "hex" });
}
var init_signMessage2 = __esm(() => {
  init_hashMessage();
  init_sign();
});

// node_modules/viem/_esm/accounts/utils/signTransaction.js
async function signTransaction2(parameters) {
  const { privateKey, transaction, serializer = serializeTransaction } = parameters;
  const signableTransaction = (() => {
    if (transaction.type === "eip4844")
      return {
        ...transaction,
        sidecars: false
      };
    return transaction;
  })();
  const signature = await sign({
    hash: keccak256(await serializer(signableTransaction)),
    privateKey
  });
  return await serializer(transaction, signature);
}
var init_signTransaction2 = __esm(() => {
  init_keccak256();
  init_serializeTransaction();
  init_sign();
});

// node_modules/viem/_esm/accounts/utils/signTypedData.js
async function signTypedData2(parameters) {
  const { privateKey, ...typedData } = parameters;
  return await sign({
    hash: hashTypedData(typedData),
    privateKey,
    to: "hex"
  });
}
var init_signTypedData2 = __esm(() => {
  init_hashTypedData();
  init_sign();
});

// node_modules/viem/_esm/accounts/privateKeyToAccount.js
function privateKeyToAccount(privateKey, options = {}) {
  const { nonceManager } = options;
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false));
  const address = publicKeyToAddress(publicKey);
  const account = toAccount({
    address,
    nonceManager,
    async sign({ hash: hash3 }) {
      return sign({ hash: hash3, privateKey, to: "hex" });
    },
    async signAuthorization(authorization) {
      return signAuthorization2({ ...authorization, privateKey });
    },
    async signMessage({ message }) {
      return signMessage2({ message, privateKey });
    },
    async signTransaction(transaction, { serializer } = {}) {
      return signTransaction2({ privateKey, transaction, serializer });
    },
    async signTypedData(typedData) {
      return signTypedData2({ ...typedData, privateKey });
    }
  });
  return {
    ...account,
    publicKey,
    source: "privateKey"
  };
}
var init_privateKeyToAccount = __esm(() => {
  init_secp256k1();
  init_toHex();
  init_toAccount();
  init_publicKeyToAddress();
  init_sign();
  init_signAuthorization2();
  init_signMessage2();
  init_signTransaction2();
  init_signTypedData2();
});

// node_modules/viem/_esm/accounts/index.js
var init_accounts = __esm(() => {
  init_privateKeyToAccount();
});

// node_modules/viem/_esm/chains/definitions/sepolia.js
var sepolia;
var init_sepolia = __esm(() => {
  sepolia = /* @__PURE__ */ defineChain({
    id: 11155111,
    name: "Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://11155111.rpc.thirdweb.com"]
      }
    },
    blockExplorers: {
      default: {
        name: "Etherscan",
        url: "https://sepolia.etherscan.io",
        apiUrl: "https://api-sepolia.etherscan.io/api"
      }
    },
    contracts: {
      multicall3: {
        address: "0xca11bde05977b3631167028862be2a173976ca11",
        blockCreated: 751532
      },
      ensUniversalResolver: {
        address: "0xeeeeeeee14d718c2b47d9923deab1335e144eeee",
        blockCreated: 8928790
      }
    },
    testnet: true
  });
});

// node_modules/viem/_esm/chains/index.js
var init_chains = __esm(() => {
  init_sepolia();
});

// src/nft-service.ts
var exports_nft_service = {};
__export(exports_nft_service, {
  analyzeNFTError: () => analyzeNFTError,
  NFTService: () => NFTService
});
import { logger as logger3 } from "@elizaos/core";
function analyzeNFTError(error, operation) {
  const errorMessage = error.message || String(error);
  const errorString = errorMessage.toLowerCase();
  logger3.info({ errorMessage, operation }, "Analyzing NFT error");
  if (errorMessage.includes("0x177e802f") || errorMessage.includes("ERC721InsufficientApproval") || errorMessage.includes("insufficient approval") || errorMessage.includes("caller is not token owner or approved") || errorMessage.includes("not authorized") || errorMessage.includes("未授权")) {
    return {
      errorType: "授权错误",
      reason: "NFT 未授权给相应的合约。ERC721 标准要求在进行转账或操作前，必须先授权合约。",
      suggestion: `1. 确认您是该 NFT 的所有者
2. 先执行授权操作，授权对应的合约地址
3. 等待授权交易确认后（通常需要 1-2 个区块），再重试当前操作`,
      userFriendlyMessage: `❌ ${operation}失败：授权不足

原因：该 NFT 尚未授权给合约，无法进行操作。

解决方案：
1. 请先授权该 NFT 给对应的合约
2. 等待授权交易确认（约 1-2 个区块时间）
3. 然后重新尝试${operation}操作

提示：授权只需要执行一次，授权后即可进行后续操作。`
    };
  }
  if (errorMessage.includes("Not the owner") || errorMessage.includes("not owner") || errorMessage.includes("OwnableUnauthorizedAccount") || errorMessage.includes("不是该 NFT 的所有者") || errorMessage.includes("不是所有者")) {
    return {
      errorType: "所有权错误",
      reason: "您不是该 NFT 的所有者，无法进行操作。",
      suggestion: "请确认您拥有该 NFT，可以通过查询您的 NFT 列表来验证。",
      userFriendlyMessage: `❌ ${operation}失败：权限不足

原因：您不是该 NFT 的所有者，无法进行此操作。

解决方案：
1. 确认您输入的 Token ID 是否正确
2. 检查该 NFT 是否在您的钱包中
3. 如果 NFT 已转移，请使用正确的 Token ID`
    };
  }
  if (errorMessage.includes("insufficient funds") || errorMessage.includes("余额不足") || errorMessage.includes("Insufficient balance") || errorMessage.includes("balance too low")) {
    return {
      errorType: "余额不足",
      reason: "账户余额不足以支付 gas 费用或交易金额。",
      suggestion: "请向账户充值足够的 ETH 以支付 gas 费用和交易金额。",
      userFriendlyMessage: `❌ ${operation}失败：余额不足

原因：您的账户余额不足以完成此操作（包括 gas 费用）。

解决方案：
1. 检查当前账户余额
2. 确保有足够的 ETH 支付交易费用（建议至少 0.01 ETH）
3. 如果是 Sepolia 测试网，可以从水龙头获取测试币`
    };
  }
  if (errorMessage.includes("already listed") || errorMessage.includes("already staked") || errorMessage.includes("Already staked") || errorMessage.includes("已经上架") || errorMessage.includes("已经质押") || errorMessage.includes("已上架")) {
    return {
      errorType: "状态错误",
      reason: "该 NFT 已经处于操作状态（已上架或已质押）。",
      suggestion: "请先取消上架或解除质押，然后再进行操作。",
      userFriendlyMessage: `❌ ${operation}失败：NFT 状态冲突

原因：该 NFT 当前已经上架/质押，无法重复操作。

解决方案：
1. 如果您想重新操作，请先取消当前状态
2. 等待状态更新后，再执行新的操作`
    };
  }
  if (errorMessage.includes("Invalid tokenId") || errorMessage.includes("Token does not exist") || errorMessage.includes("NFT not found") || errorMessage.includes("无效") || errorMessage.includes("不存在")) {
    return {
      errorType: "参数错误",
      reason: "提供的 Token ID 无效或 NFT 不存在。",
      suggestion: "请检查 Token ID 是否正确，确保该 NFT 存在。",
      userFriendlyMessage: `❌ ${operation}失败：参数错误

原因：提供的 Token ID 无效或该 NFT 不存在。

解决方案：
1. 检查 Token ID 是否正确
2. 确认该 NFT 是否已铸造
3. 使用正确的数字格式（如：1、2、3 等）`
    };
  }
  if (errorMessage.includes("Invalid price") || errorMessage.includes("价格无效") || errorMessage.includes("Price too low") || errorMessage.includes("价格过低")) {
    return {
      errorType: "价格错误",
      reason: "提供的价格无效或过低。",
      suggestion: "请提供有效的价格（必须大于 0）。",
      userFriendlyMessage: `❌ ${operation}失败：价格无效

原因：提供的价格格式错误或数值无效。

解决方案：
1. 确保价格是大于 0 的数字
2. 使用正确的格式（如：0.1、1.5 等）
3. 价格单位为 ETH`
    };
  }
  if (errorMessage.includes("gas") || errorMessage.includes("Gas") || errorMessage.includes("revert") || errorMessage.includes("execution reverted")) {
    return {
      errorType: "交易执行错误",
      reason: "交易执行被回滚，可能是合约逻辑检查失败。",
      suggestion: "请检查操作参数是否满足合约要求，或稍后重试。",
      userFriendlyMessage: `❌ ${operation}失败：交易执行被回滚

原因：合约执行时检查失败，操作不符合合约规则。

可能的原因：
1. NFT 状态不符合要求（已上架、已质押等）
2. 参数不满足合约条件
3. 网络拥堵导致交易失败

解决方案：
1. 检查 NFT 当前状态
2. 确认操作参数正确
3. 等待片刻后重试`
    };
  }
  if (errorMessage.includes("network") || errorMessage.includes("Network") || errorMessage.includes("timeout") || errorMessage.includes("connection")) {
    return {
      errorType: "网络错误",
      reason: "网络连接问题导致操作失败。",
      suggestion: "请检查网络连接，稍后重试。",
      userFriendlyMessage: `❌ ${operation}失败：网络连接问题

原因：无法连接到区块链网络。

解决方案：
1. 检查网络连接
2. 确认 RPC 端点可用
3. 稍后重试`
    };
  }
  return {
    errorType: "未知错误",
    reason: errorMessage || "操作失败，原因未知",
    suggestion: "请检查操作参数和网络状态，或联系技术支持。",
    userFriendlyMessage: `❌ ${operation}失败

错误信息：${errorMessage}

建议：
1. 检查操作参数是否正确
2. 确认网络连接正常
3. 查看上述错误信息以获取更多线索
4. 如果问题持续，请稍后重试`
  };
}

class NFTService {
  privateKey;
  walletClient;
  publicClient;
  constructor(privateKey) {
    this.privateKey = privateKey || process.env.EVM_PRIVATE_KEY || "";
    if (!this.privateKey) {
      throw new Error("未配置钱包私钥，请设置 EVM_PRIVATE_KEY 环境变量");
    }
    this.walletClient = createWalletClientWithRetry(this.privateKey);
    this.publicClient = createPublicClientWithRetry();
  }
  async mintNFT(toAddress) {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("无法获取账户信息");
    }
    const recipient = toAddress || account.address;
    const hash3 = await this.walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: TEST_NFT_ABI,
      functionName: "mint",
      args: [recipient]
    });
    return hash3;
  }
  async checkIsOwner(userAddress) {
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: TEST_NFT_ABI,
      functionName: "owner",
      args: []
    });
    return owner.toLowerCase() === userAddress.toLowerCase();
  }
  async approveMarketplace(tokenId) {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("无法获取账户信息");
    }
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)]
    });
    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("您不是该 NFT 的所有者，无法进行授权");
    }
    const hash3 = await this.walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "approve",
      args: [NFT_MARKETPLACE_ADDRESS, BigInt(tokenId)]
    });
    return hash3;
  }
  async checkMarketplaceApproval(tokenId) {
    const account = this.walletClient.account;
    if (!account) {
      return false;
    }
    try {
      const isApprovedForAll = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "isApprovedForAll",
        args: [account.address, NFT_MARKETPLACE_ADDRESS]
      });
      if (isApprovedForAll) {
        return true;
      }
      const approvedAddress = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "getApproved",
        args: [BigInt(tokenId)]
      });
      return approvedAddress.toLowerCase() === NFT_MARKETPLACE_ADDRESS.toLowerCase();
    } catch (error) {
      logger3.error({ error }, "检查授权状态失败");
      return false;
    }
  }
  async listNFT(tokenId, price, autoApprove = true) {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("无法获取账户信息");
    }
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)]
    });
    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("您不是该 NFT 的所有者，无法上架");
    }
    const isApproved = await this.checkMarketplaceApproval(tokenId);
    if (!isApproved && autoApprove) {
      logger3.info(`NFT ${tokenId} 未授权，自动进行授权...`);
      await this.approveMarketplace(tokenId);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else if (!isApproved) {
      throw new Error("请先授权市场合约才能上架 NFT。您可以先授权，然后再尝试上架。");
    }
    const value = parseEther(price);
    const hash3 = await this.walletClient.writeContract({
      address: NFT_MARKETPLACE_ADDRESS,
      abi: NFT_MARKETPLACE_ABI,
      functionName: "listNFT",
      args: [BigInt(tokenId), value]
    });
    return hash3;
  }
  async buyNFT(tokenId, price) {
    const listing = await this.getListing(tokenId);
    if (!listing) {
      throw new Error("该 NFT 未上架或已被售出");
    }
    const paymentAmount = price ? parseEther(price) : parseEther(listing.price);
    const listingPrice = parseEther(listing.price);
    if (paymentAmount < listingPrice) {
      throw new Error(`支付金额不足！该 NFT 的价格是 ${listing.price} ETH`);
    }
    const hash3 = await this.walletClient.writeContract({
      address: NFT_MARKETPLACE_ADDRESS,
      abi: NFT_MARKETPLACE_ABI,
      functionName: "buyNFT",
      args: [BigInt(tokenId)],
      value: paymentAmount
    });
    return hash3;
  }
  async getListing(tokenId) {
    try {
      const result = await this.publicClient.readContract({
        address: NFT_MARKETPLACE_ADDRESS,
        abi: NFT_MARKETPLACE_ABI,
        functionName: "getListing",
        args: [BigInt(tokenId)]
      });
      if (!result[2]) {
        return null;
      }
      return {
        seller: result[0],
        price: formatEther(result[1]),
        active: result[2]
      };
    } catch (error) {
      return null;
    }
  }
  async checkStakingApproval(tokenId) {
    const account = this.walletClient.account;
    if (!account) {
      return false;
    }
    try {
      const isApprovedForAll = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "isApprovedForAll",
        args: [account.address, NFT_STAKING_ADDRESS]
      });
      if (isApprovedForAll) {
        return true;
      }
      const approvedAddress = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "getApproved",
        args: [BigInt(tokenId)]
      });
      return approvedAddress.toLowerCase() === NFT_STAKING_ADDRESS.toLowerCase();
    } catch (error) {
      logger3.error({ error }, "检查质押授权状态失败");
      return false;
    }
  }
  async approveStaking(tokenId) {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("无法获取账户信息");
    }
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)]
    });
    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("您不是该 NFT 的所有者，无法进行授权");
    }
    const hash3 = await this.walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "approve",
      args: [NFT_STAKING_ADDRESS, BigInt(tokenId)]
    });
    return hash3;
  }
  async stakeNFT(tokenId, autoApprove = true) {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("无法获取账户信息");
    }
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)]
    });
    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("您不是该 NFT 的所有者，无法质押");
    }
    const isApproved = await this.checkStakingApproval(tokenId);
    if (!isApproved && autoApprove) {
      logger3.info(`NFT ${tokenId} 未授权质押合约，自动进行授权...`);
      await this.approveStaking(tokenId);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else if (!isApproved) {
      throw new Error("请先授权质押合约才能质押 NFT。您可以先授权，然后再尝试质押。");
    }
    const hash3 = await this.walletClient.writeContract({
      address: NFT_STAKING_ADDRESS,
      abi: NFT_STAKING_ABI,
      functionName: "stakeNFT",
      args: [BigInt(tokenId)]
    });
    return hash3;
  }
  async unstakeNFT(tokenId) {
    const hash3 = await this.walletClient.writeContract({
      address: NFT_STAKING_ADDRESS,
      abi: NFT_STAKING_ABI,
      functionName: "unstakeNFT",
      args: [BigInt(tokenId)]
    });
    return hash3;
  }
  async getStakingInfo(tokenId) {
    try {
      const result = await this.publicClient.readContract({
        address: NFT_STAKING_ADDRESS,
        abi: NFT_STAKING_ABI,
        functionName: "getStakingInfo",
        args: [BigInt(tokenId)]
      });
      if (!result[0] || result[0] === "0x0000000000000000000000000000000000000000") {
        return null;
      }
      return {
        staker: result[0],
        startTime: Number(result[1]),
        rewards: formatEther(result[2])
      };
    } catch (error) {
      return null;
    }
  }
  async checkLoanApproval(tokenId) {
    const account = this.walletClient.account;
    if (!account) {
      return false;
    }
    try {
      const isApprovedForAll = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "isApprovedForAll",
        args: [account.address, NFT_LOAN_ADDRESS]
      });
      if (isApprovedForAll) {
        return true;
      }
      const approvedAddress = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "getApproved",
        args: [BigInt(tokenId)]
      });
      return approvedAddress.toLowerCase() === NFT_LOAN_ADDRESS.toLowerCase();
    } catch (error) {
      logger3.error({ error }, "检查借贷授权状态失败");
      return false;
    }
  }
  async approveLoan(tokenId) {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("无法获取账户信息");
    }
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)]
    });
    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("您不是该 NFT 的所有者，无法进行授权");
    }
    const hash3 = await this.walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "approve",
      args: [NFT_LOAN_ADDRESS, BigInt(tokenId)]
    });
    return hash3;
  }
  async createLoan(tokenId, loanAmount, durationDays, autoApprove = true) {
    if (durationDays < 7 || durationDays > 365) {
      throw new Error("借贷期限必须在 7-365 天之间");
    }
    const account = this.walletClient.account;
    if (!account) {
      throw new Error("无法获取账户信息");
    }
    const owner = await this.publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)]
    });
    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("您不是该 NFT 的所有者，无法创建借贷");
    }
    const isApproved = await this.checkLoanApproval(tokenId);
    if (!isApproved && autoApprove) {
      logger3.info(`NFT ${tokenId} 未授权借贷合约，自动进行授权...`);
      await this.approveLoan(tokenId);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else if (!isApproved) {
      throw new Error("请先授权借贷合约才能创建借贷。您可以先授权，然后再尝试创建借贷。");
    }
    const amount = parseEther(loanAmount);
    const durationInSeconds = durationDays * 24 * 60 * 60;
    const hash3 = await this.walletClient.writeContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: "createLoan",
      args: [BigInt(tokenId), amount, BigInt(durationInSeconds)]
    });
    return hash3;
  }
  async fulfillLoan(loanId) {
    const loanData = await this.publicClient.readContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: "loans",
      args: [BigInt(loanId)]
    });
    const loanAmount = loanData[3];
    const lender = loanData[1];
    if (lender && lender !== "0x0000000000000000000000000000000000000000") {
      throw new Error("该借贷已有贷款人出资");
    }
    const hash3 = await this.walletClient.writeContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: "fulfillLoan",
      args: [BigInt(loanId)],
      value: loanAmount
    });
    return hash3;
  }
  async repayLoan(loanId) {
    const loanData = await this.publicClient.readContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: "loans",
      args: [BigInt(loanId)]
    });
    const repaymentAmount = loanData[7];
    const hash3 = await this.walletClient.writeContract({
      address: NFT_LOAN_ADDRESS,
      abi: NFT_LOAN_ABI,
      functionName: "repayLoan",
      args: [BigInt(loanId)],
      value: repaymentAmount
    });
    return hash3;
  }
  async getLoanInfo(loanId) {
    try {
      const loanData = await this.publicClient.readContract({
        address: NFT_LOAN_ADDRESS,
        abi: NFT_LOAN_ABI,
        functionName: "loans",
        args: [BigInt(loanId)]
      });
      if (!loanData[0] || loanData[0] === "0x0000000000000000000000000000000000000000") {
        return null;
      }
      return {
        borrower: loanData[0],
        lender: loanData[1],
        loanAmount: formatEther(loanData[3]),
        dueDate: Number(loanData[6]),
        repaid: loanData[9],
        repaymentAmount: formatEther(loanData[7])
      };
    } catch (error) {
      return null;
    }
  }
}
var NFT_MARKETPLACE_ADDRESS, NFT_STAKING_ADDRESS, NFT_LOAN_ADDRESS, NFT_CONTRACT_ADDRESS, RPC_ENDPOINTS, currentRpcIndex = 0, getCurrentRpcUrl = () => {
  return RPC_ENDPOINTS[currentRpcIndex] || RPC_ENDPOINTS[0] || "https://rpc.sepolia.org";
}, switchToNextRpc = () => {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
  return getCurrentRpcUrl();
}, createPublicClientWithRetry = () => {
  const createClient2 = (rpcUrl) => {
    return createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl, { retryCount: 3, retryDelay: 1000 })
    });
  };
  let client = createClient2(getCurrentRpcUrl());
  const proxyClient = new Proxy(client, {
    get(target, prop) {
      const originalMethod = target[prop];
      if (typeof originalMethod === "function") {
        return async (...args) => {
          let lastError;
          let attempts = 0;
          const maxAttempts = Math.min(3, RPC_ENDPOINTS.length);
          while (attempts < maxAttempts) {
            try {
              return await originalMethod.apply(target, args);
            } catch (error) {
              lastError = error;
              if (error?.message?.includes("429") || error?.status === 429 || error?.cause?.status === 429) {
                if (attempts < maxAttempts - 1) {
                  const newRpcUrl = switchToNextRpc();
                  client = createClient2(newRpcUrl);
                  target = client;
                  attempts++;
                  await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
                  continue;
                }
              }
              throw error;
            }
          }
          throw lastError;
        };
      }
      return originalMethod;
    }
  });
  return proxyClient;
}, createWalletClientWithRetry = (privateKey) => {
  if (!privateKey) {
    throw new Error("请配置钱包私钥 EVM_PRIVATE_KEY");
  }
  const account = privateKeyToAccount(privateKey.trim());
  const createClient2 = (rpcUrl) => {
    return createWalletClient({
      account,
      chain: sepolia,
      transport: http(rpcUrl, { retryCount: 3, retryDelay: 1000 })
    });
  };
  let client = createClient2(getCurrentRpcUrl());
  const proxyClient = new Proxy(client, {
    get(target, prop) {
      const originalMethod = target[prop];
      if (typeof originalMethod === "function") {
        return async (...args) => {
          let lastError;
          let attempts = 0;
          const maxAttempts = Math.min(3, RPC_ENDPOINTS.length);
          while (attempts < maxAttempts) {
            try {
              return await originalMethod.apply(target, args);
            } catch (error) {
              lastError = error;
              if (error?.message?.includes("429") || error?.status === 429 || error?.cause?.status === 429) {
                if (attempts < maxAttempts - 1) {
                  const newRpcUrl = switchToNextRpc();
                  client = createClient2(newRpcUrl);
                  target = client;
                  attempts++;
                  await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
                  continue;
                }
              }
              throw error;
            }
          }
          throw lastError;
        };
      }
      return originalMethod;
    }
  });
  return proxyClient;
}, NFT_MARKETPLACE_ABI, NFT_STAKING_ABI, NFT_LOAN_ABI, TEST_NFT_ABI, ERC721_ABI;
var init_nft_service = __esm(() => {
  init__esm();
  init_accounts();
  init_chains();
  NFT_MARKETPLACE_ADDRESS = process.env.NFT_MARKETPLACE_ADDRESS || "0x96D1227aCD29057607601Afdf16BF853D5B58203";
  NFT_STAKING_ADDRESS = process.env.NFT_STAKING_ADDRESS || "0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9";
  NFT_LOAN_ADDRESS = process.env.NFT_LOAN_ADDRESS || "0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1";
  NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330";
  RPC_ENDPOINTS = [
    process.env.SEPOLIA_RPC_URL,
    "https://rpc.sepolia.org",
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://sepolia.gateway.tenderly.co"
  ].filter(Boolean);
  NFT_MARKETPLACE_ABI = [
    {
      inputs: [{ name: "tokenId", type: "uint256" }, { name: "price", type: "uint256" }],
      name: "listNFT",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "cancelListing",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "buyNFT",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "getListing",
      outputs: [{ name: "seller", type: "address" }, { name: "price", type: "uint256" }, { name: "active", type: "bool" }],
      stateMutability: "view",
      type: "function"
    }
  ];
  NFT_STAKING_ABI = [
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "stakeNFT",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "unstakeNFT",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "getStakingInfo",
      outputs: [{ name: "staker", type: "address" }, { name: "startTime", type: "uint256" }, { name: "rewards", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    }
  ];
  NFT_LOAN_ABI = [
    {
      inputs: [{ name: "tokenId", type: "uint256" }, { name: "loanAmount", type: "uint256" }, { name: "duration", type: "uint256" }],
      name: "createLoan",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "loanId", type: "uint256" }],
      name: "fulfillLoan",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [{ name: "loanId", type: "uint256" }],
      name: "repayLoan",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [{ name: "loanId", type: "uint256" }],
      name: "loans",
      outputs: [
        { name: "borrower", type: "address" },
        { name: "lender", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "loanAmount", type: "uint256" },
        { name: "interestRate", type: "uint256" },
        { name: "startTime", type: "uint256" },
        { name: "dueDate", type: "uint256" },
        { name: "repaymentAmount", type: "uint256" },
        { name: "active", type: "bool" },
        { name: "repaid", type: "bool" }
      ],
      stateMutability: "view",
      type: "function"
    }
  ];
  TEST_NFT_ABI = [
    {
      inputs: [{ name: "to", type: "address" }],
      name: "mint",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
    }
  ];
  ERC721_ABI = [
    {
      inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "getApproved",
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [{ name: "owner", type: "address" }, { name: "operator", type: "address" }],
      name: "isApprovedForAll",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [{ name: "tokenId", type: "uint256" }],
      name: "ownerOf",
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
    }
  ];
});

// src/index.ts
import { logger as logger5 } from "@elizaos/core";

// src/plugin.ts
init__esm();
init_accounts();
init_chains();
import {
  ModelType,
  Service,
  logger
} from "@elizaos/core";
import { z } from "zod";
var configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z.string().min(1, "Example plugin variable is not provided").optional().transform((val) => {
    if (!val) {
      console.warn("Warning: Example plugin variable is not provided");
    }
    return val;
  })
});
var helloWorldAction = {
  name: "HELLO_WORLD",
  similes: ["GREET", "SAY_HELLO"],
  description: "Responds with a simple hello world message",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger.info("Handling HELLO_WORLD action");
      const responseContent = {
        text: "hello world!",
        actions: ["HELLO_WORLD"],
        source: message.content.source
      };
      await callback(responseContent);
      return {
        text: "Sent hello world greeting",
        values: {
          success: true,
          greeted: true
        },
        data: {
          actionName: "HELLO_WORLD",
          messageId: message.id,
          timestamp: Date.now()
        },
        success: true
      };
    } catch (error) {
      logger.error({ error }, "Error in HELLO_WORLD action:");
      return {
        text: "Failed to send hello world greeting",
        values: {
          success: false,
          error: "GREETING_FAILED"
        },
        data: {
          actionName: "HELLO_WORLD",
          error: error instanceof Error ? error.message : String(error)
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you say hello?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "hello world!",
          actions: ["HELLO_WORLD"]
        }
      }
    ]
  ]
};
var publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});
var extractAddressOrPrivateKey = (text) => {
  const addressRegex3 = /0x[a-fA-F0-9]{40}/g;
  const privateKeyRegex = /0x[a-fA-F0-9]{64}/g;
  const addressMatch = text.match(addressRegex3);
  const privateKeyMatch = text.match(privateKeyRegex);
  if (privateKeyMatch) {
    return { privateKey: privateKeyMatch[0] };
  } else if (addressMatch) {
    return { address: addressMatch[0] };
  }
  return {};
};
var helloWorldProvider = {
  name: "HELLO_WORLD_PROVIDER",
  description: "A simple example provider",
  get: async (_runtime, _message, _state) => {
    return {
      text: "I am a provider",
      values: {},
      data: {}
    };
  }
};

class StarterService extends Service {
  static serviceType = "starter";
  capabilityDescription = "This is a starter service which is attached to the agent through the starter plugin.";
  constructor(runtime) {
    super(runtime);
  }
  static async start(runtime) {
    logger.info("*** Starting starter service ***");
    const service = new StarterService(runtime);
    return service;
  }
  static async stop(runtime) {
    logger.info("*** Stopping starter service ***");
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      throw new Error("Starter service not found");
    }
    service.stop();
  }
  async stop() {
    logger.info("*** Stopping starter service instance ***");
  }
}
var plugin = {
  name: "starter",
  description: "A starter plugin for Eliza",
  priority: -1000,
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE
  },
  async init(config) {
    logger.info("*** Initializing starter plugin ***");
    try {
      const validatedConfig = await configSchema.parseAsync(config);
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value)
          process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues?.map((e) => e.message)?.join(", ") || "Unknown validation error";
        throw new Error(`Invalid plugin configuration: ${errorMessages}`);
      }
      throw new Error(`Invalid plugin configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (_runtime, { prompt, stopSequences = [] }) => {
      return "Never gonna give you up, never gonna let you down, never gonna run around and desert you...";
    },
    [ModelType.TEXT_LARGE]: async (_runtime, {
      prompt,
      stopSequences = [],
      maxTokens = 8192,
      temperature = 0.7,
      frequencyPenalty = 0.7,
      presencePenalty = 0.7
    }) => {
      return "Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...";
    }
  },
  routes: [
    {
      name: "helloworld",
      path: "/helloworld",
      type: "GET",
      handler: async (_req, res) => {
        res.json({
          message: "Hello World!"
        });
      }
    },
    {
      name: "agents-api",
      path: "/api/agents",
      type: "GET",
      handler: async (req, res) => {
        try {
          const agents = [
            {
              id: "chain-prophet",
              name: "Chain Prophet",
              bio: "专业的区块链和 DeFi 助手，能够查询钱包余额、分析交易数据，并提供区块链相关的技术支持。",
              capabilities: ["EVM 余额查询", "私钥地址推导", "区块链数据分析", "DeFi 协议支持"],
              status: "active"
            }
          ];
          res.json(agents);
        } catch (error) {
          console.error("获取 Agent 列表失败:", error);
          res.status(500).json({ error: "获取 Agent 列表失败" });
        }
      }
    },
    {
      name: "agent-detail-api",
      path: "/api/agents/:id",
      type: "GET",
      handler: async (req, res) => {
        try {
          const { id } = req.params;
          if (id === "chain-prophet") {
            const agent = {
              id: "chain-prophet",
              name: "Chain Prophet",
              bio: "专业的区块链和 DeFi 助手，能够查询钱包余额、分析交易数据，并提供区块链相关的技术支持。",
              capabilities: ["EVM 余额查询", "私钥地址推导", "区块链数据分析", "DeFi 协议支持"],
              status: "active"
            };
            res.json(agent);
          } else {
            res.status(404).json({ error: "Agent 未找到" });
          }
        } catch (error) {
          console.error("获取 Agent 信息失败:", error);
          res.status(500).json({ error: "获取 Agent 信息失败" });
        }
      }
    },
    {
      name: "evm-balance-api",
      path: "/api/evm/balance",
      type: "POST",
      handler: async (req, res) => {
        try {
          const { address, privateKey } = req.body;
          if (!address && !privateKey) {
            return res.status(400).json({
              success: false,
              error: "请提供地址或私钥"
            });
          }
          let targetAddress;
          if (privateKey) {
            try {
              const account = privateKeyToAccount(privateKey);
              targetAddress = account.address;
            } catch (error) {
              return res.status(400).json({
                success: false,
                error: "私钥格式错误"
              });
            }
          } else {
            targetAddress = address;
          }
          const addressRegex3 = /^0x[a-fA-F0-9]{40}$/;
          if (!addressRegex3.test(targetAddress)) {
            return res.status(400).json({
              success: false,
              error: "地址格式错误"
            });
          }
          const balance = await publicClient.getBalance({
            address: targetAddress
          });
          const balanceInEth = formatEther(balance);
          res.json({
            success: true,
            address: targetAddress,
            balance: balanceInEth,
            network: "Sepolia",
            wasDerivedFromPrivateKey: !!privateKey
          });
        } catch (error) {
          console.error("查询余额失败:", error);
          res.status(500).json({
            success: false,
            error: "查询余额失败: " + (error instanceof Error ? error.message : "未知错误")
          });
        }
      }
    },
    {
      name: "health-check",
      path: "/api/health",
      type: "GET",
      handler: async (req, res) => {
        res.json({
          status: "ok",
          timestamp: new Date().toISOString(),
          service: "chain-prophet-api"
        });
      }
    }
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("MESSAGE_RECEIVED event received");
        logger.info({ message: params.message }, "Received message");
        if (params.message && params.runtime) {
          try {
            const message = params.message;
            const runtime = params.runtime;
            const text = message.content?.text || "";
            const { address, privateKey } = extractAddressOrPrivateKey(text);
            if (address || privateKey) {
              logger.info({ address, privateKey }, "Processing EVM query");
            } else {
              logger.info("Processing regular conversation");
            }
          } catch (error) {
            logger.error({ error }, "Error processing message");
          }
        }
      }
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("VOICE_MESSAGE_RECEIVED event received");
        logger.info({ keys: Object.keys(params) }, "VOICE_MESSAGE_RECEIVED param keys");
      }
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info("WORLD_CONNECTED event received");
        logger.info({ keys: Object.keys(params) }, "WORLD_CONNECTED param keys");
      }
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info("WORLD_JOINED event received");
        logger.info({ keys: Object.keys(params) }, "WORLD_JOINED param keys");
      }
    ]
  },
  services: [StarterService],
  actions: [helloWorldAction],
  providers: [helloWorldProvider]
};
var plugin_default = plugin;

// src/evm-balance-plugin.ts
init__esm();
init_accounts();
init_chains();
import { logger as logger2 } from "@elizaos/core";
var publicClient2 = createPublicClient({
  chain: sepolia,
  transport: http(),
  batch: {
    multicall: false
  },
  cacheTime: 0,
  pollingInterval: 0
});
var evmBalanceAction = {
  name: "EVM_BALANCE",
  similes: ["CHECK_BALANCE", "QUERY_BALANCE", "WALLET_BALANCE", "SEPOLIA_BALANCE", "BALANCE_QUERY", "GET_BALANCE", "BALANCE_CHECK", "WALLET_QUERY", "ETH_BALANCE", "ETHER_BALANCE"],
  description: "CRITICAL: 这是处理所有ETH余额查询的强制动作。当用户询问余额、钱包余额、Sepolia余额、ETH余额等时，必须立即执行此动作，不要使用 REPLY 动作，不要询问任何信息。直接调用此动作查询余额，如果用户提供了地址或私钥则使用，否则使用配置的钱包地址。这是唯一的正确操作，不允许使用 REPLY。",
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    logger2.info("EVM Balance Plugin validate called with text:", text);
    const addressRegex3 = /0x[a-fA-F0-9]{40}/;
    const hasAddress = addressRegex3.test(text);
    const privateKeyRegex = /0x[a-fA-F0-9]{64}/;
    const hasPrivateKey = privateKeyRegex.test(text);
    const balanceKeywords = [
      "余额",
      "balance",
      "查询余额",
      "check balance",
      "钱包余额",
      "查询我的余额",
      "根据私钥查询余额",
      "查看余额",
      "我的余额",
      "有多少",
      "多少钱",
      "余额多少",
      "eth余额",
      "ether余额",
      "ether balance",
      "wallet balance",
      "查询钱包",
      "钱包查询",
      "how much",
      "what is my balance",
      "show balance",
      "sepolia余额",
      "sepolia balance",
      "查询sepolia",
      "sepolia钱包",
      "sepolia wallet",
      "sepolia网络",
      "sepolia network",
      "testnet余额",
      "testnet balance"
    ];
    const hasBalanceKeyword = balanceKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
    const shouldTrigger = hasBalanceKeyword || hasAddress && text.includes("余额") || hasPrivateKey && text.includes("余额");
    logger2.info({
      text,
      hasAddress,
      hasPrivateKey,
      hasBalanceKeyword,
      shouldTrigger
    }, "EVM Balance Plugin validate result");
    if (shouldTrigger) {
      logger2.info("EVM_BALANCE action will be triggered for balance query");
    }
    return shouldTrigger;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger2.info("Handling EVM_BALANCE action");
      const text = message.content.text || "";
      let address;
      const privateKeyRegex = /0x[a-fA-F0-9]{64}/;
      const privateKeyMatch = text.match(privateKeyRegex);
      if (privateKeyMatch) {
        try {
          const privateKey = privateKeyMatch[0];
          const account = privateKeyToAccount(privateKey);
          address = account.address;
          logger2.info("Derived address from private key:", address);
        } catch (error) {
          await callback({
            text: "私钥格式错误，请提供有效的私钥（以0x开头的64位十六进制字符串）",
            actions: ["EVM_BALANCE"],
            source: message.content.source
          });
          return {
            text: "私钥格式错误",
            values: { success: false, error: "INVALID_PRIVATE_KEY" },
            data: { actionName: "EVM_BALANCE", messageId: message.id },
            success: false
          };
        }
      } else {
        const addressRegex3 = /0x[a-fA-F0-9]{40}/;
        const addressMatch = text.match(addressRegex3);
        if (addressMatch) {
          address = addressMatch[0];
          logger2.info("Using provided address:", address);
        } else {
          try {
            const evmPrivateKey = process.env.EVM_PRIVATE_KEY;
            logger2.info("Checking EVM_PRIVATE_KEY environment variable...");
            if (evmPrivateKey && evmPrivateKey.trim()) {
              const account = privateKeyToAccount(evmPrivateKey.trim());
              address = account.address;
              logger2.info("Using wallet address from EVM_PRIVATE_KEY:", address);
            } else {
              logger2.info("EVM_PRIVATE_KEY not found or empty");
              await callback({
                text: "未找到配置的钱包地址，请提供有效的以太坊地址或私钥进行查询。",
                actions: ["EVM_BALANCE"],
                source: message.content.source
              });
              return {
                text: "未找到地址或私钥",
                values: { success: false, error: "INVALID_INPUT" },
                data: { actionName: "EVM_BALANCE", messageId: message.id },
                success: false
              };
            }
          } catch (error) {
            logger2.error({ error }, "Error deriving address from EVM_PRIVATE_KEY");
            await callback({
              text: "无法从配置中获取钱包地址，请提供有效的以太坊地址或私钥",
              actions: ["EVM_BALANCE"],
              source: message.content.source
            });
            return {
              text: "地址获取失败",
              values: { success: false, error: "ADDRESS_DERIVATION_FAILED" },
              data: { actionName: "EVM_BALANCE", messageId: message.id },
              success: false
            };
          }
        }
      }
      const balance = await publicClient2.getBalance({
        address,
        blockTag: "latest"
      });
      const balanceInEth = formatEther(balance);
      const hasProvidedAddress = /0x[a-fA-F0-9]{40}/.test(text);
      const wasDerivedFromPrivateKey = /0x[a-fA-F0-9]{64}/.test(text);
      const wasFromConfig = !hasProvidedAddress && !wasDerivedFromPrivateKey;
      const timestamp = new Date().toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      let resultText;
      if (wasDerivedFromPrivateKey) {
        resultText = `从私钥推导的地址：${address}

余额：${balanceInEth} ETH

网络：Sepolia测试网
查询时间：${timestamp}`;
      } else if (wasFromConfig) {
        resultText = `配置的钱包地址：${address}

余额：${balanceInEth} ETH

网络：Sepolia测试网
查询时间：${timestamp}`;
      } else {
        resultText = `钱包地址 ${address} 的余额：
${balanceInEth} ETH

网络：Sepolia测试网
查询时间：${timestamp}`;
      }
      await callback({
        text: resultText,
        actions: ["EVM_BALANCE"],
        source: message.content.source
      });
      return {
        text: `成功查询地址 ${address} 的余额`,
        values: {
          success: true,
          address,
          balance: balanceInEth
        },
        data: {
          actionName: "EVM_BALANCE",
          messageId: message.id,
          address,
          balance: balanceInEth,
          timestamp: Date.now()
        },
        success: true
      };
    } catch (error) {
      logger2.error({ error }, "Error in EVM_BALANCE action:");
      await callback({
        text: "查询余额时出现错误，请检查地址格式是否正确，或稍后重试。",
        actions: ["EVM_BALANCE"],
        source: message.content.source
      });
      return {
        text: "查询余额失败",
        values: {
          success: false,
          error: "BALANCE_QUERY_FAILED"
        },
        data: {
          actionName: "EVM_BALANCE",
          error: error instanceof Error ? error.message : String(error)
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  },
  examples: [
    [
      {
        name: "{{user}}",
        content: {
          text: "查询我的钱包余额"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: `配置的钱包地址：0x742d35Cc6634C0532925a3b844Bc454e4438f44e

余额：0.5 ETH

网络：Sepolia测试网`,
          actions: ["EVM_BALANCE"]
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "查询余额 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: `钱包地址 0x742d35Cc6634C0532925a3b844Bc454e4438f44e 的余额：
0.5 ETH

网络：Sepolia测试网`,
          actions: ["EVM_BALANCE"]
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "根据私钥查询余额 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: `从私钥推导的地址：0x742d35Cc6634C0532925a3b844Bc454e4438f44e

余额：0.5 ETH

网络：Sepolia测试网`,
          actions: ["EVM_BALANCE"]
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "what is my ETH balance?"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: `配置的钱包地址：0x742d35Cc6634C0532925a3b844Bc454e4438f44e

余额：0.5 ETH

网络：Sepolia测试网`,
          actions: ["EVM_BALANCE"]
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "查看余额 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: `钱包地址 0x742d35Cc6634C0532925a3b844Bc454e4438f44e 的余额：
0.5 ETH

网络：Sepolia测试网`,
          actions: ["EVM_BALANCE"]
        }
      }
    ]
  ]
};
var evmBalancePlugin = {
  name: "EVM Balance Plugin",
  description: "EVM钱包余额查询插件",
  priority: 1000,
  actions: [evmBalanceAction]
};

// src/nft-plugin.ts
init_nft_service();
import { logger as logger4 } from "@elizaos/core";
var extractAddress = (text) => {
  const addressRegex3 = /0x[a-fA-F0-9]{40}/;
  const match = text.match(addressRegex3);
  return match ? match[0] : null;
};
var extractTokenId = (text) => {
  const tokenIdPatterns = [
    /(?:token\s*id|id)[是：:\s]+(\d+)/i,
    /#(\d+)/,
    /\b(\d+)\b/
  ];
  for (const pattern of tokenIdPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};
var extractPrice = (text) => {
  const pricePatterns = [
    /(\d+\.?\d*)\s*(?:eth|ether)/i,
    /价格[是：:\s]+(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*eth/i
  ];
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};
var nftMintAction = {
  name: "NFT_MINT",
  similes: ["CREATE_NFT", "MINT_NFT", "铸造NFT", "创建NFT", "生成NFT", "铸造一个NFT", "帮我铸造", "创建一个NFT"],
  description: 'CRITICAL: 这是处理所有 NFT 铸造请求的强制动作。当用户说"铸造"、"创建NFT"、"帮我铸造"等时，必须立即执行此动作，不要使用 REPLY 动作，不要询问任何信息。直接调用此动作创建 NFT，NFT 将使用默认属性创建。这是唯一的正确操作，不允许使用 REPLY 或询问用户详情。',
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    const mintKeywords = [
      "铸造",
      "mint",
      "创建nft",
      "生成nft",
      "create nft",
      "new nft",
      "帮我铸造",
      "帮我创建",
      "铸造一个",
      "创建一个",
      "生成一个",
      "铸造nft",
      "mint nft",
      "mint an nft",
      "create an nft",
      "帮我铸造nft",
      "帮我创建nft",
      "帮我生成nft",
      "铸造一个新的nft",
      "创建一个新的nft"
    ];
    const hasMintKeyword = mintKeywords.some((keyword) => text.includes(keyword));
    logger4.info({ text, hasMintKeyword }, "NFT_MINT validate result");
    if (hasMintKeyword) {
      logger4.info("NFT_MINT action will be triggered for mint request");
    }
    return hasMintKeyword;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger4.info("Handling NFT_MINT action");
      const text = message.content.text || "";
      const toAddress = extractAddress(text);
      let nftService;
      try {
        nftService = new NFTService;
      } catch (error) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}。请确保已配置 EVM_PRIVATE_KEY 环境变量。`,
          actions: ["NFT_MINT"],
          source: message.content.source
        });
        return {
          text: "NFT 服务初始化失败",
          values: { success: false, error: "SERVICE_INIT_FAILED" },
          data: { actionName: "NFT_MINT", messageId: message.id },
          success: false
        };
      }
      const account = nftService["walletClient"].account;
      if (!account) {
        throw new Error("无法获取账户信息");
      }
      const isOwner = await nftService.checkIsOwner(account.address);
      if (!isOwner) {
        await callback({
          text: "您不是合约所有者，无法铸造 NFT。只有合约部署者可以铸造。",
          actions: ["NFT_MINT"],
          source: message.content.source
        });
        return {
          text: "权限不足",
          values: { success: false, error: "NOT_OWNER" },
          data: { actionName: "NFT_MINT", messageId: message.id },
          success: false
        };
      }
      await callback({
        text: "正在为您铸造 NFT...",
        actions: ["NFT_MINT"],
        source: message.content.source
      });
      const recipientAddress = toAddress || account.address;
      const hash3 = await nftService.mintNFT(recipientAddress);
      await callback({
        text: `NFT 铸造成功！

交易哈希: ${hash3}
接收地址: ${recipientAddress}

NFT 已使用默认属性创建，后续可以通过其他方式更新元数据。`,
        actions: ["NFT_MINT"],
        source: message.content.source
      });
      return {
        text: `成功铸造 NFT，交易哈希: ${hash3}`,
        values: { success: true, transactionHash: hash3, recipientAddress },
        data: { actionName: "NFT_MINT", messageId: message.id, transactionHash: hash3, recipientAddress },
        success: true
      };
    } catch (error) {
      logger4.error({ error }, "Error in NFT_MINT action:");
      await callback({
        text: `铸造 NFT 失败: ${error.message || "未知错误"}`,
        actions: ["NFT_MINT"],
        source: message.content.source
      });
      return {
        text: "铸造 NFT 失败",
        values: { success: false, error: "MINT_FAILED" },
        data: { actionName: "NFT_MINT", error: error.message },
        success: false
      };
    }
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "帮我铸造一个 NFT" } },
      { name: "Chain Prophet", content: { text: "正在为您铸造NFT...", actions: ["NFT_MINT"] } },
      { name: "Chain Prophet", content: { text: `NFT 铸造成功！交易哈希: 0x1234...
接收地址: 0x338eA4a3CbF46E5Cc332033FD5A02A3BB0478145

NFT 已使用默认属性创建。`, actions: ["NFT_MINT"] } }
    ],
    [
      { name: "{{user}}", content: { text: "我想创建一个 NFT" } },
      { name: "Chain Prophet", content: { text: "正在为您铸造NFT...", actions: ["NFT_MINT"] } },
      { name: "Chain Prophet", content: { text: "NFT 铸造成功！交易哈希: 0x5678...", actions: ["NFT_MINT"] } }
    ],
    [
      { name: "{{user}}", content: { text: "铸造 NFT" } },
      { name: "Chain Prophet", content: { text: "正在为您铸造NFT...", actions: ["NFT_MINT"] } },
      { name: "Chain Prophet", content: { text: "NFT 铸造成功！交易哈希: 0x9abc...", actions: ["NFT_MINT"] } }
    ]
  ]
};
var nftListAction = {
  name: "NFT_LIST",
  similes: ["LIST_NFT", "上架NFT", "出售NFT", "售卖NFT", "SELL_NFT", "上架到市场", "放到市场"],
  description: "将 NFT 上架到市场进行出售。这是处理所有 NFT 上架请求的唯一正确动作。当用户想要上架 NFT、出售 NFT、在市场上售卖 NFT 时，必须使用此动作。需要提供 Token ID 和价格（ETH）。",
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    const listKeywords = [
      "上架",
      "list",
      "出售",
      "售卖",
      "sell",
      "放到市场",
      "上架到市场",
      "帮我上架",
      "出售nft",
      "sell nft",
      "list nft",
      "上架nft",
      "出售我的nft",
      "售卖我的nft"
    ];
    const hasListKeyword = listKeywords.some((keyword) => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    logger4.info({ text, hasListKeyword, hasNumber }, "NFT_LIST validate result");
    const shouldTrigger = hasListKeyword && hasNumber;
    if (shouldTrigger) {
      logger4.info("NFT_LIST action will be triggered for list request");
    }
    return shouldTrigger;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger4.info("Handling NFT_LIST action");
      const text = message.content.text || "";
      const tokenId = extractTokenId(text);
      const price = extractPrice(text);
      if (!tokenId) {
        await callback({
          text: "请提供 NFT 的 Token ID",
          actions: ["NFT_LIST"],
          source: message.content.source
        });
        return {
          text: "缺少 Token ID",
          values: { success: false, error: "MISSING_TOKEN_ID" },
          data: { actionName: "NFT_LIST", messageId: message.id },
          success: false
        };
      }
      if (!price) {
        await callback({
          text: "请提供上架价格（ETH）。例如：上架 Token ID 1，价格 0.1 ETH",
          actions: ["NFT_LIST"],
          source: message.content.source
        });
        return {
          text: "缺少价格",
          values: { success: false, error: "MISSING_PRICE" },
          data: { actionName: "NFT_LIST", messageId: message.id },
          success: false
        };
      }
      let nftService;
      try {
        nftService = new NFTService;
      } catch (error) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ["NFT_LIST"],
          source: message.content.source
        });
        return {
          text: "NFT 服务初始化失败",
          values: { success: false, error: "SERVICE_INIT_FAILED" },
          data: { actionName: "NFT_LIST", messageId: message.id },
          success: false
        };
      }
      try {
        const hash3 = await nftService.listNFT(tokenId, price);
        await callback({
          text: `NFT 上架成功！交易哈希: ${hash3}
Token ID: ${tokenId}
价格: ${price} ETH`,
          actions: ["NFT_LIST"],
          source: message.content.source
        });
        return {
          text: `成功上架 NFT，交易哈希: ${hash3}`,
          values: { success: true, transactionHash: hash3, tokenId, price },
          data: { actionName: "NFT_LIST", messageId: message.id, transactionHash: hash3, tokenId, price },
          success: true
        };
      } catch (listError) {
        const errorMessage = listError.message || "";
        const isApprovalError = errorMessage.includes("0x177e802f") || errorMessage.includes("ERC721InsufficientApproval") || errorMessage.includes("insufficient approval") || errorMessage.includes("caller is not token owner or approved");
        if (isApprovalError) {
          logger4.info(`检测到授权错误，尝试自动授权 NFT ${tokenId}...`);
          try {
            const approveHash = await nftService.approveMarketplace(tokenId);
            await callback({
              text: `检测到需要授权，正在进行授权...
授权交易哈希: ${approveHash}
请等待几秒钟后再次尝试上架。`,
              actions: ["NFT_LIST"],
              source: message.content.source
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const hash3 = await nftService.listNFT(tokenId, price, false);
            await callback({
              text: `授权成功，NFT 上架成功！
授权交易哈希: ${approveHash}
上架交易哈希: ${hash3}
Token ID: ${tokenId}
价格: ${price} ETH`,
              actions: ["NFT_LIST"],
              source: message.content.source
            });
            return {
              text: `成功上架 NFT，交易哈希: ${hash3}`,
              values: { success: true, transactionHash: hash3, tokenId, price },
              data: { actionName: "NFT_LIST", messageId: message.id, transactionHash: hash3, tokenId, price },
              success: true
            };
          } catch (approveError) {
            throw new Error(`授权失败: ${approveError.message}。请手动授权市场合约后再试。`);
          }
        }
        throw listError;
      }
    } catch (error) {
      logger4.error({ error }, "Error in NFT_LIST action:");
      const { analyzeNFTError: analyzeNFTError2 } = await Promise.resolve().then(() => (init_nft_service(), exports_nft_service));
      const errorAnalysis = analyzeNFTError2(error, "上架 NFT");
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ["NFT_LIST"],
        source: message.content.source
      });
      return {
        text: `上架 NFT 失败: ${errorAnalysis.errorType}`,
        values: {
          success: false,
          error: "LIST_FAILED",
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: {
          actionName: "NFT_LIST",
          error: error.message,
          errorAnalysis
        },
        success: false
      };
    }
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "上架 Token ID 1，价格 0.1 ETH" } },
      { name: "Chain Prophet", content: { text: "NFT 上架成功！交易哈希: 0x...", actions: ["NFT_LIST"] } }
    ],
    [
      { name: "{{user}}", content: { text: "帮我上架 ID 为 5 的 NFT，价格 0.5 ETH" } },
      { name: "Chain Prophet", content: { text: "NFT 上架成功！交易哈希: 0x...", actions: ["NFT_LIST"] } }
    ],
    [
      { name: "{{user}}", content: { text: "我想出售我的 NFT，Token ID 是 3，价格 1 ETH" } },
      { name: "Chain Prophet", content: { text: "NFT 上架成功！交易哈希: 0x...", actions: ["NFT_LIST"] } }
    ]
  ]
};
var nftStakeAction = {
  name: "NFT_STAKE",
  similes: ["STAKE_NFT", "质押NFT", "锁定NFT", "LOCK_NFT", "质押我的NFT", "把NFT质押"],
  description: "质押 NFT 以获得奖励。这是处理所有 NFT 质押请求的唯一正确动作。当用户想要质押 NFT、锁定 NFT 以获得收益时，必须使用此动作。需要提供 Token ID。",
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    const stakeKeywords = [
      "质押",
      "stake",
      "锁定",
      "lock",
      "质押nft",
      "stake nft",
      "帮我质押",
      "质押我的",
      "把nft质押",
      "锁定nft"
    ];
    const hasStakeKeyword = stakeKeywords.some((keyword) => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    logger4.info({ text, hasStakeKeyword, hasNumber }, "NFT_STAKE validate result");
    const shouldTrigger = hasStakeKeyword && hasNumber;
    if (shouldTrigger) {
      logger4.info("NFT_STAKE action will be triggered for stake request");
    }
    return shouldTrigger;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger4.info("Handling NFT_STAKE action");
      const text = message.content.text || "";
      const tokenId = extractTokenId(text);
      if (!tokenId) {
        await callback({
          text: "请提供 NFT 的 Token ID",
          actions: ["NFT_STAKE"],
          source: message.content.source
        });
        return {
          text: "缺少 Token ID",
          values: { success: false, error: "MISSING_TOKEN_ID" },
          data: { actionName: "NFT_STAKE", messageId: message.id },
          success: false
        };
      }
      let nftService;
      try {
        nftService = new NFTService;
      } catch (error) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ["NFT_STAKE"],
          source: message.content.source
        });
        return {
          text: "NFT 服务初始化失败",
          values: { success: false, error: "SERVICE_INIT_FAILED" },
          data: { actionName: "NFT_STAKE", messageId: message.id },
          success: false
        };
      }
      try {
        const hash3 = await nftService.stakeNFT(tokenId, false);
        await callback({
          text: `NFT 质押成功！交易哈希: ${hash3}
Token ID: ${tokenId}`,
          actions: ["NFT_STAKE"],
          source: message.content.source
        });
        return {
          text: `成功质押 NFT，交易哈希: ${hash3}`,
          values: { success: true, transactionHash: hash3, tokenId },
          data: { actionName: "NFT_STAKE", messageId: message.id, transactionHash: hash3, tokenId },
          success: true
        };
      } catch (stakeError) {
        const errorMessage = stakeError.message || "";
        const isApprovalError = errorMessage.includes("0x177e802f") || errorMessage.includes("ERC721InsufficientApproval") || errorMessage.includes("insufficient approval") || errorMessage.includes("caller is not token owner or approved") || errorMessage.includes("请先授权质押合约");
        if (isApprovalError) {
          logger4.info(`检测到授权错误，尝试自动授权 NFT ${tokenId} 给质押合约...`);
          try {
            const approveHash = await nftService.approveStaking(tokenId);
            await callback({
              text: `检测到需要授权，正在进行授权...
授权交易哈希: ${approveHash}
请等待几秒钟后自动重试质押。`,
              actions: ["NFT_STAKE"],
              source: message.content.source
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const hash3 = await nftService.stakeNFT(tokenId, false);
            await callback({
              text: `授权成功，NFT 质押成功！
授权交易哈希: ${approveHash}
质押交易哈希: ${hash3}
Token ID: ${tokenId}`,
              actions: ["NFT_STAKE"],
              source: message.content.source
            });
            return {
              text: `成功质押 NFT，交易哈希: ${hash3}`,
              values: { success: true, transactionHash: hash3, tokenId },
              data: { actionName: "NFT_STAKE", messageId: message.id, transactionHash: hash3, tokenId },
              success: true
            };
          } catch (approveError) {
            throw new Error(`授权失败: ${approveError.message}。请手动授权质押合约后再试。`);
          }
        }
        throw stakeError;
      }
    } catch (error) {
      logger4.error({ error }, "Error in NFT_STAKE action:");
      const { analyzeNFTError: analyzeNFTError2 } = await Promise.resolve().then(() => (init_nft_service(), exports_nft_service));
      const errorAnalysis = analyzeNFTError2(error, "质押 NFT");
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ["NFT_STAKE"],
        source: message.content.source
      });
      return {
        text: `质押 NFT 失败: ${errorAnalysis.errorType}`,
        values: {
          success: false,
          error: "STAKE_FAILED",
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: {
          actionName: "NFT_STAKE",
          error: error.message,
          errorAnalysis
        },
        success: false
      };
    }
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "质押 Token ID 1" } },
      { name: "Chain Prophet", content: { text: "NFT 质押成功！交易哈希: 0x...", actions: ["NFT_STAKE"] } }
    ],
    [
      { name: "{{user}}", content: { text: "帮我质押 ID 为 5 的 NFT" } },
      { name: "Chain Prophet", content: { text: "NFT 质押成功！交易哈希: 0x...", actions: ["NFT_STAKE"] } }
    ],
    [
      { name: "{{user}}", content: { text: "我想质押我的 NFT，Token ID 是 3" } },
      { name: "Chain Prophet", content: { text: "NFT 质押成功！交易哈希: 0x...", actions: ["NFT_STAKE"] } }
    ]
  ]
};
var nftBuyAction = {
  name: "NFT_BUY",
  similes: ["BUY_NFT", "购买NFT", "购买", "buy", "purchase", "买NFT", "我要买", "帮我买"],
  description: "CRITICAL PRIORITY: 购买市场上的 NFT。这是处理所有 NFT 购买请求的唯一正确动作，优先级高于任何 EVM 插件的转账或交易动作。当用户想要购买 NFT、买 NFT、购买某个 Token ID 的 NFT、购买编号 X 的 NFT 时，必须使用此动作，不要使用 EVM_TRANSFER 或其他 EVM 插件动作。需要提供 Token ID。如果用户提供了价格，将使用该价格；否则将自动使用上架价格。这是强制性的 - 当 validate 返回 true 时，必须使用 NFT_BUY 而不是其他任何动作。",
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    const nftKeywords = [
      "nft",
      "token id",
      "tokenid",
      "token #",
      "编号",
      "id",
      "token",
      "nft编号",
      "nft id"
    ];
    const buyKeywords = [
      "购买",
      "buy",
      "purchase",
      "买",
      "我要买",
      "帮我买",
      "购买nft",
      "buy nft",
      "购买token",
      "buy token",
      "购买id",
      "买id",
      "购买编号",
      "买nft"
    ];
    const hasNftKeyword = nftKeywords.some((keyword) => text.includes(keyword));
    const hasBuyKeyword = buyKeywords.some((keyword) => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    const shouldTrigger = hasNumber && (hasNftKeyword && hasBuyKeyword || hasBuyKeyword && (text.includes("id") || text.includes("token") || text.includes("编号")));
    logger4.info({ text, hasNftKeyword, hasBuyKeyword, hasNumber, shouldTrigger }, "NFT_BUY validate result");
    if (shouldTrigger) {
      logger4.info("NFT_BUY action will be triggered for buy NFT request - PRIORITY ACTION");
    }
    return shouldTrigger;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger4.info("Handling NFT_BUY action");
      const text = message.content.text || "";
      const tokenId = extractTokenId(text);
      const price = extractPrice(text);
      if (!tokenId) {
        await callback({
          text: "购买 NFT 需要提供 Token ID。请告诉我您想购买哪个 Token ID 的 NFT。",
          actions: ["NFT_BUY"],
          source: message.content.source
        });
        return {
          text: "缺少 Token ID",
          values: { success: false, error: "MISSING_TOKEN_ID" },
          data: { actionName: "NFT_BUY", messageId: message.id },
          success: false
        };
      }
      let nftService;
      try {
        nftService = new NFTService;
      } catch (error) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}。请确保已配置 EVM_PRIVATE_KEY 环境变量。`,
          actions: ["NFT_BUY"],
          source: message.content.source
        });
        return {
          text: "NFT 服务初始化失败",
          values: { success: false, error: "SERVICE_INIT_FAILED" },
          data: { actionName: "NFT_BUY", messageId: message.id },
          success: false
        };
      }
      const listing = await nftService.getListing(tokenId);
      if (!listing) {
        await callback({
          text: `❌ 购买失败：该 NFT (Token ID: ${tokenId}) 未上架或已被售出。

解决方案：
1. 确认 Token ID 是否正确
2. 检查该 NFT 是否已经在市场上架
3. 如果已上架，可能是刚刚被其他人购买`,
          actions: ["NFT_BUY"],
          source: message.content.source
        });
        return {
          text: "NFT 未上架或已售出",
          values: { success: false, error: "NOT_LISTED" },
          data: { actionName: "NFT_BUY", messageId: message.id, tokenId },
          success: false
        };
      }
      const account = nftService["walletClient"].account;
      if (!account) {
        throw new Error("无法获取账户信息");
      }
      if (listing.seller.toLowerCase() === account.address.toLowerCase()) {
        await callback({
          text: `无法购买：这是您自己上架的 NFT (Token ID: ${tokenId})，您不能购买自己的 NFT。

当前上架价格：${listing.price} ETH

解决方案：
1. 如果您想取消上架，可以取消该 NFT 的挂牌
2. 如果您想购买其他人的 NFT，请选择其他 Token ID`,
          actions: ["NFT_BUY"],
          source: message.content.source
        });
        return {
          text: "不能购买自己的 NFT",
          values: { success: false, error: "CANNOT_BUY_OWN" },
          data: { actionName: "NFT_BUY", messageId: message.id, tokenId },
          success: false
        };
      }
      const buyPrice = price || listing.price;
      await callback({
        text: `正在购买 NFT...

Token ID: ${tokenId}
价格: ${buyPrice} ETH
卖家: ${listing.seller}

请等待交易确认...`,
        actions: ["NFT_BUY"],
        source: message.content.source
      });
      const hash3 = await nftService.buyNFT(tokenId, price || undefined);
      await callback({
        text: `✅ NFT 购买成功！

交易哈希: ${hash3}
Token ID: ${tokenId}
支付金额: ${buyPrice} ETH

NFT 已成功转移到您的钱包！`,
        actions: ["NFT_BUY"],
        source: message.content.source
      });
      return {
        text: `成功购买 NFT，交易哈希: ${hash3}`,
        values: { success: true, transactionHash: hash3, tokenId, price: buyPrice },
        data: { actionName: "NFT_BUY", messageId: message.id, transactionHash: hash3, tokenId, price: buyPrice },
        success: true
      };
    } catch (error) {
      logger4.error({ error }, "Error in NFT_BUY action:");
      const { analyzeNFTError: analyzeNFTError2 } = await Promise.resolve().then(() => (init_nft_service(), exports_nft_service));
      const errorAnalysis = analyzeNFTError2(error, "购买 NFT");
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ["NFT_BUY"],
        source: message.content.source
      });
      return {
        text: `购买 NFT 失败: ${errorAnalysis.errorType}`,
        values: {
          success: false,
          error: "BUY_FAILED",
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: {
          actionName: "NFT_BUY",
          error: error.message,
          errorAnalysis
        },
        success: false
      };
    }
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "购买 Token ID 1" } },
      { name: "Chain Prophet", content: { text: `正在购买 NFT...

Token ID: 1
价格: 0.1 ETH

请等待交易确认...`, actions: ["NFT_BUY"] } }
    ],
    [
      { name: "{{user}}", content: { text: "我要买 Token ID 5，价格 0.5 ETH" } },
      { name: "Chain Prophet", content: { text: `✅ NFT 购买成功！

交易哈希: 0x...
Token ID: 5
支付金额: 0.5 ETH`, actions: ["NFT_BUY"] } }
    ],
    [
      { name: "{{user}}", content: { text: "帮我购买编号 3 的 NFT" } },
      { name: "Chain Prophet", content: { text: `正在购买 NFT...

Token ID: 3
价格: 0.2 ETH

请等待交易确认...`, actions: ["NFT_BUY"] } }
    ],
    [
      { name: "{{user}}", content: { text: "buy token id 2" } },
      { name: "Chain Prophet", content: { text: `✅ NFT 购买成功！

交易哈希: 0x...
Token ID: 2`, actions: ["NFT_BUY"] } }
    ],
    [
      { name: "{{user}}", content: { text: "购买 NFT Token ID 10" } },
      { name: "Chain Prophet", content: { text: `正在购买 NFT...

Token ID: 10
价格: 0.1 ETH

请等待交易确认...`, actions: ["NFT_BUY"] } }
    ],
    [
      { name: "{{user}}", content: { text: "我要购买编号 7 的 NFT" } },
      { name: "Chain Prophet", content: { text: `✅ NFT 购买成功！

交易哈希: 0x...
Token ID: 7`, actions: ["NFT_BUY"] } }
    ]
  ]
};
var nftUnstakeAction = {
  name: "NFT_UNSTAKE",
  similes: ["UNSTAKE_NFT", "解除质押", "取回NFT", "WITHDRAW_NFT", "UNLOCK_NFT", "取消质押", "解除我的质押"],
  description: "解除 NFT 质押并取回 NFT。这是处理所有 NFT 解除质押请求的唯一正确动作。当用户想要解除质押、取回已质押的 NFT、取消质押时，必须使用此动作。需要提供 Token ID。",
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    const unstakeKeywords = [
      "解除质押",
      "unstake",
      "取回",
      "withdraw",
      "解锁",
      "unlock",
      "解除我的质押",
      "取消质押",
      "取回nft",
      "unstake nft",
      "帮我解除质押",
      "解除质押nft"
    ];
    const hasUnstakeKeyword = unstakeKeywords.some((keyword) => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    logger4.info({ text, hasUnstakeKeyword, hasNumber }, "NFT_UNSTAKE validate result");
    const shouldTrigger = hasUnstakeKeyword && hasNumber;
    if (shouldTrigger) {
      logger4.info("NFT_UNSTAKE action will be triggered for unstake request");
    }
    return shouldTrigger;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger4.info("Handling NFT_UNSTAKE action");
      const text = message.content.text || "";
      const tokenId = extractTokenId(text);
      if (!tokenId) {
        await callback({
          text: "请提供 NFT 的 Token ID",
          actions: ["NFT_UNSTAKE"],
          source: message.content.source
        });
        return {
          text: "缺少 Token ID",
          values: { success: false, error: "MISSING_TOKEN_ID" },
          data: { actionName: "NFT_UNSTAKE", messageId: message.id },
          success: false
        };
      }
      let nftService;
      try {
        nftService = new NFTService;
      } catch (error) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ["NFT_UNSTAKE"],
          source: message.content.source
        });
        return {
          text: "NFT 服务初始化失败",
          values: { success: false, error: "SERVICE_INIT_FAILED" },
          data: { actionName: "NFT_UNSTAKE", messageId: message.id },
          success: false
        };
      }
      const hash3 = await nftService.unstakeNFT(tokenId);
      await callback({
        text: `NFT 解除质押成功！交易哈希: ${hash3}
Token ID: ${tokenId}`,
        actions: ["NFT_UNSTAKE"],
        source: message.content.source
      });
      return {
        text: `成功解除质押 NFT，交易哈希: ${hash3}`,
        values: { success: true, transactionHash: hash3, tokenId },
        data: { actionName: "NFT_UNSTAKE", messageId: message.id, transactionHash: hash3, tokenId },
        success: true
      };
    } catch (error) {
      logger4.error({ error }, "Error in NFT_UNSTAKE action:");
      const { analyzeNFTError: analyzeNFTError2 } = await Promise.resolve().then(() => (init_nft_service(), exports_nft_service));
      const errorAnalysis = analyzeNFTError2(error, "解除质押");
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ["NFT_UNSTAKE"],
        source: message.content.source
      });
      return {
        text: `解除质押失败: ${errorAnalysis.errorType}`,
        values: {
          success: false,
          error: "UNSTAKE_FAILED",
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: {
          actionName: "NFT_UNSTAKE",
          error: error.message,
          errorAnalysis
        },
        success: false
      };
    }
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "解除质押 Token ID 1" } },
      { name: "Chain Prophet", content: { text: "NFT 解除质押成功！交易哈希: 0x...", actions: ["NFT_UNSTAKE"] } }
    ],
    [
      { name: "{{user}}", content: { text: "帮我解除质押 ID 为 5 的 NFT" } },
      { name: "Chain Prophet", content: { text: "NFT 解除质押成功！交易哈希: 0x...", actions: ["NFT_UNSTAKE"] } }
    ],
    [
      { name: "{{user}}", content: { text: "我想取回我的 NFT，Token ID 是 3" } },
      { name: "Chain Prophet", content: { text: "NFT 解除质押成功！交易哈希: 0x...", actions: ["NFT_UNSTAKE"] } }
    ]
  ]
};
var nftCreateLoanAction = {
  name: "NFT_CREATE_LOAN",
  similes: ["CREATE_LOAN", "创建借贷", "发起借贷", "借贷NFT", "LOAN_NFT", "用NFT借贷", "抵押NFT借贷"],
  description: "使用 NFT 作为抵押品创建借贷。这是处理所有 NFT 借贷创建请求的唯一正确动作。当用户想要用 NFT 作为抵押品借 ETH、创建借贷、发起借贷时，必须使用此动作。需要提供 Token ID、借贷金额（ETH）和期限（天数，7-365天）。",
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    const loanKeywords = [
      "创建借贷",
      "create loan",
      "发起借贷",
      "借贷",
      "loan",
      "用nft借贷",
      "抵押nft",
      "用nft抵押",
      "nft借贷",
      "帮我创建借贷",
      "创建一个借贷",
      "发起一个借贷"
    ];
    const hasLoanKeyword = loanKeywords.some((keyword) => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    logger4.info({ text, hasLoanKeyword, hasNumber }, "NFT_CREATE_LOAN validate result");
    const shouldTrigger = hasLoanKeyword && hasNumber;
    if (shouldTrigger) {
      logger4.info("NFT_CREATE_LOAN action will be triggered for create loan request");
    }
    return shouldTrigger;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger4.info("Handling NFT_CREATE_LOAN action");
      const text = message.content.text || "";
      const tokenId = extractTokenId(text);
      const loanAmountPatterns = [
        /金额[是：:\s]+(\d+\.?\d*)/i,
        /(\d+\.?\d*)\s*(?:eth|ether)/i
      ];
      let loanAmount = null;
      for (const pattern of loanAmountPatterns) {
        const match = text.match(pattern);
        if (match) {
          loanAmount = match[1];
          break;
        }
      }
      const durationPatterns = [
        /期限[是：:\s]+(\d+)/i,
        /(\d+)\s*天/i,
        /(\d+)\s*days?/i
      ];
      let durationDays = "30";
      for (const pattern of durationPatterns) {
        const match = text.match(pattern);
        if (match) {
          durationDays = match[1];
          break;
        }
      }
      if (!tokenId) {
        await callback({
          text: "请提供 NFT 的 Token ID",
          actions: ["NFT_CREATE_LOAN"],
          source: message.content.source
        });
        return {
          text: "缺少 Token ID",
          values: { success: false, error: "MISSING_TOKEN_ID" },
          data: { actionName: "NFT_CREATE_LOAN", messageId: message.id },
          success: false
        };
      }
      if (!loanAmount) {
        await callback({
          text: "请提供借贷金额（ETH）。例如：使用 Token ID 1 创建借贷，金额 1 ETH，期限 30 天",
          actions: ["NFT_CREATE_LOAN"],
          source: message.content.source
        });
        return {
          text: "缺少借贷金额",
          values: { success: false, error: "MISSING_LOAN_AMOUNT" },
          data: { actionName: "NFT_CREATE_LOAN", messageId: message.id },
          success: false
        };
      }
      const duration = parseInt(durationDays);
      if (isNaN(duration) || duration < 7 || duration > 365) {
        await callback({
          text: "借贷期限必须在 7-365 天之间",
          actions: ["NFT_CREATE_LOAN"],
          source: message.content.source
        });
        return {
          text: "期限无效",
          values: { success: false, error: "INVALID_DURATION" },
          data: { actionName: "NFT_CREATE_LOAN", messageId: message.id },
          success: false
        };
      }
      let nftService;
      try {
        nftService = new NFTService;
      } catch (error) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ["NFT_CREATE_LOAN"],
          source: message.content.source
        });
        return {
          text: "NFT 服务初始化失败",
          values: { success: false, error: "SERVICE_INIT_FAILED" },
          data: { actionName: "NFT_CREATE_LOAN", messageId: message.id },
          success: false
        };
      }
      try {
        const hash3 = await nftService.createLoan(tokenId, loanAmount, duration, false);
        await callback({
          text: `借贷创建成功！交易哈希: ${hash3}
Token ID: ${tokenId}
借贷金额: ${loanAmount} ETH
期限: ${duration} 天`,
          actions: ["NFT_CREATE_LOAN"],
          source: message.content.source
        });
        return {
          text: `成功创建借贷，交易哈希: ${hash3}`,
          values: { success: true, transactionHash: hash3, tokenId, loanAmount, duration },
          data: { actionName: "NFT_CREATE_LOAN", messageId: message.id, transactionHash: hash3, tokenId, loanAmount, duration },
          success: true
        };
      } catch (loanError) {
        const errorMessage = loanError.message || "";
        const isApprovalError = errorMessage.includes("0x177e802f") || errorMessage.includes("ERC721InsufficientApproval") || errorMessage.includes("insufficient approval") || errorMessage.includes("caller is not token owner or approved") || errorMessage.includes("请先授权借贷合约");
        if (isApprovalError) {
          logger4.info(`检测到授权错误，尝试自动授权 NFT ${tokenId} 给借贷合约...`);
          try {
            const approveHash = await nftService.approveLoan(tokenId);
            await callback({
              text: `检测到需要授权，正在进行授权...
授权交易哈希: ${approveHash}
请等待几秒钟后自动重试创建借贷。`,
              actions: ["NFT_CREATE_LOAN"],
              source: message.content.source
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const hash3 = await nftService.createLoan(tokenId, loanAmount, duration, false);
            await callback({
              text: `授权成功，借贷创建成功！
授权交易哈希: ${approveHash}
借贷交易哈希: ${hash3}
Token ID: ${tokenId}
借贷金额: ${loanAmount} ETH
期限: ${duration} 天`,
              actions: ["NFT_CREATE_LOAN"],
              source: message.content.source
            });
            return {
              text: `成功创建借贷，交易哈希: ${hash3}`,
              values: { success: true, transactionHash: hash3, tokenId, loanAmount, duration },
              data: { actionName: "NFT_CREATE_LOAN", messageId: message.id, transactionHash: hash3, tokenId, loanAmount, duration },
              success: true
            };
          } catch (approveError) {
            throw new Error(`授权失败: ${approveError.message}。请手动授权借贷合约后再试。`);
          }
        }
        throw loanError;
      }
    } catch (error) {
      logger4.error({ error }, "Error in NFT_CREATE_LOAN action:");
      const { analyzeNFTError: analyzeNFTError2 } = await Promise.resolve().then(() => (init_nft_service(), exports_nft_service));
      const errorAnalysis = analyzeNFTError2(error, "创建借贷");
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ["NFT_CREATE_LOAN"],
        source: message.content.source
      });
      return {
        text: `创建借贷失败: ${errorAnalysis.errorType}`,
        values: {
          success: false,
          error: "CREATE_LOAN_FAILED",
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: {
          actionName: "NFT_CREATE_LOAN",
          error: error.message,
          errorAnalysis
        },
        success: false
      };
    }
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "使用 Token ID 1 创建借贷，金额 1 ETH，期限 30 天" } },
      { name: "Chain Prophet", content: { text: "借贷创建成功！交易哈希: 0x...", actions: ["NFT_CREATE_LOAN"] } }
    ],
    [
      { name: "{{user}}", content: { text: "用 Token ID 5 作为抵押，借贷 2 ETH，期限 60 天" } },
      { name: "Chain Prophet", content: { text: "借贷创建成功！交易哈希: 0x...", actions: ["NFT_CREATE_LOAN"] } }
    ],
    [
      { name: "{{user}}", content: { text: "我想用我的 NFT（ID 是 3）创建一个借贷，借 0.5 ETH，期限 7 天" } },
      { name: "Chain Prophet", content: { text: "借贷创建成功！交易哈希: 0x...", actions: ["NFT_CREATE_LOAN"] } }
    ]
  ]
};
var nftRepayLoanAction = {
  name: "NFT_REPAY_LOAN",
  similes: ["REPAY_LOAN", "还款", "偿还借贷", "REPAY", "还贷", "偿还我的借贷"],
  description: "偿还 NFT 借贷并取回抵押的 NFT。这是处理所有 NFT 借贷还款请求的唯一正确动作。当用户想要还款、偿还借贷、还清借贷时，必须使用此动作。需要提供借贷 ID（Loan ID）。",
  validate: async (_runtime, message, _state) => {
    const text = message.content.text?.toLowerCase() || "";
    const repayKeywords = [
      "还款",
      "repay",
      "偿还",
      "还贷",
      "偿还借贷",
      "还清借贷",
      "帮我还款",
      "偿还我的借贷",
      "repay loan"
    ];
    const hasRepayKeyword = repayKeywords.some((keyword) => text.includes(keyword));
    const hasNumber = /\d+/.test(text);
    logger4.info({ text, hasRepayKeyword, hasNumber }, "NFT_REPAY_LOAN validate result");
    const shouldTrigger = hasRepayKeyword && hasNumber;
    if (shouldTrigger) {
      logger4.info("NFT_REPAY_LOAN action will be triggered for repay loan request");
    }
    return shouldTrigger;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger4.info("Handling NFT_REPAY_LOAN action");
      const text = message.content.text || "";
      const loanId = extractTokenId(text);
      if (!loanId) {
        await callback({
          text: "请提供借贷 ID（Loan ID）。例如：还款借贷 ID 1",
          actions: ["NFT_REPAY_LOAN"],
          source: message.content.source
        });
        return {
          text: "缺少借贷 ID",
          values: { success: false, error: "MISSING_LOAN_ID" },
          data: { actionName: "NFT_REPAY_LOAN", messageId: message.id },
          success: false
        };
      }
      let nftService;
      try {
        nftService = new NFTService;
      } catch (error) {
        await callback({
          text: `无法创建 NFT 服务: ${error.message}`,
          actions: ["NFT_REPAY_LOAN"],
          source: message.content.source
        });
        return {
          text: "NFT 服务初始化失败",
          values: { success: false, error: "SERVICE_INIT_FAILED" },
          data: { actionName: "NFT_REPAY_LOAN", messageId: message.id },
          success: false
        };
      }
      const hash3 = await nftService.repayLoan(loanId);
      await callback({
        text: `还款成功！交易哈希: ${hash3}
借贷 ID: ${loanId}
您的 NFT 已归还。`,
        actions: ["NFT_REPAY_LOAN"],
        source: message.content.source
      });
      return {
        text: `成功还款，交易哈希: ${hash3}`,
        values: { success: true, transactionHash: hash3, loanId },
        data: { actionName: "NFT_REPAY_LOAN", messageId: message.id, transactionHash: hash3, loanId },
        success: true
      };
    } catch (error) {
      logger4.error({ error }, "Error in NFT_REPAY_LOAN action:");
      const { analyzeNFTError: analyzeNFTError2 } = await Promise.resolve().then(() => (init_nft_service(), exports_nft_service));
      const errorAnalysis = analyzeNFTError2(error, "还款");
      await callback({
        text: errorAnalysis.userFriendlyMessage,
        actions: ["NFT_REPAY_LOAN"],
        source: message.content.source
      });
      return {
        text: `还款失败: ${errorAnalysis.errorType}`,
        values: {
          success: false,
          error: "REPAY_FAILED",
          errorType: errorAnalysis.errorType,
          reason: errorAnalysis.reason,
          suggestion: errorAnalysis.suggestion
        },
        data: {
          actionName: "NFT_REPAY_LOAN",
          error: error.message,
          errorAnalysis
        },
        success: false
      };
    }
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "还款借贷 ID 1" } },
      { name: "Chain Prophet", content: { text: "还款成功！交易哈希: 0x...", actions: ["NFT_REPAY_LOAN"] } }
    ],
    [
      { name: "{{user}}", content: { text: "帮我还款借贷 ID 5" } },
      { name: "Chain Prophet", content: { text: "还款成功！交易哈希: 0x...", actions: ["NFT_REPAY_LOAN"] } }
    ],
    [
      { name: "{{user}}", content: { text: "我想偿还我的借贷，借贷 ID 是 3" } },
      { name: "Chain Prophet", content: { text: "还款成功！交易哈希: 0x...", actions: ["NFT_REPAY_LOAN"] } }
    ]
  ]
};
var nftPlugin = {
  name: "NFT Plugin",
  description: "NFT 创建、上架、质押、借贷等功能插件。支持铸造 NFT、上架 NFT 到市场、质押 NFT 获得奖励、创建和偿还 NFT 借贷等功能。",
  priority: 1e4,
  actions: [
    nftMintAction,
    nftListAction,
    nftBuyAction,
    nftStakeAction,
    nftUnstakeAction,
    nftCreateLoanAction,
    nftRepayLoanAction
  ]
};

// src/character.ts
var character = {
  name: "Chain Prophet",
  username: "chain_prophet",
  plugins: [
    "@elizaos/plugin-sql",
    "@elizaos/plugin-bootstrap",
    ...process.env.ANTHROPIC_API_KEY?.trim() ? ["@elizaos/plugin-anthropic"] : [],
    ...process.env.OPENROUTER_API_KEY?.trim() ? ["@elizaos/plugin-openrouter"] : [],
    ...process.env.OPENAI_API_KEY?.trim() ? ["@elizaos/plugin-openai"] : [],
    ...process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ? ["@elizaos/plugin-google-genai"] : [],
    ...process.env.OLLAMA_API_ENDPOINT?.trim() ? ["@elizaos/plugin-ollama"] : [],
    ...process.env.EVM_PRIVATE_KEY?.trim() ? ["@elizaos/plugin-evm"] : [],
    ...process.env.DISCORD_API_TOKEN?.trim() ? ["@elizaos/plugin-discord"] : [],
    ...process.env.TWITTER_API_KEY?.trim() && process.env.TWITTER_API_SECRET_KEY?.trim() && process.env.TWITTER_ACCESS_TOKEN?.trim() && process.env.TWITTER_ACCESS_TOKEN_SECRET?.trim() ? ["@elizaos/plugin-twitter"] : [],
    ...process.env.TELEGRAM_BOT_TOKEN?.trim() ? ["@elizaos/plugin-telegram"] : []
  ],
  adjectives: [
    "precise",
    "technical",
    "security-focused",
    "analytical",
    "professional",
    "reliable",
    "methodical",
    "expert"
  ],
  settings: {
    secrets: {},
    chains: {
      evm: ["sepolia"]
    },
    avatar: "https://elizaos.github.io/eliza-avatars/Eliza/portrait.png",
    model: "gpt-4o-mini",
    temperature: 0.3,
    maxTokens: 2000,
    memoryLimit: 1000,
    conversationLength: 32,
    enableMessageProcessing: true,
    autoRespond: true,
    responseDelay: 1000,
    allowResponses: true,
    ignoreActions: false,
    messageBus: {
      enabled: true,
      allowResponses: true,
      ignoreActions: false
    }
  },
  system: `You are Chain Prophet, a specialized blockchain expert and transaction executor. Your core responsibilities:
1. Provide accurate technical information about blockchain protocols, smart contracts, and on-chain operations
2. Assist with transaction preparation, including gas estimation, parameter validation, and security checks
3. Execute on-chain transactions securely according to user instructions
4. Explain complex blockchain concepts clearly without unnecessary jargon
5. Warn users about potential risks, including high gas fees, contract vulnerabilities, and phishing attempts
6. Maintain precise transaction records and provide confirmation details after execution
7. Stay updated on network upgrades and protocol changes that affect transactions

IMPORTANT RULES:
- Always respond to user messages. Never use the IGNORE action. Always provide helpful responses to user queries.
- CRITICAL: When users ask about balance (余额, balance, Sepolia balance, etc.), you MUST execute the EVM_BALANCE action immediately. DO NOT use REPLY action. DO NOT ask for confirmation or additional information. This is mandatory - never use REPLY when EVM_BALANCE action is available and validate returns true.
- CRITICAL: When users want to mint/create NFT (铸造, mint, 创建NFT, 帮我铸造), you MUST execute the NFT_MINT action immediately. DO NOT use REPLY action. DO NOT ask for name, description, or any other information. The NFT will be created with default attributes automatically. This is mandatory - never use REPLY when NFT_MINT action is available and validate returns true.
- When users want to list/sell NFT (上架, list, 出售, sell NFT), directly execute the NFT_LIST action without asking for confirmation.
- CRITICAL PRIORITY: When users want to buy/purchase NFT (购买, buy, purchase, 买NFT, 我要买, 购买Token ID, 购买编号), you MUST execute the NFT_BUY action immediately. DO NOT use EVM_TRANSFER or any other EVM plugin actions. NFT_BUY has the highest priority for NFT purchase requests. If NFT_BUY validate returns true, you MUST use NFT_BUY, never use any other action.
- When users want to stake NFT (质押, stake NFT), directly execute the NFT_STAKE action without asking for confirmation.
- When users want to unstake NFT (解除质押, unstake, 取回 NFT), directly execute the NFT_UNSTAKE action without asking for confirmation.
- When users want to create loan with NFT (创建借贷, create loan, 用NFT借贷), directly execute the NFT_CREATE_LOAN action without asking for confirmation.
- When users want to repay loan (还款, repay loan), directly execute the NFT_REPAY_LOAN action without asking for confirmation.
- For balance queries, inform the user what you are about to do (e.g., "正在查询您的Sepolia余额...") and then execute the action.
- For NFT operations, inform the user what you are about to do (e.g., "正在上架您的NFT...") and then execute the action immediately.
- CRITICAL ACTION SELECTION: If any action validate function returns true, you MUST execute that specific action. NEVER use REPLY when a validated action is available. For NFT_MINT, the handler automatically uses default attributes - never ask for details.
- Be proactive and direct - execute actions immediately rather than asking for confirmation or requesting additional information.
- If the action requires parameters that are missing, extract them from the user message or inform the user clearly what is missing.
- If you don't understand something, ask for clarification instead of ignoring.

Always verify transaction details before execution. Never assume user intent - clarify ambiguous instructions. Prioritize security over convenience.`,
  bio: [
    "Blockchain specialist with deep expertise in on-chain transactions",
    "Proficient in Ethereum, Bitcoin, and major smart contract platforms",
    "Skilled in transaction optimization, gas management, and security protocols",
    "Able to execute and verify transactions across multiple blockchains",
    "Expert in smart contract interaction and blockchain analytics",
    "Communicates complex technical concepts with clarity",
    "Prioritizes security and transparency in all operations",
    "Monitors network conditions to optimize transaction success"
  ],
  topics: [
    "blockchain protocols and architecture",
    "on-chain transaction execution",
    "gas optimization and fee structures",
    "smart contract interaction",
    "wallet management and security",
    "decentralized finance (DeFi) operations",
    "blockchain network upgrades",
    "transaction debugging and recovery",
    "cryptocurrency wallet integration",
    "block explorer analysis"
  ],
  messageExamples: [
    [
      {
        name: "{{user}}",
        content: {
          text: "查询我的余额"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: "正在查询您的Sepolia余额...",
          actions: ["EVM_BALANCE"]
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "上架ID为0的NFT，价格为0.01 ETH"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: "正在上架您的NFT...",
          actions: ["NFT_LIST"]
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "帮我铸造一个NFT"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: "正在为您铸造NFT...",
          actions: ["NFT_MINT"]
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "质押Token ID 1"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: "正在质押您的NFT...",
          actions: ["NFT_STAKE"]
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "I want to send 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: `I can help with that. Current network conditions: Ethereum mainnet gas price is 32 gwei (standard). Estimated transaction cost: ~0.004 ETH.
- Recipient address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
- Amount: 1 ETH
- Network: Ethereum mainnet
`
        }
      }
    ],
    [
      {
        name: "{{user}}",
        content: {
          text: "My transaction is stuck. What should I do?"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: `Please provide the transaction hash (starting with 0x). I can check its status and recommend solutions.

Common fixes include:
- Speeding up with higher gas (if using a compatible wallet)
- Canceling and resubmitting
- Waiting for network congestion to resolve`
        }
      },
      {
        name: "{{user}}",
        content: {
          text: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        }
      },
      {
        name: "Chain Prophet",
        content: {
          text: `Transaction 0x123...ef is pending with 10 gwei gas (below current network minimum of 28 gwei).

Recommendation: Cancel this transaction and resubmit with 30 gwei. Would you like me to guide you through this process?`
        }
      }
    ]
  ],
  knowledge: [
    "Blockchain transaction mechanics and gas optimization",
    "Smart contract security best practices",
    "Multi-chain bridge protocols and cross-chain operations",
    "DeFi protocol interactions and yield farming strategies",
    "Wallet security and private key management",
    "Network congestion patterns and optimal transaction timing",
    "Blockchain analytics and transaction tracing",
    {
      path: "./knowledge/blockchain-docs",
      shared: true
    }
  ],
  templates: {
    messageTemplate: (params) => `Chain Prophet analyzing: ${params.message}`,
    thoughtTemplate: (params) => `Technical analysis: ${params.thought}`,
    actionTemplate: (params) => `Executing blockchain operation: ${params.action}`,
    shouldRespondTemplate: `<task>决定{{agentName}}是否应该响应用户消息。根据消息内容智能决定。</task>

{{providers}}

<rules>
- 对于任何区块链相关问题，都应该响应
- 对于余额查询（余额、balance、ETH余额等），必须响应
- 对于交易相关操作，应该响应
- 对于技术咨询，应该响应
- 始终提供有用的响应，不要忽略用户
- 根据消息内容选择最合适的动作
</rules>

<output>
<response>
  <reasoning>分析用户消息内容，决定是否需要响应</reasoning>
  <action>RESPOND</action>
</response>
</output>`
  },
  style: {
    all: [
      "Be precise and accurate with technical details",
      "Provide specific, actionable information",
      "Include relevant technical parameters (gas prices, addresses, etc.)",
      "Structure complex information in clear steps",
      "Warn about potential risks explicitly",
      "Avoid hype or speculative claims",
      "Use blockchain terminology correctly",
      "Provide sources/links to verify information when possible",
      "Maintain professional tone while remaining helpful",
      "Document transaction details for reference"
    ],
    chat: [
      "Ask clarifying questions about transaction details",
      "Present options with clear pros/cons",
      "Break complex processes into simple steps",
      "Follow up with confirmation details after transactions",
      "Offer additional context about network conditions"
    ]
  }
};

// src/index.ts
var initCharacter = ({ runtime }) => {
  logger5.info("Initializing character");
  logger5.info({ name: character.name }, "Name:");
};
var projectAgent = {
  character,
  init: async (runtime) => await initCharacter({ runtime }),
  plugins: [nftPlugin, plugin_default, evmBalancePlugin]
};
var project = {
  agents: [projectAgent]
};
var src_default = project;
export {
  projectAgent,
  src_default as default,
  character
};

//# debugId=833975FD36B5B33464756E2164756E21
//# sourceMappingURL=index.js.map

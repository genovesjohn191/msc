import { LoggerOptions } from './logger.options';
import { LoggerContext } from '../logger.context';

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

/**
 * Gets the class name of the class instance
 * @param classInstance Class instance to extract the name
 */
export function getClassName(classInstance: any): string {
  return classInstance && classInstance.constructor.name;
}

/**
 * Gets the method arguments including their values of specified function
 * @param argValues Argunments of the function
 * @param func Function to extract the arguments values
 */
export function getArgsMap(argValues: any[], func: Function): Map<string, any> {
  let fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let argNames: string[] | null = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (argNames === null) { return new Map(); }

  let argsMap = new Map<string, any>();
  let argsTable = argNames.map((argName: string) => argNames.indexOf(argName));
  argsTable.forEach((argIndex: number) => {
    if (argIndex === -1 || argIndex >= argValues.length) { return ''; }
    argsMap.set(argNames[argIndex], argValues[argIndex]);
  });
  return argsMap;
}

/**
 * Gets the properties of the class instance
 * @param classInstance Intance of the class on where to obtain the properties
 */
export function getPropsMap(classInstance: any): Map<string, any> {
  let allProps = Object.keys(classInstance) || [];
  let filteredProps = allProps.filter((propName: string) =>
    typeof (classInstance[propName]) !== 'object'
  );
  let propMaps = new Map<string, any>();
  filteredProps.forEach((propName) => {
    propMaps.set(propName, classInstance[propName]);
  });
  return propMaps;
}

/**
 * Gets the current time in string
 */
export function getCurrentTime(): string {
  return (new Date()).toLocaleString().replace(',', '');
}

/**
 * Patches the logger into method
 * @param method Method to on where to apply the method
 * @param methodName Method name to be logged
 * @param options Logger options
 */
export function patchMethodLogger(
  className: string,
  method: Function,
  methodName: string,
  options: LoggerOptions
): Function {
  return function(...args) {
    logMessage(true, className, this, method, methodName, args, options);
    let result = method.apply(this, args);
    logMessage(false, className, this, method, methodName, args, options);
    return result;
  };
}

/**
 * Logs the message based on target elements
 * @param isStart Start or end flag
 * @param className Target class name to be logged
 * @param classObject Target class instance to be logged
 * @param method Method of the class to be applied
 * @param methodName Method name of the method
 * @param args Arguments of the method
 * @param options Options of the logger
 */
export function logMessage(
  isStart: boolean,
  className: string,
  classObject: any,
  method: Function,
  methodName: string,
  args: any[],
  options: LoggerOptions
): void {
  // Skip logging when the flag is not activated
  let loggerContext = LoggerContext.getInstance();
  if (!loggerContext.isLoggingEnabled) { return; }

  let timeStr = getCurrentTime() || '';
  let argsContext = convertMapToStringBuilder(getArgsMap(args, method));
  let propsContext = convertMapToStringBuilder(getPropsMap(classObject));

  let initLabel = isStart ? 'Started' : 'Ended';
  console.info(`%c ${timeStr}\t${className}::${methodName}\t ${initLabel}`, 'color: lightgreen');

  let logArgsIsEnabled = (options && options.logArguments) && argsContext && argsContext.length > 0;
  if (logArgsIsEnabled) { console.info(`\tArguments:`, ...argsContext); }

  let logPropsIsEnabled = (options && options.logProperties) && propsContext && propsContext.length > 0;
  if (logPropsIsEnabled) { console.info(`\tProperties:`, ...propsContext); }
}

/**
 * Converts map to string builder
 * @param map Map to be converted
 */
export function convertMapToStringBuilder(map: Map<string, any>): any[] {
  if (!map) { return []; }

  let stringBuilder: any[] = [];
  map.forEach((value, key) => {
    stringBuilder.push(`\t[${key}=`);
    stringBuilder.push(value);
    stringBuilder.push(']');
  });
  return stringBuilder;
}

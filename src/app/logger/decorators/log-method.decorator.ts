import { patchMethodLogger, getClassName } from './logger.helper';
import { LoggerOptions } from './logger.options';

/**
 * Logs the method including its argument values by default, otherwise
 * you can overwrite it on the options parameter
 * @param options Options of the logger
 */
export function LogMethod(options?: LoggerOptions) {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, methodName);
    }

    let originalMethod = descriptor.value;
    descriptor.value = patchMethodLogger(getClassName(this), originalMethod, methodName,
      options || {
        logArguments: true,
        logProperties: false
      } as LoggerOptions
    );
    return descriptor;
  };
}

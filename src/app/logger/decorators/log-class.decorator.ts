import { patchMethodLogger } from './logger.helper';
import { LoggerOptions } from './logger.options';

/**
 * Logs the class object including all of its methods and properties, otherwise
 * you can overwrite it on the options parameter
 * @param options Options of the logger
 */
export function LogClass(options?: LoggerOptions) {
  return (constructor: Function) => {
    let methodNames = Object.getOwnPropertyNames(constructor.prototype);
    if (methodNames) {
      methodNames.forEach((methodName) => {
        let methodDescriptor = Object.getOwnPropertyDescriptor(constructor.prototype, methodName);
        if (!methodDescriptor.value && typeof (methodDescriptor.value) !== 'function') { return; }

        let originalMethod = methodDescriptor.value;
        if (originalMethod.__ignoreLog) { return; }

        constructor.prototype[methodName] = patchMethodLogger(constructor.name, originalMethod, methodName,
          options || {
            logArguments: true,
            logProperties: false
          } as LoggerOptions
        );
      });
    }
  };
}

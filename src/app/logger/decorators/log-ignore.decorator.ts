
/**
 * Ignore the logging for this method
 */
export function LogIgnore() {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, methodName);
    }

    let originalMethod = descriptor.value;
    originalMethod.__ignoreLog = true;
    return descriptor;
  };
}

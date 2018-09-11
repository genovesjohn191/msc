export interface McsDelegate<T> {
  (...args: any[]): T;
}

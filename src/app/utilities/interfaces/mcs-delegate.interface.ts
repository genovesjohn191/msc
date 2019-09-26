export interface McsDelegate<T> {
  // tslint:disable-next-line:callable-types
  (...args: any[]): T;
}

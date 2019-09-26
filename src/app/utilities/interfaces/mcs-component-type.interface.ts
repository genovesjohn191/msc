export interface McsComponentType<T> {
  // tslint:disable-next-line:callable-types
  new(...args: any[]): T;
}

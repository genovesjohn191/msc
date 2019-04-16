export abstract class McsApiEntityFactory<T> {
  public factoryType: T;

  constructor(private _factoryInstance: new (...args: any[]) => T) { }

  public getServiceInstance() {
    return this._factoryInstance;
  }
}

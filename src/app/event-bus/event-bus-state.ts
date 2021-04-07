export abstract class EventBusState<T> {
  private _eventName: string;
  private _typeOf: T;

  constructor(eventName: string) {
    this._eventName = eventName;
  }

  public get eventName(): string {
    return this._eventName;
  }

  public get eventType() {
    return this._typeOf;
  }
}

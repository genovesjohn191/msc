export abstract class EventBusState<T> {
  private _eventName: string;
  private _typeOf: T;

  constructor(eventName: string) {
    this._eventName = eventName;
  }

  /**
   * Returns the event name
   */
  public get eventName(): string {
    return this._eventName;
  }

  /**
   * Returns the event type
   */
  public get eventType() {
    return this._typeOf;
  }
}

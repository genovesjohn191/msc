import {
  OperatorFunction,
  Observable,
  Operator,
  Subscriber,
  Subscription
} from 'rxjs';
import { InnerSubscriber } from 'rxjs/internal/InnerSubscriber';
import { OuterSubscriber } from 'rxjs/internal/OuterSubscriber';

class EmitLatestMapSubscriber<T, R> extends OuterSubscriber<T, R> {

  private _index: number = 0;
  private _pendingItem: T;
  private _activeItem: T;
  private _hasSubscription: boolean;
  private _hasCompleted: boolean;

  constructor(
    destination: Subscriber<R>,
    private _project: (value: T, index: number) => Observable<R>
  ) {
    super(destination);
  }

  public notifyError(error: any): void {
    this.destination.error(error);
  }

  public notifyComplete(outerSub: Subscription): void {
    const destination = this.destination as Subscription;
    destination.remove(outerSub);

    this._hasSubscription = false;

    if (this._pendingItem && this._pendingItem !== this._activeItem) {
      this._tryNext(this._pendingItem);
      this._pendingItem = undefined;
      return;
    }

    if (this._hasCompleted) {
      this.destination.complete();
    }
  }

  protected _next(value: T): void {
    this._pendingItem = value;
    if (this._hasSubscription) { return; }
    this._tryNext(value);
  }

  protected _complete(): void {
    this._hasCompleted = true;
    this.destination.complete();
    this.unsubscribe();
  }

  private _tryNext(value: T): void {
    let result: Observable<R>;
    let index = this._index++;

    try {
      result = this._project(value, index);
    } catch (error) {
      this.destination.error(error);
      this.unsubscribe();
      return;
    }

    this._hasSubscription = true;
    this._activeItem = value;
    this._executeInnerSub(result);
  }

  private _executeInnerSub(result: Observable<R>): void {
    const innerSubscriber = new InnerSubscriber(this, undefined, undefined);
    const destination = this.destination as Subscription;
    destination.add(innerSubscriber);
    result.subscribe(innerSubscriber);
  }
}

// tslint:disable-next-line:max-classes-per-file
class EmitLatestMapOperator<T, R> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>) { }

  public call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new EmitLatestMapSubscriber(subscriber, this.project));
  }
}

/**
 * Emits a value from the source Observable, then ignores subsequent values until
 * the previous has been emitted, then emits again the latest value from the subsequent
 * values. The same process will be executed again.
 */
export function emitLatestMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R> {

  return (source: Observable<T>) =>
    source.lift(new EmitLatestMapOperator(project));
}

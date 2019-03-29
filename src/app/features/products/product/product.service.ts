import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsProduct } from '@app/models';
import { CoreEvent } from '@app/core';

@Injectable()
export class ProductService {
  private _selectedProduct$ = new BehaviorSubject<McsProduct>(null);

  constructor(private _eventDispatcher: EventBusDispatcherService) { }

  /**
   * Returns the selected product as observable
   */
  public selectedProduct(): Observable<McsProduct> {
    return this._selectedProduct$.asObservable();
  }

  /**
   * Setst the product and notify the selection change
   * @param product Product to be selected
   */
  public setProduct(product: McsProduct): void {
    this._eventDispatcher.dispatch(CoreEvent.productSelected, product);
    this._selectedProduct$.next(product);
  }

  /**
   * Removes the selected product on the event bus
   */
  public removeSelectedProduct(): void {
    this._eventDispatcher.dispatch(CoreEvent.productUnSelected);
  }
}

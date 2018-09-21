import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isNullOrEmpty } from '@app/utilities';
import { McsProduct } from '@app/models';

@Injectable()
export class ProductService {
  /**
   * Stream for product selection
   */
  private _productSelectionChange = new BehaviorSubject<McsProduct>(undefined);
  public get productSelectionChange(): BehaviorSubject<McsProduct> {
    return this._productSelectionChange;
  }

  /**
   * The product selected from the list panel
   */
  private _selectedProduct: McsProduct;
  public get selectedProduct(): McsProduct { return this._selectedProduct; }

  constructor() {
    this._selectedProduct = new McsProduct();
  }

  /**
   * Select the product and notify the selection change
   * @param product Product to be selected
   */
  public selectProduct(product: McsProduct): void {
    if (isNullOrEmpty(product)) { return; }
    this._selectedProduct = product;
    this._productSelectionChange.next(product);
  }
}

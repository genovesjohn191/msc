import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isNullOrEmpty } from '../../../utilities';
import { Product } from '../models';

@Injectable()
export class ProductService {
  /**
   * Stream for product selection
   */
  private _productSelectionChange = new BehaviorSubject<Product>(undefined);
  public get productSelectionChange(): BehaviorSubject<Product> {
    return this._productSelectionChange;
  }

  /**
   * The product selected from the list panel
   */
  private _selectedProduct: Product;
  public get selectedProduct(): Product { return this._selectedProduct; }

  /**
   * Select the product and notify the selection change
   * @param product Product to be selected
   */
  public selectProduct(product: Product): void {
    if (isNullOrEmpty(product)) { return; }
    this._selectedProduct = product;
    this._productSelectionChange.next(product);
  }
}

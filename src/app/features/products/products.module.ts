import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Components */
import { ProductsComponent } from './products.component';
import { ProductComponent } from './product/product.component';
/** Providers List */
import { productsProviders } from './products.constants';

@NgModule({
  declarations: [
    ProductsComponent,
    ProductComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...productsProviders
  ]
})

export class ProductsModule { }

import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
/** Components */
import { ProductsComponent } from './products.component';
import { ProductComponent } from './product/product.component';
import { ProductAnnexComponent } from './shared';
/** Providers List */
import { productsProviders } from './products.constants';

@NgModule({
  declarations: [
    ProductsComponent,
    ProductComponent,
    ProductAnnexComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...productsProviders
  ]
})

export class ProductsModule { }

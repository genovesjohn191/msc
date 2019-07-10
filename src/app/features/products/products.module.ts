import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';

import { ProductsComponent } from './products.component';
import { ProductComponent } from './product/product.component';
import {
  productsProviders,
  productsRoutes
} from './products.constants';

@NgModule({
  declarations: [
    ProductsComponent,
    ProductComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(productsRoutes)
  ],
  providers: [
    ...productsProviders
  ]
})

export class ProductsModule { }

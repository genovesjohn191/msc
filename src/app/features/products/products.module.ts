import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { ProductsComponent } from './products.component';
import { ProductComponent } from './product/product.component';
import { ProductAnnexComponent } from './shared';
/** Providers List */
import {
  productsProviders,
  productsRoutes
} from './products.constants';

@NgModule({
  declarations: [
    ProductsComponent,
    ProductComponent,
    ProductAnnexComponent
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

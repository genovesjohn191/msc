import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';

/** Services */
import {
  ordersRoutesComponents,
  ordersProviders
} from './orders.constants';

/** Components */
import { ordersRoutes } from './orders.constants';
import { OrdersComponent } from './orders.component';
import { OrderComponent } from './order/order.component';
import { ScaleManagedServerComponent } from './scale-managed-server/scale-managed-server.component';

@NgModule({
  entryComponents: [
    ...ordersRoutesComponents
  ],
  declarations: [
    OrdersComponent,
    OrderComponent,
    ScaleManagedServerComponent
  ],
  imports: [
    RouterModule.forChild(ordersRoutes),
    SharedModule,
    FeaturesSharedModule
  ],
  providers: [...ordersProviders]
})

export class OrdersModule { }

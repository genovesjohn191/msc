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
import { ServerManagedScaleComponent } from './server-managed-scale/server-managed-scale.component';
import { VdcStorageExpandComponent } from './vdc-storage-expand/vdc-storage-expand.component';
import { VdcStorageCreateComponent } from './vdc-storage-create/vdc-storage-create.component';
import { ServiceInviewRaiseComponent } from './service-inview-raise/service-inview-raise.component';

@NgModule({
  entryComponents: [
    ...ordersRoutesComponents
  ],
  declarations: [
    OrdersComponent,
    OrderComponent,
    ServerManagedScaleComponent,
    VdcStorageExpandComponent,
    VdcStorageCreateComponent,
    ServiceInviewRaiseComponent
  ],
  imports: [
    RouterModule.forChild(ordersRoutes),
    SharedModule,
    FeaturesSharedModule
  ],
  providers: [...ordersProviders]
})

export class OrdersModule { }

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { OrderFirewallPolicyEditDialogComponent } from './order-firewall-policy-dialog.component';

@NgModule({
  declarations: [
    OrderFirewallPolicyEditDialogComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [
    OrderFirewallPolicyEditDialogComponent
  ],
  entryComponents: [ OrderFirewallPolicyEditDialogComponent ],
})
export class OrderDialogModule { }

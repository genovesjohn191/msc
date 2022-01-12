import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { DnsZoneTtlEditDialogComponent } from './dns-zone-ttl-edit-dialog.component';

@NgModule({
  declarations: [
    DnsZoneTtlEditDialogComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [
    DnsZoneTtlEditDialogComponent
  ],
  entryComponents: [ DnsZoneTtlEditDialogComponent ],
})
export class DnsZoneDialogModule { }

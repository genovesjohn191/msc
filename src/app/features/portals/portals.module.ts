import { NgModule } from '@angular/core';
/** Modules */
import { SharedModule } from '../../shared';
/** Components */
import { PortalsComponent } from './portals.component';
/** Providers List */
import { portalsProviders } from './portals.constants';

@NgModule({
  declarations: [
    PortalsComponent,
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...portalsProviders
  ]
})

export class PortalsModule { }

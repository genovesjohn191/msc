import { NgModule } from '@angular/core';
/** Components */
import { TicketsComponent } from './tickets.component';
/** Modules */
import { SharedModule } from '../../shared';
/** Providers List */
import { ticketsProviders } from './tickets.constants';

@NgModule({
  declarations: [
    TicketsComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...ticketsProviders
  ]
})

export class TicketsModule { }

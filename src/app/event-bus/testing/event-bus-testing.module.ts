import { NgModule } from '@angular/core';
import { eventBusProviders } from '../event-bus.constants';

@NgModule({
  providers: [
    ...eventBusProviders
  ]
})

export class EventBusTestingModule { }

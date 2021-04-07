import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';

import { eventBusProviders } from './event-bus.constants';

@NgModule({
  providers: eventBusProviders
})
export class EventBusModule {

  public static forRoot(): ModuleWithProviders<EventBusModule> {
    return { ngModule: EventBusModule };
  }

  constructor(@Optional() @SkipSelf() parentModule: EventBusModule) {
    if (parentModule) {
      throw new Error('EventBusModule is already loaded. Import it in the AppModule only');
    }
  }
}

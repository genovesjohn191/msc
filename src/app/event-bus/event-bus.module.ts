import {
  NgModule,
  Optional,
  SkipSelf,
  ModuleWithProviders
} from '@angular/core';
import { EventBusDispatcherService } from './event-bus-dispatcher.service';

@NgModule({
  providers: [
    EventBusDispatcherService
  ]
})

export class EventBusModule {
  /**
   * Use this method in your root module to provide the EventBusModule
   * and it should only be derived once
   */
  public static forRoot(): ModuleWithProviders {
    return { ngModule: EventBusModule };
  }

  constructor(@Optional() @SkipSelf() parentModule: EventBusModule) {
    if (parentModule) {
      throw new Error('EventBusModule is already loaded. Import it in the AppModule only');
    }
  }
}

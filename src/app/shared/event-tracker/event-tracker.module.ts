import { NgModule } from '@angular/core';
import { EventTrackerDirective } from './event-tracker.directive';

@NgModule({
  declarations: [ EventTrackerDirective ],
  exports: [ EventTrackerDirective ]
})

export class EventTrackerModule {
}

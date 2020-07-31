import { NgModule } from '@angular/core';
import { CtaListComponent } from './cta-list.component';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives';
import { CommonModule } from '@angular/common';
import { EventTrackerModule } from '../event-tracker/event-tracker.module';

@NgModule({
  imports: [ IconModule, DirectivesModule, CommonModule, EventTrackerModule ],
  declarations: [ CtaListComponent ],
  exports: [ CtaListComponent ]
})
export class CtaListModule { }

import { NgModule } from '@angular/core';
import { CtaListComponent } from './cta-list.component';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives';
import { CommonModule } from '@angular/common';
import { EventTrackerModule } from '../event-tracker/event-tracker.module';
import { CtaListHeaderComponent } from './cta-list-header/cta-list-header.component';
import { CtaListBodyComponent } from './cta-list-body/cta-list-body.component';
import { CtaListActionComponent } from './cta-list-action/cta-list-action.component';
import { CtaListPanelComponent } from './cta-list-panel/cta-list-panel.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    IconModule,
    DirectivesModule,
    CommonModule,
    EventTrackerModule,
    MatIconModule
  ],
  declarations: [
    CtaListComponent,
    CtaListPanelComponent,
    CtaListHeaderComponent,
    CtaListBodyComponent,
    CtaListActionComponent
  ],
  exports: [
    CtaListComponent,
    CtaListPanelComponent,
    CtaListHeaderComponent,
    CtaListBodyComponent,
    CtaListActionComponent
  ]
})
export class CtaListModule { }

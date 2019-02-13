import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { RippleModule } from '../ripple/ripple.module';
import { OptionGroupModule } from '../option-group';

import { SelectComponent } from './select.component';
import { SelectTriggerLabelDirective } from './select-trigger-label.directive';

@NgModule({
  declarations: [
    SelectComponent,
    SelectTriggerLabelDirective
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule,
    OptionGroupModule
  ],
  exports: [
    SelectComponent,
    SelectTriggerLabelDirective,
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule,
    OptionGroupModule
  ]
})

export class SelectModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { RippleModule } from '../ripple/ripple.module';
import { TagListModule } from '../tag-list/tag-list.module';
import { OptionGroupModule } from '../option-group';

import { SelectComponent } from './select.component';
import { SelectSearchDirective } from './select-search.directive';
import { SelectTriggerLabelDirective } from './select-trigger-label.directive';

@NgModule({
  declarations: [
    SelectComponent,
    SelectSearchDirective,
    SelectTriggerLabelDirective
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule,
    OptionGroupModule,
    TagListModule
  ],
  exports: [
    SelectComponent,
    SelectSearchDirective,
    SelectTriggerLabelDirective,
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule,
    OptionGroupModule,
    TagListModule
  ]
})

export class SelectModule { }

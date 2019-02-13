import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';
import { RippleModule } from '../ripple/ripple.module';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { ItemModule } from '../item/item.module';
/** Options */
import { OptionGroupComponent } from './option-group.component';
import { OptionGroupLabelDirective } from './option-group-label.directive';
import { OptionGroupHeaderDirective } from './option-group-header.directive';
import { OptionComponent } from './option/option.component';

@NgModule({
  declarations: [
    OptionGroupComponent,
    OptionGroupLabelDirective,
    OptionGroupHeaderDirective,
    OptionComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule,
    CheckboxModule,
    ItemModule
  ],
  exports: [
    OptionGroupComponent,
    OptionGroupLabelDirective,
    OptionGroupHeaderDirective,
    OptionComponent,
    CommonModule,
    IconModule,
    DirectivesModule,
    RippleModule,
    CheckboxModule,
    ItemModule
  ]
})

export class OptionGroupModule { }

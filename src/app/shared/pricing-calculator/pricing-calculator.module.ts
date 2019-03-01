import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// TODO: Should be removed once the shared module was fully furnished
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '../directives/directives.module';
import { IconModule } from '../icon/icon.module';
import { ItemModule } from '../item/item.module';
import { LoaderModule } from '../loader/loader.module';

import { PricingCalculatorComponent } from './pricing-calculator.component';

@NgModule({
  declarations: [
    PricingCalculatorComponent
  ],
  imports: [
    CommonModule,
    DirectivesModule,
    IconModule,
    ItemModule,
    LoaderModule,
    TranslateModule
  ],
  exports: [
    DirectivesModule,
    IconModule,
    ItemModule,
    LoaderModule,
    PricingCalculatorComponent
  ]
})

export class PricingCalculatorModule { }

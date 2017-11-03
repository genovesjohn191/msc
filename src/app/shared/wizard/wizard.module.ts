import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { IconModule } from '../icon/icon.module';
import { ButtonModule } from '../button/button.module';
import { TabGroupModule } from '../tab-group/tab-group.module';
import { WizardComponent } from './wizard.component';
// Wizard step
import { WizardStepComponent } from './wizard-step/wizard-step.component';

@NgModule({
  declarations: [
    WizardComponent,
    WizardStepComponent
  ],
  imports: [
    CommonModule,
    TabGroupModule,
    LayoutModule,
    IconModule,
    ButtonModule
  ],
  exports: [
    WizardComponent,
    WizardStepComponent,
    TabGroupModule,
    LayoutModule,
    IconModule,
    ButtonModule
  ]
})

export class WizardModule { }

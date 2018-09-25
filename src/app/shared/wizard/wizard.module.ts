import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../directives/directives.module';
import { IconModule } from '../icon/icon.module';
import { ButtonModule } from '../button/button.module';
import { TabGroupModule } from '../tab-group/tab-group.module';
import { WizardComponent } from './wizard.component';
import { WizardActionPlacementDirective } from './wizard-step/wizard-action-placement.directive';
// Wizard step
import { WizardStepComponent } from './wizard-step/wizard-step.component';
// Wizard buttons
import { WizardStepNextDirective } from './wizard-buttons/wizard-step-next.directive';
import { WizardStepPreviousDirective } from './wizard-buttons/wizard-step-previous.directive';
// Wizard Top panel definitions
import { WizardTopPanelDefDirective } from './wizard-top-panel/wizard-top-panel-def.directive';
import {
  WizardTopPanelPlaceholderDirective
} from './wizard-top-panel/wizard-top-panel-placeholder.directive';

@NgModule({
  declarations: [
    WizardComponent,
    WizardActionPlacementDirective,
    WizardStepComponent,
    WizardStepNextDirective,
    WizardStepPreviousDirective,
    WizardTopPanelDefDirective,
    WizardTopPanelPlaceholderDirective
  ],
  imports: [
    CommonModule,
    TabGroupModule,
    DirectivesModule,
    IconModule,
    ButtonModule
  ],
  exports: [
    WizardComponent,
    WizardActionPlacementDirective,
    WizardStepComponent,
    WizardStepNextDirective,
    WizardStepPreviousDirective,
    WizardTopPanelDefDirective,
    WizardTopPanelPlaceholderDirective,
    TabGroupModule,
    DirectivesModule,
    IconModule,
    ButtonModule
  ]
})

export class WizardModule { }

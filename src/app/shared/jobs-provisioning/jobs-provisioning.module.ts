import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from '../progress-bar/progress-bar.module';
import { IconModule } from '../icon/icon.module';
import { AlertModule } from '../alert/alert.module';
import { DirectivesModule } from '../directives';
import { ButtonModule } from '../button';
import { JobsProvisioningComponent } from './jobs-provisioning.component';

@NgModule({
  declarations: [
    JobsProvisioningComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProgressBarModule,
    IconModule,
    AlertModule,
    DirectivesModule,
    ButtonModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ProgressBarModule,
    IconModule,
    AlertModule,
    DirectivesModule,
    ButtonModule,
    JobsProvisioningComponent
  ]
})

export class JobsProvisioningModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from '../progress-bar/progress-bar.module';
import { IconModule } from '../icon/icon.module';
import { LoaderModule } from '../loader/loader.module';
import { AlertModule } from '../alert/alert.module';
import { DirectivesModule } from '../directives';
import { ButtonModule } from '../button';
import { ItemModule } from '../item/item.module';
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
    LoaderModule,
    AlertModule,
    DirectivesModule,
    ButtonModule,
    ItemModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ProgressBarModule,
    IconModule,
    LoaderModule,
    AlertModule,
    ButtonModule,
    ItemModule,
    DirectivesModule,
    JobsProvisioningComponent
  ]
})

export class JobsProvisioningModule { }

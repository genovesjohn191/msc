import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressBarModule } from '../progress-bar/progress-bar.module';
import { IconModule } from '../icon/icon.module';
import { LoaderModule } from '../loader/loader.module';
import { AlertModule } from '../alert/alert.module';
import { DirectivesModule } from '../directives';
import { ButtonModule } from '../button';
import { ListModule } from '../list/list.module';
import { ItemModule } from '../item/item.module';

import { JobsProvisioningComponent } from './jobs-provisioning.component';
import { JobsProvisioningLoadingTextDirective } from './jobs-provisioning-loading-text.directive';

@NgModule({
  declarations: [
    JobsProvisioningComponent,
    JobsProvisioningLoadingTextDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ProgressBarModule,
    IconModule,
    LoaderModule,
    AlertModule,
    DirectivesModule,
    ButtonModule,
    ListModule,
    ItemModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ProgressBarModule,
    IconModule,
    LoaderModule,
    AlertModule,
    ButtonModule,
    ListModule,
    ItemModule,
    DirectivesModule,
    JobsProvisioningComponent,
    JobsProvisioningLoadingTextDirective
  ]
})

export class JobsProvisioningModule { }

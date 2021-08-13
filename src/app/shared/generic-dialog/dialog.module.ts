import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '../icon/icon.module';

import { DialogConfirmationComponent2 } from './dialog-confirmation/dialog-confirmation.component';
import { DialogMatchConfirmationComponent } from './dialog-match-confirmation/dialog-match-confirmation.component';
import { DialogMessageComponent2 } from './dialog-message/dialog-message.component';
import { DialogService2 } from './dialog.service';

@NgModule({
  providers: [
    DialogService2
  ],
  declarations: [
    DialogMessageComponent2,
    DialogConfirmationComponent2,
    DialogMatchConfirmationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    IconModule,

    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  exports: [
    CommonModule,
    DialogMessageComponent2,
    DialogConfirmationComponent2,
    DialogMatchConfirmationComponent,
    IconModule
  ]
})
export class DialogModule2 { }

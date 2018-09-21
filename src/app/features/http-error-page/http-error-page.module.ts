import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ButtonModule,
  DirectivesModule
} from '@app/shared';
/** Components */
import { HttpErrorPageComponent } from './http-error-page.component';
import { httpErrorRoutesComponents } from './http-error-page.constants';

@NgModule({
  entryComponents: [
    ...httpErrorRoutesComponents
  ],
  declarations: [
    HttpErrorPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    DirectivesModule
  ]
})

export class HttpErrorPageModule { }

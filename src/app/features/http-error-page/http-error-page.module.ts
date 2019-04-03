import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  DirectivesModule
} from '@app/shared';
/** Components */
import { httpErrorPageRoutes } from './http-error-page.constants';
import { HttpErrorPageComponent } from './http-error-page.component';

@NgModule({
  declarations: [
    HttpErrorPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(httpErrorPageRoutes),
    TranslateModule,
    ButtonModule,
    DirectivesModule
  ]
})

export class HttpErrorPageModule { }

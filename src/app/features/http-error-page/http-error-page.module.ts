import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '../../shared/button/button.module';
/** Components */
import { HttpErrorPageComponent } from './http-error-page.component';

@NgModule({
  declarations: [
    HttpErrorPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule
  ]
})

export class HttpErrorPageModule { }

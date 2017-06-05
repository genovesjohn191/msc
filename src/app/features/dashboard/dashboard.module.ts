import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** Components */
import { DashboardComponent } from './dashboard.component';
/** Modules */
import { SharedModule } from '../../shared';
/** Routes */
import { routes } from './dashboard.routes';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [
    DashboardComponent,
    RouterModule
  ]
})

export class DashboardModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** Components */
import { DashboardComponent } from './dashboard.component';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule
  ]
})

export class DashboardModule { }

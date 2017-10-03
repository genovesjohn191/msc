import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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

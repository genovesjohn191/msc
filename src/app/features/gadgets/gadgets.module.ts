import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** Components */
import { GadgetsComponent } from './gadgets.component';
/** Modules */
import { SharedModule } from '../../shared';
/** Routes */
import { routes } from './gadgets.routes';

@NgModule({
  declarations: [
    GadgetsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule
  ]
})

export class GadgetsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** Components */
import { GadgetsComponent } from './gadgets.component';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    GadgetsComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule
  ]
})

export class GadgetsModule { }

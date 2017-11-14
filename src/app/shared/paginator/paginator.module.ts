import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { RippleModule } from '../ripple/ripple.module';
import { PaginatorComponent } from './paginator.component';

@NgModule({
  declarations: [
    PaginatorComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    RippleModule
  ],
  exports: [
    PaginatorComponent,
    IconModule,
    RippleModule
  ]
})

export class PaginatorModule { }

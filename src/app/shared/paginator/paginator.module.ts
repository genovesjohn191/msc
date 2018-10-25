import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LoaderModule } from '../loader/loader.module';
import { RippleModule } from '../ripple/ripple.module';
import { PaginatorComponent } from './paginator.component';

@NgModule({
  declarations: [
    PaginatorComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    LoaderModule,
    RippleModule
  ],
  exports: [
    PaginatorComponent,
    IconModule,
    LoaderModule,
    RippleModule
  ]
})

export class PaginatorModule { }

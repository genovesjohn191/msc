import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderModule } from '../loader/loader.module';
import { LoadingComponent } from './loading.component';

@NgModule({
  declarations: [
    LoadingComponent
  ],
  imports: [
    CommonModule,
    LoaderModule
  ],
  exports: [
    LoadingComponent,
    LoaderModule
  ]
})

export class LoadingModule { }

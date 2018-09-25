import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { DirectivesModule } from '../directives/directives.module';

import { LoaderComponent } from './loader.component';

@NgModule({
  declarations: [
    LoaderComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    DirectivesModule
  ],
  exports: [
    LoaderComponent,
    IconModule,
    DirectivesModule
  ]
})

export class LoaderModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule,
    IconModule,
    LoaderModule,
    RippleModule
  ],
  exports: [
    PaginatorComponent,
    TranslateModule,
    IconModule,
    LoaderModule,
    RippleModule
  ]
})

export class PaginatorModule { }

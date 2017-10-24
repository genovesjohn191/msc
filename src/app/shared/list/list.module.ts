import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { ListComponent } from './list.component';
// List item
import { ListItemComponent } from './list-item/list-item.component';

@NgModule({
  declarations: [
    ListComponent,
    ListItemComponent
  ],
  imports: [
    CommonModule,
    LayoutModule
  ],
  exports: [
    ListComponent,
    ListItemComponent,
    CommonModule,
    LayoutModule
  ]
})

export class ListModule { }

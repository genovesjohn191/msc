import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { ListComponent } from './list.component';
import { ListHeaderDirective } from './list-header.directive';
// List item
import { ListItemComponent } from './list-item/list-item.component';

@NgModule({
  declarations: [
    ListComponent,
    ListItemComponent,
    ListHeaderDirective
  ],
  imports: [
    CommonModule,
    LayoutModule
  ],
  exports: [
    ListComponent,
    ListItemComponent,
    ListHeaderDirective,
    CommonModule,
    LayoutModule
  ]
})

export class ListModule { }

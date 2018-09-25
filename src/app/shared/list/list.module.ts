import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../directives/directives.module';
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
    DirectivesModule
  ],
  exports: [
    ListComponent,
    ListItemComponent,
    ListHeaderDirective,
    CommonModule,
    DirectivesModule
  ]
})

export class ListModule { }

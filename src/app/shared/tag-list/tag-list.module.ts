import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { TagListComponent } from './tag-list.component';
import { TagComponent } from './tag/tag.component';
import { TagInputDirective } from './tag-input/tag-input.directive';

@NgModule({
  declarations: [
    TagListComponent,
    TagComponent,
    TagInputDirective
  ],
  imports: [
    CommonModule,
    IconModule
  ],
  exports: [
    TagListComponent,
    TagComponent,
    TagInputDirective,
    IconModule
  ]
})

export class TagListModule { }

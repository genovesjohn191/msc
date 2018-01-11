import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icon/icon.module';
import { LayoutModule } from '../layout/layout.module';
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
    IconModule,
    LayoutModule
  ],
  exports: [
    TagListComponent,
    TagComponent,
    TagInputDirective,
    IconModule,
    LayoutModule
  ]
})

export class TagListModule { }

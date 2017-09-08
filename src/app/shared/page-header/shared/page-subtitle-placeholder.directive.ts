import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsPageSubTitlePlaceholder]'
})

export class PageSubTitlePlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

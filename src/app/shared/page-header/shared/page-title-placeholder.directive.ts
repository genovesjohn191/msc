import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsPageTitlePlaceholder]'
})

export class PageTitlePlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

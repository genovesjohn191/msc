import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsPageDescriptionPlaceholder]'
})

export class PageDescriptionPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

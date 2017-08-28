import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsHeaderPlaceholder]'
})

export class HeaderPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

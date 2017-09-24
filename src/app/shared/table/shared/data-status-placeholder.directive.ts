import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsDataStatusPlaceholder]'
})

export class DataStatusPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

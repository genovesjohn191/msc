import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsDataPlaceholder]'
})

export class DataPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

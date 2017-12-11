import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsSelectTagSubItemPlaceholder]'
})

export class SelectTagSubItemPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

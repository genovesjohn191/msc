import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsLeftPanelItemPlaceholder]'
})

export class LeftPanelItemPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

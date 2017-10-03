import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsLeftPanelPlaceholder]'
})

export class LeftPanelPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

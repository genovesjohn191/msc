import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsTopPanelPlaceholder]'
})

export class TopPanelPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

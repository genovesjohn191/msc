import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsTopPanelItemPlaceholder]'
})

export class TopPanelItemPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

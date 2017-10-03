import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsContentPanelPlaceholder]'
})

export class ContentPanelPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

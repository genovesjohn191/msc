import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsListItemsStatusPlaceholder]'
})

export class ListItemsStatusPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

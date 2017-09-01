import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsListItemsPlaceholder]'
})

export class ListItemsPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

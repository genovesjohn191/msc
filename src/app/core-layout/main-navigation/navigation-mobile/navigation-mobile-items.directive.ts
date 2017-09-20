import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsNavigationMobileItems]'
})

export class NavigationMobileItemsDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

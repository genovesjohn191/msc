import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsNavigationDesktopItems]'
})

export class NavigationDesktopItemsDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

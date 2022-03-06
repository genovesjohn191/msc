import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsSideSheet]',
})
export class SideSheetDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
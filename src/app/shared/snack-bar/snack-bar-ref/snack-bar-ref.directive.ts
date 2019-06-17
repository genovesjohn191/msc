import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[snackBarRef]'
})

export class SnackBarRefDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

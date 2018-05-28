import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsSnackBarRef]'
})

export class McsSnackBarRefDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

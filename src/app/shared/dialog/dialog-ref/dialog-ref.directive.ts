import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[dialogRef]'
})

export class DialogRefDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

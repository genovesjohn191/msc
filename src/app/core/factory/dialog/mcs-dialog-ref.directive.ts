import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsDialogRef]'
})

export class McsDialogRefDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

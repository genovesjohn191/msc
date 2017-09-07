import {
  Directive,
  ElementRef
} from '@angular/core';

@Directive({
  selector: '[mcsListSearchDef]'
})

export class ListSearchDefDirective {
  constructor(public elementRef: ElementRef) { }
}

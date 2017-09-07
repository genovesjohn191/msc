import {
  Directive,
  ElementRef
} from '@angular/core';

@Directive({
  selector: '[mcsListPanelDef]'
})

export class ListPanelDefDirective {
  constructor(public elementRef: ElementRef) { }
}

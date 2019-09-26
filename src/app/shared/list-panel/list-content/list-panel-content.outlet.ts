import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsListPanelContentOutlet]'
})

export class ListPanelContentOutletDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

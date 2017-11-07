import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsWizardActionPlacement]'
})

export class WizardActionPlacementDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

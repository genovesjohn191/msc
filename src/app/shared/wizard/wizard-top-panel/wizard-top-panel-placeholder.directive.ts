import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsWizardTopPanelPlaceholder]'
})

export class WizardTopPanelPlaceholderDirective {
  constructor(public viewContainer: ViewContainerRef) { }
}

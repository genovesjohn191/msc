import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsWizardTopPanelDef]'
})

export class WizardTopPanelDefDirective {
  constructor(public template: TemplateRef<any>) { }
}

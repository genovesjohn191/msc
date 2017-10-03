import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsLeftPanelDef]'
})

export class LeftPanelDefDirective {
  constructor(public template: TemplateRef<any>) { }
}

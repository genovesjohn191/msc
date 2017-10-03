import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsContentPanelDef]'
})

export class ContentPanelDefDirective {
  constructor(public template: TemplateRef<any>) { }
}

import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsTopPanelDef]'
})

export class TopPanelDefDirective {
  constructor(public template: TemplateRef<any>) { }
}

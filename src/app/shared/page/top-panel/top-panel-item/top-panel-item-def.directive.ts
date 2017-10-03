import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsTopPanelItemDef]'
})

export class TopPanelItemDefDirective {
  constructor(public template: TemplateRef<any>) { }
}

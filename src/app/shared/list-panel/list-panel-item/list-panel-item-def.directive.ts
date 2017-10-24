import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsListPanelItemDef]'
})

export class ListPanelItemDefDirective {
  constructor(public template: TemplateRef<any>) { }
}

import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsLeftPanelItemDef]'
})

export class LeftPanelItemDefDirective {
  constructor(public template: TemplateRef<any>) { }
}

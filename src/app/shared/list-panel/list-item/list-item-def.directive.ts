import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsListItemDef]'
})

export class ListItemDefDirective {
  constructor(public template: TemplateRef<any>) { }
}

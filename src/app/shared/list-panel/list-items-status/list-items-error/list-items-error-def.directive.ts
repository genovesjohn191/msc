import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsListItemsErrorDef]'
})

export class ListItemsErrorDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

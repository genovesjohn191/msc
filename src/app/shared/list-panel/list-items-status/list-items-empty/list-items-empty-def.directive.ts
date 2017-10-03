import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsListItemsEmptyDef]'
})

export class ListItemsEmptyDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

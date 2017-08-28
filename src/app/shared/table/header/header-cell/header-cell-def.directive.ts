import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsHeaderCellDef]'
})

export class HeaderCellDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

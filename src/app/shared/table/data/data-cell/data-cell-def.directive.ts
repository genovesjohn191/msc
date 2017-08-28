import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsDataCellDef]'
})

export class DataCellDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsDataEmptyDef]'
})

export class DataEmptyDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

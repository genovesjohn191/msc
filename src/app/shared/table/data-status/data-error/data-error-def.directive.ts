import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsDataErrorDef]'
})

export class DataErrorDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

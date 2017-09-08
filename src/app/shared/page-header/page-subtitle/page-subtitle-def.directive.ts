import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsPageSubTitleDef]'
})

export class PageSubTitleDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

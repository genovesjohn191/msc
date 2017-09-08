import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsPageTitleDef]'
})

export class PageTitleDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

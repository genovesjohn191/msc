import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsPageDescriptionDef]'
})

export class PageDescriptionDefDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }
}

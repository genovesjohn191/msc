import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsPageHeader]'
})

export class PageHeaderDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

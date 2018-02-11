import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsListHeader]'
})

export class ListHeaderDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

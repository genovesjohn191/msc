import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsOptionGroupHeader]'
})

export class OptionGroupHeaderDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

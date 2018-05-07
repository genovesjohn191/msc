import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsOptionGroupLabel]'
})

export class OptionGroupLabelDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

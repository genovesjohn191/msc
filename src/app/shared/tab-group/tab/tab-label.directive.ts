import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsTabLabel]'
})

export class TabLabelDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

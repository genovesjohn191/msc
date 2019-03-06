import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsLeftPanelItemHeader]'
})

export class LeftPanelItemHeaderDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

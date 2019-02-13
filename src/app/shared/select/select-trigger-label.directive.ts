import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsSelectTriggerLabel]'
})

export class SelectTriggerLabelDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

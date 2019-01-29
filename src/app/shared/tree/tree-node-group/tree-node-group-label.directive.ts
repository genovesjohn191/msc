import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsTreeNodeGroupLabel]'
})

export class TreeNodeGroupLabelDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

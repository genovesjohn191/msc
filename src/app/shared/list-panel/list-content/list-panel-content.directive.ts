import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsListPanelContent]'
})

export class ListPanelContentDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

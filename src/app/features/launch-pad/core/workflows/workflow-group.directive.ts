import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[workflowGroup]',
})
export class WorkflowGroupDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

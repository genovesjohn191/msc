import {
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsJobsProvisioningLoadingText]'
})

export class JobsProvisioningLoadingTextDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

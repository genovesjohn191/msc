import {
  Component,
  ChangeDetectionStrategy,
  Input, ViewChild, OnDestroy
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  DynamicFormComponent,
  DynamicFormFieldDataBase
} from '@app/features-shared/dynamic-form';
import { LaunchPadWorkflow } from './workflow';
import { LaunchPadWorkflowType, Workflow } from './workflow.interface';

@Component({
  selector: 'mcs-launch-pad-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
  host: {
    'class': 'mcs-launch-pad-workflow',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LaunchPadWorkflowComponent implements OnDestroy {
  @ViewChild('form', { static: false})
  protected form: DynamicFormComponent;

  @Input()
  public title: string;

  @Input()
  public type: LaunchPadWorkflowType;

  @Input()
  public referenceId: string;

  @Input()
  public parentReferenceId?: string;

  @Input()
  public serviceId?: string;

  @Input()
  public parentServiceId?: string;

  @Input()
  public fieldData: DynamicFormFieldDataBase[];

  @Input()
  public required: boolean = false;

  public panelOpenState: boolean = false;

  public get formGroup(): FormGroup {
    return this.form.form;
  }

  public get included(): boolean {
    return this.required || this.panelOpenState === true;
  }

  public ngOnDestroy(): void {
    this.form.ngOnDestroy();
  }

  public openPanel(): void {
    this.panelOpenState = true;
  }

  public closePanel(): void {
    this.panelOpenState = false;

    if (this.required) {
      this.form.markAsTouched();
    }
  }

  public GetRawValue(): Workflow {
    if (!this.included) {
      return null;
    }

    // Return valid workflow structure
    return {
      type: this.type,
      referenceId: this.referenceId,
      parentReferenceId: this.parentReferenceId,
      serviceId: this.serviceId,
      parentServiceId: this.parentServiceId,
      properties: this.form.GetRawValue()
    };
  }

  public get valid(): boolean {
    if (this.form) {
      return this.form.form.valid;
    }

    return false;
  }

  public reset(): void {
    this.form.resetForm();
  }

  public load(workflow: LaunchPadWorkflow): void {
    this.title = workflow.title;
    this.required = workflow.required;
    this.type = workflow.type;
    this.referenceId = workflow.referenceId;
    this.parentReferenceId = workflow.parentReferenceId;
    this.serviceId = workflow.serviceId;
    this.parentServiceId = workflow.parentServiceId;
    this.fieldData = workflow.properties;
  }
}

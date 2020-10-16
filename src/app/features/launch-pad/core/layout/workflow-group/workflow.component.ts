import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

import {
  DynamicFormComponent,
  DynamicFormFieldDataBase
} from '@app/features-shared/dynamic-form';
import { WorkflowType } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadWorkflow } from '../../workflows/workflow';
import { Workflow } from '../../workflows/workflow.interface';

@Component({
  selector: 'mcs-launch-pad-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
  host: {
    'class': 'mcs-launch-pad-workflow',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LaunchPadWorkflowComponent {
  @ViewChild('panel')
  public panel: MatExpansionPanel;

  @ViewChild('form')
  protected form: DynamicFormComponent;

  @Input()
  public title: string;

  @Input()
  public type: WorkflowType;

  @Input()
  public referenceId: string;

  @Input()
  public parentReferenceId?: string;

  @Input()
  public serviceId?: string;

  @Input()
  public fieldData: DynamicFormFieldDataBase[];

  @Input()
  public required: boolean = false;

  public openPanelByDefault: boolean = false;

  public panelOpenState: boolean = false;

  public get included(): boolean {
    return this.required || this.panelOpenState === true;
  }

  public panelOpened(): void {
    this.panelOpenState = true;
  }

  public panelClosed(): void {
    this.panelOpenState = false;

    if (this.required) {
      this.form.markAsTouched();
    }
  }

  public getRawValue(): Workflow {
    if (!this.included) {
      return null;
    }

    // Return valid workflow structure
    return {
      type: this.type,
      title: this.title,
      referenceId: this.referenceId,
      parentReferenceId: this.parentReferenceId,
      serviceId: this.serviceId,
      properties: this.form.getRawValue()
    };
  }

  public load(workflow: Workflow): void {
    if (!isNullOrEmpty(workflow.serviceId)) {
      this.serviceId = workflow.serviceId;
    }

    this.title = workflow.title;
    this.type = workflow.type;
    this.referenceId = workflow.referenceId;
    this.parentReferenceId = workflow.parentReferenceId;
    this.serviceId = workflow.serviceId;

    // Set fields
    this.form.setValues(workflow.properties);
    this.open();
  }

  public close(): void {
    if (!isNullOrEmpty(this.panel)) {
      this.panel.close();
    }
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

  public open(): void {
    this.openPanelByDefault = true;

    if (!isNullOrEmpty(this.panel)) {
      this.panel.open();
    }
  }

  public initialize(workflow: LaunchPadWorkflow): void {
    this.title = workflow.title;
    this.required = workflow.required;
    this.type = workflow.type;
    this.referenceId = workflow.referenceId;
    this.parentReferenceId = workflow.parentReferenceId;
    this.serviceId = workflow.serviceId;
    this.fieldData = workflow.properties;
  }
}

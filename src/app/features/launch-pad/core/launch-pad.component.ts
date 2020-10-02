import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  Input, OnDestroy
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadWorkflowGroupComponent } from './workflow-group.component';
import { WorkflowGroupConfig } from './workflows/workflow-group.interface';
import { Workflow } from './workflows/workflow.interface';

@Component({
  selector: 'mcs-launch-pad',
  templateUrl: './launch-pad.component.html',
  styleUrls: ['./launch-pad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadComponent implements OnDestroy {
  @ViewChild('stepper', { static: false})
  protected stepper: MatVerticalStepper;

  @ViewChild('workflows', { static: false})
  protected workflows: LaunchPadWorkflowGroupComponent;

  @Input()
  public set config(value: WorkflowGroupConfig) {
    this.workflowPayload = [];
    if (this.stepper) {
      this.stepper.reset();
    }
    this._config = value;
  }

  public get config(): WorkflowGroupConfig {
    return this._config;
  }

  public workflowPayload: Workflow[] = [];

  private _config: WorkflowGroupConfig;

  public ngOnDestroy(): void {
    // TODO: implement
  }

  public get valid(): boolean {
    if (isNullOrEmpty(this.workflows)) {
      return false;
    }
    return this.workflows.valid;
  }

  public get stepControl(): FormArray {
    if (isNullOrEmpty(this.workflows)) {
      return null;
    }
    return new FormArray(this.workflows.forms);
  }

  public addAnother(): void {
    this.workflows.reset();
  }

  public addToWorkflow(): void {
    this.workflows.payload.forEach((payload) => {
      // Get index if workflow is existing
      let index = this.workflowPayload.findIndex((item) => item.referenceId === payload.referenceId);

      if (index >= 0) {
        // Update parent
        this.workflowPayload[index] = payload;
        this._deleteChildren(payload.referenceId);
      } else {
        this.workflowPayload.push(payload);
      }
    });
  }

  public parse(payload: any): string {
    return JSON.stringify(payload, null, 2);
  }

  private _deleteChildren(parentReferenceId: string): void {
    this.workflowPayload = this.workflowPayload.filter(payload => payload.parentReferenceId !== parentReferenceId);
  }

  private _removeFromWorkflow(referenceId: string): void {
    this.workflowPayload = this.workflowPayload.filter(payload => payload.referenceId !== referenceId);
    this._deleteChildren(referenceId);
  }
}

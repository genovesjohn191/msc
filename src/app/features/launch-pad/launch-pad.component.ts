import {
  Component,
  ChangeDetectionStrategy, ViewChild, ChangeDetectorRef
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { isNullOrEmpty } from '@app/utilities';
import { Observable, of } from 'rxjs';
import { LaunchPadWorkflowGroupComponent } from './core/workflow-group.component';
import { Workflow } from './core/workflow.interface';
import { WorkflowGroupLaunchSettings } from './core/workflow.service';

@Component({
  selector: 'mcs-launch-pad',
  templateUrl: './launch-pad.component.html',
  styleUrls: ['./launch-pad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadComponent {
  @ViewChild('workflows', { static: false})
  protected workflows: LaunchPadWorkflowGroupComponent;

  public config$: Observable<WorkflowGroupLaunchSettings>;

  public workflowPayload: Workflow[] = [];

  constructor() {
    this.createWorkflowGroup({type: 'new-cvm', serviceId: 'MVC222222', parentServiceId: 'test2'});
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

  public createWorkflowGroup(settings: WorkflowGroupLaunchSettings): void {
    this.config$ = of(settings);
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

    console.log(this.workflowPayload);
  }

  private _deleteChildren(parentReferenceId: string): void {
    this.workflowPayload = this.workflowPayload.filter(payload => payload.parentReferenceId !== parentReferenceId);
  }

  public parse(payload: any): string {
    return JSON.stringify(payload, null, 2);
  }
}

import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy, Input
} from '@angular/core';

import { Guid, isNullOrEmpty } from '@app/utilities';
import { LaunchPadWorkflowComponent } from './workflow.component';
import { LaunchPadWorkflow } from './workflow';
import {
  LaunchPadWorkflowService,
  WorkflowGroupLaunchSettings
} from './workflow.service';
import { WorkflowGroupDirective } from './workflow-group.directive';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Workflow } from './workflow.interface';

@Component({
  selector: 'mcs-launch-pad-workflow-group',
  templateUrl: './workflow-group.component.html',
  styleUrls: ['./workflow-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LaunchPadWorkflowGroupComponent implements OnDestroy {
  public workflowComponentRef: ComponentRef<LaunchPadWorkflowComponent>[] = [];

  public componentRef: ComponentRef<any>;

  public title: string;

  @Input()
  public set config(value: WorkflowGroupLaunchSettings) {
    if (isNullOrEmpty(value)) {
      return;
    }
    this._renderWorkflowGroup(value);
  }

   @ViewChild(WorkflowGroupDirective, {static: true})
   workflowGroup: WorkflowGroupDirective;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _workflowService: LaunchPadWorkflowService) { }

  public ngOnDestroy() {
    this.workflowComponentRef.forEach(ref => {
      ref.destroy();
    });
  }

  /**
   * Returns validity of combined workflow
   */
  public get valid(): boolean {
    let valid: boolean = true;
    this.workflowComponentRef.forEach(ref => {
      if (ref.instance.included && !ref.instance.valid) {
        valid = false;
      }
    });

    return valid;
  }

  public get forms(): FormGroup[] {
    let formArray: FormGroup[]  = [];
    this.workflowComponentRef.forEach(ref => {
      if (ref.instance.included) {
        formArray.push(ref.instance.formGroup);
      }
    });
    return formArray;
  }

  /**
   * Returns consolidated fields
   */
  public get payload(): Workflow[] {
    let payloadItems: Workflow[] = [];
    this.workflowComponentRef.forEach(ref => {
      let payload = ref.instance.GetRawValue();
      if (!isNullOrEmpty(payload)) {
        payloadItems.push(payload);
      }
    });
    return payloadItems;
  }

  public reset(): void {
    let newParentReferenceId = Guid.newGuid().toString();
    this.workflowComponentRef.forEach(ref => {
      // Set new reference IDs
      if (isNullOrEmpty(ref.instance.parentReferenceId)) {
        ref.instance.referenceId = newParentReferenceId;
      } else {
        ref.instance.referenceId = Guid.newGuid().toString();
        ref.instance.parentReferenceId = newParentReferenceId;
      }

      ref.instance.reset();
    });
  }

  private _renderWorkflowGroup(config: WorkflowGroupLaunchSettings): void {
    let workflowGroup: LaunchPadWorkflow[] = this._workflowService.getWorkflowGroup(config);
    this.title = workflowGroup[0].title + ` [${config.serviceId}]`;

    this.workflowComponentRef = [];
    this.workflowGroup.viewContainerRef.clear();

    workflowGroup.forEach(workflow => {
      this._renderWorkflow(workflow);
    });
  }

  private _renderWorkflow(param: LaunchPadWorkflow): void {
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(LaunchPadWorkflowComponent);
    const viewContainerRef = this.workflowGroup.viewContainerRef;
    const componentRef = viewContainerRef.createComponent<LaunchPadWorkflowComponent>(componentFactory);

    // Set workflow settings
    componentRef.instance.load(param);

    this.workflowComponentRef.push(componentRef);
  }
}

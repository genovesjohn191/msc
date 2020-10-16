import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnInit
} from '@angular/core';

import {
  Guid,
  isNullOrEmpty
} from '@app/utilities';
import { LaunchPadWorkflowComponent } from './workflow.component';
import { LaunchPadWorkflow } from '../../workflows/workflow';
import { WorkflowService } from '../../workflows/workflow.service';
import { WorkflowGroupDirective } from '../../workflows/workflow-group.directive';
import { Workflow } from '../../workflows/workflow.interface';
import { WorkflowGroupConfig } from '../../workflows/workflow-group.interface';
import { Subject } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'mcs-launch-pad-workflow-group',
  templateUrl: './workflow-group.component.html',
  styleUrls: ['./workflow-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowGroupComponent implements OnInit {
  public workflowComponentRef: ComponentRef<LaunchPadWorkflowComponent>[] = [];

  public componentRef: ComponentRef<any>;

  public title: string;

  public serviceId: string;

  @Input()
  public companyId: string;

  @Input()
  public set config(value: WorkflowGroupConfig) {
    if (isNullOrEmpty(value)) {
      return;
    }
    this._renderWorkflowGroup(value);
  }

  @Input()
  protected loadWorkflowNotifier: Subject<Workflow[]>;

  @ViewChild(WorkflowGroupDirective, {static: true})
  public workflowGroup: WorkflowGroupDirective;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _workflowService: WorkflowService) { }

  public ngOnInit(): void {
    if (!isNullOrEmpty(this.loadWorkflowNotifier)) {
      this.loadWorkflowNotifier.subscribe((workflows) => this._loadWorkflowGroup(workflows));
    }
  }

  private _loadWorkflowGroup(workflows: Workflow[]): void {
    if (isNullOrEmpty(workflows)) {
      return;
    }

    // Load and edit each workflow
    let parentReferenceId: string = '';

    this.workflowComponentRef.forEach(ref => {
      // WARNING: Workflow - This will not handle similar types in a group
      let workflowIndex = workflows.findIndex((workflow) => workflow.type === ref.instance.type);

      let includeWorkflow = workflowIndex >= 0;
      if (!includeWorkflow) {
        ref.instance.referenceId = Guid.newGuid().toString();
        ref.instance.parentReferenceId = parentReferenceId;
        ref.instance.close();
        return;
      }

      // Set Service ID for the workflow group
      let isParentWorkflow = !isNullOrEmpty(workflows[workflowIndex].serviceId);
      if (isParentWorkflow) {
        parentReferenceId = workflows[workflowIndex].referenceId;
        this.serviceId = workflows[workflowIndex].serviceId;
      }

      // Load values to form
      ref.instance.load(workflows[workflowIndex]);
    });
  }

  /**
   * Returns validity of combined workflow
   */
  public get valid(): boolean {
    let validForm = true;
    let validServiceId: boolean = !isNullOrEmpty(this.serviceId);

    this.workflowComponentRef.forEach(ref => {
      if (ref.instance.included && !ref.instance.valid) {
        validForm = false;
      }
    });

    return validForm && validServiceId;
  }

  /**
   * Returns consolidated fields
   */
  public get payload(): Workflow[] {
    let payloadItems: Workflow[] = [];
    this.workflowComponentRef.forEach(ref => {
      let payload = ref.instance.getRawValue();
      if (!isNullOrEmpty(payload)) {
        payloadItems.push(payload);
      }
    });

    return payloadItems;
  }

  public reset(): void {
    let parentReferenceId = Guid.newGuid().toString();

    this.workflowComponentRef.forEach(ref => {
      // Set new reference IDs
      if (isNullOrEmpty(ref.instance.parentReferenceId)) {
        ref.instance.referenceId = parentReferenceId;
      } else {
        ref.instance.referenceId = Guid.newGuid().toString();
        ref.instance.parentReferenceId = parentReferenceId;
      }

      ref.instance.reset();
    });
  }

  public serviceIdChanged(event: MatSelectChange): void {
    this.serviceId = event.value;
    this._updateServiceId(this.serviceId);
  }

  private _updateServiceId(serviceId: string): void {
    this.workflowComponentRef.forEach(ref => {
      if (!isNullOrEmpty(ref.instance.serviceId)) {
        ref.instance.serviceId = serviceId ;
      }
    });
  }

  private _renderWorkflowGroup(config: WorkflowGroupConfig): void {
    let workflows: LaunchPadWorkflow[] = this._workflowService.getWorkflowGroup(config);
    this.serviceId = config.parent.serviceId;

    // Clear references and instances of existing workflow
    this.workflowComponentRef = [];
    this.workflowGroup.viewContainerRef.clear();

    if (isNullOrEmpty(workflows)) {
      console.log('No workflow group found.');
      return;
    }
    // Render workflows
    workflows.forEach(workflow => {
      this._renderWorkflow(workflow);
    });
  }

  private _renderWorkflow(param: LaunchPadWorkflow): void {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(LaunchPadWorkflowComponent);
    let componentRef = this.workflowGroup.viewContainerRef.createComponent<LaunchPadWorkflowComponent>(componentFactory);

    // Set workflow settings
    componentRef.instance.initialize(param);
    if (param.hasValueOverride) {
      componentRef.instance.open();
    }

    this.workflowComponentRef.push(componentRef);
  }
}

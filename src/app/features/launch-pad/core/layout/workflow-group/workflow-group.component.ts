import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnInit,
  ChangeDetectorRef
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
import { WorkflowGroupConfig, WorkflowGroupSaveState } from '../../workflows/workflow-group.interface';
import { Subject, throwError } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { McsApiService } from '@app/services';
import { McsObjectQueryParams, ProductType } from '@app/models';
import { workflowGroupMap } from '../../workflows/workflow-group.map';
import { catchError } from 'rxjs/operators';
import { productWorkflowGroupMap } from '../../workflows/product-workflow-group.map';

interface ServiceIdSelector {
  serviceId: string;
  description: string;
  productType: string;
}

@Component({
  selector: 'mcs-launch-pad-workflow-group',
  templateUrl: './workflow-group.component.html',
  styleUrls: ['./workflow-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowGroupComponent implements OnInit {
  @ViewChild(WorkflowGroupDirective, {static: true})
  public workflowGroup: WorkflowGroupDirective;

  // TODO: Update list
  @Input()
  public set context(value: WorkflowGroupSaveState) {
    if (isNullOrEmpty(value)) { return; }
    this._context = value;

    this.getServiceIds();

    if (!isNullOrEmpty(value.config)) {
      this._renderWorkflowGroup(value.config);
    }
  }

  public get context(): WorkflowGroupSaveState {
    return this._context;
  }

  @Input()
  protected loadWorkflowNotifier: Subject<Workflow[]>;

  public servicesOption: ServiceIdSelector[] = [];

  public workflowComponentRef: ComponentRef<LaunchPadWorkflowComponent>[] = [];

  public componentRef: ComponentRef<any>;

  public title: string;

  public serviceId: string;

  public ongoingServiceIdRetrieval: boolean = false;
  public hasServiceIdRetrievalError: boolean = false;

  private _context: WorkflowGroupSaveState;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _workflowService: WorkflowService,
    private _apiService: McsApiService) { }

  public ngOnInit(): void {
    if (!isNullOrEmpty(this.loadWorkflowNotifier)) {
      this.loadWorkflowNotifier.subscribe((workflows) => this._loadWorkflowGroup(workflows));
    }
  }

  public getServiceIds(): void {
    this.ongoingServiceIdRetrieval = true;
    this.hasServiceIdRetrievalError = false;

    // Get product types that are valid for this workflow group
    let validProductTypes: string[] = [];
    productWorkflowGroupMap.forEach((val, key) => {
      if (val.findIndex((workflowGroup) => workflowGroup === this._context.workflowGroupId) >= 0) {
        validProductTypes.push(ProductType[key]);
      }
    });

    // Get service list that are valid for this workflow group
    let queryParam = new McsObjectQueryParams();
    queryParam.pageSize = 100;
    queryParam.companyId = this._context.companyId;
    queryParam.productType = validProductTypes.join();

    this._apiService.getCrispElements(queryParam)
    .pipe(
      catchError(() => {
        this.ongoingServiceIdRetrieval = false;
        this.hasServiceIdRetrievalError = true;
        this._changeDetector.markForCheck();

        return throwError('Retrieving CRISP elements by product Type.');
      }))
    .subscribe((response) => {
      response.collection.forEach((service) => {
        // Ignore missing service ID
        if(isNullOrEmpty(service.serviceId)) { return; }
        // Ignore duplicate
        let isExistng = this.servicesOption.findIndex((item) => item.serviceId === service.serviceId) > 0;
        if (isExistng) { return; }

        this.servicesOption.push({
          serviceId: service.serviceId,
          description: service.description,
          productType: service.productType.toString()
        });

        this.ongoingServiceIdRetrieval = false;
        this._changeDetector.markForCheck();
      });
    });
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

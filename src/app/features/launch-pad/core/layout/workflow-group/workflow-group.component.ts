import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import {
  Guid,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { LaunchPadWorkflowComponent } from './workflow.component';
import { LaunchPadWorkflow } from '../../workflows/workflow';
import { WorkflowService } from '../../workflows/workflow.service';
import { WorkflowGroupDirective } from '../../workflows/workflow-group.directive';
import { Workflow, WorkflowData } from '../../workflows/workflow.interface';
import { WorkflowGroupConfig, WorkflowGroupSaveState } from '../../workflows/workflow-group.interface';
import { Subject, throwError } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { McsApiService } from '@app/services';
import { McsObjectQueryParams, ProductType } from '@app/models';
import { workflowGroupMap } from '../../workflows/workflow-group.map';
import { catchError, takeUntil } from 'rxjs/operators';
import { productWorkflowGroupMap } from '../../workflows/product-workflow-group.map';
import { LaunchPadServiceIdSwitchDialogComponent } from '../service-id-switch-dialog/service-id-switch-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorSnackbarDuration: number = 30000;

interface ServiceIdSelector {
  serviceId: string;
  description: string;
  productType: string;
  productId: string;
}

@Component({
  selector: 'mcs-launch-pad-workflow-group',
  templateUrl: './workflow-group.component.html',
  styleUrls: ['./workflow-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowGroupComponent implements OnInit, OnDestroy {
  @ViewChild(WorkflowGroupDirective, {static: true})
  public workflowGroup: WorkflowGroupDirective;

  @Input()
  public set context(value: WorkflowGroupSaveState) {
    if (isNullOrEmpty(value)) { return; }
    this._context = value;

    this.getServiceIds();
    this._loadWorkflow();
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

  public ongoingServiceIdRetrieval: boolean = false;
  public hasServiceIdRetrievalError: boolean = false;

  private _context: WorkflowGroupSaveState;
  private _dialogSubject = new Subject<void>();

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _workflowService: WorkflowService,
    private _apiService: McsApiService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,) { }

  public ngOnInit(): void {
    if (!isNullOrEmpty(this.loadWorkflowNotifier)) {
      this.loadWorkflowNotifier.subscribe((workflows) => this._loadWorkflowGroup(workflows));
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._dialogSubject);
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
          productType: service.productType.toString(),
          productId: service.productId,
        });
        this.context.companyName = service.companyName;

        this.ongoingServiceIdRetrieval = false;
        this._changeDetector.markForCheck();
      });
    });
  }

  private _loadWorkflow(): void {
    let workflowGroupType = workflowGroupMap.get(this.context.workflowGroupId);
    let workflowGroup = new workflowGroupType();

    let parent: WorkflowData = {
      id: workflowGroup.parent.id,
      serviceId: this.context.serviceId,
      propertyOverrides: [],
    };
    let children: WorkflowData[] = [];

    // TODO: This approach is for crisp-elements only
    this._apiService.getCrispElement(this.context.productId)
    .pipe(
      catchError(() => {
        this._context.config = {
          id: this.context.workflowGroupId,
          parent,
          children
        };

        this._snackBar.open('Unable to retrieve CRISP attributes.', 'OK', {
          duration: errorSnackbarDuration,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        this._renderWorkflowGroup(this.context.config);
        this._changeDetector.markForCheck();

        return throwError('Retrieving CRISP element failed.');
      }))
    .subscribe((response) => {
      // Sets the preselected values of the form
      parent.propertyOverrides = workflowGroup.parent.form.crispElementConverter(response.serviceAttributes);

      // TODO: Load the child overrides

      // Load the form
      this._context.config = {
        id: this.context.workflowGroupId,
        parent,
        children
      };

      this._renderWorkflowGroup(this.context.config);

      this._changeDetector.markForCheck();
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
        this.context.serviceId = workflows[workflowIndex].serviceId;
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
    let validServiceId: boolean = !isNullOrEmpty(this.context.serviceId);

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
    const loadSaveStateDialogRef = this._dialog.open(LaunchPadServiceIdSwitchDialogComponent, { data: event.value });

    loadSaveStateDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result === true) {

        this.context.serviceId = event.value;
        let service = this.servicesOption.find((item) => item.serviceId === this.context.serviceId);
        this.context.serviceId = this.context.serviceId;
        this.context.productId = service.productId;

        this._loadWorkflow();
        this._updateServiceId(this.context.serviceId);
        this._changeDetector.markForCheck();
      } else {

        this.context.serviceId = event.value;
        this._updateServiceId(this.context.serviceId);
        this._changeDetector.markForCheck();
      }
    });
  }

  private _updateServiceId(serviceId: string): void {
    this.workflowComponentRef.forEach(ref => {
      if (!isNullOrEmpty(ref.instance.serviceId)) {
        ref.instance.serviceId = serviceId;
      }
    });
  }

  private _renderWorkflowGroup(config: WorkflowGroupConfig): void {
    let workflows: LaunchPadWorkflow[] = this._workflowService.getWorkflowGroup(config);
    this.context.serviceId = config.parent.serviceId;

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

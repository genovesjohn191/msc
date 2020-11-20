import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';

import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from '../../workflows/workflow-group.interface';
import { Observable } from 'rxjs';
import { McsApiService } from '@app/services';
import {
  McsObjectCrispElement,
  McsObjectQueryParams,
  ProductType
} from '@app/models';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap
} from 'rxjs/operators';
import { productWorkflowGroupMap } from '../../workflows/product-workflow-group.map';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'mcs-launch-pad-object-selector',
  templateUrl: './object-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadObjectSelectorComponent implements OnInit {
  @Input()
  public set context(value: WorkflowGroupSaveState) {
    if (isNullOrEmpty(value)) { return; }

    this._context = value;
    this._identifyValidProductTypes();
  }

  public get context(): WorkflowGroupSaveState {
    return this._context;
  }

  public get hasValidSelection(): boolean {
    return !isNullOrEmpty(this.selectedObject);
  }

  @Output()
  public targetObjectChanged = new EventEmitter<McsObjectCrispElement>();

  public filteredOptions: Observable<McsObjectCrispElement[]>;
  public isSwitching: boolean = false;
  public searchKeyword: string = '';
  public serviceFilterControl = new FormControl();

  public processing: boolean = false;
  public hasError: boolean = false;

  private _validProductTypes: string[];
  private _context: WorkflowGroupSaveState;
  public selectedObject: McsObjectCrispElement;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    this._initializeFiltering();
  }

  public switchNow(): void {
    this.targetObjectChanged.emit(this.selectedObject);
    this.isSwitching = false;
    this._changeDetector.markForCheck();
  }

  public displayProperty(value: McsObjectCrispElement) {
    if (value) { return value.serviceId + ' | ' + value.productId; }
  }

  private _identifyValidProductTypes(): void {
    this._validProductTypes = [];
    productWorkflowGroupMap.forEach((val, key) => {
      if (val.findIndex((workflowGroup) => workflowGroup === this._context.workflowGroupId) >= 0) {
        this._validProductTypes.push(ProductType[key]);
      }
    });
  }

  private _initializeFiltering(): void {
    this.filteredOptions = this.serviceFilterControl.valueChanges
    .pipe(
      startWith(null as void),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) => {
        // Do not proceed with empty search
        if (isNullOrEmpty(value)) { return []; };

        // Has selected an option
        if (typeof value === 'object') {
          this.selectedObject = value;
          this._changeDetector.markForCheck();
          return [];
        }

        this.processing = true;
        this.hasError = false;
        this._changeDetector.markForCheck();

        // Search CRISP for matches
        let queryParam = new McsObjectQueryParams();
        queryParam.keyword = value;
        queryParam.pageSize = 10;
        queryParam.companyId = this._context.companyId;
        queryParam.productType = this._validProductTypes.join();

        return this._apiService.getCrispElements(queryParam)
        .pipe(
          map((response) => {
            this.processing = false;
            this._changeDetector.markForCheck();
            return response.collection;
          }),
          catchError(() => {
            this.selectedObject = null;
            this.processing = false;
            this.hasError = false;
            this._changeDetector.markForCheck();

            this._snackBar.open('Unable to retrieve CRISP attributes.', 'OK', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });

            return [];
          }))
      }));
  }
}

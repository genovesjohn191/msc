import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  forwardRef,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { McsResourceStorage } from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { FormFieldBaseComponent } from '../form-field.base';

@Component({
  selector: 'mcs-select-storage-profile',
  templateUrl: './select-storage-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectStorageProfileComponent),
      multi: true
    }
  ],
  host: {
    'class': 'mcs-select-storage-profile'
  }
})
export class SelectStorageProfileComponent
  extends FormFieldBaseComponent<McsResourceStorage>
  implements OnInit, OnDestroy {

  public fcModel = new FormControl<any>('', []);
  public storages$: Observable<McsResourceStorage[]>;

  @Input()
  public disabled: boolean;

  @Input()
  public placeholder: string;

  @Input()
  public resourceId: string;

  private _destroySubject = new Subject<void>();
  private _storagesChange = new BehaviorSubject<McsResourceStorage[]>(null);

  constructor(
    private _translateService: TranslateService,
    private _apiService: McsApiService
  ) {
    super();
    this.placeholder = this._translateService.instant('label.selectStorage');
  }

  public ngOnInit(): void {
    this._validateResourceId();
    this._subscribeToStoragesChange();
    this._subscriveToSelectionChange();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  private _validateResourceId(): void {
    if (!isNullOrEmpty(this.resourceId)) { return; }
    throw new Error('Unable to use select-storage-profile without resourceId of undefined.');
  }

  private _subscribeToStoragesChange(): void {
    this.storages$ = this._storagesChange.pipe(
      takeUntil(this._destroySubject)
    );

    this._apiService.getResourceStorages(this.resourceId).pipe(
      tap(response => this._storagesChange.next(response?.collection))
    ).subscribe();
  }

  private _subscriveToSelectionChange(): void {
    this.fcModel.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(value => {
        if (this.disabled) { return; }
        let storageProfileFound = this._storagesChange.getValue().find(
          storage => storage.id === value
        );
        this.writeValue(storageProfileFound);
      })
    ).subscribe();
  }
}
import { Observable } from 'rxjs';
import {
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { McsOption } from '@app/models';
import {
  convertRawObjectToString,
  isNullOrEmpty,
  DataProcess
} from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldSelect } from './field-select';
import { FieldSelectDatasource } from './field-select.datasource';

@Component({
  selector: 'mcs-field-select',
  templateUrl: './field-select.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldSelectComponent<TValue>
  extends FormFieldBaseComponent2<TValue>
  implements IFieldSelect, OnInit, OnDestroy {

  @Input()
  public multiple: boolean;

  @Input()
  public dataSource: FieldSelectDatasource;

  @Output()
  public optionsChange = new EventEmitter<McsOption[]>();

  public dataProcess: DataProcess<any>;
  public optionItems$: Observable<McsOption[]>;

  constructor(
    _injector: Injector
  ) {
    super(_injector);
    this.dataProcess = new DataProcess();
  }

  @HostBinding('class')
  public get hostClass(): string | null {
    return convertRawObjectToString({
      'mcs-field-select': true
    });
  }

  public ngOnInit(): void {
    this._subscribeToOptionItems();
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  public showHelpText(option: McsOption): boolean {
    return !isNullOrEmpty(option.helpText) &&
      (option.disabled || option.alwaysShowHelpText);
  }

  private _subscribeToOptionItems(): void {
    this.dataProcess.setInProgress();

    this.optionItems$ = this.dataSource?.connect().pipe(
      takeUntil(this.destroySubject),
      tap(options => {
        this.dataProcess.setCompleted();
        this.optionsChange.next(options);
        this._updateCurrentSelectionByState(options);
      }),
      shareReplay(1)
    );
  }

  private _updateCurrentSelectionByState(options: McsOption[]): void {
    if (isNullOrEmpty(options)) { return; }
    let currentOption = options.find(option => option.value === this.value);
    if (currentOption?.disabled) {
      this.ngControl.control.setValue(null);
    }
  }
}

import { Observable } from 'rxjs';
import {
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { McsOption } from '@app/models';
import {
  convertRawObjectToString,
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

  private _subscribeToOptionItems(): void {
    this.dataProcess.setInProgress();

    this.optionItems$ = this.dataSource?.connect().pipe(
      takeUntil(this.destroySubject),
      tap(() => this.dataProcess.setCompleted()),
      shareReplay(1)
    );
  }
}

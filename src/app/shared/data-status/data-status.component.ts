import {
  Component,
  Input,
  OnDestroy,
  ElementRef,
  Renderer2,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef,
  ContentChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { McsDataStatusFactory } from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  unsubscribeSubject
} from '@app/utilities';
import { DataStatus } from '@app/models';
import { DataStatusErrorComponent } from './data-status-error/data-status-error.component';

@Component({
  selector: 'mcs-data-status',
  templateUrl: './data-status.component.html',
  styleUrls: ['./data-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'data-status-wrapper'
  }
})

export class DataStatusComponent implements OnDestroy {

  @ContentChild(DataStatusErrorComponent)
  public errorTemplate: DataStatusErrorComponent;

  @Input()
  public get dataStatusFactory(): McsDataStatusFactory<any> { return this._dataStatusFactory; }
  public set dataStatusFactory(value: McsDataStatusFactory<any>) {
    if (this._dataStatusFactory !== value) {
      this._dataStatusFactory = value;
      this._listenToStatusChanged();
    }
  }
  private _dataStatusFactory: McsDataStatusFactory<any>;

  @Input()
  public set alignment(value: string) {
    if (isNullOrEmpty(value)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, value);
  }

  /**
   * Returns the data status based on the factory class
   */
  public get dataStatus(): DataStatus {
    return isNullOrEmpty(this.dataStatusFactory) ?
      DataStatus.Success : this.dataStatusFactory.dataStatus;
  }

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) { }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  public get dataStatusEnum(): any {
    return DataStatus;
  }

  /**
   * Listen for every status changed of the factory
   */
  private _listenToStatusChanged(): void {
    if (isNullOrEmpty(this.dataStatusFactory)) { return; }
    this.dataStatusFactory.statusChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }
}

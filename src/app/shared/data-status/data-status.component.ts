import {
  Component,
  Input,
  OnDestroy,
  ElementRef,
  Renderer2,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import {
  McsDataStatusFactory,
  McsDataStatus,
  CoreDefinition
} from '../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../utilities';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mcs-data-status',
  templateUrl: './data-status.component.html',
  styleUrls: ['./data-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'data-status-wrapper'
  }
})

export class DataStatusComponent implements OnDestroy {

  @Input()
  public get dataStatusFactory(): McsDataStatusFactory<any> { return this._dataStatusFactory; }
  public set dataStatusFactory(value: McsDataStatusFactory<any>) {
    if (this._dataStatusFactory !== value) {
      this._dataStatusFactory = value;
      this._listenToStatusChanged();
    }
  }
  private _dataStatusFactory: McsDataStatusFactory<any>;

  private _statusChangedSubscription: Subscription;

  /**
   * Returns the data status based on the factory class
   */
  public get dataStatus(): McsDataStatus {
    return isNullOrEmpty(this.dataStatusFactory) ?
      McsDataStatus.Success : this.dataStatusFactory.dataStatus;
  }

  @Input()
  public set alignment(value: string) {
    if (isNullOrEmpty(value)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, value);
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) { }

  public ngOnDestroy() {
    unsubscribeSafely(this._statusChangedSubscription);
  }

  public get dataStatusEnum(): any {
    return McsDataStatus;
  }

  // Returns the spinner icon key
  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  // Returns the warning icon key
  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  // Returns the error icon key
  public get errorIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ERROR;
  }

  /**
   * Listen for every status changed of the factory
   */
  private _listenToStatusChanged(): void {
    if (isNullOrEmpty(this.dataStatusFactory)) { return; }
    this._statusChangedSubscription = this.dataStatusFactory.statusChanged
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }
}

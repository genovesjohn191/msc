import {
  Component,
  Input,
  OnInit,
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
import {
  McsDataStatusFactory,
  McsTextContentProvider,
  CoreDefinition
} from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  unsubscribeSubject
} from '@app/utilities';
import { McsDataStatus } from '@app/models';
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

export class DataStatusComponent implements OnInit, OnDestroy {
  public textContent: any;

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
  public get dataStatus(): McsDataStatus {
    return isNullOrEmpty(this.dataStatusFactory) ?
      McsDataStatus.Success : this.dataStatusFactory.dataStatus;
  }

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _textContentProvider: McsTextContentProvider
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.shared.dataStatus;
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  public get dataStatusEnum(): any {
    return McsDataStatus;
  }

  // Returns the spinner icon key
  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
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
    this.dataStatusFactory.statusChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }
}

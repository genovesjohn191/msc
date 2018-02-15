import {
  Component,
  Input,
  ElementRef,
  Renderer2,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import {
  McsDataStatus,
  CoreDefinition
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

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

export class DataStatusComponent {

  @Input()
  public get dataStatus(): McsDataStatus {
    return this._dataStatus;
  }
  public set dataStatus(value: McsDataStatus) {
    if (this._dataStatus !== value) {
      this._dataStatus = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _dataStatus: McsDataStatus;

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
}

import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'mcs-report-widget-data-status',
  templateUrl: './report-widget-data-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'status-message-wrapper'
  }
})

export class ReportWidgetDataStatusComponent implements OnChanges {
  @Input()
  public hasError: boolean = false;

  @Input()
  public processing: boolean = true;

  @Output()
  public retry = new EventEmitter<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngOnChanges(changes: SimpleChanges): void {
    this._changeDetectorRef.markForCheck();
  }

  public tryAgain(): void {
    this.retry.next();
  }
}

import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({ template: '' })
export abstract class ReportWidgetBase {
  @Output()
  public chartChange= new EventEmitter<string>(null);

  protected updateChartUri(chartUri: string): void {
    this.chartChange.emit(chartUri);
  }
}
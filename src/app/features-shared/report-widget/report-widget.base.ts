import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { McsOption } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

@Component({ template: '' })
export abstract class ReportWidgetBase {
  @Output()
  public chartChange = new EventEmitter<string>(null);

  protected updateChartUri(chartUri: string): void {
    this.chartChange.emit(chartUri);
  }

  protected generateCustomHtmlTooltip(
    title: string,
    options: McsOption[]
  ): string {

    // This would automatically ignore those empty or null items
    let htmlChartItemFunc = (label: string, value: string) => {
      if (isNullOrEmpty(value)) { return ''; }

      return `
        <div class="chart-item">
          <span class="chart-label">${label}:</span>
          <span class="chart-value">${value}</span>
        </div>
      `
    };

    return `
      <div class="chart-list">
        <span class="chart-title">${title}</span>
        ${options?.reduce((accumulatedHtml, next) =>
        accumulatedHtml + htmlChartItemFunc(next.text, next.value), '')}
      </div>
    `;
  }
}
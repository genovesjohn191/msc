import { ChartItem } from '@app/shared';
import { JsonProperty } from '@app/utilities';
import { McsReportSeverityAlerts } from './mcs-report-severity-alerts';

export class McsReportMonitoringAndAlerting {
  @JsonProperty()
  public startedOn: string = undefined;

  @JsonProperty()
  public totalAlerts: number = undefined;

  @JsonProperty()
  public alerts: McsReportSeverityAlerts[] = undefined;

  @JsonProperty()
  public alertsChartItem: ChartItem[] = undefined;
}


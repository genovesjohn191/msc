import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import {
  McsReportGenericItem,
  McsReportIntegerData,
  McsReportServiceChangeInfo,
  McsReportSeverityAlerts
} from '@app/models';
import { ServicesModule } from '@app/services';
import { ChartItem } from '@app/shared';
import { CoreTestingModule } from '../testing';
import { McsReportingService } from './mcs-reporting.service';

describe('McsReportingService', () => {

  /** Declare Service */
  let mcsReportingService: McsReportingService;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        CoreTestingModule,
        ServicesModule
      ]
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      mcsReportingService = TestBed.inject(McsReportingService);
    });
  }));

  /** Test Implementation */
  describe('_convertServiceChangeInfoToChartItem()', () => {
    it('should convert to chart item if serviceName and serviceCountChange isnt null or empty', () => {
      const item: McsReportServiceChangeInfo[] = [
        {
          serviceName: 'Azure Network Interface',
          serviceCountChange: 3
        },
        {
          serviceName: 'Azure Load Balancer',
          serviceCountChange: -1
        }
      ]
      let convertedChartItem = mcsReportingService._convertServiceChangeInfoToChartItem(item);
      let expectedResult: ChartItem[] = [
        {
          name: 'Change',
          xValue: 'Azure Network Interface',
          yValue: 3
        },
        {
          name: 'Change',
          xValue: 'Azure Load Balancer',
          yValue: -1
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });

    it('should not be converted to chart item if serviceName is null or empty', () => {
      const item: McsReportServiceChangeInfo[] = [
        {
          serviceName: null,
          serviceCountChange: 3
        },
        {
          serviceName: 'Azure Load Balancer',
          serviceCountChange: -1
        }
      ]
      let convertedChartItem = mcsReportingService._convertServiceChangeInfoToChartItem(item);
      let expectedResult: ChartItem[] = [
        {
          name: 'Change',
          xValue: 'Azure Load Balancer',
          yValue: -1
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });

    it('should not be converted to chart item if serviceCountChange is null or empty', () => {
      const item: McsReportServiceChangeInfo[] = [
        {
          serviceName: 'Azure Network Interface',
          serviceCountChange: 3
        },
        {
          serviceName: 'Azure Load Balancer',
          serviceCountChange: 0
        }
      ]
      let convertedChartItem = mcsReportingService._convertServiceChangeInfoToChartItem(item);
      let expectedResult: ChartItem[] = [
        {
          name: 'Change',
          xValue: 'Azure Network Interface',
          yValue: 3
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });
  });

  describe('_convertMonitoringAndAlertingToChartItem()', () => {
    it('should convert to chart item if description isnt null or empty', () => {
      const item: McsReportSeverityAlerts[] = [
        {
          severity: 0,
          totalAlerts: 5,
          description: 'Sev0'
        },
        {
          severity: 1,
          totalAlerts: 3,
          description: 'Sev1'
        }
      ]
      let convertedChartItem = mcsReportingService._convertMonitoringAndAlertingToChartItem(item);
      let expectedResult: ChartItem[] = [
        {
          name: '',
          xValue: 'Sev 0',
          yValue: 5
        },
        {
          name: '',
          xValue: 'Sev 1',
          yValue: 3
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });

    it('should not be converted to chart item if description is null or empty', () => {
      const item: McsReportSeverityAlerts[] = [
        {
          severity: 0,
          totalAlerts: 5,
          description: null
        },
        {
          severity: 1,
          totalAlerts: 3,
          description: 'Sev1'
        }
      ]
      let convertedChartItem = mcsReportingService._convertMonitoringAndAlertingToChartItem(item);
      let expectedResult: ChartItem[] = [
        {
          name: '',
          xValue: 'Sev 1',
          yValue: 3
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });
  });

  describe('_convertIntegerDataToChartItem()', () => {
    it('should convert to chart item if description isnt null or empty', () => {
      const item: McsReportIntegerData[] = [
        {
          name: 'Extensions',
          value: 8
        },
        {
          name: 'ResourceGroup',
          value: 5
        }
      ]
      let convertedChartItem = mcsReportingService._convertIntegerDataToChartItem(item);
      let expectedResult: ChartItem[] = [
        {
          name: '',
          xValue: 'Extensions',
          yValue: 8
        },
        {
          name: '',
          xValue: 'ResourceGroup',
          yValue: 5
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });

    it('should not be converted to chart item if description is null or empty', () => {
      const item: McsReportIntegerData[] = [
        {
          name: 'Extensions',
          value: 8
        },
        {
          name: null,
          value: 5
        }
      ]
      let convertedChartItem = mcsReportingService._convertIntegerDataToChartItem(item);
      let expectedResult: ChartItem[] = [
        {
          name: '',
          xValue: 'Extensions',
          yValue: 8
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });
  });

  describe('_convertGenericItemToChartItem()', () => {
    it('should convert data to chart item', () => {
      const items: McsReportGenericItem[] = [
        {
          name: 'Analytics',
          period: 'Dec 2019',
          value: 77.24
        },
        {
          name: 'Internet',
          period: 'Jan 2019',
          value: 33.56
        }
      ]
      let convertedChartItem = mcsReportingService._convertGenericItemToChartItem(items);
      let expectedResult: ChartItem[] = [
        {
          name: 'Analytics',
          xValue: 'Dec 2019',
          yValue: 77.24
        },
        {
          name: 'Internet',
          xValue: 'Dec 2019',
          yValue: 0
        },
        {
          name: 'Analytics',
          xValue: 'Jan 2019',
          yValue: 0
        },
        {
          name: 'Internet',
          xValue: 'Jan 2019',
          yValue: 33.56
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });
  });

  describe('_convertGenericItemToChartItemNoMonth()', () => {
    it('should convert data to chart item', () => {
      const items: McsReportGenericItem[] = [
        {
          name: 'Analytics',
          period: 'Dec 01',
          value: 77.24
        },
        {
          name: 'Compute',
          period: 'Dec 02',
          value: 23
        }
      ]
      let convertedChartItem = mcsReportingService._convertGenericItemToChartItemNoMonth(items);
      let expectedResult: ChartItem[] = [
        {
          name: 'Analytics',
          xValue: '01',
          yValue: 77.24
        },
        {
          name: 'Compute',
          xValue: '01',
          yValue: 0
        },
        {
          name: 'Analytics',
          xValue: '02',
          yValue: 0
        },
        {
          name: 'Compute',
          xValue: '02',
          yValue: 23
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });
  });

  describe('fillMissingRecordsWithDefault()', () => {
    it('should fill up missing period and name', () => {
      const items: McsReportGenericItem[] = [
        {
          name: 'Analytics',
          period: 'Jan 2019',
          value: 77.24
        },
        {
          name: 'Compute',
          period: 'Feb 2019',
          value: 23
        },
        {
          name: 'Internet',
          period: 'March 2019',
          value: 45
        }
      ]
      let convertedChartItem = mcsReportingService.fillMissingRecordsWithDefault(items);
      let expectedResult: McsReportGenericItem[] = [
        {
          name: 'Analytics',
          period: 'Jan 2019',
          value: 77.24
        },
        {
          name: 'Compute',
          period: 'Jan 2019',
          value: 0
        },
        {
          name: 'Internet',
          period: 'Jan 2019',
          value: 0
        },
        {
          name: 'Analytics',
          period: 'Feb 2019',
          value: 0
        },
        {
          name: 'Compute',
          period: 'Feb 2019',
          value: 23
        },
        {
          name: 'Internet',
          period: 'Feb 2019',
          value: 0
        },
        {
          name: 'Analytics',
          period: 'March 2019',
          value: 0
        },
        {
          name: 'Compute',
          period: 'March 2019',
          value: 0
        },
        {
          name: 'Internet',
          period: 'March 2019',
          value: 45
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });

    it('should not be added to newPeriodlist/newNames if period or name is null', () => {
      const items: McsReportGenericItem[] = [
        {
          name: 'Analytics',
          period: 'Jan 2019',
          value: 77.24
        },
        {
          name: 'Compute',
          period: 'Feb 2019',
          value: 23
        },
        {
          name: null,
          period: 'Feb 2019',
          value: 23
        },
        {
          name: 'Web + Mobile',
          period: null,
          value: 45
        },
        {
          name: 'Internet',
          period: 'March 2019',
          value: 45
        }
      ]
      let convertedChartItem = mcsReportingService.fillMissingRecordsWithDefault(items);
      let expectedResult: McsReportGenericItem[] = [
        {
          name: 'Analytics',
          period: 'Jan 2019',
          value: 77.24
        },
        {
          name: 'Compute',
          period: 'Jan 2019',
          value: 0
        },
        {
          name: 'Internet',
          period: 'Jan 2019',
          value: 0
        },
        {
          name: 'Analytics',
          period: 'Feb 2019',
          value: 0
        },
        {
          name: 'Compute',
          period: 'Feb 2019',
          value: 23
        },
        {
          name: 'Internet',
          period: 'Feb 2019',
          value: 0
        },
        {
          name: 'Analytics',
          period: 'March 2019',
          value: 0
        },
        {
          name: 'Compute',
          period: 'March 2019',
          value: 0
        },
        {
          name: 'Internet',
          period: 'March 2019',
          value: 45
        }
      ]
      expect(expectedResult).toEqual(convertedChartItem);
    });
  });
});
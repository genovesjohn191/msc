import {
  ComponentFixture,
  TestBed,
  waitForAsync
} from "@angular/core/testing";
import {
  ChartComponentBase,
  ChartConfig
} from "./chart-base.component";
import { By } from "@angular/platform-browser";
import { CoreTestingModule } from "@app/core/testing";
import { ServicesTestingModule } from "@app/services/testing";
import { StatusMessageModule } from "@app/shared/status-message/status-message.module";
import { NgApexchartsModule } from "ng-apexcharts";
import { ChartDataService } from "../chart-data.service";


describe("ChartComponentBase", () => {
  /** Stub Services/Components */
  let component: ChartComponentBase;
  let fixture: ComponentFixture<ChartComponentBase>;

  beforeEach(waitForAsync(() => {

    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ChartComponentBase,
      ],
      imports: [
        CoreTestingModule,
        ServicesTestingModule,
        NgApexchartsModule,
        StatusMessageModule
      ],
      providers: [
        ChartDataService
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ChartComponentBase);
      // fixture.detectChanges();

      component = fixture.componentInstance;

    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the component`, () => {
      expect(component).toBeTruthy();
    });

  });

  describe("setInputConfig", () => {

    let chartConfig: ChartConfig;

    beforeEach(() => {

    })
    it("should set the config values", () => {

      chartConfig = {
        type: 'donut'
      };
      component.config = chartConfig;

      expect(component.options.chart).toBeTruthy();
    });

    it("should set the chart config type", () => {

      chartConfig = {
        type: 'donut'
      };
      component.config = chartConfig;

      expect(component.options.chart.type).toEqual("donut");
    });

    it("should set the height value", () => {

      chartConfig = {
        height: '380px'
      };
      component.config = chartConfig;

      expect(component.options.chart.height).toEqual("380px");
    });

    it("should set the height to auto if not specified", () => {

      chartConfig = {
        type: 'donut'
      };
      component.config = chartConfig;

      expect(component.options.chart.height).toEqual("auto");
    });

    it("should set the x-axis value", () => {

      chartConfig = {
        xaxis: {
          title: "Test chart X"
        }
      };
      component.config = chartConfig;

      expect(component.options.xaxis).toBeTruthy();
    });

    it("should set the y-axis value", () => {

      chartConfig = {
        yaxis: {
          title: "Test chart Y"
        }
      };
      component.config = chartConfig;

      expect(component.options.yaxis).toBeTruthy();
    });

    it("should set the datalabels value", () => {

      chartConfig = {
        dataLabels: {
          enabled: true
        }
      };
      component.config = chartConfig;

      expect(component.options.dataLabels).toBeTruthy();
    });

    it("should set the legend value", () => {

      chartConfig = {
        legend: {
        }
      };
      component.config = chartConfig;

      expect(component.options.legend).toBeTruthy();
    });

    it("should set the plotoptions value", () => {

      chartConfig = {
        plotOptions: {
          bar: {}
        }
      };
      component.config = chartConfig;

      expect(component.options.plotOptions).toBeTruthy();
    });

    it("should set the colors value", () => {

      chartConfig = {
        colors: ["blue"]
      };
      component.config = chartConfig;

      expect(component.options.colors).toBeTruthy();
    });

    it("should call the updateChart() method", () => {

      spyOn(component, "updateChart");
      chartConfig = {
        type: "donut"
      };
      component.config = chartConfig;

      expect(component.updateChart).toHaveBeenCalled();
    });
  })

  describe("setInputnoDataMessage", () => {

    it("should display the data message value", () => {
      component.noDataMessage = "Sample Chart";
      fixture.detectChanges();
      const msgElement = fixture.debugElement.queryAll(By.css("mcs-status-message"));

      expect(msgElement[0].nativeElement.innerText).toContain("Sample Chart")
    })

    it("should display 'No chart items to display' if value is empty", () => {
      component.noDataMessage = "";
      fixture.detectChanges();
      const msgElement = fixture.debugElement.queryAll(By.css("mcs-status-message"));

      expect(msgElement[0].nativeElement.innerText).toContain("No chart items to display")
    })
  })
})
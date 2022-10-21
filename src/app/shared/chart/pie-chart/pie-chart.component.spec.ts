import { TestBed, waitForAsync } from "@angular/core/testing";
import { CoreTestingModule } from "@app/core/testing";
import { ServicesTestingModule } from "@app/services/testing";
import { StatusMessageModule } from "@app/shared/status-message/status-message.module";
import { NgApexchartsModule } from "ng-apexcharts";
import { ChartDataService } from "../chart-data.service";
import { PieChartComponent } from "./pie-chart.component";

describe("PieChartComponent", () => {
    /** Stub Services/Components */
  let component: PieChartComponent;

  beforeEach(waitForAsync(() => {

    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        PieChartComponent
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
      let fixture = TestBed.createComponent(PieChartComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-pie-chart element`, () => {
      expect(component).toBeTruthy();
    });

    it("should set the config", () => {
      expect(component.options).toBeTruthy();
    })

    it("should have default values for the legend", () => {
      expect(component.options.legend).toBeTruthy();
    })

    it("should have default values for the plotOptions", () => {
      expect(component.options.plotOptions).toBeTruthy();
    })
    
  });
})
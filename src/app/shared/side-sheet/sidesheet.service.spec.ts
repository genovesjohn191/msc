import {
  Overlay,
  OverlayModule
} from "@angular/cdk/overlay";
import { Component } from "@angular/core";
import {
  TestBed,
  waitForAsync
} from "@angular/core/testing";
import { CoreLayoutTestingModule } from "@app/core-layout/testing";
import { SideSheetService } from "./sidesheet.service";

@Component({
  selector: 'test-sidesheet-container',
  template: ``
})
export class SideSheetContainerTestComponent {

}

describe("SideSheetService", () => {
  let service: SideSheetService;
  let mockOverlay: Overlay;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SideSheetContainerTestComponent
      ],
      imports: [
        CoreLayoutTestingModule,
        OverlayModule
      ],
      providers: [
        Overlay
      ]
    });

    mockOverlay = TestBed.inject(Overlay);
    service = new SideSheetService(mockOverlay);
  }));

  describe("open()", () => {

    it(`should create sidesheet component`, () => {
      let sidesheetRef = service.open(SideSheetContainerTestComponent, {
        title: 'SideSheet Title',
        data: {
          message: 'Test Message'
        }
      });

      expect(sidesheetRef.componentInstance).toBeTruthy();
    })

  })

  describe("closeAll()", () => {

    it(`should execute without error`, () => {

      expect(() => { service.closeAll() }).not.toThrowError();
    })

  })

})
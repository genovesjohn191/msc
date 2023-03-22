import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { CoreTestingModule } from '@app/core/testing';

import { JsonViewerComponent } from './json-viewer.component';
import { JsonViewerModule } from './json-viewer.module';
@Component({
  selector: 'mcs-test-json-viewer',
  template: ``
})
export class TestJsonViewerComponent {
  @ViewChild(JsonViewerComponent)
  public JsonViewerComponent: JsonViewerComponent;

  public workflow: any;

  constructor() {
    this.workflow = [
      {
        type: "launchpad.managementtools.add",
        title: "Add to Management Tools",
        referenceId: "c9aab782-bfa0-4045-99c9-a3455f868150",
        parentReferenceId: "",
        serviceId: "MXCVM2860313256",
        productId: "163096459",
        properties: {
          hostName: "test",
          managementDomain: [
            {
              value: ".mgt.syd.intellicentre.net.au",
              label: ".mgt.syd.intellicentre.net.au"
            }
          ],
          ipAddress: "1.1.1.1",
          az: "IC2",
          osType: "LIN",
          deviceType: "SE",
          username: "",
          password: "",
          communityString: ""
        }
      }
    ];
  }
}
describe('JsonViewerComponent', () => {
  let component: TestJsonViewerComponent;
  /** Stub Services/Components */
  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestJsonViewerComponent
      ],
      imports: [
        JsonViewerModule,
        CoreTestingModule
      ]
    });
    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestJsonViewerComponent, {
      set: {
        template: `
        <mcs-json-viewer [obj]="workflow">
          <div>JSON Viewer Component template</div>
        </mcs-json-viewer>
        `
      }
    });
    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestJsonViewerComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));
  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-json-viewer element`, () => {
      let jsonViewerElement: any;
      jsonViewerElement = document.querySelector('mcs-json-viewer');
      expect(jsonViewerElement).not.toBe(null);
    });
  });

  describe('ngAfterContentInit() | ngAfterContentChecked()', () => {
    it(`should create table element`, () => {
      let tableElement: any;
      tableElement = document.querySelector('table');
      expect(tableElement).not.toBe(null);
    });

    it(`should create td element`, () => {
      let rowElement: NodeListOf<Element>;
      rowElement = document.querySelectorAll('td');
      expect(rowElement.length).toBe(40);
    });
  });
});
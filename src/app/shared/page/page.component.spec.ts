import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { PageComponent } from './page.component';
import { PageModule } from './page.module';
import { CoreTestingModule } from '@app/core/testing';

@Component({
  selector: 'mcs-test-page',
  template: ``
})
export class TestPageComponent {
  @ViewChild(PageComponent, { static: true })
  public pageComponent: PageComponent;
}

describe('PageComponent', () => {

  /** Stub Services/Components */

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestPageComponent
      ],
      imports: [
        PageModule,
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestPageComponent, {
      set: {
        template: `
        <mcs-page header="Page Header">

          <mcs-top-panel *mcsTopPanelDef>
            <mcs-top-panel-item *mcsTopPanelItemDef>
              <div>Top Panel Item 1</div>
            </mcs-top-panel-item>

            <mcs-top-panel-item *mcsTopPanelItemDef>
              <div>Top Panel Item 2</div>
            </mcs-top-panel-item>
          </mcs-top-panel>

          <mcs-left-panel *mcsLeftPanelDef>
            <mcs-left-panel-item *mcsLeftPanelItemDef header="Item Header 1">
              <div>Top Panel Item 1</div>
            </mcs-left-panel-item>

            <mcs-left-panel-item *mcsLeftPanelItemDef header="Item Header 2">
              <div>Top Panel Item 2</div>
            </mcs-left-panel-item>
          </mcs-left-panel>

          <mcs-content-panel *mcsContentPanelDef>
            <div>Content Panel Item</div>
          </mcs-content-panel>
        </mcs-page>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestPageComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-page element`, () => {
      let pageElement: any;
      pageElement = document.querySelector('mcs-page');
      expect(pageElement).not.toBe(null);
    });
  });
});

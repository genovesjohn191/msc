import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';
import { PageHeaderModule } from './page-header.module';

@Component({
  selector: 'mcs-test-page-header',
  template: ``
})
export class TestPageHeaderComponent {
  @ViewChild(PageHeaderComponent)
  public pageHeaderComponent: PageHeaderComponent;
}

describe('PageHeaderComponent', () => {

  /** Stub Services/Components */
  let component: TestPageHeaderComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestPageHeaderComponent
      ],
      imports: [
        PageHeaderModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestPageHeaderComponent, {
      set: {
        template: `
        <mcs-page-header>
          <mcs-page-title *mcsPageTitleDef>
            Header
          </mcs-page-title>
          <mcs-page-subtitle *mcsPageSubTitleDef>
            <span>100 Records</span>
          </mcs-page-subtitle>
          <mcs-page-description *mcsPageDescriptionDef>
            This is the description area
          </mcs-page-description>
        </mcs-page-header>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestPageHeaderComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-page-header element`, () => {
      let pageHeaderElement: any;
      pageHeaderElement = document.querySelector('mcs-page-header');
      expect(pageHeaderElement).not.toBe(null);
    });
  });

  describe('ngAfterContentInit()', () => {
    it(`should create the mcs-page-title element`, () => {
      let pageTitleElement: any;
      pageTitleElement = document.querySelector('mcs-page-title');
      expect(pageTitleElement).not.toBe(null);
    });

    it(`should create the mcs-page-subtitle element`, () => {
      let pageSubTitleElement: any;
      pageSubTitleElement = document.querySelector('mcs-page-subtitle');
      expect(pageSubTitleElement).not.toBe(null);
    });

    it(`should create the mcs-page-description element`, () => {
      let pageDescriptionElement: any;
      pageDescriptionElement = document.querySelector('mcs-page-description');
      expect(pageDescriptionElement).not.toBe(null);
    });
  });
});

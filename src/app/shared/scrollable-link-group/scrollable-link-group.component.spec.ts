import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';
import { ScrollableLinkGroupModule } from './scrollable-link-group.module';
import { ScrollableLinkGroupComponent } from './scrollable-link-group.component';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(ScrollableLinkGroupComponent)
  public scrollableLinkComponent: ScrollableLinkGroupComponent;
}

describe('ScrollableLinkGroupComponent', () => {

  /** Stub Services/Components */
  let component: TestComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        CoreTestingModule,
        ScrollableLinkGroupModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
          <mcs-scrollable-link-group>
            <mcs-scrollable-link label="Information">
              This is the information content
            </mcs-scrollable-link>
            <mcs-scrollable-link label="Description">
              This is the description content
            </mcs-scrollable-link>
          </mcs-scrollable-link-group>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create mcs-scrollable-link-group element`, () => {
      let element = document.querySelector('mcs-scrollable-link-group');
      expect(element).not.toBe(null);
    });

    it(`should create 2 mcs-scrollable-link element`, () => {
      let element = document.querySelectorAll('mcs-scrollable-link');
      expect(element).not.toBe(null);
      expect(element.length).toBe(2);
    });
  });

  describe('scrollableLinks()', () => {
    it(`should have mcs-scrollable-link element that has a label of Information`, () => {
      let allInformation = component.scrollableLinkComponent.scrollableLinks.first;
      expect(allInformation.label).toBe('Information');
    });

    it(`should have mcs-scrollable-link element that has a label of Description`, () => {
      let description = component.scrollableLinkComponent.scrollableLinks.last;
      expect(description.label).toBe('Description');
    });
  });
});

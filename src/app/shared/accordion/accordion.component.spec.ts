import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { triggerEvent } from '@app/utilities';
import { CoreTestingModule } from '@app/core/testing';
import { AccordionComponent } from './accordion.component';
import { AccordionModule } from './accordion.module';

@Component({
  selector: 'mcs-test-accordion',
  template: ``
})
export class TestAccordionComponent {
  @ViewChild(AccordionComponent, { static: false })
  public accordionComponent: AccordionComponent;
}

describe('AccordionComponent', () => {

  /** Stub Services/Components */
  let fixtureInstance: ComponentFixture<TestAccordionComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestAccordionComponent
      ],
      imports: [
        CoreTestingModule,
        AccordionModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestAccordionComponent, {
      set: {
        template: `
        <mcs-accordion [multi]="true" class="multiple-selection">
          <!-- Panel 1 -->
          <mcs-accordion-panel>
            <mcs-accordion-panel-header mcsPanelHeaderDef>
              <mcs-icon key="notification-bell"></mcs-icon>
              <h2 [ngStyle]="{'margin': '0px', 'padding-left': '20px'}">Multiple Panel Expanded</h2>
            </mcs-accordion-panel-header>
            <span>Standard management network for this VDC.</span>
            <span>
              <b>Gateway:</b> 172.30.18.94/27
            </span>
          </mcs-accordion-panel>

          <!-- Panel 2 -->
          <mcs-accordion-panel>
            <mcs-accordion-panel-header mcsPanelHeaderDef>
              <mcs-icon key="calendar"></mcs-icon>
              <h2 [ngStyle]="{'margin': '0px', 'padding-left': '20px'}">Customer_MGMT27124449</h2>
            </mcs-accordion-panel-header>
            <span>Standard management network for this VDC.</span>
            <span>
              <b>Gateway:</b> 172.30.18.95/27
            </span>
          </mcs-accordion-panel>
        </mcs-accordion>

        <mcs-accordion [multi]="false" class="single-selection">
          <!-- Panel 1 -->
          <mcs-accordion-panel>
            <mcs-accordion-panel-header mcsPanelHeaderDef>
              <mcs-icon key="notification-bell"></mcs-icon>
              <h2 [ngStyle]="{'margin': '0px', 'padding-left': '20px'}">Multiple Panel Expanded</h2>
            </mcs-accordion-panel-header>
            <span>Standard management network for this VDC.</span>
            <span>
              <b>Gateway:</b> 172.30.18.94/27
            </span>
          </mcs-accordion-panel>

          <!-- Panel 2 -->
          <mcs-accordion-panel>
            <mcs-accordion-panel-header mcsPanelHeaderDef>
              <mcs-icon key="calendar"></mcs-icon>
              <h2 [ngStyle]="{'margin': '0px', 'padding-left': '20px'}">Customer_MGMT27124449</h2>
            </mcs-accordion-panel-header>
            <span>Standard management network for this VDC.</span>
            <span>
              <b>Gateway:</b> 172.30.18.95/27
            </span>
          </mcs-accordion-panel>
        </mcs-accordion>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestAccordionComponent);
      fixtureInstance.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngAfterContentInit()', () => {
    it(`should create the mcs-accordion element`, () => {
      let element = document.querySelector('mcs-accordion');
      expect(element).not.toBe(null);
    });

    it(`should create 4 the mcs-accordion-panel element`, () => {
      let elements = document.querySelectorAll('mcs-accordion-panel');
      expect(elements.length).toBe(4);
    });

    it(`should create 4 the mcs-accordion-panel-header element`, () => {
      let elements = document.querySelectorAll('mcs-accordion-panel-header');
      expect(elements.length).toBe(4);
    });
  });

  describe('onClickHeaderPanel() when single selection', () => {
    let accordionElement: any;
    let elements: any;
    let firstElement: any;
    let secondElement: any;
    beforeEach(async((() => {
      accordionElement = document.querySelector('.single-selection');
      elements = accordionElement.querySelectorAll('mcs-accordion-panel-header');
      firstElement = elements[0];
      secondElement = elements[1];
      triggerEvent(firstElement, 'click');
      fixtureInstance.detectChanges();
    })));

    it(`should expand the panel of the first accordion-panel, and close the second panel`, () => {
      expect(firstElement.classList.contains('active')).toBeTruthy();
      expect(secondElement.classList.contains('active')).toBeFalsy();
    });

    it(`should expand the panel of the second accordion-panel, and close the first panel`, () => {
      triggerEvent(secondElement, 'click');
      fixtureInstance.detectChanges();

      expect(secondElement.classList.contains('active')).toBeTruthy();
      expect(firstElement.classList.contains('active')).toBeFalsy();
    });
  });

  describe('onClickHeaderPanel() when multiple selection', () => {
    let accordionElement: any;
    let elements: any;
    let firstElement: any;
    let secondElement: any;
    beforeEach(async((() => {
      accordionElement = document.querySelector('.multiple-selection');
      elements = accordionElement.querySelectorAll('mcs-accordion-panel-header');
      firstElement = elements[0];
      secondElement = elements[1];
      triggerEvent(firstElement, 'click');
      triggerEvent(secondElement, 'click');
      fixtureInstance.detectChanges();
    })));

    it(`should expand the panel of the first accordion-panel`, () => {
      expect(firstElement.classList.contains('active')).toBeTruthy();
    });

    it(`should expand the panel of the second accordion-panel`, () => {
      expect(secondElement.classList.contains('active')).toBeTruthy();
    });
  });
});

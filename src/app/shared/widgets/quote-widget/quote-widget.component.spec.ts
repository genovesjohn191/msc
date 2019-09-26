import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { QuoteWidgetComponent } from './quote-widget.component';
import { WidgetsModule } from '../widgets.module';
import { CoreTestingModule } from '@app/core/testing';

@Component({
  selector: 'mcs-test-quote-widget',
  template: ``
})
export class TestQuoteWidgetComponent {
  @ViewChild(QuoteWidgetComponent, { static: false })
  public quoteWidgetComponent: QuoteWidgetComponent;
}

describe('QuoteWidgetComponent', () => {

  /** Stub Services/Components */
  let component: TestQuoteWidgetComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestQuoteWidgetComponent
      ],
      imports: [
        CoreTestingModule,
        WidgetsModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestQuoteWidgetComponent, {
      set: {
        template: `
        <mcs-quote-widget>
          <ng-container mcsQuoteWidgetHeader>
            <span>Total Cost: $200</span>
          </ng-container>

          <div>
            <span>- Monthly cost</span>
            <span>: $150</span>
          </div>

          <div>
            <span>- One-off cost</span>
            <span>: $50</span>
          </div>
        </mcs-quote-widget>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestQuoteWidgetComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-quote-widget element`, () => {
      let element = document.querySelector('mcs-quote-widget');
      expect(element).not.toBe(null);
    });

    it(`should create the mcs-icon element inside mcs-quote-widget component`, () => {
      let widgetElement = document.querySelector('mcs-quote-widget');
      let iconElement = widgetElement.querySelector('mcs-icon');
      expect(iconElement).not.toBe(null);
    });
  });

  describe('toggleWidget()', () => {
    it(`should expand the panel of the mcs-quote-widget component when it is closed`, () => {
      component.quoteWidgetComponent.toggleWidget();
      expect(component.quoteWidgetComponent.collapse).toBeFalsy();
    });

    it(`should collapse the panel of the mcs-quote-widget component when it is opened`, () => {
      component.quoteWidgetComponent.toggleWidget();
      expect(component.quoteWidgetComponent.collapse).toBeFalsy();
      component.quoteWidgetComponent.toggleWidget();
      expect(component.quoteWidgetComponent.collapse).toBeTruthy();
    });
  });
});

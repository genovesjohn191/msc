import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';

// Load the implementations that should be tested
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreTestingModule } from './core/testing';

describe(`AppComponent`, () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        CoreTestingModule,
        RouterTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(AppComponent, {
      set: {
        template: `
          <div>AppComponent Template</div>
          <div id="preloader" #spinnerElement>
            <!-- This is the content to show the spinner -->
            <div></div>
          </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('constructor', () => {
    it(`should be readly initialized`, () => {
      expect(fixture).toBeDefined();
      expect(component).toBeDefined();
    });
  });
});

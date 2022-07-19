import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

// Load the implementations that should be tested
import { AppComponent } from './app.component';
import { McsAuthenticationService } from './core';
import { CoreTestingModule } from './core/testing';
import { ServicesModule } from './services';
import { McsApiService } from './services/mcs-api.service';
import { McsAzureResourcesRepository } from './services/repositories/mcs-azure-resources.repository';

describe(`AppComponent`, () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        CoreTestingModule,
        RouterTestingModule,
        ServicesModule
      ],
      providers: [
        McsAuthenticationService
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

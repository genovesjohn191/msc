import {
  async,
  TestBed
} from '@angular/core/testing';
import { MainNavigationComponent } from './main-navigation.component';
import { CoreLayoutTestingModule } from '../testing';

describe('MainNavigationComponent', () => {

  /** Stub Services/Components */
  let component: MainNavigationComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        MainNavigationComponent
      ],
      imports: [
        CoreLayoutTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(MainNavigationComponent, {
      set: {
        template: `<div>MainNavigationComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(MainNavigationComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    // TODO: Add Unit test for main navigation
  });
});

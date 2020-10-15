import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';

import { SectionComponent } from './section.component';

describe('SectionComponent', () => {

  /** Stub Services/Components */
  let component: SectionComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SectionComponent
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SectionComponent, {
      set: {
        template: `
          <div>SectionComponent Template</div>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(SectionComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.orientation = 'horizontal';
      component.spacing = 'large';
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('hostClasses()', () => {
    it(`should have spacing on the hostclasses`, () => {
      expect(component.hostClasses).toContain(`${component.spacing}`);
    });

    it(`should have orientation on the hostclasses`, () => {
      expect(component.hostClasses).toContain(`${component.orientation}`);
    });
  });
});

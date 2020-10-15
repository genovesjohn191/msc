import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { CtaListComponent } from './cta-list.component';

describe('CheckboxComponent', () => {

  /** Stub Services/Components */
  let component: CtaListComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        CtaListComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(CtaListComponent, {
      set: {
        template: `<div>CtaListComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(CtaListComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('iconSize()', () => {
    it('return medium when compact', () => {
      component.isCompact = true;
      expect(component.iconSize).toBe('medium');
    });

    it('return xxlarge when compact', () => {
      component.isCompact = false;
      expect(component.iconSize).toBe('xxlarge');
    });
  });
});

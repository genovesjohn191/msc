import {
  async,
  TestBed
} from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { UserPanelComponent } from './user-panel.component';
import { CommonDefinition } from '@app/utilities';
import { CoreLayoutTestingModule } from '../../testing';

describe('UserPanelComponent', () => {

  /** Stub Services/Components */
  let component: UserPanelComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        UserPanelComponent
      ],
      imports: [
        CoreLayoutTestingModule
      ],
      providers: [TranslateService]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(UserPanelComponent, {
      set: {
        template: `
          <div>UserPanelComponent Template</div>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(UserPanelComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should return the bell icon definition key', () => {
      expect(component.bellIconKey).toBe(CommonDefinition.ASSETS_FONT_BELL);
    });

    it('should return the user icon definition key', () => {
      expect(component.userIconKey).toBe(CommonDefinition.ASSETS_SVG_USER_WHITE);
    });

    it('should return the caret down icon definition key', () => {
      expect(component.caretDownIconKey).toBe(CommonDefinition.ASSETS_FONT_CHEVRON_DOWN);
    });

    it('should return the caret right icon definition key', () => {
      expect(component.logoutIconKey).toBe(CommonDefinition.ASSETS_SVG_LOGOUT_WHITE);
    });
  });
});

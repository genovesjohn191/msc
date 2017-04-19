import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserPanelComponent } from './user-panel.component';
import { AssetsProvider } from '../../core/providers/assets.provider';

describe('UserPanelComponent', () => {

  /** Stub Services/Components */
  let component: UserPanelComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        'bell': 'fa fa-bell-o',
        'user': 'fa fa-user-o',
        'caret-right': 'fa fa-caret-right'
      };

      return icons[key];
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        UserPanelComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        { provide: AssetsProvider, useValue: mockAssetsProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(UserPanelComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(UserPanelComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should return the icon class of bell icon if the provided bell icon key is valid', () => {
      component.ngOnInit();
      expect(component.bellIcon).toBeDefined();
    });

    it('should return the icon class of user icon if the provided user icon key is valid', () => {
      component.ngOnInit();
      expect(component.userIcon).toBeDefined();
    });

    it('should return the icon class of caret right icon if the provided icon key is valid', () => {
      component.ngOnInit();
      expect(component.caretRightIcon).toBeDefined();
    });
  });

});

import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';
import { MainNavigationComponent } from './main-navigation.component';
import {
  McsTextContentProvider,
  McsAuthService,
  McsUserType,
  McsBrowserService,
  McsDeviceType,
  CoreDefinition
} from '../../core';

describe('MainNavigationComponent', () => {

  /** Stub Services/Components */
  let component: MainNavigationComponent;
  let mockElementRef = new ElementRef(document.createElement('div'));
  let mockAuthService = {
    userName: 'Arrian',
    userType: McsUserType.User
  };
  let mockTitleService = {
    setTitle(title: string): void { return; }
  };
  let mockTextService = {
    content: 'dummy'
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        MainNavigationComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        { provide: ElementRef, useValue: mockElementRef },
        { provide: McsAuthService, useValue: mockAuthService },
        { provide: Title, useValue: mockTitleService },
        { provide: McsTextContentProvider, useValue: mockTextService },
        McsBrowserService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(MainNavigationComponent, {
      set: {
        template: `<div>Overridden template here</div>`
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
    it('should call subscribe from browserService.resizeWindowStream',
      inject([McsBrowserService], (mcsBrowserService: McsBrowserService) => {
        spyOn(mcsBrowserService.deviceTypeStream, 'subscribe');
        component.ngOnInit();
        expect(mcsBrowserService.deviceTypeStream.subscribe).toHaveBeenCalled();
      })
    );

    it('should get the toggle icon key definition', () => {
      expect(component.toggleIconKey).toBe(CoreDefinition.ASSETS_SVG_TOGGLE_NAV);
    });

    it('should get the arrow up icon key definition', () => {
      expect(component.arrowUpIconKey).toBe(CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE);
    });

    it('should get the caret right icon key definition', () => {
      expect(component.caretRightIconKey).toBe(CoreDefinition.ASSETS_FONT_CARET_RIGHT);
    });

    it('should get the close icon key definition', () => {
      expect(component.closeIconKey).toBe(CoreDefinition.ASSETS_FONT_CLOSE);
    });

    it('should get the sign out icon key definition', () => {
      expect(component.signOutIconKey).toBe(CoreDefinition.ASSETS_FONT_SIGN_OUT);
    });
  });

  describe('setTitle()', () => {
    it('should call setTitle() from titleService 1 time',
      inject([Title], (title: Title) => {
        spyOn(title, 'setTitle');

        component.setTitle('');
        expect(title.setTitle).toHaveBeenCalledTimes(1);
      }));
  });

  describe('isUser()', () => {
    it('should return true when user type is User', () => {
      let actualValue = component.isUser();
      expect(actualValue).toEqual(true);
    });
  });

  describe('onClickOutside()', () => {
    it('should set the value of navState to hide',
      inject([ElementRef], (elementRef: ElementRef) => {
        component.isMobile = true;
        component.navState = 'show';
        component.onClickOutside(null);
        expect(component.navState).toBe('hide');
      }));
  });
});

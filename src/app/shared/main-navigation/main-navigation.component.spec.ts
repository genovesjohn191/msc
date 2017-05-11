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
  McsAssetsProvider,
  McsAuthService,
  McsUserType,
  McsBrowserService,
  McsDeviceType
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
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        'caret-right': 'fa fa-caret-right',
        'close': 'fa fa-close',
        'sign-out': 'fa fa-sign-out'
      };

      return icons[key];
    }
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
        { provide: McsAssetsProvider, useValue: mockAssetsProvider },
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
        spyOn(mcsBrowserService.resizeWindowStream, 'subscribe');
        component.ngOnInit();
        expect(mcsBrowserService.resizeWindowStream.subscribe).toHaveBeenCalled();
      })
    );

    it('should set the value of listBullet if the provided icon key is valid', () => {
      component.ngOnInit();
      expect(component.listBullet).toBeDefined();
    });

    it('should set the value of navigationCloseButton if the provided icon key is valid', () => {
      component.ngOnInit();
      expect(component.navigationCloseButton).toBeDefined();
    });

    it('should set the value of signOutIcon if the provided icon key is valid', () => {
      component.ngOnInit();
      expect(component.signOutIcon).toBeDefined();
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

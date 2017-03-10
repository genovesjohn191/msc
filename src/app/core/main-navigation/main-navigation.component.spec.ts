import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';

import { MainNavigationComponent } from './main-navigation.component';
import { TextContentProvider } from '../providers/text-content.provider';
import {
  McsPortalAuthService,
  UserTypeEnum
} from '../services/mcs-portal-auth.service';

describe('MainNavigationComponent', () => {

  /** Stub Services/Components */
  let component: MainNavigationComponent;
  let authService = {
    userName: 'Arrian',
    userType: UserTypeEnum.User
  };
  let titleService = {
    setTitle(title: string): void { return; }
  };
  let textService = {
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
        { provide: McsPortalAuthService, useValue: authService },
        { provide: Title, useValue: titleService },
        { provide: TextContentProvider, useValue: textService }
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
});

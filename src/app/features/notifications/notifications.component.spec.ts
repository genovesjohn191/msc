import {
  async,
  inject,
  TestBed,
  tick,
  fakeAsync
} from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsTextContentProvider,
  McsApiSearchKey,
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsApiJob,
  McsApiService,
  McsNotificationContextService,
  McsNotificationJobService,
  CoreDefinition
} from '../../core';
import {
  NotificationsTestingModule,
  mockNotificationsService
} from './testing';

import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';

describe('NotificationsComponent', () => {

  /** Stub Services/Components */
  CoreDefinition.SEARCH_TIME = 0;
  let component: NotificationsComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        NotificationsComponent
      ],
      imports: [
        NotificationsTestingModule
      ]
    });

    /** Testbed Onverriding of Providers */
    TestBed.overrideProvider(NotificationsService, { useValue: mockNotificationsService });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(NotificationsComponent, {
      set: {
        template: `
          <div>NotificationsComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(NotificationsComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit() | constructor', () => {
    it('should defined the notificationsTextContent', () => {
      expect(component.notificationsTextContent).toBeDefined();
    });

    it('should set the initial page to 1', () => {
      expect(component.page).toEqual(1);
    });

    it('should get the spinner icon key definition', () => {
      expect(component.spinnerIconKey).toBe(CoreDefinition.ASSETS_GIF_SPINNER);
    });

    it('should get the arrow down icon key definition', () => {
      expect(component.arrowDownIconKey).toBe(CoreDefinition.ASSETS_FONT_CHEVRON_DOWN);
    });
  });

  describe('onClickMoreEvent()', () => {
    let previousPage = 0;
    let previousDisplayedCount = 0;

    beforeEach(async () => {
      previousPage = component.page;
      previousDisplayedCount = component.getDisplayNotificationsCount();
      spyOn(component.searchSubject, 'next');
      component.onClickMoreEvent();
    });

    it('should increase the page by 1', () => {
      expect(component.page).toEqual(previousPage + 1);
    });

    it('should increase the displayed items', () => {
      expect(component.getDisplayNotificationsCount())
        .toEqual(CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE * component.page);
    });

    it('should call the listener of the searchSubject', () => {
      expect(component.searchSubject.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('onSearchEvent() | onEnterSearchEvent()', () => {
    let searchKeyword = 'start';

    beforeEach(async () => {
      spyOn(component.searchSubject, 'next');
      component.onSearchEvent(searchKeyword);
    });

    it('should initialize the page and displayServerCount value to default', () => {
      expect(component.page).toEqual(1);
      expect(component.getDisplayNotificationsCount())
        .toEqual(CoreDefinition.NOTIFICATION_MAX_ITEM_PER_PAGE);
    });

    it('should update the keyword value', () => {
      expect(component.keyword).toEqual(searchKeyword);
    });

    it('should call the listener of the searchSubject', () => {
      expect(component.searchSubject.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateNotifications()', () => {
    let keyword: string = 'mongo';
    let page: number = 1;
    let searchKey: McsApiSearchKey = new McsApiSearchKey();

    beforeEach(async () => {
      searchKey.maxItemPerPage = 10;
      searchKey.page = page;
      searchKey.keyword = keyword;

      spyOn(component.searchSubject, 'next');
      component.onSearchEvent(keyword);
    });

    it('should call the next of searchSubject 1 time with parameter of searchKey', () => {
      expect(component.searchSubject.next).toHaveBeenCalledTimes(1);
      expect(component.searchSubject.next).toHaveBeenCalledWith(searchKey);
    });

    it('should set the isLoading flag to true', () => {
      expect(component.isLoading).toEqual(true);
    });
  });

  describe('_onChangeNotification()', () => {
    it('should update the notification list',
      fakeAsync(inject([McsNotificationContextService],
        (notificationContextService: McsNotificationContextService) => {
          let notifications: McsApiJob[] = new Array();
          let notification = new McsApiJob();
          notification.id = '6';
          notifications.push(notification);
          notification = new McsApiJob();
          notification.id = '7';
          notifications.push(notification);

          notificationContextService.notificationsStream.next(notifications);
          tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
          expect(component.notifications).toBeDefined();
          expect(component.notifications.length).toBe(4);
        })));
  });

  describe('onUpdateColumnSettings()', () => {
    it('should update the columnSettings', () => {
      let columnSettings = new Array<string>('mongo');
      component.onUpdateColumnSettings(columnSettings);
      expect(component.columnSettings).toEqual(columnSettings);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should destroy the subscription of searchSubscription', () => {
      spyOn(component.searchSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.searchSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should destroy the subscription of notificationsSubscription', () => {
      spyOn(component.notificationsSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.notificationsSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});

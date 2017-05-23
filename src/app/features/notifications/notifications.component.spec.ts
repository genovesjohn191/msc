import {
  async,
  inject,
  TestBed,
  tick,
  fakeAsync
} from '@angular/core/testing';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsTextContentProvider,
  McsAssetsProvider,
  McsApiSearchKey,
  McsApiSuccessResponse,
  McsApiJob,
  McsNotificationContextService,
  McsNotificationJobService,
  CoreDefinition
} from '../../core';

import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';

describe('NotificationsComponent', () => {

  /** Stub Services/Components */
  CoreDefinition.SEARCH_TIME = 0;
  let component: NotificationsComponent;
  let pageTitle: string = 'title';
  let notificationsServiceMock = {
    getNotifications(
      page?: number,
      perPage?: number,
      searchKeyword?: string): Observable<McsApiSuccessResponse<McsApiJob[]>> {

      let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob[]>();
      mcsApiResponseMock.status = 200;
      mcsApiResponseMock.totalCount = 2;
      mcsApiResponseMock.content = new Array();

      let notification = new McsApiJob();
      notification.id = '4';
      mcsApiResponseMock.content.push(notification);
      notification = new McsApiJob();
      notification.id = '5';
      mcsApiResponseMock.content.push(notification);

      return Observable.of(mcsApiResponseMock);
    }
  };
  let textContentProviderMock = {
    content: {
      notifications: {
        title: pageTitle
      }
    }
  };
  let assetsProviderMock = {
    getIcon(iconClass: string) {
      return iconClass;
    }
  };
  let mockMcsNotificationJobService = {
    notificationStream: new Subject<McsApiJob>(),
    connectionStatusStream: new Subject<any>()
  } as McsNotificationJobService;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        NotificationsComponent
      ],
      imports: [
      ],
      providers: [
        McsNotificationContextService,
        { provide: NotificationsService, useValue: notificationsServiceMock },
        { provide: McsNotificationJobService, useValue: mockMcsNotificationJobService },
        { provide: McsTextContentProvider, useValue: textContentProviderMock },
        { provide: McsAssetsProvider, useValue: assetsProviderMock }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(NotificationsComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
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

  // describe('ngOnDestroy()', () => {
  //   it('should destroy the subscription of searchSubject', () => {
  //     spyOn(component.searchSubscription, 'unsubscribe');
  //     component.ngOnDestroy();
  //     expect(component.searchSubscription.unsubscribe).toHaveBeenCalledTimes(1);
  //   });
  // });
});

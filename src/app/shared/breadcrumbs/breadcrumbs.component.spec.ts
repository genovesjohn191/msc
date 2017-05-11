import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { BreadcrumbsComponent } from './breadcrumbs.component';
import { BreadcrumbsService } from './breadcrumbs.service';

describe('BreadcrumbsComponent', () => {

  /** Stub Services/Components */
  let component: BreadcrumbsComponent;
  let mockBreadcrumbsService = new BreadcrumbsService();
  let mockRouterService = {
    navigateByUrl(): any { return null; },
    events: Observable.of(new Event('event'))
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        BreadcrumbsComponent
      ],
      imports: [
      ],
      providers: [
        { provide: BreadcrumbsService, useValue: mockBreadcrumbsService },
        { provide: Router, useValue: mockRouterService }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(BreadcrumbsComponent, {
      set: {
        template: `<div>Overridden template here</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(BreadcrumbsComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should call the subscribe() of BreadcrumbsService.updateItemListEvent',
      inject([BreadcrumbsService], (breadcrumbService: BreadcrumbsService) => {
        spyOn(breadcrumbService.updateItemListEvent, 'subscribe');
        component.ngOnInit();
        expect(breadcrumbService.updateItemListEvent.subscribe).toHaveBeenCalled();
      }));

    it('should update the value of routeList when updateItemListEvent.emit() is called',
      inject([BreadcrumbsService], (breadcrumbService: BreadcrumbsService) => {
        breadcrumbService.updateItemListEvent.next(new Array(3));
        expect(component.breadcrumbs.length).toEqual(3);
      }));

    it('should call the subscribe() of Router.Event',
      inject([Router], (routerService: Router) => {
        spyOn(routerService.events, 'subscribe');
        component.ngOnInit();
        expect(routerService.events.subscribe).toHaveBeenCalled();
      }));
  });

  describe('onNavigateEnd()', () => {
    it('should update the component.routerList content(length) based on the URL received',
      inject([BreadcrumbsService], (breadcrumbService: BreadcrumbsService) => {
        component.onNavigateEnd(new NavigationEnd(1, '/servers/child', '/servers/child'));
        expect(component.breadcrumbs.length).toEqual(2);
      }));
  });

  describe('onNavigateTo()', () => {
    it('should call navigateByUrl() of RouterService 1 time',
      inject([Router], (routerService: Router) => {
        spyOn(routerService, 'navigateByUrl');
        component.onNavigateTo('/servers');
        expect(routerService.navigateByUrl).toHaveBeenCalledTimes(1);
      }));
  });
});

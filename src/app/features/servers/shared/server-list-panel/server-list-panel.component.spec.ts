import {
  async,
  inject,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {
  Renderer2,
  ElementRef,
} from '@angular/core';
import { ServerListPanelComponent } from './server-list-panel.component';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Server } from '../../models';
import { ServerList } from './server-list';
import {
  McsAssetsProvider,
  McsTextContentProvider,
  CoreDefinition
} from '../../../../core';

describe('ServerListPanelComponent', () => {
  /** Stub Services/Components */
  let component: ServerListPanelComponent;
  let noServersFound: string = 'No Servers Found.';
  let textContentProviderMock = {
    content: {
      servers: {
        errorMessage: noServersFound
      }
    }
  };

  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        'caret-down': 'fa fa-caret-down',
        'server-state': 'fa fa-sun-o'
      };

      return icons[key];
    }
  };

  let mockActivatedRoute = {
    params: Observable.of({id: 123})
  };

  let mockServerListData = [
      {
        id: 2686,
        vdcName: 'M1VDC27117001',
        managementName: 'mongo-db-prod-2686',
        powerState: 2,
      },
      {
        id: 2687,
        vdcName: 'M1VDC27117001',
        managementName: 'mongo-db-test-2687',
        powerState: 1,
      },
      {
        id: 2688,
        vdcName: 'M1VDC27117001',
        managementName: 'app-server-prod-2689',
        powerState: 0,
      },
  ];

  let mockRouterService = {
    navigate(): any { return null; },
    events: Observable.of(new Event('event'))
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerListPanelComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsTextContentProvider, useValue: textContentProviderMock },
        { provide: McsAssetsProvider, useValue: mockAssetsProvider },
        { provide: Router, useValue: mockRouterService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        Renderer2
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerListPanelComponent, {
      set: {
        template: `
          <div #serverListPanel>
            Server List Panel
            <div #searchBox>Searchbox</div>
            <div #serverListTree>Server List Tree</div>
          </div>
          <footer>Footer</footer>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerListPanelComponent);

      component = fixture.componentInstance;
      component.serverListData = mockServerListData as Server[];

      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    beforeEach(async () => {
      spyOn(component, 'mapServerList');
      component.mapServerList(component.serverListData);
    });

    it('should set the no servers found error message', () => {
      expect(component.errorMessage).toEqual(noServersFound);
    });

    it('should set the value of caretDown', () => {
      expect(component.caretDown).toBeDefined();
    });

    it('should set the value of serverState', () => {
      expect(component.serverState).toBeDefined();
    });

    it('should set the value of selectedServerId', () => {
      expect(component.selectedServerId).toBeDefined();
    });

    it('should call mapServerList()', () => {
      expect(component.mapServerList).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit()', () => {
    it('should set the max-width of serverListPanel', () => {
      fakeAsync(() => {
        component.ngAfterViewInit();
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.serverListPanel.nativeElement.style.maxWidth).toBeDefined();
      });
    });

    it('should set the max-height of serverListTree', () => {
      fakeAsync(() => {
        component.ngAfterViewInit();
        tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        expect(component.serverListTree.nativeElement.style.maxHeight).toBeDefined();
      });
    });
  });

  describe('mapServerList()', () => {
    it('should map the serverListData and set the value of servers', () => {
      component.mapServerList(component.serverListData);
      expect(component.servers.length).toBeGreaterThan(0);
    });
  });

  describe('onFilter()', () => {
    it('should return list of filtered servers if the keyword exists', () => {
      component.keyword = 'mongo';
      component.onFilter(component.keyword);
      expect(component.servers.length).toBeGreaterThan(0);
    });

    it('should not return any result if the keyword do not exists', () => {
      component.keyword = 'staging';
      component.onFilter(component.keyword);
      expect(component.servers.length).toEqual(0);
    });
  });

  describe('isServerSelected()', () => {
    it('should return true when the selectedServerId is the same as server id', () => {
      let selectedId = '2456';
      let isSelected: boolean = false;

      component.selectedServerId = selectedId;
      isSelected = component.isServerSelected(selectedId);
      expect(isSelected).toBe(true);
    });

    it('should return false when the selectedServerId is the not same as server id', () => {
      let selectedId = '2456';
      let isSelected: boolean = false;

      component.selectedServerId = selectedId;
      isSelected = component.isServerSelected('1234');
      expect(isSelected).toBe(false);
    });
  });
});

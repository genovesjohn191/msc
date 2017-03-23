import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import {
  ElementRef,
  EventEmitter
} from '@angular/core';
import { FilterSelectorComponent } from './filter-selector.component';
import { FilterItem } from './filter-item';
/** Services */
import {
  MscStorageService,
  TextContentProvider,
  AssetsProvider,
  FilterProvider
} from '../../core';

describe('FilterSelectorComponent', () => {
  let mockFlag = 0;
  const filterItems: any = JSON.parse('{"serverName": {"text": "server name", "value": true} }');
  const filterText: string = filterItems.serverName.text;

  /** Stub Services/Components */
  let component: FilterSelectorComponent;
  let elementRefMock = new ElementRef(document.createElement('p'));
  let mscStorageServiceMock = {
    getItem<T>(key: string): any {
      let filters: any;
      filters = filterItems;
      if (mockFlag === 0) {
        return filters;
      } else {
        return null;
      }
    },
    setItem() {
      return;
    }
  };
  let textContentProviderMock = {
    content: {
      filterSelector: {
        title: 'titleSelector'
      }
    }
  };
  let assetsProviderMock = {
    getIcon() {
      return 'iconclass';
    }
  };
  let filterProviderMock = {
    getDefaultFilters(key: string): any {
      return filterItems;
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FilterSelectorComponent
      ],
      imports: [
      ],
      providers: [
        { provide: ElementRef, useValue: elementRefMock },
        { provide: MscStorageService, useValue: mscStorageServiceMock },
        { provide: TextContentProvider, useValue: textContentProviderMock },
        { provide: AssetsProvider, useValue: assetsProviderMock },
        { provide: FilterProvider, useValue: filterProviderMock }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(FilterSelectorComponent, {
      set: {
        template: `<div>Overridden template here</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(FilterSelectorComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.key = 'myKey';
      component.onGetFilters = new EventEmitter();
      component.filterSelectorObj = {
        close() { return; }
      };
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should call the getIcon() of AssetsProvider and iConClass is not null',
      inject([AssetsProvider], (assetProvider: AssetsProvider) => {
        spyOn(assetProvider, 'getIcon');
        component.ngOnInit();
        expect(assetProvider.getIcon).toHaveBeenCalledTimes(1);
      }));

    it('should set the iconClass and filterTitle values', () => {
      component.ngOnInit();
      expect(component.iconClass).not.toEqual(undefined || null || '');
      expect(component.filterTitle).not.toEqual(undefined || null || '');
    });

    it('should call the getItem() of MscStorageService when localStorage is not empty',
      inject([MscStorageService], (mcsStorageService: MscStorageService) => {
        spyOn(mcsStorageService, 'getItem');
        component.ngOnInit();
        expect(mcsStorageService.getItem).toHaveBeenCalledTimes(1);
      }));

    it('should set the filterItems value when localStorage is not empty', () => {
      component.ngOnInit();
      expect(component.filterItems).not.toEqual(null || undefined);
      expect(component.filterItems['serverName'].text).toEqual(filterText);
      expect(component.filterItems['serverName'].value).toEqual(true);
    });

    it('should call getDefaultFilters() of FilterProvider when localStorage is empty',
      inject([FilterProvider], (filterProvider: FilterProvider) => {
        spyOn(filterProvider, 'getDefaultFilters');
        mockFlag = 1;
        component.ngOnInit();
        expect(filterProvider.getDefaultFilters).toHaveBeenCalledTimes(1);
      }));

    it('should set the filterItems default value when local storage is empty', () => {
      mockFlag = 1;
      component.ngOnInit();
      expect(component.filterItems).not.toEqual(null || undefined);
      expect(component.filterItems['serverName'].text).toEqual(filterText);
      expect(component.filterItems['serverName'].value).toEqual(true);
    });

    it('should call the emit() of onGetFilters (EventEmitter)', () => {
      spyOn(component.onGetFilters, 'emit');
      component.ngOnInit();
      expect(component.onGetFilters.emit).toHaveBeenCalled();
    });
  });

  describe('onCloseFilterSelector()', () => {
    it('should call the setItem() of MscStorageService 1 time',
      inject([MscStorageService], (mcsStorageService: MscStorageService) => {
        spyOn(mcsStorageService, 'setItem');
        component.onCloseFilterSelector();
        expect(mcsStorageService.setItem).toHaveBeenCalledTimes(1);
      }));

    it('should call the emit() of onGetFilters (EventEmitter)', () => {
      spyOn(component.onGetFilters, 'emit');
      component.onCloseFilterSelector();
      expect(component.onGetFilters.emit).toHaveBeenCalled();
    });
  });

  describe('onClickOutside()', () => {
    it('should call the close() of filterSelectorObj 1 time',
      inject([ElementRef], (elementRef: ElementRef) => {
        spyOn(component.filterSelectorObj, 'close');
        component.onClickOutside(null);
        expect(component.filterSelectorObj.close).toHaveBeenCalledTimes(1);
      }));
  });
});

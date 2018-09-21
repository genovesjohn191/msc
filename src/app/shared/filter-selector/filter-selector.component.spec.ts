import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { FilterSelectorComponent } from './filter-selector.component';
/** Services */
import {
  McsStorageService,
  McsFilterProvider
} from '@app/core';
import { CoreTestingModule } from '@app/core/testing';

describe('FilterSelectorComponent', () => {
  let mockFlag = 0;
  const filterItems: any = JSON.parse('{"serverName": {"text": "server name", "value": true} }');
  const filterText: string = filterItems.serverName.text;

  /** Stub Services/Components */
  let component: FilterSelectorComponent;
  let mscStorageServiceMock = {
    getItem<T>(_key: string): T {
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
  let filterProviderMock = {
    getDefaultFilters(_key: string): any {
      return filterItems;
    }
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FilterSelectorComponent
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Provider */
    TestBed.overrideProvider(McsStorageService, { useValue: mscStorageServiceMock });
    TestBed.overrideProvider(McsFilterProvider, { useValue: filterProviderMock });

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
      component.filtersChange = new EventEmitter();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should call the getItem() of MscStorageService when localStorage is not empty',
      inject([McsStorageService], (mcsStorageService: McsStorageService) => {
        spyOn(mcsStorageService, 'getItem');
        component.ngOnInit();
        expect(mcsStorageService.getItem).toHaveBeenCalledTimes(1);
      }));

    it('should set the filterItemsMap value when localStorage is not empty', () => {
      component.ngOnInit();
      expect(component.filterItemsMap).not.toEqual(null || undefined);
      expect(component.filterItemsMap.get('serverName').text).toEqual(filterText);
      expect(component.filterItemsMap.get('serverName').value).toEqual(true);
    });

    it('should call getDefaultFilters() of FilterProvider when localStorage is empty',
      inject([McsFilterProvider], (filterProvider: McsFilterProvider) => {
        spyOn(filterProvider, 'getDefaultFilters');
        mockFlag = 1;
        component.ngOnInit();
        expect(filterProvider.getDefaultFilters).toHaveBeenCalledTimes(1);
      }));

    it('should set the filterItemsMap default value when local storage is empty', () => {
      mockFlag = 1;
      component.ngOnInit();
      expect(component.filterItemsMap).not.toEqual(null || undefined);
      expect(component.filterItemsMap.get('serverName').text).toEqual(filterText);
      expect(component.filterItemsMap.get('serverName').value).toEqual(true);
    });

    it('should call the emit() of filtersChange (EventEmitter)', () => {
      spyOn(component.filtersChange, 'emit');
      component.ngOnInit();
      expect(component.filtersChange.emit).toHaveBeenCalled();
    });
  });
});

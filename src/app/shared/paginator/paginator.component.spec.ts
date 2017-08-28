import {
  async,
  TestBed
} from '@angular/core/testing';
import { PaginatorComponent } from './paginator.component';
import { McsPaginator } from '../../core';
import { CoreTestingModule } from '../../core/testing';

describe('PaginatorComponent', () => {

  /** Stub Services/Components */
  let component: PaginatorComponent;
  let paginatorData = {
    length: 100,
    pageIndex: 0,
    pageSize: 10,
    loading: false,
  } as McsPaginator;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        PaginatorComponent
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(PaginatorComponent, {
      set: {
        template: `
          <div>PaginatorComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(PaginatorComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;

      /** Populate input parameters */
      component.pageIndex = paginatorData.pageIndex;
      component.pageSize = paginatorData.pageSize;
      component.length = paginatorData.length;
      component.loading = paginatorData.loading;
    });
  }));

  /** Test Implementation */
  describe('hasNextPage()', () => {
    it(`should return true when there is next page`, () => {
      expect(component.hasNextPage).toBeTruthy();
    });

    it(`should return false when there is no next page`, () => {
      component.pageIndex = component.length / component.pageSize;
      expect(component.hasNextPage).toBeFalsy();
    });
  });

  describe('hasPreviousPage()', () => {
    it(`should return false when there is no previous page`, () => {
      expect(component.hasPreviousPage).toBeFalsy();
    });

    it(`should return true when there is previous page`, () => {
      component.pageIndex = 2;
      expect(component.hasPreviousPage).toBeTruthy();
    });
  });

  describe('displayedItemsCount()', () => {
    it(`should return the displayed items based on the current page`, () => {
      component.pageIndex = 2;
      expect(component.displayedItemsCount).toBe((component.pageIndex + 1) * component.pageSize);
    });

    it(`should return all the items when it is in the last page`, () => {
      component.pageIndex = component.length / component.pageSize;
      expect(component.displayedItemsCount).toBe(component.length);
    });
  });

  describe('nextPage()', () => {
    it(`should increase the pageindex when it is invoke`, () => {
      let previousIndex = component.pageIndex;
      component.nextPage();
      expect(component.pageIndex).toBe(previousIndex + 1);
    });

    it(`should notify the page stream`, () => {
      spyOn(component.pageStream, 'next');
      component.nextPage();
      expect(component.pageStream.next).toHaveBeenCalled();
    });
  });

  describe('previousPage()', () => {
    it(`should decrease the pageindex when it is invoke`, () => {
      component.pageIndex = 2;
      let previousIndex = component.pageIndex;
      component.previousPage();
      expect(component.pageIndex).toBe(previousIndex - 1);
    });

    it(`should notify the page stream`, () => {
      component.pageIndex = 2;
      spyOn(component.pageStream, 'next');
      component.previousPage();
      expect(component.pageStream.next).toHaveBeenCalled();
    });
  });
});

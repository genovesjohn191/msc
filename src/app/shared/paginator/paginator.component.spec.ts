import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';

import { PaginatorComponent } from './paginator.component';
import { Paginator } from './paginator.interface';

describe('PaginatorComponent', () => {

  /** Stub Services/Components */
  let component: PaginatorComponent;
  let paginatorData = {
    totalCount: 100,
    pageIndex: 0,
    pageSize: 10
  } as Paginator;

  beforeEach(waitForAsync(() => {
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
      component.totalCount = paginatorData.totalCount;
    });
  }));

  /** Test Implementation */
  describe('hasNextPage()', () => {
    it(`should return true when there is next page`, () => {
      expect(component.hasNextPage).toBeTruthy();
    });

    it(`should return false when there is no next page`, () => {
      component.pageIndex = component.totalCount / component.pageSize;
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

  describe('nextPage()', () => {
    it(`should return true to loading flag`, () => {
      component.nextPage();
      expect(component.loading).toBeTruthy();
    });

    it(`should increase the pageindex when it is invoke`, () => {
      let previousIndex = component.pageIndex;
      component.nextPage();
      expect(component.pageIndex).toBe(previousIndex + 1);
    });

    it(`should notify the page stream`, () => {
      spyOn(component.pageChangedStream, 'next');
      component.nextPage();
      expect(component.pageChangedStream.next).toHaveBeenCalled();
    });
  });

  describe('previousPage()', () => {
    it(`should return true to loading flag`, () => {
      component.pageIndex = 2;
      component.previousPage();
      expect(component.loading).toBeTruthy();
    });

    it(`should decrease the pageindex when it is invoke`, () => {
      component.pageIndex = 2;
      let previousIndex = component.pageIndex;
      component.previousPage();
      expect(component.pageIndex).toBe(previousIndex - 1);
    });

    it(`should notify the page stream`, () => {
      component.pageIndex = 2;
      spyOn(component.pageChangedStream, 'next');
      component.previousPage();
      expect(component.pageChangedStream.next).toHaveBeenCalled();
    });
  });

  describe('showLoading()', () => {
    it(`should return false to loading flag`, () => {
      component.loading = true;
      component.showLoading(false);
      expect(component.loading).toBeFalsy();
    });
  });
});

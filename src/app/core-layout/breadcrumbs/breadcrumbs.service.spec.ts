import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { BreadcrumbsService } from './breadcrumbs.service';
import { Breadcrumb } from './breadcrumb';
import { CoreLayoutTestingModule } from '../testing';

describe('BreadcrumbsService', () => {

  /** Declare Service */
  let breadcrumbsService: BreadcrumbsService;

  /** Initialize Service */
  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        CoreLayoutTestingModule
      ]
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      breadcrumbsService = getTestBed().get(BreadcrumbsService);
    });
  }));

  /** Test Implementation */
  describe('push()', () => {
    beforeEach(() => {
      breadcrumbsService.push(new Breadcrumb('/servers', 'Servers'));
      breadcrumbsService.push(new Breadcrumb('/servers/child', 'Child'));
    });

    it('should push/add new record', () => {
      expect(breadcrumbsService.getBreadcrumbs().length).toEqual(2);
    });

    it('should set the last record isActive to true while the others are false', () => {
      let listLength: number = breadcrumbsService.getBreadcrumbs().length;
      expect(breadcrumbsService.getBreadcrumbs()[0].isActive).toEqual(false);
      expect(breadcrumbsService.getBreadcrumbs()[listLength - 1].isActive).toEqual(true);
    });
  });

  describe('pop()', () => {
    beforeEach(() => {
      breadcrumbsService.push(new Breadcrumb('/servers', 'Servers'));
      breadcrumbsService.push(new Breadcrumb('/servers/child', 'Child'));
      breadcrumbsService.push(new Breadcrumb('/servers/others', 'Others'));
    });

    it('should remove the last record of the item list', () => {
      breadcrumbsService.pop();
      let itemList = breadcrumbsService.getBreadcrumbs();
      expect(itemList.length).toEqual(2);
      expect(itemList[0].name).toEqual('Servers');
      expect(itemList[1].name).toEqual('Child');
    });
  });

  describe('clear()', () => {
    beforeEach(() => {
      breadcrumbsService.push(new Breadcrumb('/servers', 'Servers'));
      breadcrumbsService.push(new Breadcrumb('/servers/child', 'Child'));
      breadcrumbsService.push(new Breadcrumb('/servers/others', 'Others'));
    });

    it('should clear all the record in the item list', () => {
      let itemList = breadcrumbsService.getBreadcrumbs();
      expect(itemList.length).toEqual(3);

      breadcrumbsService.clear();
      itemList = breadcrumbsService.getBreadcrumbs();
      expect(itemList.length).toEqual(0);
    });
  });

  describe('getBreadcrumbs()', () => {
    beforeEach(() => {
      breadcrumbsService.push(new Breadcrumb('/servers', 'Servers'));
      breadcrumbsService.push(new Breadcrumb('/servers/child', 'Child'));
    });

    it('should get all the record list', () => {
      let itemList = breadcrumbsService.getBreadcrumbs();
      expect(itemList.length).toEqual(2);
    });
  });
});

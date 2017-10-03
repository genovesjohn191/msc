import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { McsListPanelItem } from '../../core';
import { ListPanelService } from './list-panel.service';

describe('ListPanelService', () => {

  /** Stub Services Mock */
  let listPanelService: ListPanelService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      providers: [
        ListPanelService
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      listPanelService = getTestBed().get(ListPanelService);
    });
  }));

  /** Test Implementation */
  describe('selectItem()', () => {
    it('should set the selected element based on the inputted parameter', () => {
      let selectedItem = {
        itemId: '1',
        groupName: 'Group'
      } as McsListPanelItem;

      listPanelService.selectItem(selectedItem);
      expect(listPanelService.selectedItem).toBe(selectedItem);
    });

    it('should notify the stream when the selectItem method is called', () => {
      let selectedItem = {
        itemId: '1',
        groupName: 'Group'
      } as McsListPanelItem;

      spyOn(listPanelService.selectedItemChangedStream, 'next');
      listPanelService.selectItem(selectedItem);
      expect(listPanelService.selectedItemChangedStream.next).toHaveBeenCalledTimes(1);
    });
  });
});

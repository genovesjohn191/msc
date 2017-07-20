import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import {
  IconType,
  IconService
} from './icon.service';
import {
  CoreDefinition,
  McsAssetsProvider
} from '../../core';
import { CoreTestingModule } from '../../core/testing';

describe('IconService', () => {

  /** Stub Services Mock */
  let iconService: IconService;
  let mockAssetsProvider = {
    getFontAwesomeIconClass(key: string): string {
      let icons = {
        exclamation: 'fa fa-warning'
      };
      return icons[key];
    },

    getSvgIconPath(key: string): string {
      let icons = {
        'no-icon-available': 'no-icon-available.svg',
        'close': 'close.svg'
      };
      return icons[key];
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        CoreTestingModule
      ],
      providers: [
        IconService
      ]
    });

    /** Testbed Onverriding of Provider */
    TestBed.overrideProvider(McsAssetsProvider, { useValue: mockAssetsProvider });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      iconService = getTestBed().get(IconService);
    });
  }));

  /** Test Implementation */
  describe('getIcon()', () => {
    it('should get the icon from the font awesome list', () => {
      let iconKey = 'exclamation';
      let icon = iconService.getIcon(iconKey);

      expect(icon.type).toBe(IconType.FontAwesome);
      expect(icon.value).toBe('fa fa-warning');
    });

    it('should get the icon from the svg list', () => {
      let iconKey = 'close';
      let icon = iconService.getIcon(iconKey);

      expect(icon.type).toBe(IconType.Svg);
      expect(icon.value).toBe('close.svg');
    });
  });
});

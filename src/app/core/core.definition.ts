export class CoreDefinition {
  /** Responsive Browser Width */
  public static DESKTOP_MIN_WIDTH = 970;
  public static TABLET_MAX_WIDTH = 969;
  public static TABLET_MIN_WIDTH = 720;
  public static MOBILE_LANDSCAPE_MAX_WIDTH = 719;
  public static MOBILE_LANDSCAPE_MIN_WIDTH = 544;
  public static MOBILE_PORTRAIT_MAX_WIDTH = 543;
  public static MOBILE_PORTRAIT_MIN_WIDTH = 320;

  /** Notifications */
  public static NOTIFICATION_JOB_PENDING = 'Pending';
  public static NOTIFICATION_JOB_ACTIVE = 'Active';
  public static NOTIFICATION_JOB_TIMEDOUT = 'TimedOut';
  public static NOTIFICATION_JOB_FAILED = 'Failed';
  public static NOTIFICATION_JOB_CANCELLED = 'Cancelled';
  public static NOTIFICATION_JOB_COMPLETED = 'Completed';
  public static NOTIFICATION_RUNNING_MAX_DISPLAY = 3;
  public static NOTIFICATION_STATE_CHANGE_MAX_DISPLAY = 2;
  public static NOTIFICATION_ANIMATION_DELAY = 310;
  public static NOTIFICATION_COMPLETED_TIMEOUT = 5000;
  public static NOTIFICATION_FAILED_TIMEOUT = 10000;
  public static NOTIFICATION_CONNECTION_RETRY_INTERVAL = 5000;

  /** AppState Properties */
  public static APPSTATE_USER_ID = 'UserId';
  public static APPSTATE_ACCOUNT_ID = 'AccountId';

  /** Server Page */
  public static SERVER_LIST_MAX_ITEM_PER_PAGE = 10;

  /** Notification Page */
  public static NOTIFICATION_MAX_ITEM_PER_PAGE = 10;

  /** Others */
  public static SEARCH_TIME = 2000;
  public static INPUT_TIME = 1000;
  public static DEFAULT_VIEW_REFRESH_TIME = 50;
  public static MANAGED_SERVER = 'Managed';
  public static GB_TO_MB_MULTIPLIER = 1024;

  /** Style */
  public static BASE_FONT = 'Circular-Pro-Book';
  public static BASE_FONT_BOLD = 'Circular-Pro-Bold';

  /** Icons */
  public static ICON_SIZE_XSMALL = '10px';
  public static ICON_SIZE_SMALL = '20px';
  public static ICON_SIZE_MEDIUM = '25px';
  public static ICON_SIZE_LARGE = '30px';
  public static ICON_SIZE_XLARGE = '40px';

  /** Assets Provider Key Definitions */
  public static ASSETS_SVG_NO_ICON_AVAILABLE = 'no-icon-available';
  public static ASSETS_SVG_CLOSE_BLACK = 'close-black';
  public static ASSETS_SVG_CLOSE_BLUE = 'close-blue';
  public static ASSETS_SVG_CLOSE_WHITE = 'close-white';
  public static ASSETS_SVG_ADD_BLACK = 'add-black';
  public static ASSETS_SVG_ADD_BLUE = 'add-blue';
  public static ASSETS_SVG_ADD_WHITE = 'add-white';
  public static ASSETS_SVG_RADIO_CHECKED = 'radio-button-checked';
  public static ASSETS_SVG_RADIO_UNCHECKED = 'radio-button-unchecked';
  public static ASSETS_SVG_STATE_RESTARTING = 'state-restarting';
  public static ASSETS_SVG_STATE_RUNNING = 'state-running';
  public static ASSETS_SVG_STATE_STOPPED = 'state-stopped';
  public static ASSETS_SVG_COLUMNS_BLACK = 'columns-black';
  public static ASSETS_SVG_ARROW_RIGHT_WHITE = 'arrow-right-white';
  public static ASSETS_SVG_ARROW_UP_WHITE = 'arrow-up-white';
  public static ASSETS_SVG_TOGGLE_NAV = 'toggle-nav';
  public static ASSETS_SVG_SPINNER = 'spinner';
  public static ASSETS_SVG_STORAGE = 'storage';

  /** RegEx Patterns */
  public static REGEX_EMAIL_PATTERN = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  public static REGEX_IP_PATTERN = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
  public static REGEX_ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
  public static REGEX_NUMERIC_PATTERN = /^[\d]+$/;

  /** Job Types */
  public static JOB_TYPE_SERVER_START = 100001;
  public static JOB_TYPE_SERVER_END = 102500;
}

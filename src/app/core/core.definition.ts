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

  /** Headers */
  public static HEADERS_AUTHORIZATION = 'Authorization';
  public static HEADERS_BEARER = 'Bearer';

  /** AppState Properties */
  public static APPSTATE_AUTH_TOKEN = 'AuthToken';
  public static APPSTATE_AUTH_IDENTITY = 'AuthIdentity';

  /** Cookie Names */
  public static COOKIE_AUTH_TOKEN  = 'MCSPAT';

  /** Query Parameters */
  public static QUERY_PARAM_BEARER  = 'bearer';

  /** Server Page */
  public static SERVER_LIST_MAX_ITEM_PER_PAGE = 10;

  // TODO: Create Enumeration for Server Type
  public static SERVER_MANAGED = 'Managed';
  public static SERVER_SELF_MANAGED = 'Self-Managed';

  /** Notification Page */
  public static NOTIFICATION_MAX_ITEM_PER_PAGE = 10;

  /** Others */
  public static SEARCH_TIME = 2000;
  public static INPUT_TIME = 1000;
  public static DEFAULT_VIEW_REFRESH_TIME = 50;
  public static DEFAULT_INITIAL_PAGE = 'servers';
  public static GB_TO_MB_MULTIPLIER = 1024;

  /** Style */
  public static BASE_FONT = 'Circular-Pro-Book';
  public static BASE_FONT_BOLD = 'Circular-Pro-Bold';

  /** Icons */
  public static ICON_SIZE_XSMALL = 10;
  public static ICON_SIZE_SMALL = 15;
  public static ICON_SIZE_MEDIUM = 20;
  public static ICON_SIZE_LARGE = 25;
  public static ICON_SIZE_XLARGE = 30;

  /** Assets Provider Key Definitions */
  // GIF Icons
  public static ASSETS_GIF_SPINNER = 'spinner';

  // SVG Icons
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
  public static ASSETS_SVG_STORAGE = 'storage';
  public static ASSETS_SVG_KEYBOARD = 'keyboard';
  public static ASSETS_SVG_PLAY = 'play';
  public static ASSETS_SVG_START = 'start';
  public static ASSETS_SVG_RESTART = 'restart';
  public static ASSETS_SVG_STOP = 'stop';
  public static ASSETS_SVG_LOGOUT_WHITE = 'logout-white';
  public static ASSETS_SVG_USER_WHITE = 'user-white';
  public static ASSETS_SVG_CIRCLE_INFO_BLACK = 'circle-info-black';
  public static ASSETS_SVG_COG = 'cog';
  public static ASSETS_SVG_INFO = 'info-svg';
  public static ASSETS_SVG_NEW_SERVER = 'new-server';
  public static ASSETS_SVG_NEXT_ARROW = 'next-arrow';
  public static ASSETS_SVG_NOTIFICATION_BELL = 'notification-bell';
  public static ASSETS_SVG_RELOAD = 'reload';
  public static ASSETS_SVG_WARNING = 'warning-svg';

  // Font Awesome Icons
  public static ASSETS_FONT_CREDIT_CARD = 'credit-card';
  public static ASSETS_FONT_SEARCH = 'search';
  public static ASSETS_FONT_CHECK = 'check';
  public static ASSETS_FONT_WARNING = 'warning';
  public static ASSETS_FONT_CALENDAR = 'calendar';
  public static ASSETS_FONT_INFORMATION = 'info';
  public static ASSETS_FONT_BELL = 'bell';
  public static ASSETS_FONT_CHECKBOX = 'check-box';
  public static ASSETS_FONT_EXCLAMATION = 'exclamation';
  public static ASSETS_FONT_MINUS = 'minus';
  public static ASSETS_FONT_PLUS = 'plus';
  public static ASSETS_FONT_EMPTY_BOX = 'empty-box';
  public static ASSETS_FONT_CIRCLE = 'circle';
  public static ASSETS_FONT_CARET_RIGHT = 'caret-right';
  public static ASSETS_FONT_CARET_DOWN = 'caret-down';
  public static ASSETS_FONT_PLAY = 'play';
  public static ASSETS_FONT_CHECKBOX_2 = 'check-box-2';
  public static ASSETS_FONT_CLOSE = 'close';
  public static ASSETS_FONT_CHEVRON_DOWN = 'chevron-down';
  public static ASSETS_FONT_CHEVRON_UP = 'chevron-up';
  public static ASSETS_FONT_GEAR = 'gear';
  public static ASSETS_FONT_SIGN_OUT = 'sign-out';
  public static ASSETS_FONT_USER = 'user';
  public static ASSETS_FONT_INFORMATION_2 = 'info-2';
  public static ASSETS_FONT_COMMENT = 'comment';
  public static ASSETS_FONT_ATTACHMENT = 'attachment';
  public static ASSETS_FONT_NAVBAR = 'navbar';
  public static ASSETS_FONT_ANGLE_DOUBLE_RIGHT = 'angle-double-right';

  /** Filter Selector */
  public static FILTERSELECTOR_SERVER_LISTING = 'serversListingFilter';
  public static FILTERSELECTOR_NOTIFICATIONS_LISTING = 'notificationsListingFilter';
  public static FILTERSELECTOR_TICKET_LISTING = 'ticketsListingFilter';
  public static FILTERSELECTOR_FIREWALLS_LISTING = 'firewallsListingFilter';
  public static FILTERSELECTOR_FIREWALL_POLICIES_LISTING = 'firewallPoliciesListingFilter';

  /** RegEx Patterns */
  public static REGEX_EMAIL_PATTERN = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  public static REGEX_IP_PATTERN = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
  public static REGEX_ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
  public static REGEX_NUMERIC_PATTERN = /^[\d]+$/;
  public static REGEX_SERVER_NAME_PATTERN = /^[a-zA-Z0-9\-]*$/;

  /** Job Types */
  public static JOB_TYPE_SERVER_START = 100001;
  public static JOB_TYPE_SERVER_END = 102500;

  /** Console Size */
  public static CONSOLE_DEFAULT_WIDTH = 800;
  public static CONSOLE_DEFAULT_HEIGHT = 600;
}

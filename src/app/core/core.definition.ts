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
  public static NOTIFICATION_MAX_DISPLAY = 3;
  public static NOTIFICATION_ANIMATION_DELAY = 310;
  public static NOTIFICATION_COMPLETED_TIMEOUT_IN_MS = 5000;
  public static NOTIFICATION_FAILED_TIMEOUT_IN_MS = 10000;
  public static NOTIFICATION_CONNECTION_RETRY_INTERVAL = 5000;

  /** Headers */
  public static HEADER_BEARER = 'Bearer';
  public static HEADER_ACCEPT = 'Accept';
  public static HEADER_CONTENT_TYPE = 'Content-Type';
  public static HEADER_API_VERSION = 'Api-Version';
  public static HEADER_COMPANY_ID = 'Company-Id';
  public static HEADER_AUTHORIZATION = 'Authorization';

  /** AppState Properties */
  public static APPSTATE_AUTH_IDENTITY = 'AuthIdentity';

  /** Cookie Names */
  public static COOKIE_AUTH_TOKEN = 'JWTBearer';
  public static COOKIE_ACTIVE_ACCOUNT = 'MCSACC';

  /** Query Parameters */
  public static QUERY_PARAM_BEARER = 'bearer';

  /** Others */
  public static SEARCH_TIME = 1000;
  public static INPUT_TIME = 1000;
  public static DEFAULT_VIEW_REFRESH_TIME = 50;
  public static DEFAULT_INITIAL_PAGE = 'servers';
  public static GB_TO_MB_MULTIPLIER = 1024;
  public static MB_TO_KB_MULTIPLIER = 1024;

  /** Server Page */
  public static CREATE_SERVER_MINIMUM_RAM = 2048;
  public static CREATE_SERVER_MINIMUM_CPU = 2;
  public static CREATE_SERVER_MINIMUM_STORAGE = 30 * CoreDefinition.GB_TO_MB_MULTIPLIER;
  public static CREATE_SERVER_STORAGE_STEP = 10;

  /** Style */
  public static BASE_FONT = 'Circular-Pro-Book';
  public static BASE_FONT_BOLD = 'Circular-Pro-Bold';

  /** Icons */
  public static ICON_SIZE_XXSMALL = 5;
  public static ICON_SIZE_XSMALL = 10;
  public static ICON_SIZE_SMALL = 15;
  public static ICON_SIZE_MEDIUM = 20;
  public static ICON_SIZE_LARGE = 25;
  public static ICON_SIZE_XLARGE = 30;
  public static ICON_SIZE_XXLARGE = 40;

  /** Images */
  public static IMAGE_SIZE_XSMALL = 100;
  public static IMAGE_SIZE_SMALL = 150;
  public static IMAGE_SIZE_MEDIUM = 200;
  public static IMAGE_SIZE_LARGE = 250;
  public static IMAGE_SIZE_XLARGE = 300;
  public static IMAGE_SIZE_XXLARGE = 400;

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
  public static ASSETS_SVG_STATE_SUSPENDED = 'state-suspended';
  public static ASSETS_SVG_COLUMNS_BLACK = 'columns-black';
  public static ASSETS_SVG_PERSON_WHITE = 'person-white';
  public static ASSETS_SVG_PERSON_BLUE = 'person-blue';
  public static ASSETS_SVG_PERSON_GREEN = 'person-green';
  public static ASSETS_SVG_PERSON_RED = 'person-red';
  public static ASSETS_SVG_PERSON_YELLOW = 'person-yellow';
  public static ASSETS_SVG_ARROW_RIGHT_WHITE = 'arrow-right-white';
  public static ASSETS_SVG_ARROW_RIGHT_BLUE = 'arrow-right-blue';
  public static ASSETS_SVG_ARROW_UP_WHITE = 'arrow-up-white';
  public static ASSETS_SVG_ARROW_UP_BLUE = 'arrow-up-blue';
  public static ASSETS_SVG_TOGGLE_NAV = 'toggle-nav';
  public static ASSETS_SVG_STORAGE = 'storage';
  public static ASSETS_SVG_KEYBOARD = 'keyboard';
  public static ASSETS_SVG_PLAY = 'play';
  public static ASSETS_SVG_START = 'start';
  public static ASSETS_SVG_RESTART = 'restart';
  public static ASSETS_SVG_STOP = 'stop';
  public static ASSETS_SVG_SUSPEND = 'suspend';
  public static ASSETS_SVG_RESUME = 'resume';
  public static ASSETS_SVG_LOGOUT_WHITE = 'logout-white';
  public static ASSETS_SVG_USER_WHITE = 'user-white';
  public static ASSETS_SVG_CIRCLE_INFO_BLACK = 'circle-info-black';
  public static ASSETS_SVG_COG = 'cog';
  public static ASSETS_SVG_INFO = 'info-svg';
  public static ASSETS_SVG_NEW_SERVER = 'new-server';
  public static ASSETS_SVG_NEXT_ARROW = 'next-arrow';
  public static ASSETS_SVG_NOTIFICATION_BELL = 'notification-bell';
  public static ASSETS_SVG_RELOAD = 'reload';
  public static ASSETS_SVG_CLOUD_UPLOAD_BLUE = 'cloud-upload-blue';
  public static ASSETS_SVG_WARNING = 'warning-svg';
  public static ASSETS_SVG_ERROR = 'error-svg';
  public static ASSETS_SVG_DOWNLOAD = 'download';

  // Font Awesome Icons
  public static ASSETS_FONT_CREDIT_CARD = 'credit-card';
  public static ASSETS_FONT_SEARCH = 'search';
  public static ASSETS_FONT_CHECK = 'check';
  public static ASSETS_FONT_CHECK_CIRCLE = 'check-circle';
  public static ASSETS_FONT_WARNING = 'warning';
  public static ASSETS_FONT_CALENDAR = 'calendar';
  public static ASSETS_FONT_INFORMATION = 'info';
  public static ASSETS_FONT_INFORMATION_CIRCLE = 'info-circle';
  public static ASSETS_FONT_BELL = 'bell';
  public static ASSETS_FONT_SQUARE = 'square';
  public static ASSETS_FONT_SQUARE_OPEN = 'square-open';
  public static ASSETS_FONT_CHECKBOX = 'check-box';
  public static ASSETS_FONT_CHECKBOX_OPEN = 'check-box-open';
  public static ASSETS_FONT_CHECKBOX_INDETERMINATE = 'check-box-indeterminate';
  public static ASSETS_FONT_EXCLAMATION = 'exclamation';
  public static ASSETS_FONT_MINUS = 'minus';
  public static ASSETS_FONT_PLUS = 'plus';
  public static ASSETS_FONT_EMPTY_BOX = 'empty-box';
  public static ASSETS_FONT_CIRCLE = 'circle';
  public static ASSETS_FONT_CARET_RIGHT = 'caret-right';
  public static ASSETS_FONT_CARET_LEFT = 'caret-left';
  public static ASSETS_FONT_CARET_DOWN = 'caret-down';
  public static ASSETS_FONT_PLAY = 'play';
  public static ASSETS_FONT_CLOSE = 'close';
  public static ASSETS_FONT_CLOSE_CIRCLE = 'close-circle';
  public static ASSETS_FONT_CHEVRON_DOWN = 'chevron-down';
  public static ASSETS_FONT_CHEVRON_UP = 'chevron-up';
  public static ASSETS_FONT_CHEVRON_LEFT = 'chevron-left';
  public static ASSETS_FONT_CHEVRON_RIGHT = 'chevron-right';
  public static ASSETS_FONT_GEAR = 'gear';
  public static ASSETS_FONT_SIGN_OUT = 'sign-out';
  public static ASSETS_FONT_USER = 'user';
  public static ASSETS_FONT_INFORMATION_2 = 'info-2';
  public static ASSETS_FONT_COMMENT = 'comment';
  public static ASSETS_FONT_ATTACHMENT = 'attachment';
  public static ASSETS_FONT_NAVBAR = 'navbar';
  public static ASSETS_FONT_ANGLE_DOUBLE_RIGHT = 'angle-double-right';
  public static ASSETS_FONT_TRASH = 'trash-o';
  public static ASSETS_FONT_BULLET = 'circle';
  public static ASSETS_FONT_ELLIPSIS_VERTICAL = 'ellipsis-v';

  // Images
  public static ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG = 'light-mcs-logo-svg';
  public static ASSETS_IMAGE_MCS_LIGHT_LOGO = 'light-mcs-logo';
  public static ASSETS_IMAGE_MCS_DARK_LOGO = 'dark-mcs-logo';

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
  public static REGEX_UUID_PATTERN
    = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
  public static REGEX_SPACE_AND_DASH = /([\s-]+)/;
  public static REGEX_BEARER_PATTERN = /bearer=[^&]*/g;

  /** Job Types */
  public static JOB_TYPE_SERVER_START = 100001;
  public static JOB_TYPE_SERVER_END = 102500;

  /** Console Size */
  public static CONSOLE_DEFAULT_WIDTH = 800;
  public static CONSOLE_DEFAULT_HEIGHT = 600;

  /** Dialog Size */
  public static DIALOG_SIZE_SMALL = '300px';
  public static DIALOG_SIZE_MEDIUM = '400px';
  public static DIALOG_SIZE_LARGE = '500px';
  public static DIALOG_SIZE_XLARGE = '600px';
}

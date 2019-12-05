export class CommonDefinition {

  /** Headers */
  public static HEADER_ACCEPT = 'Accept';
  public static HEADER_CONTENT_TYPE = 'Content-Type';
  public static HEADER_API_VERSION = 'Api-Version';
  public static HEADER_COMPANY_ID = 'Company-Id';

  /** Query Parameters */
  public static QUERY_PARAM_BEARER = 'bearer';

  /** AppState Properties */
  public static APPSTATE_RETURN_URL_KEY = 'Return-Url';

  /** Cookie Names */
  public static COOKIE_ACTIVE_ACCOUNT = 'MCSACC';
  public static COOKIE_SESSION_TIMER = 'mcsSessionTimer';
  public static COOKIE_SESSION_ID = 'mcsSessionId';
  public static COOKIE_USER_STATE_ID = 'mcsStateId';
  public static COOKIE_ACTIVE_MESSAGE = 'mcsActiveMessage';

  // Cookies
  public static COOKIE_ENABLE_LOGGER = '_enableMcsObserver';

  // Page Default
  public static PAGE_INDEX_DEFAULT = 1;
  public static PAGE_SIZE_MIN = 25;
  public static PAGE_SIZE_MAX = 1000;

  /** Others */
  public static SEARCH_TIME = 1000;
  public static DEFAULT_VIEW_REFRESH_TIME = 50;

  /** Notifications */
  public static NOTIFICATION_ANIMATION_DELAY = 310;
  public static NOTIFICATION_COMPLETED_TIMEOUT_IN_MS = 5000;
  public static NOTIFICATION_FAILED_TIMEOUT_IN_MS = 10000;
  public static NOTIFICATION_CONNECTION_RETRY_INTERVAL = 10000;

  // Common Url
  public static INVIEW_URL = `{{macviewUrl}}/Bounce.aspx?bounce=1&mvClientID={{companyId}}`
    + `&mvURL={{inviewUrl}}%2Fframe%2Finview%2Fdata_details.html%3Fservice%3D{{serviceId}};`;

  // Common Timezone
  public static TIMEZONE_SYDNEY = `Australia/Sydney`;

  // Ordering Flags
  public static ORDERING_ENABLE_PRICING_CALCULATOR = false;

  /** Responsive Browser Width */
  /** These variables should be the same with the css definition */
  public static BREAKPOINT_XSMALL = 0;
  public static BREAKPOINT_SMALL = 543;
  public static BREAKPOINT_MEDIUM = 720;
  public static BREAKPOINT_LARGE = 970;

  /** Icons */
  public static ICON_SIZE_XXSMALL = 7;
  public static ICON_SIZE_XSMALL = 12;
  public static ICON_SIZE_SMALL = 17;
  public static ICON_SIZE_MEDIUM = 22;
  public static ICON_SIZE_LARGE = 27;
  public static ICON_SIZE_XLARGE = 32;
  public static ICON_SIZE_XXLARGE = 42;

  /** Images */
  public static IMAGE_SIZE_XSMALL = 100;
  public static IMAGE_SIZE_SMALL = 150;
  public static IMAGE_SIZE_MEDIUM = 200;
  public static IMAGE_SIZE_LARGE = 250;
  public static IMAGE_SIZE_XLARGE = 300;
  public static IMAGE_SIZE_XXLARGE = 400;

  // GIF Icons
  public static ASSETS_GIF_LOADER_SPINNER = 'loader-spinner';
  public static ASSETS_GIF_LOADER_ELLIPSIS = 'loader-ellipsis';

  // Images
  public static ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG = 'light-mcs-logo-svg';
  public static ASSETS_IMAGE_MCS_LIGHT_LOGO = 'light-mcs-logo';
  public static ASSETS_IMAGE_MCS_DARK_LOGO = 'dark-mcs-logo';
  public static ASSETS_IMAGE_USER_PERMISSIONS = 'user-permissions';
  public static ASSETS_IMAGE_PRODUCT_CATALOG_BANNER = 'product-catalog-banner';

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
  public static ASSETS_SVG_DELETE = 'delete';
  public static ASSETS_SVG_PLUS = 'plus';
  public static ASSETS_SVG_PLAY = 'play';
  public static ASSETS_SVG_START = 'start';
  public static ASSETS_SVG_RESTART = 'restart';
  public static ASSETS_SVG_STOP = 'stop';
  public static ASSETS_SVG_SUSPEND = 'suspend';
  public static ASSETS_SVG_RESUME = 'resume';
  public static ASSETS_SVG_EJECT_BLUE = 'eject-blue';
  public static ASSETS_SVG_EJECT_BLACK = 'eject-black';
  public static ASSETS_SVG_CHEVRON_LEFT = 'chevron-left-svg';
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
  public static ASSETS_SVG_WARNING_BLUE = 'warning-blue-svg';
  public static ASSETS_SVG_ERROR = 'error-svg';
  public static ASSETS_SVG_DOWNLOAD = 'download';
  public static ASSETS_SVG_DOS_PROMPT_BLUE = 'dos-prompt-blue';
  public static ASSETS_SVG_DOS_PROMPT_GREY = 'dos-prompt-grey';
  public static ASSETS_SVG_SUCCESS = 'success-svg';
  public static ASSETS_SVG_CLOUD_BLUE = 'cloud-blue';
  public static ASSETS_SVG_CLOCK = 'clock';
  public static ASSETS_SVG_CHECK = 'check';
  public static ASSETS_SVG_BLOCK = 'block';
  public static ASSETS_SVG_ELLIPSIS_VERTICAL = 'ellipsis-vertical';
  public static ASSETS_SVG_ELLIPSIS_HORIZONTAL = 'ellipsis-horizontal';
  public static ASSETS_SVG_HELP = 'help';

  public static ASSETS_SVG_SEARCH = 'search';
  public static ASSETS_SVG_NOTIFICATIONS = 'notifications';
  public static ASSETS_SVG_CHECK_BOX = 'check-box';
  public static ASSETS_SVG_CHECK_BOX_OUTLINE = 'check-box-outline';
  public static ASSETS_SVG_CHECK_BOX_INDETERMINATE = 'check-box-indeterminate';
  public static ASSETS_SVG_CHEVRON_DOWN = 'chevron-down';
  public static ASSETS_SVG_CHEVRON_UP = 'chevron-up';
  public static ASSETS_SVG_CHEVRON_RIGHT = 'chevron-right';
  public static ASSETS_SVG_COMMENT = 'comment';
  public static ASSETS_SVG_ATTACHMENT = 'attachment';
  public static ASSETS_SVG_BULLET = 'bullet';

  /** Filter Selector */
  public static FILTERSELECTOR_SERVER_LISTING = 'serverFilter';
  public static FILTERSELECTOR_NOTIFICATIONS_LISTING = 'notificationFilter';
  public static FILTERSELECTOR_TICKET_LISTING = 'ticketFilter';
  public static FILTERSELECTOR_FIREWALLS_LISTING = 'firewallFilter';
  public static FILTERSELECTOR_FIREWALL_POLICIES_LISTING = 'firewallPolicyFilter';
  public static FILTERSELECTOR_MEDIA_LISTING = 'mediaFilter';
  public static FILTERSELECTOR_ORDER_LISTING = 'orderFilter';
  public static FILTERSELECTOR_INTERNET_LISTING = 'internetFilter';
  public static FILTERSELECTOR_AGGREGATION_TARGETS_LISTING = 'aggregationTargetFilter';
  public static FILTERSELECTOR_TOOLS_LISTING = 'toolsFilter';
  public static FILTERSELECTOR_SYSTEM_MESSAGE_LISTING = 'systemMessageFilter';

  /** RegEx Patterns */
  public static REGEX_EMAIL_PATTERN = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  public static REGEX_IP_PATTERN = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
  public static REGEX_URL_PATTERN
    = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  public static REGEX_ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
  public static REGEX_NUMERIC_PATTERN = /^-?\d*?$/;
  public static REGEX_DECIMAL_PATTERN = /^-?\d*(\.\d+)?$/;
  public static REGEX_SERVER_NAME_PATTERN = /^[a-zA-Z0-9\-]*$/;
  public static REGEX_MEDIA_NAME_PATTERN = /^[a-zA-Z0-9\-]*$/;
  public static REGEX_UUID_PATTERN
    = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
  public static REGEX_SPACE_AND_DASH = /([\s-]+)/;
  public static REGEX_BEARER_PATTERN = /bearer=[^&]*/g;

  /** Session count */
  public static SESSION_IDLE_TIME_IN_SECONDS = 720;
  public static SESSION_TIMEOUT_COUNTDOWN_IN_SECONDS = 150;

  /** Paging Setup */
  public static DEFAULT_PAGE_INDEX = 1;
  public static DEFAULT_PAGE_SIZE = 25;

  /** Environment settings */
  public static LOCALE = 'en-AU';
}

export class CommonDefinition {

  // Common Url
  public static INVIEW_URL =  `{{macviewUrl}}/Bounce.aspx?bounce=1&mvClientID={{companyId}}
  &mvURL={{inviewUrl}}%2Fframe%2Finview%2Fdata_details.html%3Fservice%3D{{serviceId}};`;

  // Common Timezone
  public static TIMEZONE_SYDNEY = `Australia/Sydney`;

  // Cookies
  public static COOKIE_ENABLE_LOGGER = '_enableMcsObserver';

  // Page Default
  public static PAGE_INDEX_DEFAULT = 1;
  public static PAGE_SIZE_MIN = 25;
  public static PAGE_SIZE_MAX = 1000;

  // Ordering Flags
  public static ORDERING_ENABLE_PRICING_CALCULATOR = false;

  // GIF Icons
  public static ASSETS_GIF_LOADER_SPINNER = 'loader-spinner';
  public static ASSETS_GIF_LOADER_ELLIPSIS = 'loader-ellipsis';

  // Images
  public static ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG = 'light-mcs-logo-svg';

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

  /** Filter Selector */
  public static FILTERSELECTOR_SERVER_LISTING = 'serverFilter';
  public static FILTERSELECTOR_NOTIFICATIONS_LISTING = 'notificationFilter';
  public static FILTERSELECTOR_TICKET_LISTING = 'ticketFilter';
  public static FILTERSELECTOR_FIREWALLS_LISTING = 'firewallFilter';
  public static FILTERSELECTOR_FIREWALL_POLICIES_LISTING = 'firewallPolicyFilter';
  public static FILTERSELECTOR_MEDIA_LISTING = 'mediaFilter';
  public static FILTERSELECTOR_ORDER_LISTING = 'orderFilter';
  public static FILTERSELECTOR_INTERNET_LISTING = 'internetFilter';
  public static FILTERSELECTOR_TOOLS_LISTING = 'toolsFilter';
  public static FILTERSELECTOR_SYSTEM_MESSAGE_LISTING = 'systemMessageFilter';
}

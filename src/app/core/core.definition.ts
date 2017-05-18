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
  public static NOTIFICATION_MAX_DISPLAY = 3;
  public static NOTIFICATION_ANIMATION_DELAY = 310;
  public static NOTIFICATION_COMPLETED_TIMEDOUT = 3000;
  public static NOTIFICATION_FAILED_TIMEDOUT = 5000;
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
  public static DEFAULT_VIEW_REFRESH_TIME = 50;

  /** Server States */
  public static SERVER_STATE_STOPPED = 'stopped';
  public static SERVER_STATE_RUNNING = 'running';
  public static SERVER_STATE_RESTARTING = 'restarting';
}

#!/bin/bash
sed -i 's,MCS_API_HOST,'"${MCS_API_HOST}"',g
s,MCS_HOST,'"${MCS_HOST}"',g
s,MCS_PORT,'"${MCS_PORT}"',g
s,MCS_GTM_ID,'"${MCS_GTM_ID}"',g
s,MCS_SENTRY_DSN,'"${MCS_SENTRY_DSN}"',g
s,MCS_MACVIEW_URL,'"${MCS_MACVIEW_URL}"',g
s,MCS_LOGIN_URL,'"${MCS_LOGIN_URL}"',g
s,MCS_LOGOUT_URL,'"${MCS_LOGOUT_URL}"',g
s,MCS_MACVIEW_ORDERS_URL,'"${MCS_MACVIEW_ORDERS_URL}"',g
s,MCS_MACVIEW_CHANGE_PASSWORD_URL,'"${MCS_MACVIEW_CHANGE_PASSWORD_URL}"',g
s,MCS_TERMS_AND_CONDITIONS_URL,'"${MCS_TERMS_AND_CONDITIONS_URL}"',g
s,MCS_SESSION_EXTENSION_WINDOW_IN_SECONDS,'"${MCS_SESSION_EXTENSION_WINDOW_IN_SECONDS}"',g
s,MCS_IMAGE_ROOT,'"${MCS_IMAGE_ROOT}"',g
s,MCS_ICON_ROOT,'"${MCS_ICON_ROOT}"',g
s,MCS_EK,'"${MCS_EK}"',g' assets/env.config.js;
nginx -g 'daemon off;'
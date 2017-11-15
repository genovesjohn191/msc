#!/bin/bash
sed -i 's,MCS_API_HOST,'"${MCS_API_HOST}"',g
s,MCS_HOST,'"${MCS_HOST}"',g
s,MCS_PORT,'"${MCS_PORT}"',g
s,MCS_SENTRY_DSN,'"${MCS_SENTRY_DSN}"',g
s,MCS_MACQUARIE_VIEW_URL,'"${MCS_MACQUARIE_VIEW_URL}"',g
s,MCS_LOGIN_URL,'"${MCS_LOGIN_URL}"',g
s,MCS_LOGOUT_URL,'"${MCS_LOGOUT_URL}"',g
s,MCS_JWT_COOKIE_NAME,'"${MCS_JWT_COOKIE_NAME}"',g
s,MCS_IMAGE_ROOT,'"${MCS_IMAGE_ROOT}"',g
s,MCS_ICON_ROOT,'"${MCS_ICON_ROOT}"',g' assets/env.config.js;
nginx -g 'daemon off;'
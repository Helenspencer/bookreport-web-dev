#!/usr/bin/env bash

echo "-------------------------------------------------------------------"
echo "          Copying environment variables..."
echo "-------------------------------------------------------------------"

ANGULAR_CONFIG_FILE="/var/www/bookreport-web/public/scripts/config.js"
NGINX_CONF="/bookreport-web/nginx.conf"
NGINX_HTTPS_CONF="/bookreport-web/nginx-https.conf"

CONTAINER_PORT=9000

cp -f /var/www/bookreport-web/public/scripts/config-template.js /var/www/bookreport-web/public/scripts/config.js
sed -i -e "s/ENVIRONMENT/${ENV}/g" ${ANGULAR_CONFIG_FILE}
sed -i -e "s@API_END_POINT@${API_END_POINT}@g" ${ANGULAR_CONFIG_FILE}
sed -i -e "s@APP_HOST@${APP_HOST}@g" ${ANGULAR_CONFIG_FILE}
sed -i -e "s@PUSHER_KEY@${PUSHER_KEY}@g" ${ANGULAR_CONFIG_FILE}

echo "-------------------------------------------------------------------"
echo "Changing nginx listener port in nginx.conf to: $CONTAINER_PORT"
echo "-------------------------------------------------------------------"
sed -i -e "s/listen_port/${CONTAINER_PORT}/g" ${NGINX_CONF}
sed -i -e "s/listen_port/${CONTAINER_PORT}/g" ${NGINX_HTTPS_CONF}

echo "-------------------------------------------------------------------"
echo "Changing router ip in nginx.conf to: ${PUBLIC_IP}"
echo "-------------------------------------------------------------------"
sed -i -e "s/router_ip/${PUBLIC_IP}/g" ${NGINX_CONF}
sed -i -e "s/router_ip/${PUBLIC_IP}/g" ${NGINX_HTTPS_CONF}

echo "-------------------------------------------------------------------"
echo "Changing server name in nginx.conf to: ${PUBLIC_IP}"
echo "-------------------------------------------------------------------"
sed -i -e "s@rewrite_url@${APP_HOST}@g" ${NGINX_CONF}
sed -i -e "s@rewrite_url@${APP_HOST}@g" ${NGINX_HTTPS_CONF}

if [ "${REDIRECT_TO_HTTPS}" = "true" ] ; then
    cp -f ${NGINX_HTTPS_CONF} /etc/nginx/nginx.conf
else
    cp -f ${NGINX_CONF} /etc/nginx/nginx.conf
fi

service nginx restart
tail -F /var/log/nginx/access.log
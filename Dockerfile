FROM cedarwood/web-base
MAINTAINER Naren J

ADD ./src/client/fonts /bookreport-web/src/client/fonts
ADD ./src/client/images /bookreport-web/src/client/images
ADD ./src/client/locale /bookreport-web/src/client/locale
ADD ./src/client/locales /bookreport-web/src/client/locales
ADD ./src/client/scripts /bookreport-web/src/client/scripts
ADD ./src/client/styles /bookreport-web/src/client/styles
ADD ./src/client/views /bookreport-web/src/client/views
ADD ./src/client/index.html /bookreport-web/src/client/index.html
ADD ./src/client/document-view.html /bookreport-web/src/client/document-view.html
ADD ./src/grunt /bookreport-web/src/grunt

ADD ./config.sh /bookreport-web/config.sh
ADD ./nginx.conf /bookreport-web/nginx.conf
ADD ./nginx-https.conf /bookreport-web/nginx-https.conf

RUN cd /bookreport-web/src && grunt build

RUN cp -a /bookreport-web/src/dist/. /var/www/bookreport-web/public

RUN chmod +x /bookreport-web/config.sh

EXPOSE 9000

ENTRYPOINT ["/bookreport-web/config.sh"]
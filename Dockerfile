FROM webdevops/nginx:alpine

LABEL JASSUE <jassue@163.com>

ENV WEB_DOCUMENT_ROOT=/app/admin \
    WEB_DOCUMENT_INDEX=index.html
    
WORKDIR $WEB_DOCUMENT_ROOT

COPY dist .

EXPOSE 80

VOLUME $WEB_DOCUMENT_ROOT

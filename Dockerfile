FROM alpine:3.13 as builder

RUN apk --update add nodejs yarn 

WORKDIR /opt/src
ADD package.json yarn.lock .
RUN yarn --pure-lockfile

ADD . .
RUN yarn build
RUN mkdir -p /opt/dsadmin && \
  cp -r /opt/src/bin /opt/src/build /opt/src/package.json /opt/src/yarn.lock /opt/dsadmin && \
  cd /opt/dsadmin && \
  yarn install --production --pure-lockfile


FROM alpine:3.13

RUN apk --update add nodejs tini
WORKDIR /opt/dsadmin
COPY --from=builder /opt/dsadmin /opt/dsadmin

ENTRYPOINT ["/sbin/tini", "/opt/dsadmin/bin/dsadmin.js"]

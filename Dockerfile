FROM alpine

RUN apk --no-cache add nodejs nodejs-npm curl git python make g++

WORKDIR /usr/local/project/app
COPY ./package.json .
RUN npm install
COPY ./ .
RUN npm run build
#
#

FROM alpine
RUN apk --no-cache add nodejs nodejs-npm curl git
WORKDIR /usr/local/project/app
COPY --from=0 /usr/local/project/app /usr/local/project/app


EXPOSE 3000
ENTRYPOINT ["npm", "start"]
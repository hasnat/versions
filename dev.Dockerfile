FROM alpine

RUN apk --no-cache add nodejs nodejs-npm curl git python make

#WORKDIR /usr/local/project/app
#COPY ./package.json .
#RUN npm install
#COPY ./ .
#RUN npm run build
#
#
#EXPOSE 3000
#ENTRYPOINT ["npm", "start"]
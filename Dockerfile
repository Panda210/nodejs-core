FROM docker-registry-oss.yifen7.cn/env/node-base:latest

#更新源，安装yasm ffmpeg
RUN apk update
RUN apk add ffmpeg

WORKDIR /data1/admin/app

COPY ./package.json /data1/admin/app
RUN npm install --production

COPY ./ /data1/admin/app
EXPOSE 8080

CMD npm start
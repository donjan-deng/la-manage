FROM node:13.3.0-alpine3.10

ENV PORT=4200 \
    NODE_ENV=production

# 安装express和angular/cli
RUN npm install express@4.17.1 -g \
    && npm install -g @angular/cli
# 创建app目录
RUN mkdir -p /app
# 复制代码到 App 目录
COPY . /app
WORKDIR /app

# 安装依赖,构建程序,这里由于我需要反向代理到子目录，所以添加了base-href参数
RUN npm install && ng build --base-href /manage/ --prod

EXPOSE ${PORT}

ENTRYPOINT ["node", "/app/server.js"]
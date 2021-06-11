## Jassue Admin

基于 Vue、Element UI 实现的后台管理系统，后端代码移步 [jassue-admin](https://github.com/jassue/jassue-admin)

## 环境依赖

- @vue/cli ~4
- node
- npm
- webpack
- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)

## 运行发布

- 修改配置文件

  ```
  1.打开根目录下 .env.production 文件
  2.修改 api 域名
  ```

- 安装依赖

  ~~~
  npm install
  ~~~

- 开发

  ~~~
  npm run serve
  ~~~

- 编译

  ~~~
  npm run build
  ~~~

- 发布

  ~~~
  将编译完的所有文件放到 nginx 服务器项目根目录下
  ~~~

## 使用 Docker

- 开发环境
  docker-compose.yml:

  ~~~yaml
  version: "3"
  services:
    jassue-admin-client:
      image: jassue/node
      container_name: jassue-admin-client
      tty: true
      working_dir: /app
      expose:
        - "80"
      ports:
        - "8080:80"
      volumes:
        - ./:/app
  
  networks:
    default:
      driver: bridge
  ~~~

- 生产环境
  docker-compose.yml:

  ~~~yaml
  version: "3"
  services:
    jassue-admin-client:
      image: jassue/nginx
      container_name: jassue-admin-client
      expose:
        - "80"
      ports:
        - "8080:80"
      volumes:
        - ./:/app
  
  networks:
    default:
      driver: bridge
  ~~~

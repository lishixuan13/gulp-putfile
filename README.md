# `gulp-putfile`

> gulp插件，上传文件到服务器

## Usage

```javascript
const gulpPutFile = require("gulp-putfile");

gulp.src("dist/**").pipe(
  gulpPutFile({
    dest: "/opt/xxx/xxx",
    host: "111.111.111.111",
    username: "root",
    password: "123",
    port: 22,
  })
);
```

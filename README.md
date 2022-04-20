# vue-easytodo

## 运行项目

### 初始化项目安装依赖
```
vue add electron-builder
```
```
npm install
```

### 运行测试
```
npm run electron:serve
```

### 打包
```
npm run electron:build
```
注意：打包前先到 App.vue 中更换一下 databaseUrl ，ctrl+F 找一下就能找到。
打包后只有 win-unpacked 文件夹是有用的，其他都能删掉，进入程序也从 win-unpacked 里面的 exe 文件进。

## 软件游玩
日历视图和任务视图的数据是同步的，只是叫法不同。

### 日历视图
点击每一个日历单元格可以新增日程，悬浮在每条日程上可以进行日程状态更改和删除。

### 任务视图
任务视图右侧表单可以新增任务，左侧显示的任务可以进行任务状态更改和删除。

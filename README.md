# 蓝屿花庭 · Blue Bloom Castle

可交互的蓝花楹城堡微缩景观。支持拖拽旋转、缩放、清晨 / 蓝调日落 / 夜晚、连续时间调节，以及独立的晴天 / 雨天 / 雪天切换。

## GitHub Pages

这是无需安装依赖或构建的静态网页。将本目录内容上传到仓库根目录，在 Settings → Pages 选择 Deploy from a branch，分支 main，目录 /(root)。保留 `.nojekyll` 文件。

所有脚本、样式和核心 3D 资源使用相对路径，支持 GitHub Pages 的仓库子路径。手写标题字体随项目附带，辅助字体由 Google Fonts 提供，无法连接时使用系统字体。

## 操作

- 拖拽旋转，滚轮或双指缩放。
- 时间与天气分别切换。
- 点击大门开合，轻点水面产生涟漪。
- 纯享模式隐藏界面；返回按钮或 Esc 恢复。

## 微信小程序

本仓库发布的是独立网页。个人主体小程序若要在首页运行此交互场景，需要适配小程序 Canvas / WebGL；发布网页本身不会自动完成这一步。建筑画面可以另外导出成封面图片。

## 第三方许可

Three.js r170、OrbitControls 与 BufferGeometryUtils：MIT，见 `vendor/LICENSE`。

Pinyon Script：SIL Open Font License，见 `vendor/PinyonScript-OFL.txt`。

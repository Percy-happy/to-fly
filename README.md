# 静态网站项目

一个现代化的中型静态网站项目模板。

## 项目结构

```
static-website-project/
├── src/                    # 源代码目录
│   ├── assets/            # 静态资源
│   ├── components/        # 可复用组件
│   ├── pages/             # 页面文件
│   ├── styles/            # 样式文件
│   ├── scripts/           # JavaScript文件
│   └── utils/             # 工具函数
├── public/                # 公共资源（不参与构建）
├── dist/                  # 构建输出目录
├── docs/                  # 项目文档
├── config/                # 配置文件
└── tests/                 # 测试文件
```

## 技术栈

- **构建工具**: Vite
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: Sass/CSS
- **包管理**: npm/yarn

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建项目：
```bash
npm run build
```

## 开发指南

- 源代码位于 `src/` 目录
- 静态资源放在 `src/assets/`
- 公共资源放在 `public/`
- 构建输出到 `dist/`
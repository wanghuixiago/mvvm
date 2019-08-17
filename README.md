# mvvm
简单实现MVVM原理


##项目运行步骤

#1 npm init -y 生成默认的package.json文件

#2 npm install vue 可以安装vue包


项目实现步骤：


#模板编译
 
主要简单处理两种：1指令编译 v-modle  2 文本编译 {{data}}

对应 更新元素数据（input） 方法    更新文本数据方法

#数据劫持

遍历传进来的数据对象，分别给对象的属性重写get \ set 方法

利用了Object.defineProperty

#观察者将劫持和编译联系起来

发布订阅

订阅： 将watcher 添加进数组中，
发布： 触发update方法时，一次遍历执行数组中的方法

# CImage
demo查看：[ https://cccshine.github.io/Clmage/demo/index.html ]( https://cccshine.github.io/Clmage/demo/index.html )

## Introduction
基于原生`JavaScript`的图片截取插件，可预览截取效果

## 使用方法
### 载入 CSS 文件
```
//HTML code

<link rel="stylesheet" href="cimage.css">
```

### 载入 JavaScript 文件
```
//HTML code

<script type="text/javascript" src="CImage.min.js"></script>
```

### 给 img 标签加上 id --- cimage
```
//HTML code

<img id="cimage" src="xx.jpg" alt="cimage">
```

### 调用Cimage
```
//JavaScript code

var CI = new CImage([可选的options]);
```

## 参数说明
参数名 | 默认值 | 说明 
:-: | :-: | :-: 
element | document.getElementById('cimage') | 应用CImage插件的img元素
allowNewSelect | true | 是否允许新选框
allowMove | true | 是否允许移动选框
allowResize | true | 是否允许缩放选框
bgColor | #000 | 蒙版的背景颜色，颜色关键字、HEX、RGB 均可。
bgOpacity | 0.6 | 蒙版的背景透明度
borderOpacity | 0.4 | 选框的边框透明度
handleOpacity | 0.5 | 边角控制器的透明度
handleSize | 5 | 边角控制器的尺寸，单位为px
aspectRatio | null | 选框宽高比，width/height
hasPreview | true | 是否需要预览截取效果，需要设置了aspectRatio才能看到预览
previewSize | [200] | 预览框的数量及尺寸，单位px；如果想要三个分别为200px,100px,50px的预览框，则设置为[200,100,50]；此选项仅在设置了aspectRatio并且开启预览时才生效
createHandles | ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'] | 设置选框的边角控制器，数组内的边角将会生成控制器
createBorders | ['n', 'e', 's', 'w'] | 设置需要选框的哪些方向的边框
drawBorders | true | 是否显示选框的边框
minSize | [0,0] | 选框的最小尺寸，单位为px
maxSize | [null,null] | 选框的最大尺寸，单位为px
onChange | function() {} | 选框改变时的事件
onSelect | function() {} | 选框选定时的事件
onRelease | function() {} | 取消选框时的事件
	
## API说明
使用实例调用即可，如`CI.getSelectInfo()`获取选定的选框信息

名称 | 说明 
:-: | :-: 
setImage(imgSrc, callback) | 设置（或改变）图像。例：CI.setImage('newpic.jpg')
setOptions(options) | 设置（或改变）参数，格式与初始化设置参数一样
setSelect(pos) | 创建选框，参数格式为：{x1:0,y1:0,x2:100,y2:100}，偏移参考点为左上角
getSelectInfo() | 获取选框信息，返回格式为{ "x1": x1, "y1": y1, "x2": x2, "y2": y2, "width": width, "height": height }
release() | 取消选框
destroy() | 移除CImage
disable() | 禁用CImage
enable() | 启用CImage

# css sticky 属性

- 在屏幕范围（viewport）内时，元素的位置不受到 top, left 等定位值的影响
- 当元素移出屏幕范围时，定位会变成 fixed，根据设置的 left, top 等属性相对于窗口布局。
- 元素并不脱离文档流，仍然保持元素原本在文档流中的位置
- 如果指定了 top: 50px，那么在 sticky 元素到达距离相对定位的元素顶部 50px 的位置时固定，不再向上移动。也就是说，sticky 元素在他所处的滚动容器中，被滚动超过了绝对定位指定的偏移值，就会在容器内固定。
- 元素固定的相对偏移是相对于离它最近的具有滚动框的祖先元素，如果祖先元素都不可以滚动，那么是相对于 viewport 来计算元素的偏移量

## 参考链接

1. https://github.com/lgwebdream/FE-Interview/issues/529
2. https://stackoverflow.com/a/48355127/8242705

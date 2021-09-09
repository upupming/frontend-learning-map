# React Diff 算法

- Virtual DOM: Virtual DOM 主要是通过 JS 维护 DOM 元素的数据结构，能够通过 JS 去高效地对比新旧 Virtual DOM 来找出真正的 DOM 变化之处。
- Diff 算法: 找出更新前后的 DOM 的变化，就是 diff 算法所要做的。diff 不是 React 首创的，但是 React 对其进行了优化，使得 React 性能有所提升。

React 中有 3 中不同的 Diff 策略：

- Tree Diff
    - 更新前后的两颗 DOM 树进行比较时，只会对同一层次的节点进行比较。
        - 基于的假设：DOM 节点跨层级的移动操作少到可以忽略不计，React 通过 updateDepth 对 Virtual DOM 树进行层级控制，只会对同一父节点下所有的子节点进行比较。当发现节点已经不存在时，直接删除，不再进行下面层的比较。因此只需要对树进行一次遍历，便能够完成整个 DOM 树的比较。
- Component Diff
    - 同一类型的组件按照原策略继续比较 virtual DOM tree
    - 如果不是同类型的组件，判断为 dirty component，从而替换组件下的所有子节点
    - 如果同一类型的组件，virtual DOM 有可能没有任何变化，没有必要再去对比，React 允许用户指定 shouldUpdateComponent() 来判断该组件是否需要进行 diff
- Element Diff
    - 当节点处于同一层级时，React diff 提供 3 种节点操作，分别是 INSERT_MARKUP（插入）、MOVE_EXISTING（移动） 和 REMOVE_NODE（删除）

另外 React 允许开发者对同一层级的同组子节点，添加唯一 key 进行区分。

## 参考链接

1. https://github.com/lgwebdream/FE-Interview/issues/222

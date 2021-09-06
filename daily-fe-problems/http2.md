# HTTP 2、HTTP 3 有哪些新特性

Chrome 抓包查看 HTTP 版本：

![2021-09-06](https://i.loli.net/2021/09/06/z8Y3IXswtVcJCPl.png)

## HTTP 2

- 二进制分帧
- 对报头压缩，降低开销
- 默认使用加密，HTTP/2 必须使用 HTTPS
- 多路复用
    - HTTP 1.x 多个并行请求以提升性能，则必须使用多个 TCP 连接
    - 将 HTTP 消息分解为独立的帧，交错发送，然后在另一端重新组装是 HTTP 2 最重要的一项增强
    - 可以使用一个连接并行交错地发送多个请求、响应
- 服务器推送
- 伪头字段
    - :method, GET
    - :scheme, https
    - :authority, api.juejin.cn
    - :path, /user_api/v1/user/profile_id?aid=2608&uuid=6939057499312801288&web_id=6939057499312801288
    - :status

## HTTP 3

- 运行在 QUIC 之上，QUIC 基于 UDP
- 减少了握手的延迟(1-RTT 或 0-RTT)
- 多路复用，并且没有 TCP 的阻塞问题
    - HTTP/1.1 和 HTTP/2 都存在队头阻塞问题(Head of line blocking)
- 连接迁移，(主要是在客户端)当由 Wifi 转移到 4G 时，连接不 会被断开。
- HTTP 3与HTTP 1.1和HTTP 2没有直接的关系，也不是http2的扩展；HTTP 3将会是一个全新的WEB协议

## 参考资料

1. https://juejin.cn/post/6844904135137951758

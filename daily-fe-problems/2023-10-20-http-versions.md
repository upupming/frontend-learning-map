# HTTP 各种版本差异

[![](https://camo.githubusercontent.com/a6b5ec126753f682f5a423bd827303a264519fc14d8a9301c075e97f40fd7d9a/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f65313637613538302d623933612d313165622d616239302d6439616538313462323430642e706e67)](https://camo.githubusercontent.com/a6b5ec126753f682f5a423bd827303a264519fc14d8a9301c075e97f40fd7d9a/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f65313637613538302d623933612d313165622d616239302d6439616538313462323430642e706e67)

## 一、HTTP1.0

`HTTP`协议的第二个版本，第一个在通讯中指定版本号的HTTP协议版本

`HTTP 1.0` 浏览器与服务器只保持短暂的连接，每次请求都需要与服务器建立一个`TCP`连接

服务器完成请求处理后立即断开`TCP`连接，服务器不跟踪每个客户也不记录过去的请求

简单来讲，每次与服务器交互，都需要新开一个连接

[![](https://camo.githubusercontent.com/bafb5aa86567b06f6ab49e77e8093b86ecbfa0706b895dab2aa0f092a5e14688/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f65666666346461302d623933612d313165622d383566362d3666616337376330633962332e706e67)](https://camo.githubusercontent.com/bafb5aa86567b06f6ab49e77e8093b86ecbfa0706b895dab2aa0f092a5e14688/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f65666666346461302d623933612d313165622d383566362d3666616337376330633962332e706e67)

例如，解析`html`文件，当发现文件中存在资源文件的时候，这时候又创建单独的链接

最终导致，一个`html`文件的访问包含了多次的请求和响应，每次请求都需要创建连接、关系连接

这种形式明显造成了性能上的缺陷

如果需要建立长连接，需要设置一个非标准的Connection字段 `Connection: keep-alive`

## 二、HTTP1.1

在`HTTP1.1`中，默认支持长连接（`Connection: keep-alive`），即在一个TCP连接上可以传送多个`HTTP`请求和响应，减少了建立和关闭连接的消耗和延迟

建立一次连接，多次请求均由这个连接完成

[![](https://camo.githubusercontent.com/ec0086853db850c6a5c274887dd332872a60ade3661fd5e275fd600b9dd692f6/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f32326462326239302d623933622d313165622d616239302d6439616538313462323430642e706e67)](https://camo.githubusercontent.com/ec0086853db850c6a5c274887dd332872a60ade3661fd5e275fd600b9dd692f6/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f32326462326239302d623933622d313165622d616239302d6439616538313462323430642e706e67)

这样，在加载`html`文件的时候，文件中多个请求和响应就可以在一个连接中传输

同时，`HTTP 1.1`还允许客户端不用等待上一次请求结果返回，就可以发出下一次请求，但服务器端必须按照接收到客户端请求的先后顺序依次回送响应结果，以保证客户端能够区分出每次请求的响应内容，这样也显著地减少了整个下载过程所需要的时间

同时，`HTTP1.1`在`HTTP1.0`的基础上，增加更多的请求头和响应头来完善的功能，如下：

- 引入了更多的缓存控制策略，如If-Unmodified-Since, If-Match, If-None-Match等缓存头来控制缓存策略
- 引入range，允许值请求资源某个部分
- 引入host，实现了在一台WEB服务器上可以在同一个IP地址和端口号上使用不同的主机名来创建多个虚拟WEB站点

并且还添加了其他的请求方法：`put`、`delete`、`options`...

## 三、HTTP2.0

而`HTTP2.0`在相比之前版本，性能上有很大的提升，如添加了一个特性：

- 多路复用
- 二进制分帧
- 首部压缩
- 服务器推送

### 多路复用

`HTTP/2` 复用`TCP`连接，在一个连接里，客户端和浏览器都可以**同时**发送多个请求或回应，而且不用按照顺序一一对应，这样就避免了”队头堵塞”

[![](https://camo.githubusercontent.com/1ad75c779b69eb8d74aa22119609ab6638daa487170f40d185b72e91beb4ecb2/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f33313366313938302d623933622d313165622d383566362d3666616337376330633962332e706e67)](https://camo.githubusercontent.com/1ad75c779b69eb8d74aa22119609ab6638daa487170f40d185b72e91beb4ecb2/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f33313366313938302d623933622d313165622d383566362d3666616337376330633962332e706e67)

上图中，可以看到第四步中`css`、`js`资源是同时发送到服务端

### 二进制分帧

帧是`HTTP2`通信中最小单位信息

`HTTP/2` 采用二进制格式传输数据，而非 `HTTP 1.x` 的文本格式，解析起来更高效

将请求和响应数据分割为更小的帧，并且它们采用二进制编码

`HTTP2` 中，同域名下所有通信都在单个连接上完成，该连接可以承载任意数量的双向数据流

每个数据流都以消息的形式发送，而消息又由一个或多个帧组成。多个帧之间可以乱序发送，根据帧首部的流标识可以重新组装，这也是多路复用同时发送数据的实现条件

### 首部压缩

`HTTP/2`在客户端和服务器端使用“首部表”来跟踪和存储之前发送的键值对，对于相同的数据，不再通过每次请求和响应发送

首部表在`HTTP/2`的连接存续期内始终存在，由客户端和服务器共同渐进地更新

例如：下图中的两个请求， 请求一发送了所有的头部字段，第二个请求则只需要发送差异数据，这样可以减少冗余数据，降低开销

[![](https://camo.githubusercontent.com/58c277eb38640eadd608fac804f074a1d5e923a5174bf3e83d4e6c0f6be3775e/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f33633533363734302d623933622d313165622d616239302d6439616538313462323430642e706e67)](https://camo.githubusercontent.com/58c277eb38640eadd608fac804f074a1d5e923a5174bf3e83d4e6c0f6be3775e/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f33633533363734302d623933622d313165622d616239302d6439616538313462323430642e706e67)

### 服务器推送

`HTTP2`引入服务器推送，允许服务端推送资源给客户端

服务器会顺便把一些客户端需要的资源一起推送到客户端，如在响应一个页面请求中，就可以随同页面的其它资源

免得客户端再次创建连接发送请求到服务器端获取

这种方式非常合适加载静态资源

[![](https://camo.githubusercontent.com/738fcfd203f7f9fbe5d0ada988733fad8b63f29ef5e01fa9f4fa6fd9bd47cef4/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f34373133303535302d623933622d313165622d383566362d3666616337376330633962332e706e67)](https://camo.githubusercontent.com/738fcfd203f7f9fbe5d0ada988733fad8b63f29ef5e01fa9f4fa6fd9bd47cef4/68747470733a2f2f7374617469632e7675652d6a732e636f6d2f34373133303535302d623933622d313165622d383566362d3666616337376330633962332e706e67)

## 四、HTTP3

### HTTP/2 的缺陷

HTTP/2 是基于 TCP 传输，但是 TCP 协议还是有两个个致命的缺陷：

- 建立连接时间长
- 队头阻塞问题相较于 HTTP/1.1 更严重

#### 1\. 建立连接时间长

目前是用 RTT（Round-Trip Time）来定义建立时间，RTT 指的是往返时间，表示从发送端发送数据开始，到发送端收到来自接受端的确认（接收端收到数据后便立即发送确认，不包含数据传输时间）总共经历的时间，即通信一来一回的时间。

**TCP 建立连接时间**

TCP 建立连接有三次握手： ![http3](https://limeii.github.io/assets/images/posts/http/http3-01.png)

- 一去 （SYN）：客户端向服务端发送连接请求报文段。该报文段中包含自身的数据通讯初始序号。请求发送后，客户端便进入 SYN-SENT 状态
- 二回 （SYN+ACK）：服务端收到连接请求报文段后，如果同意连接，则会发送一个应答，该应答中也会包含自身的数据通讯初始序号，发送完成后便进入 SYN-RECEIVED 状态
- 三去 （ACK）：当客户端收到连接同意的应答后，还要向服务端发送一个确认报文。客户端发完这个报文段后便进入 ESTABLISHED 状态，服务端收到这个应答后也进入 ESTABLISHED 状态，此时连接建立成功

TCP 建立连接时间 = 1.5 RTT

**HTTP 交易时间**

客户端在请求数据的时候，首先花费 1.5 RTT 建立 TCP 连接，然后 TCP 才开始传输 HTTP 请求，浏览器收到服务器的响应，又要等待的时间为：

- 一去（HTTP Request）
- 二回 （HTTP Responses）

HTTP 交易时间 = 1 RTT

由于 TCP 在第三次握手的时候，不需要等待服务器端的响应，所以节省 0.5 RTT，那么基于 TCP 传输的 HTTP 通信，一共花费的时间总和：

HTTP 通信时间总和 = TCP 建立连接时间 + HTTP 交易时间 = 1 RTT + 1 RTT = 2 RTT

**HTTPS 通信时间**

HTTP/2 延续了 HTTP/1 的“明文”特点，可以像以前一样使用明文传输数据，不强制使用加密通信，但 HTTPS 已经是大势所趋，各大主流浏览器都公开宣布只支持加密的 HTTP/2，所以，真实应用中的 HTTP/2 是还是加密的，HTTPS 通信时间 = TCP 建立连接时间 + TLS 连接时间 + HTTP 交易时间。

TLS 建立连接的时候，有四次握手，需要 2 个 RTT。

HTTPS 通信时间总和 = TCP 建立连接时间 + TLS 连接时间 + HTTP交易时间 = 1 RTT + 2 RTT + 1 RTT = 4 RTT

需要注意的是，在 TLS1.3 协议中，首次建立连接只需要一个 RTT，后面恢复连接就不需要 RTT 了。

HTTPS 通信时间总和（基于TLS1.2） = TCP 建立连接时间 + TLS1.2 连接时间 + HTTP交易时间 = 1 RTT + 2 RTT + 1 RTT = 4 RTT

HTTPS 通信时间总和（基于TLS1.3） = TCP 建立连接时间 + TLS1.3 连接时间 + HTTP交易时间 = 1 RTT + 1 RTT + 1 RTT = 3 RTT

#### 2\. 队头阻塞问题相较于 HTTP/1.1 更严重

因为 HTTP/2 使用了多路复用，一般来说同一域名下只需要使用一个 TCP 连接。当这个连接中出现了丢包的情况，那就会导致 HTTP/2 的表现情况反倒不如 HTTP/1 了。

因为在出现丢包的情况下，整个 TCP 都要开始等待重传，也就导致了后面的所有数据都被阻塞了。但是对于 HTTP/1 来说，可以开启多个 TCP 连接，出现这种情况反到只会影响其中一个连接，剩余的 TCP 连接还可以正常传输数据。

### QUIC 协议介绍

如果 TCP 建立时间过长，那能不能缩短这个时间呢？因为 TCP 存在的时间实在太长，已经充斥在各种设备中，并且这个协议是由操作系统实现的，改造起来不大现实。

我们先来看下 UDP 的特性：

- UDP 本身是无连接的，没有建立连接、拆除连接的成本，耗时低
- UDP 的数据包没有队头阻塞的问题
- UDP 改造成本比较小

所以，Google 就另起炉灶写了一个基于 UDP 协议的 QUIC 协议（Quick UDP Internet Connection），并把这个协议用在了 HTTP/3 上，HTTP/3 之前的命名为 HTTP-over-QUIC。

### HTTP/3 新特性

![http3](https://limeii.github.io/assets/images/posts/http/http3-02.png)

QUIC 虽然基于 UDP，但是在原本的基础上新增了很多功能，比如多路复用、0-RTT、使用 TLS1.3 加密、流量控制、有序交付、重传等等功能。

#### 1\. 多路复用，解决队头阻塞问题

虽然 HTTP/2 支持了多路复用，但是 TCP 协议终究是没有这个功能的。QUIC 原生就实现了这个功能。

QUIC 协议是基于 UDP 协议实现的，同一个 QUIC 连接上可以创建多个 stream（数据流） 来发送多个 HTTP 请求，并且，多个 stream 之间没有依赖，传输的单个 stream可以保证有序交付且不会影响其他的数据流。

例如下图，stream2 丢了一个 UDP 包，不会影响后面跟着 Stream3 和 Stream4。这样的技术就解决了之前 TCP 存在的队头阻塞问题。

![http3](https://limeii.github.io/assets/images/posts/http/http3-03.jpeg)

并且 QUIC 在移动端的表现也会比 TCP 好。因为 TCP 是基于 IP 和端口去识别连接的，这种方式在多变的移动端网络环境下是很脆弱的。但是 QUIC 是通过 ID 的方式去识别一个连接，不管你网络环境如何变化，只要 ID 不变，就能迅速重连上。

#### 2\. 0RTT

通过使用类似 TCP 快速打开的技术，缓存当前会话的上下文，在下次恢复会话的时候，只需要将之前的缓存传递给服务端验证通过就可以进行传输了。

0RTT 建连可以说是 QUIC 相比 HTTP2 最大的性能优势。那什么是 0RTT 建连呢？

- 传输层 0RTT 就能建立连接。
- 加密层 0RTT 就能建立加密连接。

![http3](https://limeii.github.io/assets/images/posts/http/http3-04.gif) 上图左边是 HTTPS 的一次完全握手的建连过程，需要 2-3 个 RTT才开始传输数据，右边 QUIC 协议在第一个包就可以包含有效的应用数据

当然，QUIC 协议可以实现 0RTT ，但这也是有条件的，实际上是首次连接 1RTT，非首次连接 0RTT。

#### 3\. 向前纠错机制

QUIC 协议有一个非常独特的特性，称为向前纠错 (Forward Error Correction，FEC)，每个数据包除了它本身的内容之外，还包括了部分其他数据包的数据，因此少量的丢包可以通过其他包的冗余数据直接组装而无需重传。

向前纠错牺牲了每个数据包可以发送数据的上限，但是减少了因为丢包导致的数据重传，因为数据重传将会消耗更多的时间（包括确认数据包丢失、请求重传、等待新数据包等步骤的时间消耗）。

假如说这次我要发送三个包，那么协议会算出这三个包的异或值并单独发出一个校验包，也就是总共发出了四个包。

当出现其中的非校验包丢包的情况时，可以通过另外三个包计算出丢失的数据包的内容。

当然这种技术只能使用在丢失一个包的情况下，如果出现丢失多个包就不能使用纠错机制了，只能使用重传的方式了。

#### 4\. 加密认证的报文

TCP 协议头部没有经过任何加密和认证，所以在传输过程中很容易被中间网络设备篡改，注入和窃听。比如修改序列号、滑动窗口。这些行为有可能是出于性能优化，也有可能是主动攻击。

但是 QUIC 的 packet 可以说是武装到了牙齿。除了个别报文比如 PUBLIC\_RESET 和 CHLO，所有报文头部都是经过认证的，报文 Body 都是经过加密的。

这样只要对 QUIC 报文任何修改，接收端都能够及时发现，有效地降低了安全风险。

## 五、总结

HTTP1.0：

- 浏览器与服务器只保持短暂的连接，浏览器的每次请求都需要与服务器建立一个TCP连接

HTTP1.1：

- 引入了持久连接，即TCP连接默认不关闭，可以被多个请求复用
- 在同一个TCP连接里面，客户端可以同时发送多个请求
- 虽然允许复用TCP连接，但是同一个TCP连接里面，所有的数据通信是按次序进行的，服务器只有处理完一个请求，才会接着处理下一个请求。如果前面的处理特别慢，后面就会有许多请求排队等着
- 新增了一些请求方法
- 新增了一些请求头和响应头

HTTP2.0：

- 采用二进制格式而非文本格式
- 完全多路复用，而非有序并阻塞的、只需一个连接即可实现并行
- 使用报头压缩，降低开销
- 服务器推送

HTTP3.0：

- 基于UDP协议，多路复用，解决TCP的队头阻塞问题
- 0RTT建连，加快建连速度
- 向前纠错机制，减少重传
- 加密认证的报文，防止中间人攻击

## 参考文献

- https://github.com/febobo/web-interview/issues/143
- [https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#HTTP/1.0](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#HTTP/1.0)
- [https://www.jianshu.com/p/52d86558ca57](https://www.jianshu.com/p/52d86558ca57)
- [https://segmentfault.com/a/1190000016496448](https://segmentfault.com/a/1190000016496448)
- [https://zhuanlan.zhihu.com/p/26559480](https://zhuanlan.zhihu.com/p/26559480)
- https://limeii.github.io/2019/06/http2-http3/
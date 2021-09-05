# 开发中常用的 Content-Type

## `application/x-www-form-urlencoded`

浏览器原生 form 表单，请求格式如下，可以看到使用类似 URL 编码的方式把所有字段放在一个字符串中，问题是数字和字符串无法区分：

```txt
POST http://www.example.com HTTP/1.1
Content-Type: application/x-www-form-urlencoded;charset=utf-8

title=test&sub%5B%5D=1&sub%5B%5D=2&sub%5B%5D=3

```

## `multipart/form-data`

对原生表单手动指定 `enctype="multipart/form-data"`：

```html
<form action="/" method="post" enctype="multipart/form-data">
  <input type="text" name="description" value="some text" />
  <input type="file" name="myFile" />
  <button type="submit">Submit</button>
</form>
```

请求格式如下：

```txt
POST /foo HTTP/1.1
Content-Length: 68137
Content-Type: multipart/form-data; boundary=---------------------------974767299852498929531610575

---------------------------974767299852498929531610575
Content-Disposition: form-data; name="description"

some text
---------------------------974767299852498929531610575
Content-Disposition: form-data; name="myFile"; filename="foo.txt"
Content-Type: text/plain

(content of the uploaded file foo.txt)
---------------------------974767299852498929531610575--

```

## `application/json`

目前最长用的形式了，传数据的时候是传的序列化后的 JSON 字符串。

```txt
POST http://www.example.com HTTP/1.1
Content-Type: application/json;charset=utf-8

{"title":"test","sub":[1,2,3]}

```

## `txt/xml`

用来提交 XML 格式数据：

```txt
POST http://www.example.com HTTP/1.1
Content-Type: text/xml

<?xml version="1.0"?>
<methodCall>
    <methodName>examples.getStateName</methodName>
    <params>
        <param>
            <value><i4>41</i4></value>
        </param>
    </params>
</methodCall>

```

## 参考资料

1. https://github.com/lgwebdream/FE-Interview/issues/1208

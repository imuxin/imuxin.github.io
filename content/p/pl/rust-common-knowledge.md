# Rust 必知必会

## String and &str

`String`，“堆”上动态分配 string 类型，和 Vec 类似（查看标准库的 String 定义可以看到其 struct 里包含一个类型为 `vec: Vec<u8>` 的成员）。在你需要拥有其所有权或修改 string 的值的时候可以使用 String 类型。

`&str`，可以理解为是一个 string 的切片视图，具有 immutable 的特性，也就是说你只拥有 string 字面值的查看权限。&str 的 string 数据可以存储在任意地方，比如：

1. **In static storage**: a string literal "foo" is a &'static str. The data is hardcoded into the executable and loaded into memory when the program runs. e.g. `const FOO: &'static str = "foo"`
2. **Inside a heap allocated String**: [String dereferences to a &str view](https://doc.rust-lang.org/std/string/struct.String.html#deref) of the String's data. 将 String 类型的变量以传参数的方式给含有 &str 参数类型的函数，会发生类型转换。
3. **On the stack**: e.g. the following creates a stack-allocated byte array, and then gets a [view of that data as a &str](https://doc.rust-lang.org/std/str/fn.from_utf8.html):

   ```rust
   use std::str;

   let x: &[u8] = &[b'a', b'b', b'c'];
   let stack_str: &str = str::from_utf8(x).unwrap();
   ```

<blockquote class="important">
<p class="title">当 struct 类型里含有 &str 类型的成员时，需要声明生命周期，如：</p>

```rust
struct Foo<'a> {
    baz: &'a str,
}
```
</blockquote>

以上内容参考了 stackoverflow 上的这个回答：https://stackoverflow.com/a/24159933。

另外相关资料有：[String vs str](https://google.github.io/comprehensive-rust/basic-syntax/string-slices.html) in 《Comprehensive Rust》。

---

可以简单理解 String 和 &str 有以下的结构：

String 有一个 Buf，它是堆上分配的一块内存。这块内存的地址为 ptr，容量为 cap。len 描述当前 String 值的长度，可以理解为 [ptr, ptr+OFFSET(len)] 这个区间的内容就是 String 的值。

```rust
type String {
   type Buf {
      ptr
      cap
   }
   len
}
```

&str 的结构里就仅有 data_ptr 和 len 这两个属性。单纯地查找 string 的字面值内容是什么而已。因为不知道内存的容量大小，这里也就不能改变内存里的字符串值了。

```rust
type &str {
   data_ptr
   len
}
```

## "Result", "Options", "unwrap" and "?"

## "trait"

## Generic

## "macro_rules!"

## Asynchronous programming

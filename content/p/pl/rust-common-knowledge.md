# Rust 必知必会

## String and \&str

`String`，“堆”上动态分配 string 类型，和 Vec 类似（查看标准库的 String 定义可以看到其 struct 里包含一个类型为 `vec: Vec<u8>` 的成员）。在你需要拥有其所有权或修改 string 的值的时候可以使用 String 类型。

`&str`，可以理解为是一个 string 的切片视图，具有 immutable 的特性，也就是说你只拥有 string 字面值的查看权限。\&str 的 string 数据可以存储在任意地方，比如：

1. **In static storage**: a string literal "foo" is a &'static str. The data is hardcoded into the executable and loaded into memory when the program runs. e.g. `const FOO: &'static str = "foo"`
2. **Inside a heap allocated String**: [String dereferences to a \&str view](https://doc.rust-lang.org/std/string/struct.String.html#deref) of the String's data. 将 String 类型的变量以传参数的方式给含有 \&str 参数类型的函数，会发生类型转换。
3.  **On the stack**: e.g. the following creates a stack-allocated byte array, and then gets a [view of that data as a \&str](https://doc.rust-lang.org/std/str/fn.from\_utf8.html):

    ```rust
    use std::str;

    let x: &[u8] = &[b'a', b'b', b'c'];
    let stack_str: &str = str::from_utf8(x).unwrap();
    ```

> 当 struct 类型里含有 \&str 类型的成员时，需要声明生命周期，如：
>
> ```rust
> struct Foo<'a> {
>     baz: &'a str,
> }
> ```

以上内容参考了 stackoverflow 上的这个回答：https://stackoverflow.com/a/24159933。

另外相关资料有：[String vs str](https://google.github.io/comprehensive-rust/basic-syntax/string-slices.html) in 《Comprehensive Rust》。

***

可以简单理解 String 和 \&str 有以下的结构：

String 有一个 Buf，它是堆上分配的一块内存。这块内存的地址为 ptr，容量为 cap。len 描述当前 String 值的长度，可以理解为 \[ptr, ptr+OFFSET(len)] 这个区间的内容就是 String 的值。

```rust
type String {
   type Buf {
      ptr
      cap
   }
   len
}
```

\&str 的结构里就仅有 data\_ptr 和 len 这两个属性。单纯地查找 string 的字面值内容是什么而已。因为不知道内存的容量大小，这里也就不能改变内存里的字符串值了。

```rust
type &str {
   data_ptr
   len
}
```

## "Options", "Result", "unwrap" and "?"

在 Rust 中，所有的基本类型都是有具体的值，不存在空指针的情况。那么在 Rust 里有办法表述未知的情况吗？因为未知这个概念在计算机编程里是很普遍的，比如你要打开一个文件，然后写入字符信息，那么在打开文件这个结果就是一个未知的，因为将要打开的文件可能不存在，下面是一个打开文件的示例。

```rust
use std::fs::File;

fn main() {
    let file = File::open("foo.txt"); // 此时这个 file 就是一个未知的定义，这个文件可能不存在导致错误
}
```

为处理上述这种未知定义的情况，Rust 引入了两种类型  `Options` 及 `Result`。Options 一般表示变量的两面性：1. 不存在；2. 具体的值。它在 Rust 中的定义如下所示。

```rust
pub enum Option<T> {
    /// No value.
    None,

    /// Some value of type `T`.
    Some(#[stable(feature = "rust1", since = "1.0.0")] T),
}
```

Result 在 Rust 中一般作为函数的返回值。从下面它在 Rust 中的定义可以看出，Result 一般表示操作结果的两面性：1. 正确的结果；2. 操作异常。

```rust
pub enum Result<T, E> {
    /// Contains the success value
    Ok(#[stable(feature = "rust1", since = "1.0.0")] T),

    /// Contains the error value
    Err(#[stable(feature = "rust1", since = "1.0.0")] E),
}
```

不管是 `Option` 还是 `Reuslt`，想要从中取出“具体的值”或“正确的操作结果”，Rust 提供了一个函数 `unwrap` 来帮助开发者完成这一想法。

```rust
use std::fs::File;

fn main() {
    let file = File::open("foo.txt").unwrap(); // 此时的 file 变量就是一个确定的 File 结构体了
}
```

{% hint style="danger" %}
需要注意的是，如果 Option 真实为 None 或 Result 真实为 Err，则程序执行 unwrap 的时候 panic，使整个程序就此崩溃。所以建议开发者不要轻易使用 unwrap 函数。
{% endhint %}

除了 `unwrap` 函数，Rust 还提供了问号操作符（[The question mark operator](https://doc.rust-lang.org/reference/expressions/operator-expr.html#the-question-mark-operator)）来简化 Result 类型的展开。

> ```
> Syntax
> ErrorPropagationExpression :
>    Expression ?
> ```
>
> The question mark operator (?) unwraps valid values or returns erroneous values, propagating them to the calling function. It is a unary postfix operator that can only be applied to the types Result<T, E> and Option<T>.


正如 Rust 对 `?` 操作符解释的那样，对 Result 进行展开，若 `Result` 是 **Err** 则直接返回，否则将 `Result` 的正确结果赋值给变量。这样就有了一个隐含的约束：使用 `?` 操作符的函数的返回值必须是 `Result` 类型。

<pre class="language-rust"><code class="lang-rust">use std::fs::File;

fn main() -> std::io::Result&#x3C;()> {
<strong>    let f = File::open("foo.txt")?;
</strong>    Ok(())
}
</code></pre>

下面给出了 `?` 操作符的等价代码来解释：

<pre class="language-rust"><code class="lang-rust">use std::fs::File;

fn main() -> std::io::Result&#x3C;()> {
<strong>    let operation = File::open("foo.txt");
</strong><strong>    if operation.is_err() {
</strong><strong>        return Err(operation.unwrap_err());
</strong><strong>    }
</strong><strong>    let f = operation.unwrap();
</strong>    Ok(())
}
</code></pre>

## "trait"

## Generic

## "macro\_rules!"

## Asynchronous programming

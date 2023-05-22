# Defer, Panic and Recover

## Defer

`defer` 语句将函数调用推送到列表中。保存的调用列表在其所属的函数返回后执行，这也是 defer 字面的含义，即延迟执行。通常用于简化执行各种清理操作的函数。
defer 的语法是在后面追加一个函数调用。如下

```go
func xXX() {
  defer func (){
    // your code
  }()
}
```

defer 的行为是可以预测的，有以下几个简单的规则：

1. defer 语句是按顺序加载的，所以 defer 函数调用的参数也是在此时确定下来并一起加载进内存的。在下面的例子中将打印 “i = 0”。

```go
func xXX() {
  i := 0
  defer fmt.Println("i =", i) // 加载到这一行的时候，i 的值被确定为 0，并记录到内存中
  i++
}
```

注意 defer 函数的程序内部的变量将在其执行的时候被确定，下面的例子中将打印 “i = 1”。

```go
func xXX() {
  i := 0
  defer func() {
    fmt.Println("i =", i)
  }()
  i ++
}
```

2. defer 函数所推送的列表是类似 “栈” 的结构，满足 FILO（first in last out），先进后出的规则。在下面的例子中将依次打印 "3"，“2”，“1”。

```go
func xXX() {
  defer fmt.Println("1")
  defer fmt.Println("2")
  defer fmt.Println("3")
}
```

3. defer 函数可以读取并更改返回函数的命名返回值。在下面的例子中 xXX 函数将返回 “10”。

```go
func xXX() (r int) {
  r = 0
  defer func() {
    r = 10
  }()
  r++
  return r
}
```

## Panic and Recover

`panic` 是一个内置函数，可以停止正常的控制流并开始抛异常。当函数 F 调用 panic 时，F 的执行停止，F 中的所有 `defer` 函数都正常执行，然后 F 返回其调用方。该过程继续沿堆栈向上移动，直到当前 goroutine 中的所有函数都返回，此时程序崩溃。panic 的触发可以通过直接调用 panic，也可能是由运行时错误引起的，例如越界数组访问。

`recover` 是一个内置函数，可以重新控制一个 panic 的 goroutine。**recover 仅在 defer 函数中有用**。在正常执行期间，recover 调用将返回 nil 并且没有其他影响。如果当前 goroutine 处于 panic，则 recovery 函数将捕获 panic 的给定值并恢复正常执行。

以下是一个显式调用 panic 函数的例子，这个例子将打印 “r is hello panic.”，并且程序不会崩溃。
```go
func xXX() {
  defer func(){
    if r := recover(); r != nil {
      fmt.Println("r is", r)
    }
  }()
  panic("hello panic.")
}
```

以下是一个隐式 panic 的例子。这个例子将打印 “r is runtime error: index out of range [0] with length 0”，并且程序不会崩溃。
```go
func xXX() {
  defer func(){
    if r := recover(); r != nil {
      fmt.Println("r is", r)
    }
  }()

  var arr []int
  fmt.Println(arr[0])
}
```

以上就是 go 语言开发中所涉及的 `defer`，`panic` 和 `recover` 用法的全部内容了。

## Reference

1. [The Go Blog - Defer, Panic, and Recover](https://go.dev/blog/defer-panic-and-recover)

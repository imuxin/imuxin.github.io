# Assignment of GO


## Background

之所以写下本篇关于 Go 赋值一文，是因在工作的期间写了一个 bug。Bug 大致描述如下：

```go
func Xxx() {
	obj := &corev1.Service{}
    obj.Labels = map[string]string{}
    list []*corev1.Service{svc1, svc2} //
    for _, item := range list {
    	item.Labels = obj.Labels
        item.Labels["foo"] = valOf(item) // 假设 valOf(svc1) 返回 "bar1"， valOf(svc2) 返回  "bar2"
    }
}
```

上述代码片段 for 循环执行完，list 中两个 svc 的 Label["foo"] 的值相同，且等于 "bar2"。这其实是不符合预期的。原因是因为 map[string]string 类型是 copy-as-pointer 的。详细来说 for 循环的两次遍历中 item.Labels 的值相同且都指向了 heap 内存中同一块 map。所以第一次修改 heap 中的 map["foo"] 为 "bar1"，第二次修改为 "bar2"。最终两个 item.Labels 的内容相同且结果为最后一次修改的内容。


## TLDR;
Assignment of most types is copy-as-value like basic `integer`, `boolean` and `string`, even they are as attributes in `struct`. Some special types assignment is copy-as-pointer, such as`array`, `slice` and `map`.

<blockquote class="tip">
<p class="title">小提示（个人经验之谈，如有出错，敬请告知）</p>
当一个变量可以和 `nil` 做 boolean 比较时，则可以认为这个变量是 copy-as-pointer 的，否则是 copy-as-value。那怎么判断变量能否和 nil 做比较呢？有个比较简单的方法是写个条件判断，编译器不报错表示能和 nil 做比较。举例来说，现有个变量 `var m map[string]string`, 添加一行 nil 比较 `_ = (m == nil)`，结果发现编译器不报错，则认为变量 m 是 copy-as-pointer 类型。
</blockquote>

以下是一个验证示例程序，仅供参考。


```go
package main

func main() {
	// a := true
	// b := a
	// b = false
	//
	// Result: a = true, b = false

	// a := 1
	// b := a
	// b = 10
	//
	// Result: a= 1, b = 10

	// a := "hello"
	// b := a
	// b = "world"
	//
	// Result: a = "hello", b = "world"

	// a := map[string]string{}
	// b := a
	// b["name"] = "val"
	//
	// Result: a = b = {"name": "val"}

	// a := []int{1,2,3}
	// b := a
	// b[0] = 10
	//
	// Result: a = b = [10, 2, 3]

	// a := []int{1,2,3}
	// b := a[0:2]
	// b[0] = 10
	//
	// Result: a = [10, 2, 3], b = [10, 2]

	// a := []int{1,2,3}
	// b := append(a, 4)
	// a[0] = 10
	//
	// Result: a = [10, 2, 3], b = [1, 2, 3, 4]

	// a := []int{1,2,3}
	// b := append(a[0:2], 4)
	// a[0] = 10
	//
	// Result: a = b = [10, 2, 4]

	// a := []int{1,2,3}
	// b := append(a[0:2], 4, 5)
	// a[0] = 10
	//
	// Result: a = [10, 2, 3], b = [1, 2, 4, 5]

	// a := struct {
	// 	ID int
	// 	Map map[string]string
	// }{
	// 	ID: 1,
	// 	Map: map[string]string{"name": "val"},
	// }
	// b := a
	// b.ID = 10
	// b.Map["name"] = "b"
	//
	// Result: a = {ID: 1, Map: {"name": "b"}}
	// Result: b = {ID: 10, Map: {"name": "b"}}

	// t := struct {
	// 	ID int
	// 	Map map[string]string
	// }{
	// 	ID: 1,
	// 	Map: map[string]string{"name": "val"},
	// }
	// a := &t
	// b := a
	// b.ID = 10
	// b.Map["name"] = "b"
	//
	// Result: a = b = &{ID: 10, Map: {"name": "b"}}
}
```
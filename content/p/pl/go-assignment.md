# Assignment of GO

Assignment of most types is copy-as-value like basic `integer`, `boolean` and `string`, even they are as attributes in `struct`. Some special types assignment is copy-as-pointer, such as`array`, `slice` and `map`. The following program is a verification example. ⚠️ Be carefule, slice is dangerous.

```go
package main

func main() {
	// a := true
	// b := a
	// b = false
	// // a = true, b = false

	// a := 1
	// b := a
	// b = 10
	// // a= 1, b = 10

	// a := "hello"
	// b := a
	// b = "world"
	// // a = "hello", b = "world"

	// a := map[string]string{}
	// b := a
	// b["name"] = "val"
	// // a = b = {"name": "val"}

	// a := []int{1,2,3}
	// b := a
	// b[0] = 10
	// // a = b = [10, 2, 3]

	// a := []int{1,2,3}
	// b := a[0:2]
	// b[0] = 10
	// // a = [10, 2, 3], b = [10, 2]

	// a := []int{1,2,3}
	// b := append(a, 4)
	// a[0] = 10
	// // a = [10, 2, 3], b = [1, 2, 3, 4]

	// a := []int{1,2,3}
	// b := append(a[0:2], 4)
	// a[0] = 10
	// // a = b = [10, 2, 4]

	// a := []int{1,2,3}
	// b := append(a[0:2], 4, 5)
	// a[0] = 10
	// // a = [10, 2, 3], b = [1, 2, 4, 5]

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
	// // a = {ID: 1, Map: {"name": "b"}}
	// // b = {ID: 10, Map: {"name": "b"}}

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
	// // a = b = &{ID: 10, Map: {"name": "b"}}
}
```
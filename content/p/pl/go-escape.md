# Escape（内存逃逸）

## What is Escape

## 发生内存逃逸的几种情况

- 变量较大（栈空间不足）
- 变量大小不确定（如 slice 长度或容量不定）
- 返回地址
- 返回引用（引用变量的底层是指针）
- 返回值类型不确定（不能确定大小）
- 闭包
- 其他

## Verify

go build -gcflags "-m -m -l" /path/to/file.go

## Reference

https://github.com/golang/go/blob/master/src/cmd/compile/internal/escape/escape.go


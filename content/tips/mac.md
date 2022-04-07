# Tips for mac end user

1. App 在macOS Catalina下提示已损坏无法打开解决办法

open the terminal, and input `sudo xattr -d com.apple.quarantine /Applications/xxxx.app` (注意：`/Applications/xxxx.app` 换成你的App路径)
then restart your application.

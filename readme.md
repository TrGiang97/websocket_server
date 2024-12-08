Chạy với ngrok
- Run ngrok (run on ngrok.exe folder): ngrok http 8080
- Run node ws: npm run start
- Chỉnh student/teacher page kết nối ws tại ws://localhost:8080

Chạy trên ec2
- Chạy server websocket
+ cd websocket_server
+ npm run start

- Chạy server httpd để tải page student/teacher
+ systemctl start httpd

Chuyển code lên ec2 dùng git (git add,commit,push in 1 line)
- git cmp "messageabc"
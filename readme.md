Chạy với ngrok
- Run ngrok (run on ngrok.exe folder): ngrok http 8080
- Run node ws: npm run start
- Chỉnh student/teacher page kết nối ws tại ws://localhost:8080

Chạy trên ec2
- Chạy server websocket
+ cd websocket_server (sudo su - > cd / > cd var/www/html/websocket_server)
+ npm run start

Chạy server httpd để tải page student/teacher
+ systemctl start httpd

Chuyển code lên ec2 dùng git (git add,commit,push in 1 line)
- git cmp "messageabc"

Cách cập nhật file lên server:
- `git cmp` lên github
- vào server thư mục websocket. 1. `cd //` để ra ngoài, 2. `cd var/www/html/websocket_server`
- `git pull` để tải code
- dùng lệnh `fuser -k 8080/tcp` sẽ tự kill process và chạy lại server

Chỉnh tự động bật tắt: Vào lambda trigger event >> Event bridge schedule
Chỉnh tự động bật app khi khởi động server: Vào chatgpt tz.yafeeds => Tìm pm2 auto start app

Renew SSL:
- kill port 80: fuser -k 80/tcp
- sudo certbot certonly --standalone -d phatam.toeicsinhvien.com
- reboot instance
server {
        listen 80;
        listen [::]:80;
        server_name tataki-server.fun;
        location / {
                proxy_pass http://localhost:8001;
        }
}



sudo nano /etc/nginx/sites-available/tataki-server.fun
sudo ln -s /etc/nginx/sites-available/tataki-server.fun /etc/nginx/sites-enabled/

sudo certbot --nginx -d tataki-server.fun







server {
        listen 80;
        listen [::]:80;
        server_name tataki-test.fun;
        location / {
                proxy_pass http://localhost:5000;
        }
}



160.248.7.243
sudo nano /etc/nginx/sites-available/tataki-test.fun
sudo ln -s /etc/nginx/sites-available/tataki-test.fun /etc/nginx/sites-enabled/

sudo certbot --nginx -d tataki-test.fun
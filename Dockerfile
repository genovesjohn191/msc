# Builds a Docker to deliver dist/
FROM nginx:latest
COPY dist/ /usr/share/nginx/html
COPY bootstrap.sh /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html
CMD ["bash", "bootstrap.sh"]
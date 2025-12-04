FROM nginx:1.25-alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext && \
    rm -rf /var/cache/apk/*

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Create nginx user and adjust permissions
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Substitute environment variables and start nginx
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
#!/bin/bash

# Variable settings
DOMAIN="api.dutymate.net"
EMAIL="dutymate.net@gmail.com"

echo "=== Starting SSL Certificate Renewal ==="
echo "Checking certificate for ${DOMAIN}..."

# Check if certificate needs renewal (30 days before expiry)
CERT_FILE="certbot/conf/live/${DOMAIN}/cert.pem"

if [ -f "$CERT_FILE" ]; then
    # Get expiry date
    EXPIRY_DATE=$(docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" certbot/certbot certificates 2>/dev/null | grep -A 2 "${DOMAIN}" | grep "Expiry Date" | cut -d: -f2- | xargs)
    echo "Current certificate expiry: ${EXPIRY_DATE}"
    
    # Check if renewal is needed (within 30 days)
    EXPIRY_EPOCH=$(date -d "${EXPIRY_DATE}" +%s 2>/dev/null || echo "0")
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    echo "Days until expiry: ${DAYS_LEFT}"
    
    if [ $DAYS_LEFT -gt 30 ]; then
        echo "Certificate is still valid for ${DAYS_LEFT} days. No renewal needed."
        exit 0
    fi
    
    echo "Certificate expires in ${DAYS_LEFT} days. Proceeding with renewal..."
fi

# Renew certificate using certbot certonly with webroot
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --cert-name ${DOMAIN} \
    --force-renewal \
    --non-interactive \
    --agree-tos \
    --email ${EMAIL} \
    -d ${DOMAIN}

# Check renewal result
RENEW_EXIT_CODE=$?

if [ $RENEW_EXIT_CODE -eq 0 ]; then
    echo "Certificate renewal completed successfully"
    
    # Reload Nginx configuration
    echo "Reloading Nginx configuration..."
    docker compose exec nginx nginx -s reload
    
    if [ $? -eq 0 ]; then
        echo "Nginx reloaded successfully"
    else
        echo "Nginx reload failed, restarting nginx container..."
        docker compose restart nginx
    fi
    
    echo ""
    echo "=== Renewal Process Complete ==="
    echo "Next renewal check will run in 3 months"
else
    echo "Certificate renewal failed!"
    echo "Exit code: ${RENEW_EXIT_CODE}"
    echo ""
    echo "Please check:"
    echo "  - Certbot logs: docker compose logs certbot"
    echo "  - Domain accessibility: curl -I http://${DOMAIN}/.well-known/acme-challenge/"
    exit 1
fi

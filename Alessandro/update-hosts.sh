#!/bin/bash

DOMAIN="chart-example.com"

# Hole die External IP vom Ingress Controller
IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Fallback: nutze 127.0.0.1, falls Tunnel läuft und nur Hostname vergeben ist
if [ -z "$IP" ]; then
  IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx \
    -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
fi

if [ -z "$IP" ]; then
  echo "[ERROR] Konnte keine External IP vom Ingress finden. Läuft 'minikube tunnel'?"
  exit 1
fi

echo "[INFO] Gefundene IP: $IP"

# Entferne alte Einträge
sudo sed -i.bak "/$DOMAIN/d" /etc/hosts

# Füge neuen Eintrag hinzu
echo "$IP $DOMAIN" | sudo tee -a /etc/hosts > /dev/null

echo "[INFO] /etc/hosts wurde aktualisiert: $DOMAIN → $IP"
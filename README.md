# 🍕 W3M20035.1 Cloud Infrastructures  
**Use Case:** Skalierbares Pizza-Backen in der Cloud

Entwickelt wurde eine Web-Applikation mit Frontend und Backend. Ergänzend dazu gibt es Pizzaöfen als separate Pods, die in der Infrastruktur dynamisch hoch- und herunterskaliert werden.

Im Frontend können Pizzen in eine Warteschlange gelegt werden. Jeder Ofen kann gleichzeitig bis zu 3 Pizzen backen. Eine Pizza wird 90 Sekunden gebacken. Alle 5 Sekunden wird die Warteschlange überprüft und weiter abgearbeitet. Abhängig von der Länge der Warteschlange werden automatisch neue Öfen gestartet oder wieder entfernt.

---

## 📑 Inhaltsverzeichnis
- [⚙️ Technologien](#️-technologien)
- [🚀 Getting Started](#-getting-started)
- [🐳 Docker Build](#-docker-build)
- [⎈ Helm Commands](#-helm-commands)
- [📊 Monitoring Setup](#-monitoring-setup)
- [🌐 Zugriff auf die Anwendung](#-zugriff-auf-die-anwendung)
- [🏗 Projekt Deployment (Cloud)](#-projekt-deployment-cloud)
- [🛠 Troubleshooting](#-troubleshooting)
---

## ⚙️ Technologien  
- **UI:** Next.js / React  
- **Backend:** TypeScript / Node.js  
- **Ofen:** C#  
- **Orchestrierung:** Minikube / Kubernetes / Helm  
- **Monitoring:** Prometheus & Grafana  
- **Provisionierung:** Ansible  
- **Deployment:** Helm  

---

## 🚀 Getting Started  

### Voraussetzungen  
- [Minikube installieren](https://minikube.sigs.k8s.io/docs/start/)  
- [kubectl installieren](https://kubernetes.io/docs/tasks/tools/)  

### Minikube starten  
```bash
minikube start
minikube addons enable ingress
kubectl get pods -A        # Überprüfung ob alles läuft
kubectl get svc -n ingress-nginx
```

Nach einer Startphase erreichbar unter:  
- 🍕 **Applikation:** [chart-example.com](http://chart-example.com)  
- 📈 **Prometheus:** [chart-monitoring.com](http://chart-monitoring.com)  
- 📊 **Grafana:** [chart-grafana.com](http://chart-grafana.com)  

---

## 🐳 Docker Build  

### Build im Minikube-Context aktivieren  
**macOS / Linux:**  
```bash
eval $(minikube docker-env)
```

**Windows:**  
```cmd
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i
```
oder  
```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### Docker Images bauen  
```bash
# Frontend
docker build -f containers/frontend/Dockerfile --tag frontend:latest \
  --build-arg NEXT_PUBLIC_WS_URL=ws://chart-example.com/ws .

# Backend
docker build -f containers/backend/Dockerfile --tag backend:latest .

# Ofen
docker build -f containers/furnace/Dockerfile --tag oven:latest .
```

---

## ⎈ Helm Commands  

```bash
# Dependencies
helm dependency build deployment/charts/application/
helm dependency build <path-to-charts>

# Installation
helm install test deployment/charts/application/
helm install <releasename> <path-to-charts>

# Updates
helm dependency update deployment/charts/application/
helm upgrade test deployment/charts/application/

# Deinstallation
helm uninstall test
helm uninstall <releasename>
```

**Debugging & Logs**  
```bash
kubectl get pods            # Laufende Pods
kubectl logs <podname>      # Logs anzeigen
kubectl port-forward svc/test-frontend 3000:3000   # Falls Ingress nicht greift
```
---
## 📊 Monitoring Setup  
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm upgrade prometheus prometheus-community/prometheus -f deployment/charts/apllication/values.yaml
helm dependency build deployment/charts/application/
helm install test deployment/charts/application/
kubectl get secret -n default grafana -o jsonpath="{.data.admin-password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

Open Grafana: [chart-grafana.com](http://chart-grafana.com)
Username: admin
Passwort return from <kubectl get secret -n default grafana -o jsonpath="{.data.admin-password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }>

Add Data Source:
Connections -> Data Source -> Add new Data Source -> Prometheus
Prometheus server URL: http://test-prometheus-server
Save & test

Add Dashboards:
New -> Import
Custom Dashboard
containers/monitoring/Grafana_Dashboard_Pizza_Details.json

From Web
[https://github.com/dotdc/grafana-dashboards-kubernetes/tree/master/dashboards](https://github.com/dotdc/grafana-dashboards-kubernetes/blob/master/dashboards/k8s-views-nodes.json)
[https://github.com/dotdc/grafana-dashboards-kubernetes/tree/master/dashboards](https://github.com/dotdc/grafana-dashboards-kubernetes/blob/master/dashboards/k8s-views-pods.json)
```
---
## 🌐 Zugriff auf die Anwendung  
### Hosts-Datei anpassen  
**Windows:**  
`%windir%\system32\drivers\etc\hosts`  
**Linux/macOS:**  
`/etc/hosts`  
Beispiel:  
```
192.168.49.2 chart-example.com
127.0.0.1    chart-example.com
```
---
## 🏗 Projekt Deployment (Cloud)  
```bash
cd deployment
terraform apply
```
**Ansible Playbooks:**  
```bash
ansible-playbook -i openstack-inventory.txt ansible/installdocker.yaml -key-file "<path_to_key>"
ansible-playbook -i openstack-inventory.txt ansible/minikubehelm.yaml -key-file "<path_to_key>"
ansible-playbook -i openstack-inventory.txt ansible/clonaandbuildimage.yaml -key-file "<path_to_key>"
ansible-playbook -i openstack-inventory.txt ansible/buildandinstallhelm.yaml -key-file "<path_to_key>"
```
**Hosts anpassen:**  
```
127.0.0.1 chart-example.com
127.0.0.1 chart-monitoring.com
127.0.0.1 chart-grafana.com
```
**SSH Tunnel:**  
```bash
ssh ubuntu@<ip> -i ~/.ssh/cloudnative -L 443:192.168.49.2:443
ssh ubuntu@<ip> -i ~/.ssh/cloudnative -L 80:192.168.49.2:80
```
---
## 🛠 Troubleshooting  
### ❓ Problem: `ImagePullBackOff` in `kubectl get pods`  
✅ Lösung:  
1. Docker Images lokal bauen (siehe oben).  
2. Mit Minikube laden:  
   ```bash
   minikube image load <image-name>:<tag>
   ```  
3. Überprüfen:  
   ```bash
   kubectl get pods
   ```
---
### ❓ Problem: Pods laufen, Code-Änderung wird aber nicht übernommen  
✅ Lösung:  
1. Neues Docker-Image bauen.  
2. Altes Image in Minikube löschen:  
   ```bash
   minikube ssh
   docker rmi <image-name>
   exit
   ```
3. Neues Image laden:  
   ```bash
   minikube image load <image-name>:<tag>
   ```
4. Helm Release neu installieren:  
   ```bash
   helm uninstall <releasename>
   helm install <releasename> <path-to-charts>
   ```
---
### ❓ Problem: Ingress erreichbar, aber kein Zugriff von Host  
- Minikube-Tunnel starten:  
  ```bash
  minikube tunnel
  ```
  Danach ist sind die Pods unter **127.0.0.1** erreichbar. Die Hosts-Datei muss wie folgt angepasst werden:

```
    127.0.0.1 chart-example.com
    127.0.0.1 chart-monitoring.com
    127.0.0.1 chart-grafana.com
```

---
### ❓ Problem: Kubernetes erkennt `:latest` nicht  
✅ Lösung:  
```bash
kubectl rollout restart deployment test-frontend
```

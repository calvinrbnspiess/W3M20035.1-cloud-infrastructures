# Monitoring:  
# Prometheus  
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts -n -monitoring  
helm install prometheus prometheus-community/prometheus  
# Grafana  
helm repo add grafana https://grafana.github.io/helm-charts  
helm install grafana grafana/grafana -n default  
kubectl get secret -n default grafana ` -o jsonpath="{.data.admin-password}" | ` ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }  
$POD_NAME = kubectl get pods -n default -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=grafana" -o jsonpath="{.items[0].metadata.name}"  

# Vorbereitung:  
helm dependency build deployment/charts/application/ ##necessary ???  

# Start Application:  
kubectl port-forward svc/prometheus-server 8888:80  
kubectl port-forward $POD_NAME 9999:3000  

# Browser:  
http://localhost:9999  
Login into Grafana  
Connections->Data Sources->Prometheus  
Connection: http://prometheus-server:80  
Save & Test  

# Prometheus adapter:  
helm install prometheus-adapter-pizza prometheus-community/prometheus-adapter --namespace default --set prometheus.url=http://prometheus-server.default.svc.cluster.local --set prometheus.port=80  

helm upgrade --install prometheus-adapter-pizza prometheus-community/prometheus-adapter -f containers/scaling/rules.yaml  
kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1  
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1" | ConvertFrom-Json | ConvertTo-Json -Depth 100  

=> Query kann im Prometheus nicht eingetragen werde, da Backend/Exporter die Metrik noch gar nicht nach Prometheus schreibt  
Zu klären am Mittwoch  
  


___OLD VERSION________________________________________________________________________________________________________________________________________________________________
Monitoring:  
#Prometheus  
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts  
helm repo update  
helm install prometheus prometheus-community/prometheus  
kubectl port-forward svc/prometheus-server 8888:80  

#Prometheus adapter  
helm install prometheus-adapter-pizza oci://ghcr.io/prometheus-community/charts/prometheus-adapter  

#Grafana  
helm repo add grafana https://grafana.github.io/helm-charts  
helm repo update  
helm install grafana --set adminPassword=admin grafana/grafana  
kubectl create namespace monitoring  
kubectl get secret --namespace monitoring my-grafana  
#get Password => <GrafanaPW>  
-o jsonpath="{.data.admin-password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }  
	=> Windows  
$POD_NAME = kubectl get pods --namespace monitoring -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=my-grafana" -o jsonpath="{.items[0].metadata.name}"  
kubectl --namespace monitoring port-forward $POD_NAME 9999:3000  
localhost:9999 -> Grafana Login Username: admin | PW: <GrafanaPW>  

Im Browser (Grafana)  
#add Prometheus as Datasource  
Connections->Data Sources->Prometheus  

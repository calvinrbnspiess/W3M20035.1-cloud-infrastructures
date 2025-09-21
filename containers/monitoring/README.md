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

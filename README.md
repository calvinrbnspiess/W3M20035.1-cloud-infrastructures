# W3M20035.1-cloud-infrastructures
 Use Case: Skalierbares Pizza backen mit UI für Metriken
 Beispiel: Knopf für Pizzaorder wird gedrückt -> Pizzaofen erscheint im UI und backt Pizza 
(max. Kapazität x Pizzen und Dauer von den Pizzen y min zu Demonstrationszwecken)
 
Technologie: 
- UI (Next.js/React)
- Backend (Typescript/Node.js)
- Oven/Furnace (C#)
- Minikube/K8s etc.
- Prometheus (Dashboard)
- Ansible (Provisioning und Setup)
- Grafana (Dashboard für Metriken)
- Helm (Kubernetes Deployment)
- Jaeger (Tracing)

# Getting started
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

minikube start  
kubectl get pods -A (to verify that everything is running)  

##
installieren unser helm charts:  

helm dependency build deployment/charts/application/   
helm dependency build <path-to-charts>  

helm install test deployment/charts/application/  
helm install <releasename> <path-to-charts>  

updaten:  
helm dependency update deployment/charts/application/  
helm upgrade test deployment/charts/application/  

uninstallieren:  
helm uninstall test  
helm uninstall <releasename>  


logs:
kubectl get pods (um laufende pods zu bekoomen)
kubectl logs <podname> (logs des Pods (container))

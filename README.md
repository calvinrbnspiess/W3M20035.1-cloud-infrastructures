# W3M20035.1-cloud-infrastructures
 Use Case: Skalierbares Pizza backen mit kleiner UI für Metriken
 Beispiel: Knopf für Pizzaorder wird gedrückt -> Pizzaofen erscheint im UI und backt Pizza 
(max. Kapazität 2 Pizzen und Dauer von den Pizzen ca. 1min zu Demonstrationszwecken)
 
 
Technologie: 
- UI (Pizzaofen Infos)
- Minikube/K8s/K3s etc.
- Prometheus (Dashboard)
- Ansible (Provisioning und Setup)
- Grafana (Dashboard für Metriken)
- Helm (Kubernetes Deployment)
- Jaeger (Tracing)


## Getting started
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

minikube start  
kubectl get po -A (to verify that everything is running)

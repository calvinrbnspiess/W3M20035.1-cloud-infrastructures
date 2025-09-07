# W3M20035.1-cloud-infrastructures
 Use Case: Skalierbares Pizza backen mit UI für Metriken
 Beispiel: Knopf für Pizzaorder wird gedrückt -> Pizzaofen erscheint im UI und backt Pizza 
(max. Kapazität x Pizzen und Dauer von den Pizzen y min zu Demonstrationszwecken)
 
Technologie: 
- UI (Next.js/React)
- Backend (Typescript/Node.js)
- Oven (C#)
- Minikube/K8s etc.
- Prometheus (Dashboard)
- Ansible (Provisioning und Setup)
- Grafana (Dashboard für Metriken)
- Helm (Kubernetes Deployment)
- Jaeger (Tracing)

# Getting started
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

`minikube start`  
`kubectl get pods -A` (to verify that everything is running)  

## Docker commands
Frontend: `docker build -f containers/frontend/Dockerfile --tag frontend:latest .`  
Backend: `docker build -f containers/backend/Dockerfile --tag backend:latest .`  
Oven: `docker build -f containers/furnace/Dockerfile --tag oven:latest .`

## Helm commands

`helm dependency build deployment/charts/application/`  
`helm dependency build <path-to-charts>`  

`helm install test deployment/charts/application/`  
`helm install <releasename> <path-to-charts>`
 
`helm dependency update deployment/charts/application/`  
`helm upgrade test deployment/charts/application/`  

`helm uninstall test`  
`helm uninstall <releasename>`  

`kubectl get pods` (um laufende Pods zu bekommen)  
`kubectl logs <podname>` (Logs des Pods/Container))  

To access the frontend:  
`kubectl port-forward svc/test-frontend 3000:3000`  

## Troubleshooting:

Q: I have a ImagePullBackOff error when reading  `kubectl get pods`  
A:  
- Build all docker images that can not be found (`docker build -t <name-of-image-as-in-helm-values.yaml>:<tag-as-in-helm-values.yaml>` in the correct folder) -> see Docker commands
- `minikube image load <name-of-built-image>:<tag-of-built-image>` for each image
- Verify that the error is gone with `kubectl get pods`

Q: How do I update my pods to the latest code change? TODO: test again and if working remove this todo
A:  
- Build the docker image
- Remove the old docker image from minikube (`minikube ssh` - `docker rmi <image-name>` - `exit`)
- `minikube image load <name-of-built-image>:<tag-of-built-image>` for the updated image
- `helm uninstall <releasename>`
- `helm install <releasename> <path-to-charts>`
- Verify that the error is gone with `kubectl get pods` and `kubectl logs <podname>`

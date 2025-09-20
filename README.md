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
`minikube addons enable ingress`  
`kubectl get pods -A` (to verify that everything is running)  
`kubectl get svc -n ingress-nginx`  

# Build in minikube context:

macOS / linux: ```eval $(minikube docker-env)```  
windows: ```@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i``` or ``` minikube -p minikube docker-env --shell powershell | Invoke-Expression``` 

## Docker commands
Frontend: `docker build -f containers/frontend/Dockerfile --tag frontend:latest --build-arg NEXT_PUBLIC_WS_URL=ws://chart-example.local/ws .`  
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

To access the frontend (not needed if ingress is working correctly):  
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

Q: I can't access pods from hosts although ingress is running.
A:  
The command `kubectl get svc -n ingress-nginx` should show LoadBalancer for ingress and an external ip.
```
NAME                                 TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.102.26.215    127.0.0.1     80:30225/TCP,443:30293/TCP   4h31m
ingress-nginx-controller-admission   ClusterIP      10.100.180.199   <none>        443/TCP                      4h31m
```

Otherwise run: `kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec": {"type": "LoadBalancer"}}'` (linux/macos)  
on windows: `kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{\"spec\": {\"type\": \"LoadBalancer\"}}'`  

Please run `update-hosts.sh` (macos/linux) to update your hosts file based on the ingress ip.

Now, you need to run `minikube tunnel` to reach the application on 'chart-example.local'.

Q: Restart after updating the image
A:  
Restart Pods if needed

Sometimes Kubernetes won’t notice :latest changed (because the tag is the same). To force reload:

```kubectl rollout restart deployment test-frontend```

This deletes old pods and pulls your updated frontend:latest.

# Application erreichen:
Anpassen der etc/host datei:  
Ort Windows: ```%windir%\system32\drivers\etc```  
Hinzufügen des eintrages chart-example.local zur  minikube ip:  192.168.49.2 chart-example.local  

Anpassen der eigenen etc/hostdatei mit ```chart-example.local 127.0.0.0```  
Aufmachen eines SSH Tunnels für chart-example.local zur vm z.B mit VSCode SSH extension  

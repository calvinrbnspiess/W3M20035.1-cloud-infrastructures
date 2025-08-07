### An oven gets the following upon creation:  
- A Guid
- A capacity of 3


### Endpoints

/status  
Returns the oven ID, capacity, current load and the pizza status for every pizza.

/add  
Adds a new pizza to the oven.  
Takes an optional description of the pizza.


### Test running container
The docker run command from below redirects the exposed port 8080 to 8080 on your local machine.

curl http://localhost:8080/pizzaoven/status  
Swagger: http://localhost:8080/swagger/index.html


### Docker instructions

docker build -t pizza .  
docker run -d -p 8080:8080 --name pizzaofen pizza

docker stop pizzaofen  
docker rm pizzaofen
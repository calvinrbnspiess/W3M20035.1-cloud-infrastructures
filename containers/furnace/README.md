HTTP Port: 5097  
HTTPS Port: 7023

### An oven gets the following upon creation:  
- A Guid
- A capacity of 2

### Endpoints:

/status  
Returns the oven ID, capacity, current load and the pizza status for every pizza.

/add  
Adds a new pizza to the oven.  
Takes an optional description of the pizza.


### Docker instructions

docker build -t pizza .  
docker run -d -p 8080:80 --name pizzaofen pizza

docker stop pizzaofen  
docker rm pizzaofen

Test running container:  
curl http://localhost:8080/pizzaoven/status  
Swagger: http://localhost:8080/swagger/index.html

Internal ﻿HTTP Port: 5097  
Internal HTTPS Port: 7023

### An oven gets the following upon creation:  
- A Guid
- A capacity of 2

### Endpoints:
Swagger documentation: https://localhost:7023/swagger/index.html

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
The docker run command from above redirects the exposed port 80 to 8080 on your local machine.  

curl http://localhost:8080/pizzaoven/status  
Swagger: http://localhost:8080/swagger/index.html

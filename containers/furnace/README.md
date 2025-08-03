HTTP Port: 5097  
HTTPS Port: 7023

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

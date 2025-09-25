using furnace;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<PizzaOvenService>();

builder.Services.AddHealthChecks()
    .AddCheck<PizzaOvenHealthCheck>("pizza_oven");;

var app = builder.Build();

if (app.Environment.IsProduction())
{
    app.Urls.Add("http://0.0.0.0:8080");
}


app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Name == "pizza_oven"
});

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.Run();
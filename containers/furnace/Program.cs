using furnace;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<PizzaOvenService>();

var app = builder.Build();

if (app.Environment.IsProduction())
{
    app.Urls.Add("http://0.0.0.0:8080");
}

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.Run();
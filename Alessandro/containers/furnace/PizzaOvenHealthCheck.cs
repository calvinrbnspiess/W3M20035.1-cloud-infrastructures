namespace furnace;

using Microsoft.Extensions.Diagnostics.HealthChecks;

public class PizzaOvenHealthCheck(PizzaOvenService oven) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (oven.GetLoad() >= oven.Capacity)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Oven is full!"));
        }

        return Task.FromResult(HealthCheckResult.Healthy("Oven is ready to bake pizzas!"));
    }
}
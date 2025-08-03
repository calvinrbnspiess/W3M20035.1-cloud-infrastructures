using Microsoft.AspNetCore.Mvc;

namespace furnace;

[ApiController]
[Route("[controller]")]
public class PizzaOvenController(PizzaOvenService oven) : ControllerBase
{
    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var status = new
        {
            OvenId = oven.Id,
            oven.Capacity,
            CurrentLoad = oven.GetLoad(),
            Pizzas = oven.BakingPizzas.Select(p => new PizzaStatus(p.Key, p.Value)).ToList()
        };
        return Ok(status);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddPizza([FromBody] PizzaRequest request)
    {
        var pizza = new PizzaEntity(Guid.NewGuid(), request.Description ?? "No description");

        var success = await oven.TryAddPizzaAsync(pizza);
        if (!success)
        {
            return Conflict("Oven is full!");
        }

        return Accepted(new { PizzaId = pizza.Id, Message = "Pizza in the oven for 90 sec!" });
    }
}

public record PizzaRequest(string? Description = null);
public record PizzaStatus(PizzaEntity Pizza, int SecondsLeft);
using System.Collections.Concurrent;

namespace furnace;

public class PizzaOvenService
{
    private readonly SemaphoreSlim _semaphore;
    public Guid Id;
    public readonly int Capacity;
    
    private readonly ConcurrentDictionary<PizzaEntity, int> _bakingPizzas = new();
    public IReadOnlyDictionary<PizzaEntity, int> BakingPizzas => _bakingPizzas;
    
    public PizzaOvenService()
    {
        Capacity = 2;
        _semaphore = new SemaphoreSlim(2, 2);
        Id = Guid.NewGuid();
    }
    
    public int GetLoad() => _bakingPizzas.Count;
    
    public async Task<bool> TryAddPizzaAsync(PizzaEntity pizza)
    {
        if (!await _semaphore.WaitAsync(0))
        {
            return false;
        }

        _bakingPizzas[pizza] = 90;
        _ = BakePizzaAsync(pizza);
        return true;
    }

    private async Task BakePizzaAsync(PizzaEntity pizza)
    {
        for (var i = 90; i >= 0; i--)
        {
            _bakingPizzas[pizza] = i;
            await Task.Delay(1000);
        }

        _bakingPizzas.TryRemove(pizza, out _);
        _semaphore.Release();
    }
}
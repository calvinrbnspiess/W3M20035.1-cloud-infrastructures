using System.Collections.Concurrent;

namespace furnace;

public class PizzaOvenService
{
    private readonly SemaphoreSlim _semaphore;
    public Guid Id;
    public readonly int Capacity;
    public string State;

    private readonly ConcurrentDictionary<PizzaEntity, (int Progress, CancellationTokenSource Cts)> _bakingPizzas =
        new();

    public IReadOnlyDictionary<PizzaEntity, (int Progress, CancellationTokenSource Cts)> BakingPizzas => _bakingPizzas;

    public PizzaOvenService()
    {
        State = "Running";
        Capacity = 3;
        _semaphore = new SemaphoreSlim(3, 3);
        Id = Guid.NewGuid();
    }

    public int GetLoad() => _bakingPizzas.Count;

    public async Task<bool> TryAddPizzaAsync(PizzaEntity pizza)
    {
        if (!await _semaphore.WaitAsync(0))
        {
            return false;
        }

        var cts = new CancellationTokenSource();
        _bakingPizzas[pizza] = (90, cts);
        _ = BakePizzaAsync(pizza, cts.Token);
        return true;
    }

    public Task<bool> TryRemovePizza(Guid id)
    {
        var pizza = _bakingPizzas.Keys.FirstOrDefault(p => p.Id == id);
        if (pizza == null)
        {
            return Task.FromResult(false);
        }

        if (_bakingPizzas.TryRemove(pizza, out var entry))
        {
            entry.Cts.Cancel(); // Laufenden Prozess abbrechen
            entry.Cts.Dispose();
            _semaphore.Release();
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    private async Task BakePizzaAsync(PizzaEntity pizza, CancellationToken token)
    {
        try
        {
            for (var i = 90; i >= 0; i--)
            {
                if (token.IsCancellationRequested)
                {
                    break;
                }

                _bakingPizzas[pizza] = (i, _bakingPizzas[pizza].Cts);
                await Task.Delay(1000, token);
            }
        }
        catch (TaskCanceledException)
        {
            //ignored as its requested
        }
        finally
        {
            _bakingPizzas.TryRemove(pizza, out _);
            _semaphore.Release();
        }
    }

    public void SetShutdownState()
    {
        Console.WriteLine($"State set to Shutdown for oven: {Id}");
        State = "Shutdown";
    }
}
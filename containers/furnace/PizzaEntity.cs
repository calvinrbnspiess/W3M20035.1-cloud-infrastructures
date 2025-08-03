namespace furnace;

public class PizzaEntity(Guid id, string description)
{
    public Guid Id { get; } = id;
    public string Description { get; set; } = description;
}
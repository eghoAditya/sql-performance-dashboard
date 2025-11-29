namespace SqlPerformanceDashboard.Api.Models;

public class SqlQueryLog
{
    public int Id { get; set; }

    public string QueryText { get; set; } = string.Empty;

    public long DurationMs { get; set; }  // execution time in milliseconds

    public int RowsReturned { get; set; }

    public bool IsSuccessful { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime ExecutedAtUtc { get; set; } = DateTime.UtcNow;
}

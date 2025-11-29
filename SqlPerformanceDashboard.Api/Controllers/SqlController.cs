using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using SqlPerformanceDashboard.Api.Data;
using SqlPerformanceDashboard.Api.Models;
using System.Diagnostics;

namespace SqlPerformanceDashboard.Api.Controllers;

[ApiController]
[Route("api/sql")]
public class SqlController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public SqlController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost("execute")]
    public async Task<IActionResult> ExecuteSql([FromBody] SqlExecuteRequest request)
    {
        var stopwatch = new Stopwatch();
        stopwatch.Start();

        int rowsReturned = 0;
        bool isSuccessful = true;
        string? error = null;

        try
        {
            using var connection = new SqliteConnection("Data Source=sqlperformance.db");
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = request.Query;

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                rowsReturned++;
            }
        }
        catch (Exception ex)
        {
            isSuccessful = false;
            error = ex.Message;
        }

        stopwatch.Stop();

        // Log the event
        var log = new SqlQueryLog
        {
            QueryText = request.Query,
            DurationMs = stopwatch.ElapsedMilliseconds,
            RowsReturned = rowsReturned,
            IsSuccessful = isSuccessful,
            ErrorMessage = error,
            ExecutedAtUtc = DateTime.UtcNow
        };

        _dbContext.SqlQueryLogs.Add(log);
        await _dbContext.SaveChangesAsync();

        return Ok(new
        {
            log.Id,
            log.DurationMs,
            log.RowsReturned,
            log.IsSuccessful,
            log.ErrorMessage,
            log.ExecutedAtUtc
        });
    }

        [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int take = 50)
    {
        if (take <= 0 || take > 500)
        {
            take = 50;
        }

        var logs = await _dbContext.SqlQueryLogs
            .OrderByDescending(x => x.ExecutedAtUtc)
            .Take(take)
            .Select(x => new
            {
                x.Id,
                x.QueryText,
                x.DurationMs,
                x.RowsReturned,
                x.IsSuccessful,
                x.ErrorMessage,
                x.ExecutedAtUtc
            })
            .ToListAsync();

        return Ok(logs);
    }

}

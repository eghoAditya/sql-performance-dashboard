using Microsoft.EntityFrameworkCore;
using SqlPerformanceDashboard.Api.Models;

namespace SqlPerformanceDashboard.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<SqlQueryLog> SqlQueryLogs => Set<SqlQueryLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<SqlQueryLog>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.QueryText).IsRequired();
            entity.Property(x => x.DurationMs).IsRequired();
            entity.Property(x => x.ExecutedAtUtc).IsRequired();
        });
    }
}

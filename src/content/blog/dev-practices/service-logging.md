---
title: "Service Logging Best Practices: A Complete Guide to Production-Ready Logging"
description: "A practical guide to structured logging, correlation IDs, centralized pipelines, and safe operational logging in production systems."
pubDate: "2025-08-08"
tags: ["Logging", "Observability", "DevOps", "Best Practices"]
author: "Jongmin Lee"
heroImage: "/Service-Logging/service-logging-hero.png"
draft: false
---

# Service Logging Best Practices: A Complete Guide to Production-Ready Logging

## Why Logging Strategy Matters

Logging is the backbone of observability. When a production issue hits, logs are often the fastest path to root cause. Without a strategy, logs become noise and slow teams down. With a strategy, logs become a reliable source of truth.

Good logging reduces time-to-resolution, improves confidence during deployments, and creates a useful audit trail. The goal is not to log everything, but to log what is actionable.

## Log Levels That Actually Help

Log levels are a filter, not a hierarchy. The most useful systems keep them consistent and meaningful:

- **ERROR**: the request failed and human action is likely required.
- **WARN**: unexpected behavior that may become an error later.
- **INFO**: business events you want to track and measure.
- **DEBUG**: technical details for diagnostics, usually sampled.

If these meanings drift, alerts become noisy and dashboards lose value.

## Structured Logging (The Biggest Upgrade)

Plain text logs are easy to read but hard to query. Structured logs are both.

Unstructured:
```
"User john@example.com ordered 3 items totaling $99.99"
```

Structured:
```json
{
  "message": "Order completed",
  "userId": "john@example.com",
  "itemCount": 3,
  "total": 99.99,
  "timestamp": "2024-12-20T10:30:15Z"
}
```

Once logs are structured, you can search, filter, and aggregate reliably.

## What To Log (And Why)

A useful log stream captures key business events and system boundaries. For most services, focus on these categories:

### Business Events
Log events that explain business outcomes: signups, payments, cancellations, and key state transitions. These are the events product, support, and engineering care about the most.

### System Boundaries
External API calls, database operations, background jobs, and cache misses are common sources of failure. Logging them with timing data makes latency and failure patterns visible.

### Performance Signals
Capture response times for endpoints and critical tasks. Instead of logging every internal step, log the top-level timing with identifiers that let you trace deeper when needed.

## Context Fields Every Log Should Carry

A log entry without context is often unusable. Minimum recommended fields:

- **timestamp** (ISO-8601)
- **level**
- **service** and **version**
- **correlationId** or **requestId**
- **userId** when available
- **operation** or **event name**

This is enough to answer "what happened, to whom, in which service, and when".

## Simple Implementation Example (.NET + Serilog)

### Logger Setup

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Service", "OrderService")
    .WriteTo.Console()
    .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();
```

### Structured Usage

```csharp
_logger.LogInformation("Order processed", new
{
    CorrelationId = correlationId,
    OrderId = result.Id,
    Total = result.Total
});
```

## Correlation IDs (Essential for Tracing)

A correlation ID ties all logs for a request together. Generate it at the edge and propagate it across services.

```csharp
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers["X-Correlation-ID"]
            .FirstOrDefault() ?? Guid.NewGuid().ToString();

        context.Response.Headers.Add("X-Correlation-ID", correlationId);

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
```

## Centralized Logging

When you have multiple services, centralized logging is non-negotiable. It lets you search across services, build dashboards, and set alerts in one place.

Common choices:

- **ELK** for flexibility and custom pipelines.
- **Cloud-native** tools (CloudWatch, Azure App Insights, GCP Logging) for simpler setup.
- **Loki or Vector** for cost-effective logging pipelines.

Pick a stack your team can operate. The best tool is the one you can keep healthy.

## Security and Sensitive Data

Never log secrets. This includes passwords, tokens, credit cards, and personal identifiers. If you must log user data, mask it.

```csharp
private string MaskEmail(string email)
{
    if (string.IsNullOrEmpty(email)) return email;
    var parts = email.Split('@');
    return parts.Length == 2 ? $"{parts[0].Substring(0, 3)}***@{parts[1]}" : email;
}
```

When in doubt, remove the field entirely.

## Monitoring and Alerting

Logs become powerful when paired with alerts and dashboards. Avoid alerting on individual errors and focus on trends.

Good alerts:

- Error rate above a threshold for several minutes
- Latency spikes at p95 or p99
- A sudden increase in retries or timeouts

This turns logs into early warnings rather than noise.

## Common Pitfalls

- Logging every method entry or exit
- Inconsistent log formats between services
- Missing correlation IDs
- Mixing user-facing and internal errors
- Logging sensitive data by accident

If you fix only one thing, standardize your log format and add correlation IDs.

## Implementation Roadmap

Start small and build up:

1. **Standardize log levels and format**
2. **Add correlation IDs**
3. **Centralize logs**
4. **Create core dashboards**
5. **Add alerting and sampling**

## Key Takeaways

Good logging is not about volume. It is about clarity, consistency, and the ability to answer "what happened" quickly.

- Make logs structured and consistent
- Add correlation IDs everywhere
- Centralize and monitor
- Protect sensitive data

Your future self will thank you during the next production incident.

## Resources

- [Microsoft Logging in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging)
- [Serilog Documentation](https://serilog.net/)
- [OpenTelemetry Logs](https://opentelemetry.io/docs/logs/)

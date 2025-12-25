# Performance Monitoring

## Overview

The Performance Monitor service provides utilities to track and measure execution time of operations throughout the application. This helps identify bottlenecks and validate performance improvements.

## Usage

### Basic Usage

```typescript
import { PerformanceMonitor } from '@/shared/performance';

@Injectable()
export class MyService {
  constructor(private readonly perfMonitor: PerformanceMonitor) {}

  async myMethod() {
    const timer = this.perfMonitor.startTimer('myMethod');
    try {
      // Your code here
      const result = await someOperation();
      return result;
    } finally {
      timer.end();
    }
  }
}
```

### Getting Metrics

```typescript
// Get metrics for a specific operation
const metrics = this.perfMonitor.getMetrics('myMethod');
console.log(metrics);
// {
//   count: 100,
//   avgTime: 150,
//   minTime: 50,
//   maxTime: 500,
//   lastExecution: 120
// }

// Get all metrics
const allMetrics = this.perfMonitor.getAllMetrics();

// Get top slowest operations
const slowest = this.perfMonitor.getTopSlowestOperations(5);
```

### Prometheus Integration

```typescript
// Get metrics in Prometheus format
const prometheusMetrics = this.perfMonitor.getPrometheusMetrics();

// Add to your metrics endpoint
@Get('/metrics')
getMetrics() {
  return this.perfMonitor.getPrometheusMetrics();
}
```

### Logging Summary

```typescript
// Log performance summary to console
this.perfMonitor.logSummary();

// Output:
// === Performance Summary ===
// Total operations tracked: 15
// Top 5 slowest operations:
//   1. getDashboardMetrics: 450ms avg (50 calls)
//   2. getPerformancePorOrigem: 320ms avg (30 calls)
//   ...
```

## Features

- **Automatic Tracking**: Records count, min, max, avg, and last execution time
- **Slow Operation Detection**: Automatically logs warnings for operations > 1 second
- **Prometheus Export**: Export metrics in Prometheus text format
- **Zero Configuration**: No setup required, just inject and use
- **Low Overhead**: Minimal performance impact (<1ms per operation)

## Best Practices

1. **Name Operations Clearly**: Use descriptive names like `getDashboardMetrics` instead of `getData`
2. **Use Try-Finally**: Always use try-finally to ensure timer.end() is called
3. **Monitor Critical Paths**: Focus on user-facing endpoints and business logic
4. **Review Regularly**: Check metrics weekly to identify new bottlenecks

## Example: Monitoring Critical Paths

```typescript
@Injectable()
export class BiService {
  constructor(private readonly perfMonitor: PerformanceMonitor) {}

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const timer = this.perfMonitor.startTimer('BiService.getDashboardMetrics');
    
    try {
      // Complex operations
      const metrics = await this.calculateMetrics();
      return metrics;
    } finally {
      const duration = timer.end();
      // Duration is also returned for custom logging
    }
  }
}
```

## Integration with Health Check

Add performance metrics to health check endpoint:

```typescript
@Get('/health')
getHealth() {
  const slowest = this.perfMonitor.getTopSlowestOperations(3);
  
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    performance: {
      slowestOperations: slowest,
    },
  };
}
```

## Resetting Metrics

Metrics accumulate over time. Reset periodically if needed:

```typescript
// Reset all metrics (useful for testing or after deployment)
this.perfMonitor.reset();
```

## Performance Impact

The Performance Monitor has minimal overhead:
- Timer start: ~0.001ms
- Timer end: ~0.01ms (includes map lookup and arithmetic)
- Total overhead: <1% for operations > 10ms

## Future Enhancements

Potential improvements for v2:
- Percentile calculations (P50, P95, P99)
- Histogram support
- Time-series storage
- Alerting thresholds
- Export to external monitoring systems

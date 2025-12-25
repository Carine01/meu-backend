import { Injectable, Logger } from '@nestjs/common';

/**
 * Performance Monitoring Utility
 * 
 * Tracks execution time and provides metrics for performance monitoring.
 * Use this to validate performance improvements and identify new bottlenecks.
 * 
 * @example
 * ```typescript
 * constructor(private readonly perfMonitor: PerformanceMonitor) {}
 * 
 * async myMethod() {
 *   const timer = this.perfMonitor.startTimer('myMethod');
 *   try {
 *     // ... your code
 *     return result;
 *   } finally {
 *     timer.end();
 *   }
 * }
 * ```
 */
@Injectable()
export class PerformanceMonitor {
  private readonly logger = new Logger(PerformanceMonitor.name);
  private metrics: Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    lastExecution: number;
  }> = new Map();

  /**
   * Start a performance timer
   * @param operationName - Name of the operation being timed
   * @returns Timer object with end() method
   */
  startTimer(operationName: string): { end: () => number } {
    const startTime = Date.now();

    return {
      end: (): number => {
        const duration = Date.now() - startTime;
        this.recordMetric(operationName, duration);
        
        // Log slow operations (> 1 second)
        if (duration > 1000) {
          this.logger.warn(
            `Slow operation detected: ${operationName} took ${duration}ms`
          );
        }
        
        return duration;
      },
    };
  }

  /**
   * Record a metric manually
   * @param operationName - Name of the operation
   * @param duration - Duration in milliseconds
   */
  private recordMetric(operationName: string, duration: number): void {
    const existing = this.metrics.get(operationName);

    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.lastExecution = duration;
    } else {
      this.metrics.set(operationName, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration,
        lastExecution: duration,
      });
    }
  }

  /**
   * Get metrics for a specific operation
   * @param operationName - Name of the operation
   * @returns Metrics object or undefined if not found
   */
  getMetrics(operationName: string): {
    count: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    lastExecution: number;
  } | undefined {
    const metric = this.metrics.get(operationName);
    
    if (!metric) {
      return undefined;
    }

    return {
      count: metric.count,
      avgTime: Math.round(metric.totalTime / metric.count),
      minTime: metric.minTime,
      maxTime: metric.maxTime,
      lastExecution: metric.lastExecution,
    };
  }

  /**
   * Get all metrics
   * @returns Map of all recorded metrics
   */
  getAllMetrics(): Record<string, {
    count: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    lastExecution: number;
  }> {
    const result: Record<string, {
      count: number;
      avgTime: number;
      minTime: number;
      maxTime: number;
      lastExecution: number;
    }> = {};

    this.metrics.forEach((metric, name) => {
      result[name] = {
        count: metric.count,
        avgTime: Math.round(metric.totalTime / metric.count),
        minTime: metric.minTime,
        maxTime: metric.maxTime,
        lastExecution: metric.lastExecution,
      };
    });

    return result;
  }

  /**
   * Get metrics in Prometheus format
   * @returns String in Prometheus text format
   */
  getPrometheusMetrics(): string {
    let output = '';

    this.metrics.forEach((metric, name) => {
      const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      const avgTime = Math.round(metric.totalTime / metric.count);

      output += `# HELP ${safeName}_duration_ms Average duration in milliseconds\n`;
      output += `# TYPE ${safeName}_duration_ms gauge\n`;
      output += `${safeName}_duration_ms{stat="avg"} ${avgTime}\n`;
      output += `${safeName}_duration_ms{stat="min"} ${metric.minTime}\n`;
      output += `${safeName}_duration_ms{stat="max"} ${metric.maxTime}\n`;
      output += `${safeName}_duration_ms{stat="last"} ${metric.lastExecution}\n`;
      
      output += `# HELP ${safeName}_count Total number of executions\n`;
      output += `# TYPE ${safeName}_count counter\n`;
      output += `${safeName}_count ${metric.count}\n\n`;
    });

    return output;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.logger.log('Performance metrics reset');
  }

  /**
   * Get top slowest operations
   * @param limit - Number of operations to return
   * @returns Array of operations sorted by average time
   */
  getTopSlowestOperations(limit: number = 10): Array<{
    name: string;
    avgTime: number;
    count: number;
  }> {
    const operations = Array.from(this.metrics.entries())
      .map(([name, metric]) => ({
        name,
        avgTime: Math.round(metric.totalTime / metric.count),
        count: metric.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);

    return operations;
  }

  /**
   * Log a summary of performance metrics
   */
  logSummary(): void {
    const slowest = this.getTopSlowestOperations(5);
    
    this.logger.log('=== Performance Summary ===');
    this.logger.log(`Total operations tracked: ${this.metrics.size}`);
    
    if (slowest.length > 0) {
      this.logger.log('Top 5 slowest operations:');
      slowest.forEach((op, index) => {
        this.logger.log(
          `  ${index + 1}. ${op.name}: ${op.avgTime}ms avg (${op.count} calls)`
        );
      });
    }
  }
}

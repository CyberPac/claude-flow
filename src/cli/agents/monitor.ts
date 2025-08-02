/**
 * Monitor Agent - System health and performance monitoring specialist
 * Part of the complete 17-agent implementation
 */

import { BaseAgent } from './base-agent.js';
import type { AgentConfig, AgentEnvironment } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';

export interface MetricDefinition {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  unit: string;
  thresholds: {
    warning: number;
    critical: number;
  };
}

export interface MetricValue {
  metric: string;
  value: number;
  timestamp: Date;
  labels: Record<string, string>;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  components: Record<string, {
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    lastCheck: Date;
    message?: string;
  }>;
  uptime: number;
  lastUpdate: Date;
}

export class MonitorAgent extends BaseAgent {
  private metrics: Map<string, MetricDefinition> = new Map();
  private metricValues: Map<string, MetricValue[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();

  constructor(
    id: string,
    config: Partial<AgentConfig>,
    environment: Partial<AgentEnvironment>,
    logger: ILogger,
    eventBus: IEventBus,
    memory: DistributedMemorySystem
  ) {
    super(id, 'monitor', config, environment, logger, eventBus, memory);
    
    this.capabilities = [
      'performance-monitoring',
      'health-checking', 
      'alerting',
      'metric-collection',
      'system-diagnostics',
      'uptime-monitoring',
      'threshold-monitoring'
    ];

    this.initializeDefaultMetrics();
    this.initializeHealthChecks();
  }

  async initialize(): Promise<void> {
    await super.initialize();
    this.startMonitoring();
    this.logger.info('Monitor agent initialized', { 
      agentId: this.agentInfo.id.id,
      metrics: this.metrics.size,
      healthChecks: this.healthChecks.size
    });
  }

  /**
   * Initialize default system metrics
   */
  private initializeDefaultMetrics(): void {
    const defaultMetrics: MetricDefinition[] = [
      {
        name: 'response_time',
        type: 'histogram',
        description: 'API response time in milliseconds',
        unit: 'ms',
        thresholds: { warning: 100, critical: 500 }
      },
      {
        name: 'memory_usage',
        type: 'gauge',
        description: 'Memory usage in megabytes',
        unit: 'MB',
        thresholds: { warning: 512, critical: 1024 }
      },
      {
        name: 'cpu_usage',
        type: 'gauge',
        description: 'CPU usage percentage',
        unit: '%',
        thresholds: { warning: 70, critical: 90 }
      },
      {
        name: 'error_rate',
        type: 'counter',
        description: 'Error rate per minute',
        unit: 'errors/min',
        thresholds: { warning: 5, critical: 20 }
      },
      {
        name: 'active_connections',
        type: 'gauge',
        description: 'Number of active connections',
        unit: 'connections',
        thresholds: { warning: 100, critical: 200 }
      },
      {
        name: 'disk_usage',
        type: 'gauge',
        description: 'Disk usage percentage',
        unit: '%',
        thresholds: { warning: 80, critical: 95 }
      }
    ];

    defaultMetrics.forEach(metric => {
      this.metrics.set(metric.name, metric);
      this.metricValues.set(metric.name, []);
    });
  }

  /**
   * Initialize health checks
   */
  private initializeHealthChecks(): void {
    this.healthChecks.set('database', async () => {
      // Simulate database health check
      return Math.random() > 0.1; // 90% success rate
    });

    this.healthChecks.set('cache', async () => {
      // Simulate cache health check
      return Math.random() > 0.05; // 95% success rate
    });

    this.healthChecks.set('external_api', async () => {
      // Simulate external API health check
      return Math.random() > 0.15; // 85% success rate
    });

    this.healthChecks.set('file_system', async () => {
      // Simulate file system health check
      return Math.random() > 0.02; // 98% success rate
    });
  }

  /**
   * Start monitoring loop
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkAlerts();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = new Date();

    // Simulate metric collection
    const metricUpdates: Array<{ name: string; value: number; labels?: Record<string, string> }> = [
      { name: 'response_time', value: 50 + Math.random() * 100 },
      { name: 'memory_usage', value: 256 + Math.random() * 256 },
      { name: 'cpu_usage', value: 30 + Math.random() * 40 },
      { name: 'error_rate', value: Math.random() * 10 },
      { name: 'active_connections', value: Math.floor(50 + Math.random() * 100) },
      { name: 'disk_usage', value: 60 + Math.random() * 25 }
    ];

    for (const update of metricUpdates) {
      await this.updateMetric(update.name, update.value, update.labels || {}, timestamp);
    }
  }

  /**
   * Update a specific metric
   */
  async updateMetric(
    metricName: string, 
    value: number, 
    labels: Record<string, string> = {}, 
    timestamp: Date = new Date()
  ): Promise<void> {
    const metric = this.metrics.get(metricName);
    if (!metric) {
      this.logger.warn('Unknown metric', { metricName });
      return;
    }

    const metricValue: MetricValue = {
      metric: metricName,
      value,
      timestamp,
      labels
    };

    const values = this.metricValues.get(metricName) || [];
    values.push(metricValue);

    // Keep only last 1000 values per metric
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }

    this.metricValues.set(metricName, values);

    this.eventBus.emit('agent:metric:updated', {
      agentId: this.agentInfo.id.id,
      metric: metricName,
      value,
      timestamp
    });
  }

  /**
   * Check for alert conditions
   */
  private async checkAlerts(): Promise<void> {
    for (const [metricName, metric] of this.metrics.entries()) {
      const values = this.metricValues.get(metricName) || [];
      if (values.length === 0) continue;

      const latestValue = values[values.length - 1];
      
      // Check critical threshold
      if (latestValue.value >= metric.thresholds.critical) {
        await this.triggerAlert(metricName, 'critical', latestValue.value, metric.thresholds.critical);
      }
      // Check warning threshold
      else if (latestValue.value >= metric.thresholds.warning) {
        await this.triggerAlert(metricName, 'warning', latestValue.value, metric.thresholds.warning);
      }
      // Check if alert should be resolved
      else {
        await this.resolveAlert(metricName);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(
    metricName: string, 
    severity: 'warning' | 'critical', 
    value: number, 
    threshold: number
  ): Promise<void> {
    const alertId = `${metricName}-${severity}`;
    const existingAlert = this.alerts.get(alertId);

    // Don't create duplicate unresolved alerts
    if (existingAlert && !existingAlert.resolved) {
      return;
    }

    const alert: Alert = {
      id: alertId,
      severity,
      metric: metricName,
      message: `${metricName} value ${value} exceeds ${severity} threshold ${threshold}`,
      value,
      threshold,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(alertId, alert);

    this.logger[severity === 'critical' ? 'error' : 'warn']('Alert triggered', {
      alertId,
      metric: metricName,
      value,
      threshold
    });

    this.eventBus.emit('agent:alert:triggered', {
      agentId: this.agentInfo.id.id,
      alert
    });
  }

  /**
   * Resolve an alert
   */
  private async resolveAlert(metricName: string): Promise<void> {
    const alertIds = [`${metricName}-warning`, `${metricName}-critical`];
    
    for (const alertId of alertIds) {
      const alert = this.alerts.get(alertId);
      if (alert && !alert.resolved) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        
        this.alerts.set(alertId, alert);
        
        this.logger.info('Alert resolved', { alertId, metric: metricName });
        
        this.eventBus.emit('agent:alert:resolved', {
          agentId: this.agentInfo.id.id,
          alert
        });
      }
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const components: HealthStatus['components'] = {};
    
    for (const [name, healthCheck] of this.healthChecks.entries()) {
      try {
        const isHealthy = await healthCheck();
        components[name] = {
          status: isHealthy ? 'healthy' : 'critical',
          lastCheck: new Date(),
          message: isHealthy ? undefined : 'Health check failed'
        };
      } catch (error) {
        components[name] = {
          status: 'unknown',
          lastCheck: new Date(),
          message: 'Health check error'
        };
      }
    }

    // Determine overall health
    const statuses = Object.values(components).map(c => c.status);
    let overall: HealthStatus['overall'];
    
    if (statuses.includes('critical')) {
      overall = 'critical';
    } else if (statuses.includes('warning')) {
      overall = 'warning';
    } else if (statuses.includes('unknown')) {
      overall = 'unknown';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      components,
      uptime: Date.now() - this.startTime.getTime(),
      lastUpdate: new Date()
    };
  }

  /**
   * Get metric values
   */
  getMetricValues(metricName: string, limit?: number): MetricValue[] {
    const values = this.metricValues.get(metricName) || [];
    return limit ? values.slice(-limit) : values;
  }

  /**
   * Get current alerts
   */
  getAlerts(includeResolved: boolean = false): Alert[] {
    const alerts = Array.from(this.alerts.values());
    return includeResolved ? alerts : alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): {
    totalMetrics: number;
    totalAlerts: number;
    activeAlerts: number;
    uptime: number;
    healthScore: number;
  } {
    const totalAlerts = this.alerts.size;
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => !alert.resolved).length;
    const uptime = Date.now() - this.startTime.getTime();
    
    // Calculate health score based on active alerts
    const healthScore = Math.max(0, 1 - (activeAlerts * 0.1));

    return {
      totalMetrics: this.metrics.size,
      totalAlerts,
      activeAlerts,
      uptime,
      healthScore
    };
  }

  /**
   * Add custom health check
   */
  addHealthCheck(name: string, check: () => Promise<boolean>): void {
    this.healthChecks.set(name, check);
    this.logger.info('Health check added', { name });
  }

  /**
   * Add custom metric
   */
  addMetric(metric: MetricDefinition): void {
    this.metrics.set(metric.name, metric);
    this.metricValues.set(metric.name, []);
    this.logger.info('Metric added', { metric: metric.name });
  }

  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.logger.info('Monitor agent shutting down', { 
      metricsCollected: Array.from(this.metricValues.values()).reduce((sum, values) => sum + values.length, 0),
      alertsTriggered: this.alerts.size
    });
    
    await super.shutdown();
  }
}

/**
 * Create a new monitor agent instance
 */
export function createMonitorAgent(
  id: string,
  config: Partial<AgentConfig>,
  environment: Partial<AgentEnvironment>,
  logger: ILogger,
  eventBus: IEventBus,
  memory: DistributedMemorySystem
): MonitorAgent {
  return new MonitorAgent(id, config, environment, logger, eventBus, memory);
}
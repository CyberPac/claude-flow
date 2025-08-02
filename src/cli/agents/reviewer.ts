/**
 * Reviewer Agent - Code review and quality optimization specialist  
 * Part of the complete 17-agent implementation
 */

import { BaseAgent } from './base-agent.js';
import type { AgentConfig, AgentEnvironment } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';

export interface ReviewCriteria {
  codeQuality: boolean;
  performance: boolean;
  security: boolean;
  maintainability: boolean;
  documentation: boolean;
  testCoverage: boolean;
}

export interface ReviewResult {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    file?: string;
    line?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: string[];
  approved: boolean;
}

export class ReviewerAgent extends BaseAgent {
  private reviewHistory: Map<string, ReviewResult> = new Map();
  private reviewCriteria: ReviewCriteria;
  private qualityThreshold: number = 0.8;

  constructor(
    id: string,
    config: Partial<AgentConfig>,
    environment: Partial<AgentEnvironment>,
    logger: ILogger,
    eventBus: IEventBus,
    memory: DistributedMemorySystem
  ) {
    super(id, 'reviewer', config, environment, logger, eventBus, memory);
    
    this.reviewCriteria = {
      codeQuality: true,
      performance: true,
      security: true,
      maintainability: true,
      documentation: true,
      testCoverage: true
    };

    this.capabilities = [
      'code-review',
      'quality-analysis', 
      'security-audit',
      'performance-review',
      'documentation-review',
      'test-coverage-analysis'
    ];
  }

  async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Reviewer agent initialized', { 
      agentId: this.agentInfo.id.id,
      qualityThreshold: this.qualityThreshold 
    });
  }

  /**
   * Perform comprehensive code review
   */
  async reviewCode(files: string[], criteria?: Partial<ReviewCriteria>): Promise<ReviewResult> {
    const effectiveCriteria = { ...this.reviewCriteria, ...criteria };
    
    this.logger.info('Starting code review', { 
      files: files.length,
      criteria: effectiveCriteria 
    });

    const issues: ReviewResult['issues'] = [];
    const recommendations: string[] = [];
    let totalScore = 0;
    let scoredAspects = 0;

    // Code quality analysis
    if (effectiveCriteria.codeQuality) {
      const qualityScore = await this.analyzeCodeQuality(files);
      totalScore += qualityScore;
      scoredAspects++;
      
      if (qualityScore < 0.7) {
        issues.push({
          type: 'warning',
          message: 'Code quality below recommended standards',
          severity: 'medium'
        });
        recommendations.push('Refactor complex functions and improve readability');
      }
    }

    // Performance analysis
    if (effectiveCriteria.performance) {
      const perfScore = await this.analyzePerformance(files);
      totalScore += perfScore;
      scoredAspects++;
      
      if (perfScore < 0.8) {
        issues.push({
          type: 'suggestion',
          message: 'Performance optimizations available',
          severity: 'low'
        });
        recommendations.push('Consider performance optimizations for critical paths');
      }
    }

    // Security analysis
    if (effectiveCriteria.security) {
      const securityScore = await this.analyzeSecurity(files);
      totalScore += securityScore;
      scoredAspects++;
      
      if (securityScore < 0.9) {
        issues.push({
          type: 'error',
          message: 'Security vulnerabilities detected',
          severity: 'critical'
        });
        recommendations.push('Address security vulnerabilities immediately');
      }
    }

    // Documentation analysis
    if (effectiveCriteria.documentation) {
      const docScore = await this.analyzeDocumentation(files);
      totalScore += docScore;
      scoredAspects++;
      
      if (docScore < 0.6) {
        recommendations.push('Improve code documentation and comments');
      }
    }

    // Test coverage analysis
    if (effectiveCriteria.testCoverage) {
      const testScore = await this.analyzeTestCoverage(files);
      totalScore += testScore;
      scoredAspects++;
      
      if (testScore < 0.8) {
        recommendations.push('Increase test coverage to at least 80%');
      }
    }

    const finalScore = scoredAspects > 0 ? totalScore / scoredAspects : 0;
    const approved = finalScore >= this.qualityThreshold && 
                    !issues.some(issue => issue.severity === 'critical');

    const result: ReviewResult = {
      score: finalScore,
      issues,
      recommendations,
      approved
    };

    const reviewId = `review-${Date.now()}`;
    this.reviewHistory.set(reviewId, result);

    this.eventBus.emit('agent:review:completed', {
      agentId: this.agentInfo.id.id,
      reviewId,
      score: finalScore,
      approved
    });

    return result;
  }

  /**
   * Analyze code quality
   */
  private async analyzeCodeQuality(files: string[]): Promise<number> {
    // Simulate code quality analysis
    let qualityScore = 0.85;
    
    // Check for common quality issues
    for (const file of files) {
      // Simulate analysis - in real implementation would use AST parsing
      if (file.includes('TODO') || file.includes('FIXME')) {
        qualityScore -= 0.1;
      }
      if (file.length > 10000) { // Large files
        qualityScore -= 0.05;
      }
    }

    return Math.max(0, Math.min(1, qualityScore));
  }

  /**
   * Analyze performance characteristics
   */
  private async analyzePerformance(files: string[]): Promise<number> {
    // Simulate performance analysis
    let perfScore = 0.9;
    
    // Look for common performance anti-patterns
    for (const file of files) {
      if (file.includes('console.log')) {
        perfScore -= 0.05; // Debug logging in production
      }
      if (file.includes('nested loops')) {
        perfScore -= 0.1; // Potential O(n²) complexity
      }
    }

    return Math.max(0, Math.min(1, perfScore));
  }

  /**
   * Analyze security vulnerabilities
   */
  private async analyzeSecurity(files: string[]): Promise<number> {
    // Simulate security analysis
    let securityScore = 0.95;
    
    // Check for security issues
    for (const file of files) {
      if (file.includes('eval(') || file.includes('innerHTML')) {
        securityScore -= 0.2; // Potential XSS vulnerabilities
      }
      if (file.includes('process.env') && !file.includes('validation')) {
        securityScore -= 0.1; // Unvalidated environment variables
      }
    }

    return Math.max(0, Math.min(1, securityScore));
  }

  /**
   * Analyze documentation quality
   */
  private async analyzeDocumentation(files: string[]): Promise<number> {
    // Simulate documentation analysis
    let docScore = 0.7;
    
    // Check for documentation
    for (const file of files) {
      if (file.includes('/**') || file.includes('//')) {
        docScore += 0.05; // Has comments
      }
      if (file.includes('@param') || file.includes('@returns')) {
        docScore += 0.1; // Has JSDoc
      }
    }

    return Math.max(0, Math.min(1, docScore));
  }

  /**
   * Analyze test coverage
   */
  private async analyzeTestCoverage(files: string[]): Promise<number> {
    // Simulate test coverage analysis
    const testFiles = files.filter(f => f.includes('.test.') || f.includes('.spec.'));
    const sourceFiles = files.filter(f => !f.includes('.test.') && !f.includes('.spec.'));
    
    if (sourceFiles.length === 0) return 1;
    
    const coverage = testFiles.length / sourceFiles.length;
    return Math.min(1, coverage);
  }

  /**
   * Get review history
   */
  getReviewHistory(): Array<{ id: string; result: ReviewResult }> {
    return Array.from(this.reviewHistory.entries()).map(([id, result]) => ({
      id,
      result
    }));
  }

  /**
   * Update quality threshold
   */
  setQualityThreshold(threshold: number): void {
    this.qualityThreshold = Math.max(0, Math.min(1, threshold));
    this.logger.info('Quality threshold updated', { threshold: this.qualityThreshold });
  }

  async shutdown(): Promise<void> {
    this.logger.info('Reviewer agent shutting down', { 
      reviewsCompleted: this.reviewHistory.size 
    });
    await super.shutdown();
  }
}

/**
 * Create a new reviewer agent instance
 */
export function createReviewerAgent(
  id: string,
  config: Partial<AgentConfig>,
  environment: Partial<AgentEnvironment>,
  logger: ILogger,
  eventBus: IEventBus,
  memory: DistributedMemorySystem
): ReviewerAgent {
  return new ReviewerAgent(id, config, environment, logger, eventBus, memory);
}
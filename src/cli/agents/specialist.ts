/**
 * Specialist Agent - Domain-specific expertise and specialized knowledge
 * Part of the complete 17-agent implementation
 */

import { BaseAgent } from './base-agent.js';
import type { AgentConfig, AgentEnvironment } from '../../swarm/types.js';
import type { ILogger } from '../../core/logger.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { DistributedMemorySystem } from '../../memory/distributed-memory.js';

export type SpecializationDomain = 
  | 'security'
  | 'database'
  | 'networking'
  | 'cloud-infrastructure'
  | 'machine-learning'
  | 'blockchain'
  | 'mobile-development'
  | 'devops'
  | 'data-science'
  | 'ui-ux'
  | 'api-design'
  | 'microservices';

export interface ExpertiseLevel {
  domain: SpecializationDomain;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certifications: string[];
  specializations: string[];
}

export interface ConsultationRequest {
  domain: SpecializationDomain;
  question: string;
  context: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requiredDepth: 'overview' | 'detailed' | 'comprehensive';
}

export interface ConsultationResult {
  id: string;
  request: ConsultationRequest;
  analysis: {
    keyPoints: string[];
    recommendations: string[];
    bestPractices: string[];
    potentialRisks: string[];
    alternatives: string[];
  };
  implementation: {
    steps: string[];
    timeline: string;
    resources: string[];
    dependencies: string[];
  };
  confidence: number;
  sources: string[];
  followUpQuestions: string[];
  createdAt: Date;
}

export class SpecialistAgent extends BaseAgent {
  private expertise: Map<SpecializationDomain, ExpertiseLevel> = new Map();
  private consultationHistory: Map<string, ConsultationResult> = new Map();
  private knowledgeBase: Map<string, any> = new Map();
  private specialization: SpecializationDomain;

  constructor(
    id: string,
    config: Partial<AgentConfig>,
    environment: Partial<AgentEnvironment>,
    logger: ILogger,
    eventBus: IEventBus,
    memory: DistributedMemorySystem,
    specialization: SpecializationDomain = 'security'
  ) {
    super(id, 'specialist', config, environment, logger, eventBus, memory);
    
    this.specialization = specialization;
    this.capabilities = [
      `${specialization}-expertise`,
      'domain-consultation',
      'best-practices',
      'risk-assessment',
      'solution-architecture',
      'technical-review',
      'knowledge-transfer'
    ];

    this.initializeExpertise();
    this.initializeKnowledgeBase();
  }

  async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Specialist agent initialized', { 
      agentId: this.agentInfo.id.id,
      specialization: this.specialization,
      expertiseDomains: this.expertise.size
    });
  }

  /**
   * Initialize expertise levels
   */
  private initializeExpertise(): void {
    // Primary specialization
    this.expertise.set(this.specialization, {
      domain: this.specialization,
      proficiency: 'expert',
      yearsOfExperience: 8,
      certifications: this.getCertifications(this.specialization),
      specializations: this.getSpecializations(this.specialization)
    });

    // Secondary expertise areas
    const secondaryDomains = this.getSecondaryDomains(this.specialization);
    secondaryDomains.forEach(domain => {
      this.expertise.set(domain, {
        domain,
        proficiency: 'advanced',
        yearsOfExperience: 5,
        certifications: [],
        specializations: []
      });
    });
  }

  /**
   * Get certifications for a domain
   */
  private getCertifications(domain: SpecializationDomain): string[] {
    const certificationMap: Record<SpecializationDomain, string[]> = {
      'security': ['CISSP', 'CEH', 'GSEC'],
      'database': ['Oracle DBA', 'MongoDB Certified', 'PostgreSQL Professional'],
      'networking': ['CCNA', 'CCNP', 'CompTIA Network+'],
      'cloud-infrastructure': ['AWS Solutions Architect', 'Azure Expert', 'GCP Professional'],
      'machine-learning': ['TensorFlow Developer', 'AWS ML Specialty', 'Google ML Engineer'],
      'blockchain': ['Certified Blockchain Professional', 'Ethereum Developer'],
      'mobile-development': ['iOS Developer', 'Android Developer', 'React Native Expert'],
      'devops': ['Kubernetes Certified', 'Docker Certified', 'Jenkins Expert'],
      'data-science': ['Data Science Professional', 'Tableau Certified', 'Python Data Analysis'],
      'ui-ux': ['UX Design Certified', 'Figma Expert', 'Design Systems Specialist'],
      'api-design': ['OpenAPI Specialist', 'REST API Expert', 'GraphQL Professional'],
      'microservices': ['Microservices Architect', 'Service Mesh Expert', 'Container Orchestration']
    };

    return certificationMap[domain] || [];
  }

  /**
   * Get specializations for a domain
   */
  private getSpecializations(domain: SpecializationDomain): string[] {
    const specializationMap: Record<SpecializationDomain, string[]> = {
      'security': ['Penetration Testing', 'Cryptography', 'Incident Response', 'Compliance'],
      'database': ['Query Optimization', 'Replication', 'Backup & Recovery', 'Performance Tuning'],
      'networking': ['Network Architecture', 'Load Balancing', 'VPN Configuration', 'Firewall Management'],
      'cloud-infrastructure': ['Auto-scaling', 'Container Orchestration', 'Serverless', 'Infrastructure as Code'],
      'machine-learning': ['Deep Learning', 'NLP', 'Computer Vision', 'MLOps'],
      'blockchain': ['Smart Contracts', 'DeFi', 'Consensus Algorithms', 'Cryptocurrency'],
      'mobile-development': ['Cross-platform', 'Native Development', 'Mobile Security', 'App Store Optimization'],
      'devops': ['CI/CD', 'Infrastructure Automation', 'Monitoring', 'Release Management'],
      'data-science': ['Statistical Analysis', 'Data Visualization', 'Big Data', 'Predictive Modeling'],
      'ui-ux': ['User Research', 'Interaction Design', 'Accessibility', 'Design Systems'],
      'api-design': ['RESTful Services', 'GraphQL', 'API Gateway', 'Microservices Communication'],
      'microservices': ['Service Discovery', 'Circuit Breakers', 'Event Sourcing', 'CQRS']
    };

    return specializationMap[domain] || [];
  }

  /**
   * Get secondary domains for cross-domain expertise
   */
  private getSecondaryDomains(primary: SpecializationDomain): SpecializationDomain[] {
    const crossDomainMap: Record<SpecializationDomain, SpecializationDomain[]> = {
      'security': ['networking', 'cloud-infrastructure', 'devops'],
      'database': ['cloud-infrastructure', 'data-science', 'api-design'],
      'networking': ['security', 'cloud-infrastructure', 'devops'],
      'cloud-infrastructure': ['security', 'devops', 'microservices'],
      'machine-learning': ['data-science', 'cloud-infrastructure', 'api-design'],
      'blockchain': ['security', 'networking', 'api-design'],
      'mobile-development': ['ui-ux', 'api-design', 'security'],
      'devops': ['cloud-infrastructure', 'security', 'microservices'],
      'data-science': ['machine-learning', 'database', 'cloud-infrastructure'],
      'ui-ux': ['mobile-development', 'api-design'],
      'api-design': ['microservices', 'security', 'database'],
      'microservices': ['cloud-infrastructure', 'api-design', 'devops']
    };

    return crossDomainMap[primary] || [];
  }

  /**
   * Initialize knowledge base
   */
  private initializeKnowledgeBase(): void {
    // Domain-specific knowledge
    this.knowledgeBase.set(`${this.specialization}-patterns`, this.getDomainPatterns());
    this.knowledgeBase.set(`${this.specialization}-tools`, this.getDomainTools());
    this.knowledgeBase.set(`${this.specialization}-bestpractices`, this.getDomainBestPractices());
    this.knowledgeBase.set(`${this.specialization}-risks`, this.getDomainRisks());
  }

  /**
   * Get domain-specific patterns
   */
  private getDomainPatterns(): string[] {
    const patternMap: Record<SpecializationDomain, string[]> = {
      'security': ['Zero Trust Architecture', 'Defense in Depth', 'Principle of Least Privilege'],
      'database': ['Master-Slave Replication', 'Sharding', 'Connection Pooling', 'Read Replicas'],
      'networking': ['Load Balancing', 'Content Delivery Networks', 'VPN Tunneling'],
      'cloud-infrastructure': ['Auto-scaling Groups', 'Blue-Green Deployment', 'Infrastructure as Code'],
      'machine-learning': ['Model-View-Controller for ML', 'Feature Store Pattern', 'A/B Testing for Models'],
      'microservices': ['API Gateway', 'Circuit Breaker', 'Event Sourcing', 'Saga Pattern']
    };

    return patternMap[this.specialization] || ['Domain-specific patterns'];
  }

  /**
   * Get domain-specific tools
   */
  private getDomainTools(): string[] {
    const toolMap: Record<SpecializationDomain, string[]> = {
      'security': ['Nessus', 'Burp Suite', 'Wireshark', 'Metasploit'],
      'database': ['pgAdmin', 'MySQL Workbench', 'MongoDB Compass', 'Redis CLI'],
      'networking': ['Cisco Packet Tracer', 'Wireshark', 'Nmap', 'iperf'],
      'cloud-infrastructure': ['Terraform', 'Ansible', 'Kubernetes', 'Docker'],
      'machine-learning': ['TensorFlow', 'PyTorch', 'Jupyter', 'MLflow'],
      'devops': ['Jenkins', 'GitLab CI', 'Prometheus', 'Grafana']
    };

    return toolMap[this.specialization] || ['Domain-specific tools'];
  }

  /**
   * Get domain-specific best practices
   */
  private getDomainBestPractices(): string[] {
    const practiceMap: Record<SpecializationDomain, string[]> = {
      'security': ['Regular security audits', 'Multi-factor authentication', 'Encryption at rest and in transit'],
      'database': ['Regular backups', 'Query optimization', 'Index management', 'Connection pooling'],
      'networking': ['Network segmentation', 'Regular firmware updates', 'Traffic monitoring'],
      'cloud-infrastructure': ['Cost optimization', 'Resource tagging', 'Disaster recovery planning'],
      'machine-learning': ['Data validation', 'Model versioning', 'Continuous monitoring', 'Bias detection'],
      'devops': ['Infrastructure as Code', 'Automated testing', 'Continuous monitoring']
    };

    return practiceMap[this.specialization] || ['Domain-specific best practices'];
  }

  /**
   * Get domain-specific risks
   */
  private getDomainRisks(): string[] {
    const riskMap: Record<SpecializationDomain, string[]> = {
      'security': ['Data breaches', 'Privilege escalation', 'Social engineering attacks'],
      'database': ['Data corruption', 'Performance degradation', 'Backup failures'],
      'networking': ['Network congestion', 'Single points of failure', 'Security vulnerabilities'],
      'cloud-infrastructure': ['Vendor lock-in', 'Cost overruns', 'Service availability'],
      'machine-learning': ['Model drift', 'Bias in predictions', 'Data privacy violations'],
      'devops': ['Deployment failures', 'Configuration drift', 'Tool sprawl']
    };

    return riskMap[this.specialization] || ['Domain-specific risks'];
  }

  /**
   * Provide expert consultation
   */
  async consultOn(request: ConsultationRequest): Promise<ConsultationResult> {
    this.logger.info('Providing consultation', { 
      domain: request.domain,
      urgency: request.urgency,
      depth: request.requiredDepth
    });

    const expertise = this.expertise.get(request.domain);
    if (!expertise) {
      throw new Error(`No expertise available for domain: ${request.domain}`);
    }

    const analysis = await this.analyzeRequest(request, expertise);
    const implementation = await this.createImplementationPlan(request, analysis);
    const confidence = this.calculateConfidence(request.domain, expertise);

    const result: ConsultationResult = {
      id: `consultation-${Date.now()}`,
      request,
      analysis,
      implementation,
      confidence,
      sources: this.getSources(request.domain),
      followUpQuestions: this.generateFollowUpQuestions(request),
      createdAt: new Date()
    };

    this.consultationHistory.set(result.id, result);

    this.eventBus.emit('agent:consultation:completed', {
      agentId: this.agentInfo.id.id,
      consultationId: result.id,
      domain: request.domain,
      confidence
    });

    return result;
  }

  /**
   * Analyze consultation request
   */
  private async analyzeRequest(
    request: ConsultationRequest, 
    expertise: ExpertiseLevel
  ): Promise<ConsultationResult['analysis']> {
    const patterns = this.knowledgeBase.get(`${request.domain}-patterns`) || [];
    const bestPractices = this.knowledgeBase.get(`${request.domain}-bestpractices`) || [];
    const risks = this.knowledgeBase.get(`${request.domain}-risks`) || [];

    return {
      keyPoints: [
        `Primary concern in ${request.domain} domain`,
        `Applies to ${expertise.specializations.join(', ')} specializations`,
        'Requires consideration of industry standards'
      ],
      recommendations: [
        `Follow ${request.domain} best practices`,
        'Implement monitoring and alerting',
        'Plan for scalability and maintainability'
      ],
      bestPractices: bestPractices.slice(0, 3),
      potentialRisks: risks.slice(0, 3),
      alternatives: [
        'Alternative approach A with trade-offs',
        'Alternative approach B with different benefits',
        'Hybrid solution combining multiple approaches'
      ]
    };
  }

  /**
   * Create implementation plan
   */
  private async createImplementationPlan(
    request: ConsultationRequest,
    analysis: ConsultationResult['analysis']
  ): Promise<ConsultationResult['implementation']> {
    const tools = this.knowledgeBase.get(`${request.domain}-tools`) || [];
    
    const complexityMultiplier = request.requiredDepth === 'comprehensive' ? 2 : 
                                 request.requiredDepth === 'detailed' ? 1.5 : 1;
    
    const baseTimelineWeeks = Math.ceil(2 * complexityMultiplier);

    return {
      steps: [
        'Requirements analysis and validation',
        'Architecture design and review',
        'Implementation planning',
        'Proof of concept development',
        'Full implementation',
        'Testing and validation',
        'Documentation and knowledge transfer',
        'Deployment and monitoring setup'
      ],
      timeline: `${baseTimelineWeeks} weeks`,
      resources: [
        `${request.domain} specialist`,
        'Development team',
        'Testing environment',
        ...tools.slice(0, 2)
      ],
      dependencies: [
        'Stakeholder approval',
        'Resource allocation',
        'Environment setup',
        'Third-party integrations'
      ]
    };
  }

  /**
   * Calculate confidence based on expertise
   */
  private calculateConfidence(domain: SpecializationDomain, expertise: ExpertiseLevel): number {
    const proficiencyScore = {
      'beginner': 0.4,
      'intermediate': 0.6,
      'advanced': 0.8,
      'expert': 0.95
    }[expertise.proficiency];

    const experienceScore = Math.min(0.1, expertise.yearsOfExperience * 0.01);
    const certificationScore = Math.min(0.1, expertise.certifications.length * 0.03);

    return Math.min(0.99, proficiencyScore + experienceScore + certificationScore);
  }

  /**
   * Get sources for domain
   */
  private getSources(domain: SpecializationDomain): string[] {
    return [
      `${domain} industry standards and guidelines`,
      'Best practices from enterprise implementations',
      'Research papers and technical documentation',
      'Professional experience and case studies'
    ];
  }

  /**
   * Generate follow-up questions
   */
  private generateFollowUpQuestions(request: ConsultationRequest): string[] {
    return [
      `What are the specific constraints for this ${request.domain} implementation?`,
      'What is the expected scale and performance requirements?',
      'Are there existing systems that need to be integrated?',
      'What is the timeline and budget for this project?',
      'What are the security and compliance requirements?'
    ];
  }

  /**
   * Get consultation history
   */
  getConsultationHistory(): ConsultationResult[] {
    return Array.from(this.consultationHistory.values());
  }

  /**
   * Get expertise summary
   */
  getExpertiseSummary(): {
    primarySpecialization: SpecializationDomain;
    expertiseDomains: ExpertiseLevel[];
    totalConsultations: number;
    averageConfidence: number;
  } {
    const consultations = Array.from(this.consultationHistory.values());
    const averageConfidence = consultations.length > 0
      ? consultations.reduce((sum, c) => sum + c.confidence, 0) / consultations.length
      : 0;

    return {
      primarySpecialization: this.specialization,
      expertiseDomains: Array.from(this.expertise.values()),
      totalConsultations: consultations.length,
      averageConfidence
    };
  }

  /**
   * Add expertise in new domain
   */
  addExpertise(domain: SpecializationDomain, level: ExpertiseLevel): void {
    this.expertise.set(domain, level);
    this.capabilities.push(`${domain}-expertise`);
    this.logger.info('Expertise added', { domain, proficiency: level.proficiency });
  }

  async shutdown(): Promise<void> {
    this.logger.info('Specialist agent shutting down', { 
      specialization: this.specialization,
      consultationsProvided: this.consultationHistory.size
    });
    await super.shutdown();
  }
}

/**
 * Create a new specialist agent instance
 */
export function createSpecialistAgent(
  id: string,
  config: Partial<AgentConfig>,
  environment: Partial<AgentEnvironment>,
  logger: ILogger,
  eventBus: IEventBus,
  memory: DistributedMemorySystem,
  specialization: SpecializationDomain = 'security'
): SpecialistAgent {
  return new SpecialistAgent(id, config, environment, logger, eventBus, memory, specialization);
}
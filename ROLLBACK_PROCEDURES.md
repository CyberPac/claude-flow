# Claude Flow v2.0.0-phase2 Rollback Procedures

## 🛡️ **Emergency Rollback Guide**

This document provides comprehensive rollback procedures for Claude Flow v2.0.0-phase2 deployments, ensuring safe recovery from any deployment issues.

### 🚨 **When to Rollback**

#### **Critical Conditions**
- **Service Unavailable** - Assistant fails to start or crashes repeatedly
- **Data Loss** - Memory or configuration corruption detected
- **Performance Degradation** - Response times >5x slower than baseline
- **Security Breach** - Unauthorized access or data exposure
- **Agent Failures** - Multiple agents failing to spawn or coordinate

#### **Warning Conditions**
- **High Error Rate** - Error rate >10% over 30 minutes
- **Memory Leaks** - Memory usage increasing >50MB/hour
- **API Rate Limits** - Frequent rate limit violations
- **Network Issues** - Connection failures >5% over 15 minutes

### 🔄 **Rollback Decision Matrix**

| Severity | Condition | Action | Timeline |
|----------|-----------|---------|----------|
| **P0** | Service Down | Immediate Rollback | < 5 minutes |
| **P1** | Data Loss Risk | Emergency Rollback | < 15 minutes |
| **P2** | Performance Issues | Scheduled Rollback | < 1 hour |
| **P3** | Minor Issues | Investigate First | < 4 hours |

### 🏃‍♂️ **Emergency Rollback (P0/P1)**

#### **Immediate Actions (< 5 minutes)**
```bash
# 1. Stop current service immediately
sudo systemctl stop claude-flow 2>/dev/null || pm2 stop claude-flow-assistant

# 2. Backup current state for investigation
sudo cp -r /opt/claude-flow /opt/claude-flow-failed-$(date +%Y%m%d-%H%M%S)

# 3. Restore from last known good backup
LAST_BACKUP=$(ls -t /var/backups/claude-flow/backup-*.tar.gz | head -1)
cd /opt/claude-flow
sudo tar -xzf "$LAST_BACKUP" --overwrite

# 4. Restart service with previous version
sudo systemctl start claude-flow || pm2 start claude-flow-assistant

# 5. Verify service is operational
claude-flow health-check --critical-only
```

#### **Emergency Rollback Script**
```bash
#!/bin/bash
# emergency-rollback.sh

set -e
LOG_FILE="/var/log/claude-flow-rollback-$(date +%Y%m%d-%H%M%S).log"

echo "🚨 EMERGENCY ROLLBACK INITIATED at $(date)" | tee -a "$LOG_FILE"

# Function to log and execute
log_exec() {
    echo "Executing: $1" | tee -a "$LOG_FILE"
    eval "$1" 2>&1 | tee -a "$LOG_FILE"
}

# Stop service
log_exec "sudo systemctl stop claude-flow 2>/dev/null || pm2 stop claude-flow-assistant"

# Backup failed deployment
FAILED_DIR="/opt/claude-flow-failed-$(date +%Y%m%d-%H%M%S)"
log_exec "sudo cp -r /opt/claude-flow $FAILED_DIR"

# Find latest backup
BACKUP_DIR="/var/backups/claude-flow"
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ CRITICAL: No backup found! Manual intervention required." | tee -a "$LOG_FILE"
    exit 1
fi

echo "📦 Using backup: $LATEST_BACKUP" | tee -a "$LOG_FILE"

# Restore backup
log_exec "cd /opt/claude-flow && sudo tar -xzf '$LATEST_BACKUP' --overwrite"

# Restore service
log_exec "sudo systemctl start claude-flow || pm2 start claude-flow-assistant"

# Wait for service to stabilize
sleep 10

# Verify rollback
if claude-flow health-check --critical-only &>/dev/null; then
    echo "✅ ROLLBACK SUCCESSFUL at $(date)" | tee -a "$LOG_FILE"
    echo "📋 Failed deployment backed up to: $FAILED_DIR" | tee -a "$LOG_FILE"
else
    echo "❌ ROLLBACK FAILED - Service still not healthy" | tee -a "$LOG_FILE"
    exit 1
fi
```

### 🔧 **Version-Specific Rollback**

#### **From v2.0.0-phase2 to v2.0.0-alpha.82**
```bash
# 1. Stop current service
sudo systemctl stop claude-flow

# 2. Install previous version
npm install -g claude-flow@2.0.0-alpha.82

# 3. Restore compatible configuration
cp /opt/claude-flow/backups/config-alpha82.json /opt/claude-flow/config.json

# 4. Migrate data if needed
claude-flow migrate --from phase2 --to alpha82

# 5. Restart with previous version
sudo systemctl start claude-flow
```

#### **From v2.0.0-phase2 to v1.x**
```bash
# WARNING: Major version rollback - requires data migration

# 1. Export Phase 2 data
claude-flow export --format v1-compatible --output phase2-data.json

# 2. Install v1.x
npm install -g claude-flow@1.0.73

# 3. Initialize with v1 structure
claude-flow init --version 1 --migrate-from phase2-data.json

# 4. Verify compatibility
claude-flow health-check --version-check
```

### 💾 **Configuration Rollback**

#### **Configuration Backup and Restore**
```bash
# Create configuration checkpoint before changes
claude-flow config backup --output config-checkpoint-$(date +%Y%m%d-%H%M%S).json

# Rollback to specific configuration
claude-flow config restore --file config-checkpoint-20250104-140500.json

# Rollback to default configuration
claude-flow config reset --defaults --confirm

# Verify configuration
claude-flow config validate
```

#### **Agent Configuration Rollback**
```bash
# Backup current agent configuration
claude-flow agents export --output agents-backup-$(date +%Y%m%d-%H%M%S).json

# Restore previous agent configuration
claude-flow agents import --file agents-backup-20250104-140000.json

# Reset to default agents
claude-flow agents reset --template executive-assistant

# Verify agents
claude-flow agents status --health-check
```

### 🗄️ **Database Rollback**

#### **Memory Database Rollback**
```bash
# Backup current memory database
cp /opt/claude-flow/.swarm/memory.db /opt/claude-flow/backups/memory-failed-$(date +%Y%m%d-%H%M%S).db

# Restore from backup
MEMORY_BACKUP=$(ls -t /opt/claude-flow/backups/memory-backup-*.db | head -1)
cp "$MEMORY_BACKUP" /opt/claude-flow/.swarm/memory.db

# Verify database integrity
claude-flow database check --repair-if-needed
```

#### **Configuration Database Rollback**
```bash
# SQLite configuration rollback
sqlite3 /opt/claude-flow/config.db ".backup /opt/claude-flow/backups/config-backup-$(date +%Y%m%d-%H%M%S).db"

# Restore configuration database
CONFIG_BACKUP=$(ls -t /opt/claude-flow/backups/config-backup-*.db | head -1)
sqlite3 /opt/claude-flow/config.db ".restore '$CONFIG_BACKUP'"
```

### 🌐 **Network Rollback**

#### **API Configuration Rollback**
```bash
# Rollback to previous API endpoints
claude-flow config set claude.baseUrl "https://api.anthropic.com/v1"
claude-flow config set claude.model "claude-3-sonnet-20240229"

# Test API connectivity
claude-flow test api-connection --verbose

# Rollback rate limiting
claude-flow config set claude.rateLimit 30
claude-flow config set claude.retryDelay 2000
```

#### **Network Security Rollback**
```bash
# Disable new security features if causing issues
claude-flow security disable --feature tls-verification
claude-flow security disable --feature api-key-encryption

# Rollback firewall rules
sudo ufw delete allow 3000/tcp
sudo ufw reload
```

### 🔍 **Verification Steps**

#### **Post-Rollback Checklist**
```bash
# 1. Service Health
systemctl status claude-flow
echo "Service Status: $(systemctl is-active claude-flow)"

# 2. Application Health
claude-flow health-check --comprehensive --timeout 30

# 3. Agent Status
claude-flow assistant status --detailed

# 4. Memory Integrity
claude-flow database check --tables all

# 5. API Connectivity
claude-flow test api-connection

# 6. Performance Check
claude-flow analysis performance-report --last-hour

# 7. Error Rate Check
claude-flow logs --grep "ERROR" --last-hour --count

echo "✅ Rollback verification complete"
```

#### **Performance Validation**
```bash
# Baseline performance test
claude-flow test performance --duration 300 --agents 5

# Memory usage check
claude-flow analysis memory-usage --alert-threshold 2GB

# Response time validation
claude-flow test response-time --target 2000ms --samples 10

# Token usage validation
claude-flow analysis token-usage --last-hour --budget-check
```

### 📊 **Monitoring During Rollback**

#### **Real-time Monitoring**
```bash
# Monitor rollback progress
watch -n 5 'claude-flow health-check --quick && echo "Last check: $(date)"'

# Monitor system resources
watch -n 2 'free -h && echo "---" && ps aux | grep claude-flow | grep -v grep'

# Monitor logs in real-time
tail -f /var/log/claude-flow/*.log | grep -E "(ERROR|WARN|ROLLBACK)"
```

#### **Alerting During Rollback**
```bash
# Set up temporary monitoring
claude-flow monitoring enable --rollback-mode --alert-threshold critical

# Monitor for specific issues
claude-flow monitor --watch-for "agent-spawn-failure,memory-leak,api-timeout"

# Disable monitoring after successful rollback
claude-flow monitoring disable --rollback-mode
```

### 🧪 **Testing After Rollback**

#### **Functional Testing**
```bash
# Test basic functionality
claude-flow test basic-functions --timeout 60

# Test agent spawning
claude-flow assistant spawn --agents 3 --test-mode

# Test memory operations
claude-flow memory test --operations read,write,delete

# Test coordination
claude-flow test coordination --agents 5 --tasks 10
```

#### **Integration Testing**
```bash
# Test external integrations
claude-flow test integrations --github --claude-api

# Test webhooks if applicable
claude-flow test webhooks --endpoints all

# Test backup/restore functionality
claude-flow test backup-restore --quick
```

### 📝 **Documentation and Communication**

#### **Incident Report Template**
```markdown
# Rollback Incident Report

**Date**: $(date)
**Severity**: [P0/P1/P2/P3]
**Duration**: [Start time] - [End time]

## Problem Description
- **Issue**: [Brief description]
- **Impact**: [User/system impact]
- **Root Cause**: [If known]

## Rollback Actions Taken
- **Trigger**: [What triggered rollback]
- **Method**: [Emergency/Scheduled]
- **Version**: [Rolled back from] → [Rolled back to]
- **Data Loss**: [Yes/No - details]

## Verification Results
- **Service Health**: [Pass/Fail]
- **Performance**: [Metrics]
- **Functionality**: [Test results]

## Follow-up Actions
- [ ] Root cause analysis
- [ ] Fix development/testing
- [ ] Update deployment procedures
- [ ] Team communication

**Reporter**: [Name]
**Reviewer**: [Name]
```

#### **Communication Plan**
```bash
# Notify stakeholders
echo "Claude Flow rollback completed successfully at $(date)" | \
  mail -s "Claude Flow Rollback - Service Restored" stakeholders@company.com

# Update status page
curl -X POST "https://status.company.com/incidents" \
  -d "status=resolved&title=Claude Flow Service Restored&description=Rollback completed successfully"

# Log to monitoring system
curl -X POST "https://monitoring.company.com/events" \
  -d "event=rollback_complete&service=claude-flow&version=restored"
```

### 🔮 **Prevention and Improvement**

#### **Rollback Prevention**
- **Staged Deployments** - Deploy to staging environment first
- **Canary Releases** - Gradual rollout with monitoring
- **Feature Flags** - Enable/disable features without redeployment
- **Health Checks** - Automated health monitoring and alerts
- **Backup Automation** - Regular automated backups before changes

#### **Rollback Improvement**
- **Faster Rollback** - Pre-built rollback scripts and automation
- **Better Monitoring** - Enhanced monitoring during deployments
- **Testing** - Comprehensive testing of rollback procedures
- **Documentation** - Keep rollback procedures updated
- **Training** - Regular team training on rollback procedures

### 📞 **Emergency Contacts**

#### **Escalation Path**
1. **L1 Support** - First responder, basic rollback procedures
2. **L2 Support** - Advanced troubleshooting and complex rollbacks
3. **Engineering Team** - Code-level issues and architecture decisions
4. **Management** - Business impact and communication

#### **Contact Information**
- **Emergency Hotline**: [Phone number]
- **On-call Engineer**: [Contact details]
- **Engineering Slack**: #claude-flow-emergency
- **Status Updates**: #claude-flow-status

---

### 🎯 **Quick Reference Commands**

#### **Emergency Rollback (Copy-Paste Ready)**
```bash
# EMERGENCY ROLLBACK - COPY AND EXECUTE
sudo systemctl stop claude-flow 2>/dev/null || pm2 stop claude-flow-assistant
sudo cp -r /opt/claude-flow /opt/claude-flow-failed-$(date +%Y%m%d-%H%M%S)
BACKUP=$(ls -t /var/backups/claude-flow/backup-*.tar.gz | head -1)
cd /opt/claude-flow && sudo tar -xzf "$BACKUP" --overwrite
sudo systemctl start claude-flow || pm2 start claude-flow-assistant
claude-flow health-check --critical-only && echo "✅ ROLLBACK SUCCESS" || echo "❌ ROLLBACK FAILED"
```

#### **Health Check (Copy-Paste Ready)**
```bash
# QUICK HEALTH CHECK - VERIFY ROLLBACK
echo "Service: $(systemctl is-active claude-flow 2>/dev/null || echo 'PM2')"
claude-flow health-check --quick
claude-flow assistant status
echo "Rollback verification: $(date)"
```

**Remember: In emergency situations, execute rollback first, investigate later. Service restoration is the top priority.**

---

**Need Help?**
- GitHub Issues: https://github.com/ruvnet/claude-flow/issues
- Emergency Docs: `/docs/EMERGENCY_PROCEDURES.md`
- Discord Support: https://discord.gg/claude-flow
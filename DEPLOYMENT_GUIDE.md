# Claude Flow v2.0.0-phase2 Deployment Guide

## 🚀 **Executive Assistant Phase 2 Deployment**

This comprehensive guide covers the deployment of Claude Flow v2.0.0-phase2 with the complete Executive Assistant system.

### 📋 **Pre-Deployment Checklist**

#### **System Requirements**
- ✅ **Node.js**: Version 20.0.0 or higher
- ✅ **npm**: Version 9.0.0 or higher  
- ✅ **Operating System**: Linux, macOS, or Windows 10+
- ✅ **Memory**: Minimum 4GB RAM (8GB recommended for 17-agent system)
- ✅ **Storage**: Minimum 2GB free space
- ✅ **Network**: Stable internet connection for Claude API

#### **Dependencies Check**
```bash
# Verify Node.js version
node --version  # Should be v20+

# Verify npm version  
npm --version   # Should be v9+

# Check available memory
free -h         # Linux
vm_stat         # macOS
systeminfo      # Windows
```

#### **Environment Preparation**
```bash
# Create deployment directory
mkdir -p ~/claude-flow-deployment
cd ~/claude-flow-deployment

# Set up environment variables
export CLAUDE_API_KEY="your-api-key-here"
export NODE_ENV="production"
export CLAUDE_FLOW_ENV="production"
```

### 🔧 **Installation Methods**

#### **Method 1: NPM Installation (Recommended)**
```bash
# Install globally for system-wide access
npm install -g claude-flow@2.0.0-phase2

# Verify installation
claude-flow --version
claude-flow health-check
```

#### **Method 2: Binary Installation**
```bash
# Download platform-specific binary
curl -L https://github.com/ruvnet/claude-flow/releases/download/v2.0.0-phase2/claude-flow-linux-x64 -o claude-flow
chmod +x claude-flow

# Move to system PATH
sudo mv claude-flow /usr/local/bin/
```

#### **Method 3: Docker Deployment**
```bash
# Pull official Docker image
docker pull ruvnet/claude-flow:2.0.0-phase2

# Run with environment variables
docker run -d \
  --name claude-flow-assistant \
  -e CLAUDE_API_KEY="${CLAUDE_API_KEY}" \
  -v $(pwd)/data:/app/data \
  -p 3000:3000 \
  ruvnet/claude-flow:2.0.0-phase2
```

### 🏗️ **Executive Assistant Setup**

#### **Initial Configuration**
```bash
# Initialize with Executive Assistant template
claude-flow init --template executive-assistant --monitoring

# Configure Claude API
claude-flow config set claude.apiKey "${CLAUDE_API_KEY}"
claude-flow config set claude.model "claude-3.5-sonnet"

# Verify configuration
claude-flow config list
```

#### **Assistant Configuration**
```bash
# Create assistant configuration
cat > assistant-config.json << EOF
{
  "name": "Personal Executive Assistant",
  "version": "2.0.0-phase2",
  "agents": {
    "financialManagement": {
      "enabled": true,
      "priority": "high",
      "capabilities": ["budgeting", "investment", "expense-tracking"]
    },
    "travelLogistics": {
      "enabled": true,
      "priority": "high", 
      "capabilities": ["booking", "itinerary", "optimization"]
    },
    "crisisManagement": {
      "enabled": true,
      "priority": "critical",
      "capabilities": ["emergency-response", "coordination", "communication"]
    },
    "culturalIntelligence": {
      "enabled": true,
      "priority": "medium",
      "capabilities": ["cross-cultural", "communication", "research"]
    }
  },
  "coordination": {
    "topology": "hierarchical",
    "maxAgents": 17,
    "strategy": "parallel"
  },
  "memory": {
    "persistent": true,
    "crossSession": true,
    "maxSize": "500MB"
  },
  "monitoring": {
    "enabled": true,
    "metrics": true,
    "performance": true
  }
}
EOF
```

#### **Start Executive Assistant**
```bash
# Start with full agent suite
claude-flow assistant start --config assistant-config.json

# Alternative: Quick start with defaults
claude-flow assistant start --agents 17 --template executive-assistant
```

### 🔄 **Service Configuration**

#### **Systemd Service (Linux)**
```bash
# Create service file
sudo tee /etc/systemd/system/claude-flow.service << EOF
[Unit]
Description=Claude Flow Executive Assistant
After=network.target

[Service]
Type=simple
User=claude-flow
WorkingDirectory=/opt/claude-flow
Environment=NODE_ENV=production
Environment=CLAUDE_API_KEY=${CLAUDE_API_KEY}
ExecStart=/usr/local/bin/claude-flow assistant start --config /opt/claude-flow/assistant-config.json
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable claude-flow
sudo systemctl start claude-flow
sudo systemctl status claude-flow
```

#### **PM2 Process Manager**
```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'claude-flow-assistant',
    script: 'claude-flow',
    args: 'assistant start --config assistant-config.json',
    cwd: '/opt/claude-flow',
    env: {
      NODE_ENV: 'production',
      CLAUDE_API_KEY: process.env.CLAUDE_API_KEY
    },
    max_memory_restart: '2G',
    instances: 1,
    autorestart: true,
    watch: false
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 🔐 **Security Configuration**

#### **API Key Management**
```bash
# Use environment variables (recommended)
export CLAUDE_API_KEY="your-secure-api-key"

# Or use encrypted configuration
claude-flow config set-encrypted claude.apiKey "your-api-key"
```

#### **Network Security**
```bash
# Configure firewall (if using web interface)
sudo ufw allow 3000/tcp
sudo ufw enable

# Set up SSL/TLS (production)
claude-flow ssl setup --cert /path/to/cert.pem --key /path/to/key.pem
```

#### **User Permissions**
```bash
# Create dedicated user
sudo useradd -r -s /bin/false claude-flow
sudo mkdir -p /opt/claude-flow
sudo chown claude-flow:claude-flow /opt/claude-flow
```

### 📊 **Monitoring & Logging**

#### **Enable Monitoring**
```bash
# Configure comprehensive monitoring
claude-flow monitoring enable --metrics --performance --telemetry

# Set up log rotation
claude-flow logging configure --level info --rotate daily --keep 30
```

#### **Health Checks**
```bash
# Built-in health check
claude-flow health-check --comprehensive

# Create monitoring script
cat > monitor.sh << EOF
#!/bin/bash
while true; do
  if ! claude-flow health-check > /dev/null 2>&1; then
    echo "$(date): Claude Flow health check failed"
    systemctl restart claude-flow 2>/dev/null || pm2 restart claude-flow-assistant
  fi
  sleep 300  # Check every 5 minutes
done
EOF
chmod +x monitor.sh
```

#### **Performance Monitoring**
```bash
# Enable performance tracking
claude-flow performance monitor --enable

# View performance metrics
claude-flow analysis performance-report
claude-flow analysis token-usage --breakdown
```

### 🔄 **Backup & Recovery**

#### **Configuration Backup**
```bash
# Backup configuration
claude-flow backup create --include-config --include-memory --output backup-$(date +%Y%m%d).tar.gz

# Automated backup script
cat > backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/claude-flow"
mkdir -p \$BACKUP_DIR
claude-flow backup create --include-all --output \$BACKUP_DIR/backup-\$(date +%Y%m%d-%H%M%S).tar.gz
find \$BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete
EOF
chmod +x backup.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/claude-flow/backup.sh") | crontab -
```

#### **Recovery Procedures**
```bash
# Restore from backup
claude-flow backup restore --file backup-20250104.tar.gz

# Verify restoration
claude-flow health-check --comprehensive
claude-flow assistant status
```

### 🚀 **Production Optimization**

#### **Performance Tuning**
```bash
# Optimize for production workload
claude-flow optimize --production --agents 17

# Configure resource limits
claude-flow config set system.maxMemory "4GB"
claude-flow config set system.maxConcurrentTasks 50
claude-flow config set system.cacheSize "1GB"
```

#### **Scaling Configuration**
```bash
# Horizontal scaling (multiple instances)
claude-flow cluster start --instances 3 --load-balancer

# Vertical scaling (resource allocation)
claude-flow resources allocate --memory 8GB --cpu 4
```

### 🐛 **Troubleshooting**

#### **Common Issues**

**Issue 1: Agent Spawn Failures**
```bash
# Check agent limits
claude-flow config get system.maxAgents

# Increase if needed
claude-flow config set system.maxAgents 20

# Restart service
systemctl restart claude-flow
```

**Issue 2: Memory Issues**
```bash
# Check memory usage
claude-flow analysis memory-usage

# Clear cache
claude-flow cache clear --all

# Optimize memory settings
claude-flow optimize --memory
```

**Issue 3: API Rate Limits**
```bash
# Check API usage
claude-flow analysis token-usage --today

# Configure rate limiting
claude-flow config set claude.rateLimit 50
claude-flow config set claude.retryDelay 1000
```

#### **Log Analysis**
```bash
# View recent logs
claude-flow logs --tail 100

# Search for errors
claude-flow logs --grep "ERROR" --last-hour

# Export logs for analysis
claude-flow logs export --format json --output logs-$(date +%Y%m%d).json
```

### 📞 **Support & Maintenance**

#### **Regular Maintenance**
```bash
# Weekly maintenance script
cat > maintenance.sh << EOF
#!/bin/bash
echo "Starting weekly maintenance..."

# Update dependencies
npm update -g claude-flow

# Clean cache
claude-flow cache clean

# Optimize database
claude-flow database optimize

# Generate health report
claude-flow health-check --comprehensive --report

echo "Maintenance completed at \$(date)"
EOF
chmod +x maintenance.sh

# Schedule weekly maintenance
(crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/claude-flow/maintenance.sh") | crontab -
```

#### **Update Procedures**
```bash
# Check for updates
claude-flow update check

# Update to latest version
claude-flow update install

# Verify update
claude-flow --version
claude-flow health-check
```

### ✅ **Deployment Verification**

#### **Verification Checklist**
```bash
# 1. Service Status
systemctl status claude-flow  # or pm2 status

# 2. Health Check
claude-flow health-check --comprehensive

# 3. Agent Status
claude-flow assistant status --detailed

# 4. Performance Metrics
claude-flow analysis performance-report

# 5. Memory Usage
claude-flow analysis memory-usage

# 6. API Connectivity
claude-flow test api-connection

# 7. File Permissions
ls -la /opt/claude-flow/

# 8. Log Health
claude-flow logs --tail 10 --no-errors

echo "✅ Deployment verification complete!"
```

### 🎯 **Next Steps**

After successful deployment:

1. **Configure Workflows** - Set up your specific agent workflows
2. **Customize Agents** - Modify agent capabilities for your needs
3. **Set Up Monitoring** - Configure monitoring dashboards
4. **Train Agents** - Use the neural training features
5. **Integrate Systems** - Connect with your existing tools

### 📚 **Additional Resources**

- **Configuration Reference**: `/docs/CONFIGURATION.md`
- **API Documentation**: `/docs/API_REFERENCE.md`
- **Troubleshooting Guide**: `/docs/TROUBLESHOOTING.md`
- **Performance Tuning**: `/docs/PERFORMANCE_TUNING.md`

---

**Need Help?** 
- GitHub Issues: https://github.com/ruvnet/claude-flow/issues
- Documentation: https://github.com/ruvnet/claude-flow/docs
- Discord Community: https://discord.gg/claude-flow

**Deployment completed successfully! Your Executive Assistant is ready to serve. 🎉**
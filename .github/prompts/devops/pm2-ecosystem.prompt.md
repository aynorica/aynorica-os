---
mode: agent
description: Configure PM2 ecosystem for multi-service orchestration
---

# PM2 Service Configuration Prompt

Set up production process management with PM2.

## Basic Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      // === Identity ===
      name: 'api-server',
      script: './dist/main.js',
      cwd: '/path/to/project',
      
      // === Scaling ===
      instances: 'max',        // Use all CPU cores (cluster mode)
      exec_mode: 'cluster',    // Enable load balancing
      
      // === Reliability ===
      max_memory_restart: '500M',
      max_restarts: 10,
      min_uptime: '5s',
      restart_delay: 1000,
      kill_timeout: 5000,
      
      // === Graceful Startup ===
      wait_ready: true,        // Wait for process.send('ready')
      listen_timeout: 10000,   // Timeout for ready signal
      
      // === Logs ===
      out_file: '/var/log/app/out.log',
      error_file: '/var/log/app/error.log',
      merge_logs: true,        // Don't suffix with process ID
      time: true,              // Prefix with timestamps
      
      // === Environment ===
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80,
      },
    },
  ],
};
```

## Multi-Service Pattern

```javascript
module.exports = {
  apps: [
    // === Core Services ===
    {
      name: 'gateway',
      script: 'dist/main.js',
      cwd: '/app/packages/gateway',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: {
        PORT: 3000,
        WORKER_URL: 'http://localhost:3001',
      },
    },
    {
      name: 'worker',
      script: 'dist/main.js',
      cwd: '/app/packages/worker',
      instances: 1,
      max_memory_restart: '1G',
      env: {
        PORT: 3001,
        DATABASE_URL: 'postgresql://localhost:5432/db',
      },
    },
    {
      name: 'bot',
      script: 'dist/main.js',
      cwd: '/app/packages/telegram-bot',
      max_memory_restart: '500M',
      env: {
        GATEWAY_URL: 'http://localhost:3000',
      },
    },
    
    // === MCP Servers (Non-Node) ===
    {
      name: 'mcp-workspace',
      script: 'bash',
      args: '-c "source ~/.local/bin/env && uvx workspace-mcp --port 8100"',
      cwd: '/app',
      interpreter: 'none',
      max_memory_restart: '200M',
    },
  ],
};
```

## Non-Node Scripts

```javascript
// Python script
{
  name: 'python-worker',
  script: 'worker.py',
  interpreter: 'python3',
  args: '--config production.yaml',
},

// Bash script
{
  name: 'backup-job',
  script: 'backup.sh',
  interpreter: 'bash',
  cron_restart: '0 2 * * *',  // Run daily at 2 AM
  autorestart: false,
},

// Complex bash command
{
  name: 'mcp-server',
  script: 'bash',
  args: '-c "source ~/.local/bin/env && uvx some-mcp-server"',
  interpreter: 'none',  // Run directly
}
```

## NestJS Graceful Shutdown

```typescript
// main.ts
app.enableShutdownHooks();

// Signal PM2 that app is ready
process.send?.('ready');

// Handle SIGINT gracefully
process.on('SIGINT', async () => {
  await app.close();
  process.exit(0);
});
```

## Startup Persistence

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save

# After system reboot, processes auto-restore
```

## Environment-Specific Startup

```bash
# Start with production environment
pm2 start ecosystem.config.js --env production

# Restart with updated environment
pm2 restart api --update-env
```

## Log Management

```bash
# Install log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# View logs
pm2 logs
pm2 logs gateway --lines 200
```

## Command Reference

| Command | Description |
|---------|-------------|
| `pm2 start ecosystem.config.js` | Start all apps |
| `pm2 stop all` | Stop all apps |
| `pm2 restart all` | Restart all apps |
| `pm2 reload all` | Zero-downtime reload |
| `pm2 delete all` | Remove all apps |
| `pm2 list` | List running apps |
| `pm2 monit` | Terminal dashboard |
| `pm2 save` | Save process list |
| `pm2 resurrect` | Restore saved processes |
| `pm2 start ecosystem.config.js --only gateway` | Start specific app |

## Memory Limits Reference

| App Type | Recommended Limit |
|----------|-------------------|
| Simple API | 256M - 512M |
| Complex API | 512M - 1G |
| Worker/Background | 256M - 512M |
| MCP Server | 128M - 256M |
| Heavy Processing | 1G - 2G |

## Anti-Patterns

- ❌ Running PM2 as root
- ❌ Using `watch: true` in production
- ❌ Not saving process list (`pm2 save`)
- ❌ Ignoring logs (disk fills up)
- ❌ Hardcoding secrets in ecosystem.config.js

---
applyTo: "**"
---

# Infrastructure Services

## 🐘 PostgreSQL Database

**Docker-based Postgres 15 instance for persistent data storage.**

### Configuration:
- **Location**: `.env.postgres` (editable credentials file)
- **Connection**: `localhost:5432` (exposed port)
- **Docker Compose**: `docker-compose.postgres.yml`
- **Volume**: `aynorica-os_db_data` (persistent storage)

### Management Commands:
```bash
# Start database
scripts/start-postgres.sh

# Stop database
docker compose -f docker-compose.postgres.yml down

# Connect via container
docker compose -f docker-compose.postgres.yml exec -T db psql -U $POSTGRES_USER -d $POSTGRES_DB

# Check status
docker compose -f docker-compose.postgres.yml ps

# View logs
docker compose -f docker-compose.postgres.yml logs -f db
```

### Connection Details:
- **Credentials**: Stored in `.env.postgres` (user-editable)
- **Default DB**: `aynorica_db`
- **Port**: 5432 (mapped to host)
- **Health Check**: Built-in `pg_isready` monitoring

### Use Cases:
- Gateway registry persistence
- Worker state management
- Session/task history
- Analytics & metrics storage
- User preferences & settings

**Resource Document:** `Atlas/30 Resources/PostgreSQL Database Infrastructure.md`

**Status:** ✅ Initialized and accepting connections

---

## 🔴 Redis Cache

Docker-based Redis instance for caching and ephemeral state.

### Configuration:
- **Location**: `.env.redis` (editable credentials file)
- **Connection**: `localhost:6379` (exposed port)
- **Docker Compose**: `docker-compose.redis.yml`
- **Volume**: `redis_data` (optional persistence)

### Management Commands:
```bash
# Start
scripts/start-redis.sh

# Stop
docker compose -f docker-compose.redis.yml down

# Check status
docker compose -f docker-compose.redis.yml ps

# Connect via container
docker compose -f docker-compose.redis.yml exec -T redis redis-cli -a "$REDIS_PASSWORD" ping
```

### Notes:
- Edit `.env.redis` before starting to set REDIS_PASSWORD
- Use Redis for caching, sessions, rate-limiting, or Pub/Sub

---
applyTo: "**"
---
<!-- 
  This file has been templatized from aynorica-os.
  Replace {{PLACEHOLDERS}} with your own values.
  Synced: 2025-12-03T21:05:58.737Z
-->



# MCP Integrations

## 📅 Google Workspace MCP (Calendar)

**Direct access to {{USER_NAME}}'s Google Calendar via native MCP tools.**

| Tool | Purpose | Parameters |
|------|---------|------------|
| `mcp_googleworkspa_list_calendars` | List all calendars | `user_google_email` |
| `mcp_googleworkspa_get_events` | Get calendar events | `user_google_email`, `calendar_id`, `time_min`, `time_max`, `max_results`, `query` |
| `mcp_googleworkspa_create_event` | Create new event | `user_google_email`, `summary`, `start_time`, `end_time`, `description`, `location`, `attendees` |
| `mcp_googleworkspa_modify_event` | Update existing event | `user_google_email`, `event_id`, + any fields to change |

### Configuration:
- **User Email**: `{{USER_EMAIL}}`
- **Available Calendars**:
  - Primary: `{{USER_EMAIL}}`
  - Family: `family05333030018959857186@group.calendar.google.com`
  - Holidays (Turkey): `en.turkish#holiday@group.v.calendar.google.com`
  - Holidays (Iran): `en.ir#holiday@group.v.calendar.google.com`
- **OAuth**: Authenticated via Google Cloud Project "aynorica"
- **MCP Config**: `~/.google_workspace_mcp/` (WSL) + VS Code global `mcp.json`

### Usage Examples:
```bash
# List this week's events
mcp_googleworkspa_get_events(user_google_email="{{USER_EMAIL}}", time_min="2025-11-30", time_max="2025-12-07")

# Create a meeting
mcp_googleworkspa_create_event(user_google_email="{{USER_EMAIL}}", summary="Team Sync", start_time="2025-12-01T10:00:00{{TIMEZONE_OFFSET}}", end_time="2025-12-01T11:00:00{{TIMEZONE_OFFSET}}")
```

---

## 📓 Obsidian MCP (Vault Operations)

**Direct access to Obsidian through the Semantic MCP Plugin!**

> ⚠️ **Full Docs**: `Atlas/30 Resources/Obsidian MCP Server.md`

| Tool | Purpose |
|------|---------|
| 📁 **vault** | File operations (list, read, create, search, move, split) |
| ✏️ **edit** | Content modification (window, append, patch) |
| 👁️ **view** | Display & open in Obsidian |
| 🕸️ **graph** | Link navigation & analysis |
| 📊 **dataview** | Execute DQL queries |
| ℹ️ **system** | Server info & web fetch |

### Connection:
- **Server URL**: `https://localhost:3443`
- **API Key**: `jJDP0Z3Iv9SgWVToB0je1YDsHFMWET8IBSWND_5d_T4`
- **Protocol**: JSON-RPC 2.0 over HTTPS

---

## ⚠️ MCP Critical Reminders

1. **WSL Terminal**: Use `curl.exe` (Windows binary), NOT `curl` for Obsidian MCP
2. **Google Calendar**: Always pass `user_google_email="{{USER_EMAIL}}"`
3. **Timezone**: Use `{{TIMEZONE_OFFSET}}` (Istanbul) for event times
4. **Connection Test**: Verify servers are running before operations

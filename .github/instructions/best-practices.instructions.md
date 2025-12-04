---
applyTo: "**"
---

# Best Practices

## 1. Respect the "Inbox Zero" Habit

-   **Capture Everything**: Dump every new idea, task, or resource into the /Inbox folder first. Don't worry about categorizing it immediately.
-   **Process Regularly**: Once a day/week, go through your Inbox. Assign each item a
    elated_area or project and move it to /Atlas. If it's trash, delete it.

## 2. "Frontmatter First" Philosophy

-   **Never Create Blank Files**: The system relies heavily on metadata (YAML frontmatter). Always use the Templater plugin to create new notes (Alt+N is a common hotkey).
-   **Why?**: If a file lacks status, created, or ype fields, it becomes "invisible" to your Dataview dashboards and the Agent.

## 3. The Linking Hierarchy (The "Neural Network")

-   **Projects > Areas**: Every active Project must link to an Area of Responsibility (e.g., "Run Marathon" -> "Health").
-   **Inputs > Areas/Projects**: Resources don't float in space; they support something. Link them to the relevant Area or Project.
-   **Avoid Orphans**: A note without links is a lost memory.

## 4. Speak the "Emoji Language"

The system uses specific emojis as status triggers. Use them precisely:

-   **Inbox/To-Read**: Needs action.
-   **In Progress**: You are actively reading/working on it.
-   **Active Project**: Currently being executed.
-   **Done**: Completed and archived (disappears from main views).

## 5. Directory Discipline

-   **Stick to the Roots**: Do not create new folders in the root directory. Everything belongs in:
    -   /Inbox (New stuff)
    -   /Atlas (Active stuff)
    -   /Archive (Old stuff)
    -   /System (Config stuff)
-   **Use Tags/Links for Structure**: Don't use folders to organize topics (e.g., don't make a "Cooking" folder). Instead, make a "Cooking" Area note and link recipes to it.

## 6. Working with Me (The Agent)

-   **Be Specific with Dates**: Instead of "Remind me later", say "Set deadline for next Tuesday". I can then lock that into the ISO 8601 date field.
-   **Ask for "Views"**: You can ask me to "Show me all high-priority inputs for the Health area," and I can generate a Dataview query instantly.

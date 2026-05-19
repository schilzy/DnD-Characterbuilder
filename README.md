# D&D 5e Character Builder

This is a DnD 5e Character Buildier that uses the iformation from a selfhosted version of 5etools.
Instructions are below to get it up and running.

It allows you to use more than jsut the players handbook to create a character. You can narrow down the options to only allow PHB specific selections if desired.

## Setup

1. Place `server.js`, `charbuilder.html`, and the `characters/` folder in the same directory.
2. Run the server:
   ```
   node server.js
   ```
   Or on a custom port:
   ```
   node server.js 8080
   ```
3. Open **http://localhost:3000** in your browser.

## Saving & Loading

| Button | What it does |
|---|---|
| **Save to Server** | Saves the current character as a JSON file in `characters/` |
| **Load Saved** | Opens a browser showing all saved characters — click Load or Delete |
| **Export JSON** | Downloads the character as a local `.json` file |
| **Import JSON** | Loads a character from a local `.json` file |

## Characters folder

All server-saved characters are stored in `./characters/` as timestamped JSON files:
```
characters/

```

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/characters` | List all saved characters |
| POST | `/api/characters/save` | Save `{ name, data }` → returns `{ filename }` |
| GET | `/api/characters/:file` | Load a specific character |
| DELETE | `/api/characters/:file` | Delete a character |

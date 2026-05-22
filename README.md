# D&D 5e Character Builder

This is a DnD 5e Character Builder that uses the information from a selfhosted version of 5etools.
Instructions are below to get it up and running.

It allows you to use more than just the Players Handbook to create a character. You can narrow down the options to only allow PHB specific selections if desired.

## Setup

1. Place `server.js`, `charbuilder.html`, and the `characters/` folder in the same directory. ( just create the characters directory), best place to put them is in your root 5etools folder, but you do you.
2. Run the server:
   ```
   node server.js
   ```
   Or on a custom port:
   ```
   node server.js 8080
   ```
3. Open **http://localhost:3000** in your browser. or at whatever IP you have set 5etools to run at then /charbuilder.html

## Saving & Loading

| Button             | What it does                                                        |
| ------------------ | ------------------------------------------------------------------- |
| **Save to Server** | Saves the current character as a JSON file in `characters/`         |
| **Load Saved**     | Opens a browser showing all saved characters — click Load or Delete |
| **Export JSON**    | Downloads the character as a local `.json` file                     |
| **Import JSON**    | Loads a character from a local `.json` file                         |

## Characters folder

All server-saved characters are stored in `./characters/` as timestamped JSON files:

```
characters/

```

## API

| Method | Path                    | Description                                    |
| ------ | ----------------------- | ---------------------------------------------- |
| GET    | `/api/characters`       | List all saved characters                      |
| POST   | `/api/characters/save`  | Save `{ name, data }` → returns `{ filename }` |
| GET    | `/api/characters/:file` | Load a specific character                      |
| DELETE | `/api/characters/:file` | Delete a character                             |

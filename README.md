# Open With Extension

A VS Code extension that allows you to quickly open the current workspace folder with your preferred IDE.

## Features

- Configurable list of IDEs with their respective commands
- Quick Pick interface to select from available IDEs
- Opens the current workspace folder in the selected IDE via terminal
- Pre-configured with common IDEs (Rider, WebStorm, IntelliJ IDEA, Visual Studio, etc.)

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Open With" and select the command
3. Choose your preferred IDE from the list
4. The extension will open a terminal and execute the IDE command in the current folder

## Configuration

You can customize the available IDEs in VS Code settings:

```json
{
  "openWith.ides": {
    "Rider": "rider",
    "WebStorm": "webstorm",
    "IntelliJ IDEA": "idea",
    "Visual Studio": "devenv",
    "Sublime Text": "subl",
    "Atom": "atom",
    "Code": "code",
    "Custom IDE": "your-custom-command"
  }
}
```

## Requirements

- The IDE commands must be available in your system PATH
- A workspace folder must be open in VS Code

## Development

To set up for development:

1. Install dependencies: `npm install`
2. Compile: `npm run compile`
3. Press F5 to open a new Extension Development Host window
4. Test the extension in the new window

## Building

To build the extension:

```bash
npm run compile
```

To watch for changes during development:

```bash
npm run watch
```

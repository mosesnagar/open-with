import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
    // Command: Open With
    const openWithDisposable = vscode.commands.registerCommand('openWith.openFolder', async () => {
        const config = vscode.workspace.getConfiguration('openWith');
        const ides: { [key: string]: string } = config.get('ides', {});
        if (Object.keys(ides).length === 0) {
            vscode.window.showWarningMessage('No IDEs configured. Please configure IDEs in settings.');
            return;
        }
        const quickPickItems: vscode.QuickPickItem[] = Object.keys(ides).map(name => ({
            label: name,
            description: ides[name]
        }));
        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select IDE to open current folder'
        });
        if (selected) {
            const command = ides[selected.label];
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder is open.');
                return;
            }
            const folderPath = workspaceFolder.uri.fsPath;
            const terminal = vscode.window.createTerminal({
                name: `Open with ${selected.label}`,
                cwd: folderPath
            });
            terminal.sendText(`${command} .`);
            terminal.show();
            vscode.window.showInformationMessage(`Opening folder with ${selected.label}...`);
        }
    });

    // Command: Configure IDEs (Webview)
    const configureDisposable = vscode.commands.registerCommand('openWith.configure', async () => {
        const panel = vscode.window.createWebviewPanel(
            'openWithConfigure',
            'Configure IDEs',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        const config = vscode.workspace.getConfiguration('openWith');
        const ides: { [key: string]: string } = config.get('ides', {});
        panel.webview.html = getWebviewContent(ides);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'save') {
                await config.update('ides', message.ides, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('IDEs updated successfully!');
            }
        });
    });

    context.subscriptions.push(openWithDisposable, configureDisposable);
}

function getWebviewContent(ides: { [key: string]: string }): string {
    const idesArray = Object.entries(ides).map(([name, cmd]) => ({ name, cmd }));
    // Simple HTML/JS for editing IDEs
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configure IDEs</title>
    <style>
        body { font-family: sans-serif; margin: 1.5em; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 0.5em; }
        input { width: 100%; }
        button { margin: 0.2em; }
    </style>
</head>
<body>
    <h2>Configure IDEs</h2>
    <form id="idesForm">
        <table>
            <thead>
                <tr><th>Name</th><th>Command</th><th>Action</th></tr>
            </thead>
            <tbody id="idesTable">
            </tbody>
        </table>
        <button type="button" id="addBtn">Add IDE</button>
        <button type="submit">Save</button>
    </form>
    <script>
        const vscode = acquireVsCodeApi();
        let ides = ${JSON.stringify(idesArray)};
        function renderTable() {
            const table = document.getElementById('idesTable');
            table.innerHTML = '';
            ides.forEach((ide, idx) => {
                const row = document.createElement('tr');
                // Name cell
                const nameCell = document.createElement('td');
                const nameInput = document.createElement('input');
                nameInput.value = ide.name;
                nameInput.oninput = (e) => { ides[idx].name = nameInput.value; };
                nameCell.appendChild(nameInput);
                row.appendChild(nameCell);
                // Command cell
                const cmdCell = document.createElement('td');
                const cmdInput = document.createElement('input');
                cmdInput.value = ide.cmd;
                cmdInput.oninput = (e) => { ides[idx].cmd = cmdInput.value; };
                cmdCell.appendChild(cmdInput);
                row.appendChild(cmdCell);
                // Action cell
                const actionCell = document.createElement('td');
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.textContent = 'Remove';
                removeBtn.onclick = () => { ides.splice(idx, 1); renderTable(); };
                actionCell.appendChild(removeBtn);
                row.appendChild(actionCell);
                table.appendChild(row);
            });
        }
        document.getElementById('addBtn').onclick = () => { ides.push({ name: '', cmd: '' }); renderTable(); };
        document.getElementById('idesForm').onsubmit = (e) => {
            e.preventDefault();
            // Remove empty entries
            ides = ides.filter(ide => ide.name && ide.cmd);
            const idesObj = {};
            ides.forEach(ide => { idesObj[ide.name] = ide.cmd; });
            vscode.postMessage({ command: 'save', ides: idesObj });
        };
        renderTable();
    </script>
</body>
</html>
`;
}

export function deactivate() {}

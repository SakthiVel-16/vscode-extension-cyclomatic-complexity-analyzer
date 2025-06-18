import * as vscode from 'vscode';
import fetch from 'node-fetch'; // Make sure you've run 'npm install node-fetch@2.6.1'

let currentPanel: vscode.WebviewPanel | undefined = undefined; // Holds our webview panel instance
let debounceTimeout: NodeJS.Timeout | undefined = undefined; // For debouncing keystrokes
const DEBOUNCE_DELAY_MS = 500; // 500ms delay after last keystroke to trigger analysis

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, "cyclomatic-complexity-analyzer" is now active!');

    // 1. Register the command for manual analysis (triggered by Ctrl+Shift+P)
    let disposableCommand = vscode.commands.registerCommand('cyclomatic-complexity-analyzer.analyzeComplexity', async () => {
        // Call the analysis function, forcing panel creation if it doesn't exist
        await performAnalysis(true);
    });
    context.subscriptions.push(disposableCommand); // Add command to disposables for cleanup

    // 2. Listen for text document changes for real-time analysis (debounced)
    vscode.workspace.onDidChangeTextDocument(event => {
        // Only analyze if the change is in the active editor and it's a relevant language
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === event.document) { // Ensure change is in the currently active editor
            const languageId = editor.document.languageId;
            if (['java', 'javascript', 'typescript', 'python'].includes(languageId)) {
                // Clear any existing debounce timeout to reset the timer
                if (debounceTimeout) {
                    clearTimeout(debounceTimeout);
                }

                // Set a new timeout to perform analysis after a short delay
                debounceTimeout = setTimeout(() => {
                    performAnalysis(); // Call analysis without forcing panel creation (updates existing)
                }, DEBOUNCE_DELAY_MS);
            }
        }
    });

    // 3. Listen for active editor changes to trigger initial analysis when opening/switching files
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const languageId = editor.document.languageId;
            if (['java', 'javascript', 'typescript', 'python'].includes(languageId)) {
                performAnalysis(); // Perform analysis for the newly active supported file
            }
        }
    });
}

/**
 * Performs the cyclomatic complexity analysis by calling the backend API
 * and updates/creates the Webview panel with the results.
 * @param forcePanelCreation If true, ensures the webview panel is created if it doesn't exist.
 * Otherwise, it only updates an existing panel.
 */
async function performAnalysis(forcePanelCreation: boolean = false) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        // Only show this info if explicitly triggered by command, not background change
        if (forcePanelCreation) {
            vscode.window.showInformationMessage('No active editor found to analyze!');
        }
        return;
    }

    const code = editor.document.getText();
    const languageId = editor.document.languageId;

    let backendLanguage: string;
    switch (languageId) {
        case 'typescript':
        case 'javascript':
            backendLanguage = 'javascript'; // Map VS Code's 'typescript' to backend's 'javascript'
            break;
        case 'java':
            backendLanguage = 'java';
            break;
        case 'python':
            backendLanguage = 'python';
            break;
        default:
            // Only show error for unsupported languages if explicitly triggered by command
            if (forcePanelCreation) {
                vscode.window.showErrorMessage(`Unsupported language in VS Code for analysis: ${languageId}. Supported: Java, JavaScript, Python.`);
            }
            return; // Exit if language is not supported
    }

    const API_URL = 'https://cyclomatic-complexity-analyzer-z1fm.onrender.com/api/complexity/analyze';

    try {
        // Provide visual feedback for analysis, but avoid spamming messages during typing
        if (forcePanelCreation) {
             vscode.window.showInformationMessage(`Analyzing ${backendLanguage} code...`);
        } else {
             // For background real-time updates, log to console instead of showing popup
             console.log(`Debounced analysis triggered for ${backendLanguage} code.`);
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code, language: backendLanguage })
        });

        if (!response.ok) {
            // If the API returns an error status (e.g., 400, 500)
            const errorData = await response.json() as { error?: string };
            vscode.window.showErrorMessage(`Analysis failed: ${errorData.error || response.statusText}`);
            return;
        }

        const result = await response.json(); // Parse the successful JSON response

        // --- Webview Logic to Update or Create Panel ---
        if (currentPanel) {
            // If panel already exists, just send it the new data
            currentPanel.webview.postMessage({ type: 'analysisResult', payload: result });
            // Reveal the panel if it's not currently visible or if explicitly commanded
            if (!currentPanel.visible || forcePanelCreation) {
                 currentPanel.reveal(vscode.ViewColumn.Two);
            }
        } else if (forcePanelCreation) { // Only create a new panel if explicitly triggered by command
            currentPanel = vscode.window.createWebviewPanel(
                'complexityAnalyzer', // Internal ID for the webview
                'Complexity Analysis Results', // Title displayed to the user
                vscode.ViewColumn.Two, // Show in the second editor column
                { enableScripts: true } // Crucial: Allows JavaScript to run in the webview
            );

            // Set the HTML content for the webview
            currentPanel.webview.html = getWebviewContent();

            // Handle messages sent from the webview (if needed later)
            currentPanel.webview.onDidReceiveMessage(
                message => {
                    console.log('Message from webview:', message);
                }
                // Removed 'undefined, context.subscriptions' - THIS WAS THE FIX
            );

            // When the panel is closed by the user, clear our reference to it
            currentPanel.onDidDispose(
                () => {
                    currentPanel = undefined;
                }
                // Removed 'null, context.subscriptions' - THIS WAS THE FIX
            );

            // Send the initial analysis result to the newly created webview
            currentPanel.webview.postMessage({ type: 'analysisResult', payload: result });
        }
        
        // Removed `vscode.window.showInformationMessage` here to avoid popups on every keystroke

    } catch (error: any) {
        // Show connection error messages carefully to avoid spamming
        // Show only if explicitly commanded, or if the panel isn't already open
        if (forcePanelCreation || !currentPanel) {
            vscode.window.showErrorMessage(`Could not connect to complexity analyzer backend. Is it running? Error: ${error.message}`);
        }
        console.error(`Error during analysis: ${error.message}`);
    }
}

/**
 * Provides the static HTML content for the webview panel.
 * Includes basic styling and a script to receive and render analysis data.
 */
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Complexity Analysis Results</title>
            <style>
                /* Use VS Code theme variables for better integration */
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    padding: 20px;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                h1 { color: var(--vscode-textLink-foreground); }
                h2 { color: var(--vscode-textLink-foreground); margin-top: 20px; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                th, td {
                    border: 1px solid var(--vscode-editorGroup-border);
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: var(--vscode-editorWidget-background);
                    font-weight: bold;
                }
                /* Status styling */
                .status-simple { color: var(--vscode-gitDecoration-untrackedResourceForeground); font-weight: bold; } /* Green for simple */
                .status-moderate { color: var(--vscode-gitDecoration-modifiedResourceForeground); font-weight: bold; } /* Orange for moderate */
                .status-complex { color: var(--vscode-list-errorForeground); font-weight: bold; } /* Red for complex */
            </style>
        </head>
        <body>
            <h1>Cyclomatic Complexity Analysis</h1>
            <div id="summary"></div>
            <div id="methods-details"></div>

            <script>
                // acquireVsCodeApi is a special function provided by VS Code for webviews
                // It allows the webview to send messages back to the extension (if needed)
                const vscode = acquireVsCodeApi(); 

                // Listen for messages from the extension (our analysis results)
                window.addEventListener('message', event => {
                    const message = event.data; // The JSON data sent from our extension
                    if (message.type === 'analysisResult') {
                        const result = message.payload;
                        
                        // --- Update Summary Section ---
                        const summaryDiv = document.getElementById('summary');
                        summaryDiv.innerHTML = \`
                            <h2>Summary</h2>
                            <p><strong>Total Methods:</strong> \${result.summary.totalMethods}</p>
                            <p><strong>Total Complexity:</strong> \${result.summary.totalComplexity}</p>
                        \`;

                        // --- Update Methods Details Table ---
                        const methodsDetailsDiv = document.getElementById('methods-details');
                        let tableHtml = \`
                            <h2>Methods Details</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Method Name</th>
                                        <th>Line</th>
                                        <th>Complexity</th>
                                        <th>Status</th>
                                        <th>Nesting Depth</th>
                                    </tr>
                                </thead>
                                <tbody>
                        \`;

                        // Iterate through the 'methods' array in the result and build table rows
                        result.methods.forEach(method => {
                            tableHtml += \`
                                <tr>
                                    <td>\${method.name}</td>
                                    <td>\${method.line}</td>
                                    <td>\${method.complexity}</td>
                                    <td class="status-\${method.status.toLowerCase()}">\${method.status}</td>
                                    <td>\${method.nestingDepth}</td>
                                </tr>
                            \`;
                        });

                        tableHtml += \`
                                </tbody>
                            </table>
                        \`;
                        methodsDetailsDiv.innerHTML = tableHtml;
                    }
                });
            </script>
        </body>
        </html>
    `;
}

/**
 * This method is called when your extension is deactivated.
 * Performs cleanup for disposables like webviews and timeouts.
 */
export function deactivate() {
    console.log('"cyclomatic-complexity-analyzer" is now deactivated!');
    if (currentPanel) {
        currentPanel.dispose(); // Dispose the webview panel
    }
    if (debounceTimeout) {
        clearTimeout(debounceTimeout); // Clear any pending debounce timeout
    }
}
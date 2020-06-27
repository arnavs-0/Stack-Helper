"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let search = vscode.commands.registerCommand('stackhelper.search', () => {
        // The code you place here will be executed every time your command is executed
        vscode.window.showInputBox({
            prompt: 'What is your error?'
        }).then((result) => {
            if (result) {
                openBrowser(result);
            }
        });
        context.subscriptions.push(search);
    });
    //use Stack Overflow to search selected text
    context.subscriptions.push(vscode.commands.registerCommand('stackhelper.find', () => {
        // getting a list of problems
        let diagnostics = vscode.languages.getDiagnostics();
        // formation of the error selection list
        let errorMessages = [];
        diagnostics.forEach((value) => {
            value[1].forEach((value) => {
                let error = value.message;
                if (value.source !== undefined) {
                    error += ' ' + value.source;
                }
                errorMessages.push(error);
            });
        });
        // show the selection window
        vscode.window.showQuickPick(errorMessages)
            // process the response
            .then((value) => {
            if (value !== undefined) {
                openBrowser(value);
            }
        });
    }));
    function openBrowser(str) {
        let searchQuery = "http://stackoverflow.com/search?q=" + encodeURI(str.replace(/["'\-\\\/\.\,\|\(\)\[\]\~\`\^\:\#\;\%]/gm, ''));
        vscode.env.openExternal(vscode.Uri.parse(searchQuery));
    }
    let _statusBarItem;
    let highlightEnabled = true;
    let highlightErrorsEnabled = vscode.commands.registerCommand('stackhelper.enableError', () => {
        highlightEnabled = true;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            updateErrorHighlighting(activeTextEditor.document.uri);
        }
    });
    context.subscriptions.push(highlightErrorsEnabled);
    let highlightErrorsDisabled = vscode.commands.registerCommand('stackhelper.disableError', () => {
        highlightEnabled = false;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            updateErrorHighlighting(activeTextEditor.document.uri);
        }
    });
    context.subscriptions.push(highlightErrorsDisabled);
    function GetErrorBackgroundColor() {
        const errorColor = "rgba(250,50,50,0.5)";
        return errorColor;
    }
    function GetErrorTextColor() {
        const errorTextColor = "rgba(240,240,240,1.0)";
        return errorTextColor;
    }
    function GetFontStyle() {
        const fontStyle = "bold";
        return fontStyle;
    }
    function GetFontWeight() {
        const fontWeight = "normal";
        return fontWeight;
    }
    function GetMargin() {
        const margin = "40px";
        return margin;
    }
    function Getstatusbar() {
        const statusbar = "hide";
        return statusbar;
    }
    function AddTextPrefix() {
        const addTextPrefix = false;
        return addTextPrefix;
    }
    let decortypeError = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: GetErrorBackgroundColor()
    });
    vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => { onChangedDiagnostics(diagnosticChangeEvent); }, null, context.subscriptions);
    vscode.workspace.onDidOpenTextDocument(textDocument => { updateErrorHighlighting(textDocument.uri); }, null, context.subscriptions);
    // Update on editor switch.
    vscode.window.onDidChangeActiveTextEditor(textEditor => {
        if (textEditor === undefined) {
            return;
        }
        updateErrorHighlighting(textEditor.document.uri);
    }, null, context.subscriptions);
    /**
     * Invoked by onDidChangeDiagnostics() when the language diagnostics change.
     *
     * @param {vscode.DiagnosticChangeEvent} diagnosticChangeEvent - Contains info about the change in diagnostics.
     */
    function onChangedDiagnostics(diagnosticChangeEvent) {
        if (!vscode.window) {
            return;
        }
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return;
        }
        // Many URIs can change - we only need to decorate the active text editor
        for (const uri of diagnosticChangeEvent.uris) {
            // Only update decorations for the active text editor.
            if (uri.fsPath === activeTextEditor.document.uri.fsPath) {
                updateErrorHighlighting(uri);
                break;
            }
        }
    }
    /**
     * Update the editor decorations for the provided URI. Only if the URI scheme is "file" is the function
     * processed. (It can be others, such as "git://<something>", in which case the function early-exits).
     *
     * @param {vscode.Uri} uriToDecorate - Uri to add decorations to.
     */
    function updateErrorHighlighting(uriToDecorate) {
        if (!uriToDecorate) {
            return;
        }
        // Only process "file://" URIs.
        if (uriToDecorate.scheme !== "file") {
            return;
        }
        if (!vscode.window) {
            return;
        }
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return;
        }
        if (!activeTextEditor.document.uri.fsPath) {
            return;
        }
        const decorOptionsForError = [];
        let numErrors = 0;
        if (highlightEnabled) {
            let diagnosticRead = {};
            let diagnostic;
            // Iterate over each diagnostic that VS Code has reported for this file. For each one, add to
            // a list of objects, grouping together diagnostics which occur on a single line.
            for (diagnostic of vscode.languages.getDiagnostics(uriToDecorate)) {
                let key = "line" + diagnostic.range.start.line;
                if (diagnosticRead[key]) {
                    // Already added an object for this key, so augment the arrayDiagnostics[] array.
                    diagnosticRead[key].arrayDiagnostics.push(diagnostic);
                }
                else {
                    // Create a new object for this key, specifying the line: and a arrayDiagnostics[] array
                    diagnosticRead[key] = {
                        line: diagnostic.range.start.line,
                        arrayDiagnostics: [diagnostic]
                    };
                }
                switch (diagnostic.severity) {
                    case 0:
                        numErrors += 1;
                        break;
                }
            }
            let key;
            let addMessagePrefix = AddTextPrefix();
            for (key in diagnosticRead) // Iterate over property values (not names)
             {
                let readDiagnostic = diagnosticRead[key];
                let messagePrefix = "";
                if (addMessagePrefix) {
                    if (readDiagnostic.arrayDiagnostics.length > 1) {
                        // If > 1 diagnostic for this source line, the prefix is "Diagnostic #1 of N: "
                        messagePrefix += "Diagnostic 1/" + readDiagnostic.arrayDiagnostics.length + ": ";
                    }
                    else {
                        // If only 1 diagnostic for this source line, show the diagnostic severity
                        switch (readDiagnostic.arrayDiagnostics[0].severity) {
                            case 0:
                                messagePrefix += "Error: ";
                                break;
                        }
                    }
                }
                let decorationTextColor;
                let addHighlight = false;
                switch (readDiagnostic.arrayDiagnostics[0].severity) {
                    // Error
                    case 0:
                        addHighlight = true;
                        decorationTextColor = GetErrorTextColor();
                        break;
                }
                if (addHighlight) {
                    // Generate a DecorationInstanceRenderOptions object which specifies the text which will be rendered
                    // after the source-code line in the editor, and text rendering options.
                    const decInstanceRenderOptions = {
                        after: {
                            contentText: shorten(messagePrefix + readDiagnostic.arrayDiagnostics[0].message),
                            fontStyle: GetFontStyle(),
                            fontWeight: GetFontWeight(),
                            margin: GetMargin(),
                            color: decorationTextColor
                        }
                    };
                    // See type https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationOptions
                    const diagnosticDecorationOptions = {
                        range: readDiagnostic.arrayDiagnostics[0].range,
                        renderOptions: decInstanceRenderOptions
                    };
                    switch (readDiagnostic.arrayDiagnostics[0].severity) {
                        // Error
                        case 0:
                            decorOptionsForError.push(diagnosticDecorationOptions);
                            break;
                    }
                }
            }
        }
        activeTextEditor.setDecorations(decortypeError, decorOptionsForError);
        updateStatusBar(numErrors);
    }
    /**
     * Update the Visual Studio Code status bar, showing the number of errors.
     * Control over when (or if) to show the stackHelper info in the status bar is controlled via the
     * stackHelper.statusbar configuration property.
     *
     * @param {number} numErrors - The number of error diagnostics reported.
     */
    function updateStatusBar(numErrors) {
        // Create _statusBarItem if needed
        if (!_statusBarItem) {
            _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
        const statusbar = Getstatusbar();
        var showStatusBarText = false;
        if (highlightEnabled) {
            if (statusbar === 'always') {
                showStatusBarText = true;
            }
            else if (statusbar === 'never') {
                showStatusBarText = false;
            }
            else if (statusbar === 'hide') {
                if (numErrors > 0) {
                    showStatusBarText = true;
                }
            }
        }
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor || showStatusBarText === false) {
            _statusBarItem.hide();
        }
        else {
            let statusBarText;
            if (numErrors === 0) {
                statusBarText = "Stack Helper: No errors found";
                vscode.window.showInformationMessage('No errors found');
            }
            else if (numErrors === 1) {
                statusBarText = "Stack Helper: 1 Error Found";
                vscode.window.showInformationMessage('1 Error found');
            }
            else {
                statusBarText = "$(bug) Stack Helper: " + numErrors + " errors found.";
                vscode.window.showInformationMessage("Stack Helper: " + numErrors + " errors found.");
            }
            _statusBarItem.text = statusBarText;
            _statusBarItem.show();
        }
    }
    /**
     * shorten the supplied string to a constant number of characters. (This truncation
     * limit is hard-coded, and may be changed only by editing the const inside this function).
     *
     * @param {string} str - The string to shorten.
     * @returns {string} - The shortend string, if the string argument is over the hard-coded limit.
     */
    function shorten(str) {
        const truncationLimit = 300;
        return str.length > truncationLimit ? str.slice(0, truncationLimit) + '…' : str;
    }
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
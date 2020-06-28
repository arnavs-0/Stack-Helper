import * as vscode from 'vscode';
import * as request from "request-promise-native";


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let search = vscode.commands.registerCommand('stackhelper.search', () => {
		// The code you place here will be executed every time your command is executed

		vscode.window.showInputBox({
			prompt: 'What is your error?'
		}).then((result) => {
			if(result){
				openBrowser(result);
			}
		});
		context.subscriptions.push(search);
	});
	
	//use Stack Overflow to search selected text
	context.subscriptions.push(vscode.commands.registerCommand('stackhelper.find', () => {
		// getting a list of problems
		let diagnostics: [vscode.Uri, vscode.Diagnostic[]][] = vscode.languages.getDiagnostics();

		// formation of the error selection list
		let errorMessages: string[] = [];
		diagnostics.forEach((value) => {
			value[1].forEach((value) => {
				let error: string = value.message;
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
				if (value !== undefined)
					{openBrowser(value);}
			});
		})
	);

	const searchBySelection = vscode.commands.registerCommand('stackhelper.stackSearchApi', async () => {
        const searchTerm = getSelectedText();
		await executeSearch(searchTerm);
		context.subscriptions.push(searchBySelection);
    });
	
	
	function openBrowser(str: string) {
		let searchQuery = "http://stackoverflow.com/search?q=" + encodeURI(str.replace(/["'\-\\\/\.\,\|\(\)\[\]\~\`\^\:\#\;\%]/gm, ''));
		vscode.env.openExternal(vscode.Uri.parse(searchQuery));
	}

	let _statusBarItem: vscode.StatusBarItem;
    let highlightEnabled: boolean = true;
	
	let highlightErrorsEnabled = vscode.commands.registerCommand('stackhelper.enableError', () => {
        highlightEnabled = true;

        const activeTextEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            updateErrorHighlighting(activeTextEditor.document.uri);
        }
    });

	context.subscriptions.push(highlightErrorsEnabled);
	
	let highlightErrorsDisabled = vscode.commands.registerCommand('stackhelper.disableError', () => {
        highlightEnabled = false;

        const activeTextEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            updateErrorHighlighting(activeTextEditor.document.uri);
        }
    });

	context.subscriptions.push(highlightErrorsDisabled);
	
	function GetErrorBackgroundColor() : string
    {
        const errorColor : string = "rgba(250,50,50,0.5)";
        return errorColor;
    }

    function GetErrorTextColor() : string
    {
        const errorTextColor : string = "rgba(240,240,240,1.0)";
        return errorTextColor;
	}
	function GetFontStyle() : string
    {
        const fontStyle : string = "bold";
        return fontStyle;
    }

    function GetFontWeight() : string
    {
        const fontWeight : string = "normal";
        return fontWeight;
    }

    function GetMargin() : string
    {
        const margin : string = "40px";
        return margin;
    }
	
	function Getstatusbar() : string
    {
        const statusbar : string = "hide";
        return statusbar;
    }

    function AddTextPrefix() : boolean
    {
        const addTextPrefix : boolean = false;
        return addTextPrefix;
    }

	let decortypeError: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: GetErrorBackgroundColor()
    });

    vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => { onChangedDiagnostics(diagnosticChangeEvent); }, null, context.subscriptions );

	vscode.workspace.onDidOpenTextDocument(textDocument => { updateErrorHighlighting( textDocument.uri ); }, null, context.subscriptions );

    // Update on editor switch.
    vscode.window.onDidChangeActiveTextEditor(textEditor => {
        if (textEditor === undefined) {
            return;
        }
        updateErrorHighlighting(textEditor.document.uri );
    }, null, context.subscriptions);

    /**
     * Invoked by onDidChangeDiagnostics() when the language diagnostics change.
     *
     * @param {vscode.DiagnosticChangeEvent} diagnosticChangeEvent - Contains info about the change in diagnostics.
     */
    function onChangedDiagnostics(diagnosticChangeEvent: vscode.DiagnosticChangeEvent)
    {
        if( !vscode.window )
        {
            return;
        }

        const activeTextEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if( !activeTextEditor )
        {
            return;
        }
        
        // Many URIs can change - we only need to decorate the active text editor
        for (const uri of diagnosticChangeEvent.uris)
        {
            // Only update decorations for the active text editor.
            if ( uri.fsPath === activeTextEditor.document.uri.fsPath )
            {
                updateErrorHighlighting( uri );
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
    function updateErrorHighlighting( uriToDecorate : vscode.Uri ) {
        if ( !uriToDecorate )
        {
            return;
        }

        // Only process "file://" URIs.
        if( uriToDecorate.scheme !== "file" )
        {
            return;
        }

        if( !vscode.window )
        {
            return;
        }

        const activeTextEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if( !activeTextEditor )
        {
            return;
        }

        if ( !activeTextEditor.document.uri.fsPath )
        {
            return;
        }

        const decorOptionsForError: vscode.DecorationOptions[] = [];
        let numErrors = 0;


        if (highlightEnabled) {
            let diagnosticRead: any = {};
            let diagnostic: vscode.Diagnostic;

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

            let key: any;
            let addMessagePrefix: boolean = AddTextPrefix();
            for (key in diagnosticRead)       // Iterate over property values (not names)
            {
                let readDiagnostic = diagnosticRead[key];
                let messagePrefix: string = "";

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
                    const decInstanceRenderOptions: vscode.DecorationInstanceRenderOptions = {
                        after: {
                            contentText: shorten(messagePrefix + readDiagnostic.arrayDiagnostics[0].message),
                            fontStyle: GetFontStyle(),
                            fontWeight: GetFontWeight(),
                            margin: GetMargin(),
                            color: decorationTextColor
                        }
                    };

                    // See type https://code.visualstudio.com/docs/extensionAPI/vscode-api#DecorationOptions
                    const diagnosticDecorationOptions: vscode.DecorationOptions = {
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

		activeTextEditor.setDecorations(decortypeError
	, decorOptionsForError);

        updateStatusBar(numErrors);
    }



    /**
     * Update the Visual Studio Code status bar, showing the number of errors.
     * Control over when (or if) to show the stackHelper info in the status bar is controlled via the
     * stackHelper.statusbar configuration property.
     *
     * @param {number} numErrors - The number of error diagnostics reported.
     */
    function updateStatusBar(numErrors: number) {
        // Create _statusBarItem if needed
        if (!_statusBarItem) {
            _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }

        const statusbar = Getstatusbar();
        var showStatusBarText = false;
        if(highlightEnabled)
        {
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

        const activeTextEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

        if (!activeTextEditor || showStatusBarText === false) {

            _statusBarItem.hide();
        }
        else {
            let statusBarText: string;

            if (numErrors === 0) {
				statusBarText = "Stack Helper: No errors found";
				vscode.window.showInformationMessage('No errors found');
            } else if(numErrors === 1) {
				statusBarText = "Stack Helper: 1 Error Found";
				vscode.window.showInformationMessage('1 Error found');
			} else {
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
    function shorten(str: string): string {
        const truncationLimit: number = 300;
		return str.length > truncationLimit ? str.slice(0, truncationLimit) + '…' : str;
	}

	async function executeSearch(searchTerm: string): Promise<void> {
		if (!searchTerm || searchTerm.trim() === '') {
			return;
		}
	
		searchTerm = searchTerm.trim();
		console.log(`User initiated a stackoverflow search with [${searchTerm}] search term`);
		
		// process tags
		const tags: string[] = [];
		const changeChar = /\[(.+?)\]/gm;
		let tagsMatch;
		let updatedSearchTerm = searchTerm;
		while ((tagsMatch = changeChar.exec(updatedSearchTerm)) !== null) {
			// Avoid Null Searches
			if (tagsMatch.index === changeChar.lastIndex) {
				changeChar.lastIndex++;
			}
			
			tagsMatch.forEach((match, groupIndex) => {
				if(groupIndex === 0) { // full match without group for replace
					updatedSearchTerm = updatedSearchTerm.replace(match, "").trim();
				} else if(groupIndex === 1) { // not a full match
					tags.push(match);
				}
			});  
		}
	
		const stackoverflowApiKey = 'HtxSOY2pdB0OEfRrO)rKSQ((';
		const encodedTagsString = encodeURIComponent(tags.join(';'));
		const encodedAPISearchTerm = encodeURIComponent(updatedSearchTerm);
		const encodeWeb = encodeURIComponent(searchTerm);
		const apiSearchUrl = `https://api.stackexchange.com/2.2/search?order=desc&sort=relevance&intitle=${encodedAPISearchTerm}&tagged=${encodedTagsString}&site=stackoverflow&key=${stackoverflowApiKey}`;
		const stackoverflowSearchUrl = `https://stackoverflow.com/search?q=${encodeWeb}`;
		const googleSearchUrl = `https://www.google.com/search?q=${encodeWeb}`;
		const urlOpt = {
			uri: apiSearchUrl,
			json: true,
			gzip: true,
		};
		const questionsMeta = [
			{ title: `Stack Overflow: ${searchTerm}`, url: stackoverflowSearchUrl },
			{ title: `Google: ${searchTerm}`, url: googleSearchUrl },
		];
		try {
			const searchResponse = await request.get(urlOpt);
			if (searchResponse.items && searchResponse.items.length > 0) {
				searchResponse.items.forEach((q: any, i: any) => {
					questionsMeta.push({
						title: `${i}: ${q.is_answered ? '✔' : '✖'} ${q.score} | ${q.answer_count} | ${decodeURIComponent(q.title)}  ${q.tags.join(',')} by ${q.owner.display_name}`,
						url: q.link
					});
				});
			}
		} catch (error) {
			console.error(error);
		}
	
		const questions = questionsMeta.map(q => q.title);
		const selectedTitle = await vscode.window.showQuickPick(questions, { canPickMany: false });
		const selectedQuestionMeta = questionsMeta.find(q => q.title === selectedTitle);
		const selectedQuestionUrl = selectedQuestionMeta ? selectedQuestionMeta.url : stackoverflowSearchUrl;
		if (selectedQuestionUrl) {
			vscode.env.openExternal(vscode.Uri.parse(selectedQuestionUrl));
		}
	}
	
	function getSelectedText(): string {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return '';
		}
	
		const document = editor.document;
		const eol = document.eol === 1 ? '\n' : '\r\n';
		let result: string = '';
		const selectedTextLines = editor.selections.map((selection) => {
			if (selection.start.line === selection.end.line && selection.start.character === selection.end.character) {
				const range = document.lineAt(selection.start).range;
				const text = editor.document.getText(range);
				return `${text}${eol}`;
			}
	
			return editor.document.getText(selection);
		});
	
		if (selectedTextLines.length > 0) {
			result = selectedTextLines[0];
		}
	
		result = result.trim();
		return result;
	}


}

export function deactivate(){}
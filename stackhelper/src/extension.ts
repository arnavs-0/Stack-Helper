// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


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
					openBrowser(value);
			});
		})
	);
	
	
	function openBrowser(str: string) {
		let searchQuery = "http://stackoverflow.com/search?q=" + encodeURI(str.replace(/["'\-\\\/\.\,\|\(\)\[\]\~\`\^\:\#\;\%]/gm, ''));
		vscode.env.openExternal(vscode.Uri.parse(searchQuery));
	}


}

export function deactivate(){}
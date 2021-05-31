// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { strict } from 'assert';
import * as vscode from 'vscode';
import * as rp from 'request-promise';
import * as cheerio from 'cheerio';
import { siblings } from 'cheerio/lib/api/traversing';
import { val } from 'cheerio/lib/api/attributes';



const url = "https://pkg.go.dev/search?q="

export async function showInputBox(): Promise<string> {
	const result = await vscode.window.showInputBox({
		value: '',
		valueSelection: [2, 4],
		placeHolder: 'Search',
	});
	return `${result}`
}
// TODO: Add import if import is initialized now
export function insertImport(pkg: string) {
	const editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document
		if (editor.selection.isEmpty) {
			var position = editor.selection.active
			editor.edit(editBuilder => {
				editBuilder.insert(position, `"${pkg}"`)
			})
		}
	}
}

export async function pickPackage(pkgs: string[]) {
	let i = 0;
	const result = await vscode.window.showQuickPick(pkgs, {
		placeHolder: 'Package...'
	});
	insertImport(`${result}`)
}

export async function getPackages(query: string) {
	let q = url + query
	
	rp(q)
		.then(html => {
            var res: string[] = []
			const $ = cheerio.load(html)		
			for (let i = 0; i < 10; i++) {
				res.push($('.LegacySearchSnippet > .LegacySearchSnippet-header > a', html)[i].attribs.href.substring(1))
			}
			pickPackage(res)
		})
		.catch(err => {
			vscode.window.showErrorMessage("Filed to find package")
			console.log(err)
		})
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "gophersearch" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('gophersearch.searchPkg', () => {
		// The code you place here will be executed every time your command is executed
		var q: string = ""
		let text = showInputBox().then(
			value => getPackages(value)
		)
		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

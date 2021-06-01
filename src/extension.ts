import * as vscode from 'vscode';
import * as rp from 'request-promise';
import * as cheerio from 'cheerio';

const url = "https://pkg.go.dev/search?q=";

export async function showInputBox(): Promise<string> {
	const result = await vscode.window.showInputBox({
		value: '',
		valueSelection: [2, 4],
		placeHolder: 'Search',
	});
	return `${result}`;
}
// TODO: Add import if import is initialized now
export function insertImport(pkg: string) {
	const editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document;
		if (editor.selection.isEmpty) {
			var position = editor.selection.active;
			editor.edit(editBuilder => {
				editBuilder.insert(position, `"${pkg}"`);
			});
		}
	}
}
export async function pickPackage(names: string[], desc: string[]) {
	let i = 0;
	let pkgs = [];

	for (let i = 0; i < names.length; i++) {
		let item = {
			label: names[i],
			description: desc[i]
		};
		pkgs.push(item);
	}

	const result = await vscode.window.showQuickPick(pkgs, {
		placeHolder: 'Package..."undefined"'
	});
	insertImport(`${result}`);
}

export async function getPackages(query: string) {
	let q = url + query;
	
	rp(q)
		.then(html => {
            var resNames: string[] = [];
			var resDescription: string[] = [];
			const $ = cheerio.load(html);
			for (let i = 0; i < 10; i++) {
				resNames.push($('.LegacySearchSnippet > .LegacySearchSnippet-header > a', html)[i].attribs.href.substring(1));
				let desc = <cheerio.DataNode>$('.LegacySearchSnippet > p', html)[i].childNodes[0];
				resDescription.push(desc.data);
			}
			pickPackage(resNames, resDescription);
		})
		.catch(err => {
			vscode.window.showErrorMessage("Filed to find package");
			console.log(err);
		});
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "gophersearch" is now active!');

	let disposable = vscode.commands.registerCommand('gophersearch.searchPkg', () => {
		var q: string = "";
		let text = showInputBox().then(
			value => getPackages(value)
		);
		
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

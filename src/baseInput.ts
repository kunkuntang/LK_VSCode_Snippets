'use strict';

import { window } from 'vscode';

export async function showInputBox(selectionText: string) {
	const result = await window.showInputBox({
		value: selectionText ? selectionText : '',
		// valueSelection: [2, 4],
		placeHolder: '输入mode名称，不包含Entity、EntityContainer的字符',
		// validateInput: text => {
		// 	window.showInformationMessage(`Validating: ${text}`);
		// 	return text === '123' ? 'Not 123!' : null;
		// }
	});
  return result;
}
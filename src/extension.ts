"use strict";

import * as vscode from "vscode";
import { ModelCreator } from "./modelCreator";
import { showInputBox } from "./baseInput";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.createModel",
    async function() {
      // Get the active text editor
      let editor = vscode.window.activeTextEditor;
      let safeJsonData = {};
      
      if (editor) {
        let selection = editor.selection;
        const selectionText = editor.document.getText(selection)
        let inputClassName = await showInputBox(selectionText || '');
        const clipboardText = await vscode.env.clipboard.readText();

        try {
          console.log('clipboardText', clipboardText)
          safeJsonData = JSON.parse(clipboardText);
  
          const modelCreator = new ModelCreator(
            inputClassName || "",
            safeJsonData
          );
  
          const resultStr = modelCreator.generateModel();
          // Get the word within the selection
          editor.edit(editBuilder => {
            selectionText
            ? editBuilder.replace(selection, resultStr)
            : editBuilder.insert(selection.active, resultStr);
          });
        } catch (error) {
          console.log('error', error)
          vscode.window.showErrorMessage(
            "非法的JSON字符串，请重新复制接口响应数据"
          );
          let result = await vscode.window.showQuickPick(["是", "否"], {
            placeHolder: "是否继续生成model？"
          });
          if (result === "是") {
            const modelCreator = new ModelCreator(
              inputClassName || "",
              safeJsonData
            );
  
            const resultStr = modelCreator.generateModel();
            if (editor) {
              let selection = editor.selection;
  
              // Get the word within the selection
              editor.edit(editBuilder => {
                selectionText
                ? editBuilder.replace(selection, resultStr)
                : editBuilder.insert(selection.active, resultStr);
              });
            }
          }
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

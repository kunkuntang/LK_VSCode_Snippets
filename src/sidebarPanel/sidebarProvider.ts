import * as vscode from "vscode";
import { getCurrentProjectInfo } from "../utils/indext";
import {
  getCurrentMileStones,
  getCurrentUserInfo,
} from "../utils/request-gitlab-api";
import { getNonce } from "./getNonce";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      console.log("data", data);
      switch (data.command) {
        case "getAccessToken": {
          const config = vscode.workspace.getConfiguration("lk-vscode-gitlab");
          const gitlabAccessToken = config.get("gitlabAccessToken");
          webviewView.webview.postMessage({
            command: data.command,
            value: gitlabAccessToken,
          });
          break;
        }
        case "getUserInfo": {
          try {
            // 如果有传 accessToken ，则代表登录，用传入的 accessToken 先验证合法性
            const userInfo = await getCurrentUserInfo(data.value);
            console.log("user info", userInfo);
            if (data.value) {
              const config =
                vscode.workspace.getConfiguration("lk-vscode-gitlab");
              config.update("gitlabAccessToken", data.value, true);
              webviewView.webview.postMessage({
                command: "getAccessToken",
                value: data.value,
              });
            }
            webviewView.webview.postMessage({
              command: data.command,
              value: userInfo,
            });
          } catch (error) {
            console.log("error", error);
            webviewView.webview.postMessage({
              command: data.command,
              value: null,
            });
          }
          break;
        }
        case "getCurrentProjectInfo": {
          const projectInfo = await getCurrentProjectInfo();
          webviewView.webview.postMessage({
            command: data.command,
            value: projectInfo,
          });
          break;
        }
        case "getCurrentMileStones": {
          const currentMileStones = await getCurrentMileStones();
          webviewView.webview.postMessage({
            command: data.command,
            value: currentMileStones,
          });
        }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "checkSettings": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const scriptUri = webview.asWebviewUri(
      // vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
      vscode.Uri.joinPath(this._extensionUri, "sidebar", "dist", "umi.js")
    );
    const styleMainUri = webview.asWebviewUri(
      // vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
      vscode.Uri.joinPath(this._extensionUri, "sidebar", "dist", "umi.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <!--
        Use a content security policy to only allow loading images from https or from our extension directory,
        and only allow scripts that have a specific nonce.
    -->
    <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleResetUri}" rel="stylesheet">
    <link href="${styleMainUri}" rel="stylesheet">
    <link href="${styleVSCodeUri}" rel="stylesheet">
    <script nonce="${nonce}">
      const tsvscode = acquireVsCodeApi();
    </script>
    </head>
    <body>
      <div id="root"></div>
    </body>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
  }
}

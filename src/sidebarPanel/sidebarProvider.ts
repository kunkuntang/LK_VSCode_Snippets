import * as vscode from "vscode";
import {
  createFixedBranch,
  createLocalFeatureGitBranch,
  deleteLocalFeatureGitBranch,
  finishedFixedBranch,
  getCurrentProjectInfo,
  getFixedBranches,
  ICreateFixedModel,
} from "../utils";
import {
  createFixedMergeRequestService,
  createIssueService,
  createFeatureMergeRequestService,
  finishProjectFeature,
  getCurrentMileStonesService,
  getCurrentUserInfoService,
  getFixBranchesList,
  getProjectMergeRequestByUser,
  searchGitlabIssue,
  deleteGitlabIssue,
  searchGitlabMergeRequest,
  deleteGitlabMergeRequest,
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
          let gitlabAccessToken = config.get("gitlabAccessToken");
          try {
            // 如果成功调用获取用户信息接口，则代表 accessToken 合法
            const userInfo = await getCurrentUserInfoService(data.value);
            if (data.value) {
              const config =
                vscode.workspace.getConfiguration("lk-vscode-gitlab");
              config.update("gitlabAccessToken", data.value, true);
              gitlabAccessToken = data.value;
            }
            webviewView.webview.postMessage({
              command: data.command,
              value: gitlabAccessToken,
            });
          } catch (error) {
            vscode.window.showErrorMessage("请输入正确的 accessToken !");
            webviewView.webview.postMessage({
              command: data.command,
              value: "",
            });
          }
          break;
        }
        case "getUserInfo": {
          try {
            // 如果有传 accessToken ，则代表登录，用传入的 accessToken 先验证合法性
            const userInfo = await getCurrentUserInfoService(data.value);
            console.log("user info", userInfo);
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
            webviewView.webview.postMessage({
              command: "getAccessToken",
              value: "",
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
          const currentMileStones = await getCurrentMileStonesService();
          webviewView.webview.postMessage({
            command: data.command,
            value: currentMileStones,
          });
          break;
        }
        case "createFeature": {
          let createFlag = true;
          try {
            // 1. 本地创建一个 feature/[功能名称] 分支
            const createNewBranchResult = await createLocalFeatureGitBranch(
              data.value
            );
            if (!createNewBranchResult) {
              throw new Error("创建新分支失败");
            }
            // 2. gitlab 创建一个 Issue，并且关联当前的迭代
            const createIssueResult = await createIssueService({
              ...data.value,
              name: "Feature/" + data.value.name,
            });
            if (!createIssueResult) {
              throw new Error("创建新 Issue 失败");
            }
            // 3. gitlab 创建一个 MR，并且关联刚创建的 Issue
            const createMergeRequestResult =
              await createFeatureMergeRequestService({
                ...data.value,
                issueId: createIssueResult.iid,
              });
            if (!createMergeRequestResult) {
              throw new Error("创建新 Merge_Request 失败");
            }
          } catch (error) {
            createFlag = false;
          } finally {
            if (createFlag) {
              vscode.window.showInformationMessage("创建新功能成功");
              webviewView.webview.postMessage({
                command: data.command,
                value: createFlag,
              });
            }
          }
          break;
        }
        case "getCurrentMergeRequest": {
          const currentMergeRequest = await getProjectMergeRequestByUser(
            data.value
          );
          webviewView.webview.postMessage({
            command: data.command,
            value: currentMergeRequest,
          });
          break;
        }
        case "finishFeature": {
          let finishFlag = true;
          try {
            const { is_delete_local_branch, source_branch, ...value } =
              data.value as {
                project_id: number;
                feature_branch_id: number;
                finishedBranch: string;
                is_delete_local_branch: boolean;
                source_branch: string;
              };
            const finishResult = await finishProjectFeature(value);
            if (!finishResult) {
              finishFlag = false;
              throw Error("无法完成功能，请手动操作");
            }
            if (is_delete_local_branch) {
              const deleteResult = await deleteLocalFeatureGitBranch({
                source_branch,
              });
              if (!deleteResult) {
                finishFlag = false;
                throw Error("无法删除本地分支，请手动操作");
              }
            }
          } catch (error: any) {
            vscode.window.showErrorMessage(error.message);
          } finally {
            webviewView.webview.postMessage({
              command: data.command,
              value: finishFlag,
            });
          }
          break;
        }
        case "getFixBranchesList": {
          // 修复只能是自己创建的分支
          const result = await getFixBranchesList(data.value);
          webviewView.webview.postMessage({
            command: data.command,
            value: result,
          });
          break;
        }
        case "createFixed": {
          let result = true;
          try {
            // 1. 本地创建一个修复分支
            result = await createFixedBranch(data.value as ICreateFixedModel);
            if (!result) {
              throw new Error("分支创建失败");
            }
            debugger
            // 2. 如果修复的是 master 分支
            if (data.value.fixedBranch === "master") {
              let createIssueResult;
              const newBranchName = `hotfix/${data.value.name}`;
              const searchIssueRes = await searchGitlabIssue({
                project_id: data.value.project_id,
                search: encodeURIComponent(newBranchName),
              });
              if (searchIssueRes.length) {
                createIssueResult = searchIssueRes[0];
                const isReplace = await vscode.window.showInformationMessage(
                  `远端已经存在改分支的 Issue，是否替换？`,
                  "确定",
                  "取消"
                );
                if (isReplace) {
                  // 如果是替换，则删除远端 issue
                  await deleteGitlabIssue({
                    project_id: data.value.project_id,
                    issueId: createIssueResult.iid,
                  });
                }
              }
              // 创建新的 issue
              createIssueResult = await createIssueService({
                ...data.value,
                name: "Hotfix/" + data.value.name,
              } as ICreateFixedModel);
              if (!createIssueResult) {
                throw new Error("创建新 Issue 失败");
              }
              // 3. gitlab 创建一个 MR，并且关联刚创建的 Issue
              let createMergeRequestResult;
              const searchMergeRequestRes = await searchGitlabMergeRequest({
                project_id: data.value.project_id,
                search: encodeURIComponent(newBranchName),
              });
              if (searchMergeRequestRes.length) {
                createMergeRequestResult = searchMergeRequestRes[0];
                createIssueResult = searchIssueRes[0];
                const isReplace = await vscode.window.showInformationMessage(
                  `远端已经存在改分支的 MergeRequest，是否替换？`,
                  "确定",
                  "取消"
                );
                if (isReplace) {
                  // 如果是替换，则删除远端分 merge_request
                  deleteGitlabMergeRequest({
                    project_id: data.value.project_id,
                    merge_request_id: createMergeRequestResult.iid,
                  });
                }
              }
              // 创建新的 merge_request
              createMergeRequestResult = await createFixedMergeRequestService({
                ...data.value,
                issueId: createIssueResult.iid,
              });
              if (!createMergeRequestResult) {
                throw new Error("创建新 Merge_Request 失败");
              }
            }
          } catch (error) {
            console.log("createFixed error: ", error);
            result = false;
          } finally {
            webviewView.webview.postMessage({
              command: data.command,
              value: result,
            });
          }
          break;
        }
        case "getCurrentHotfixedBranch": {
          const result = await getFixedBranches(data.value);
          webviewView.webview.postMessage({
            command: data.command,
            value: result,
          });
          break;
        }
        case "finishFixed": {
          let result = true;
          console.log("finishFixed", data);
          try {
            result = await finishedFixedBranch(data.value);
            if (!result) {
              throw new Error("完成创建失败");
            }

          } catch (error) {
            console.log("createFixed error: ", error);
            result = false;
          } finally {
            webviewView.webview.postMessage({
              command: data.command,
              value: result,
            });
          }
          break;
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

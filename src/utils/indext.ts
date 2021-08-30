import { exec } from "child_process";
import { fstat, readFileSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import { getProjectInfoByName } from "./request-gitlab-api";
// import { readPackage } from "read-pkg";

interface IProjectInfo {
  pkg: any;
  workspace: vscode.WorkspaceFolder | null;
  gitlabProjectInfo: any;
}
export async function getCurrentProjectInfo(): Promise<IProjectInfo> {
  // exec()
  let currentWorkSpace: vscode.WorkspaceFolder | null = null;
  const workspaceFolders = vscode.workspace.workspaceFolders;
  let pkg = null;
  let gitlabProjectInfo = null;
  if (workspaceFolders) {
    if (workspaceFolders.length > 1) {
      interface WorkSpaceQuickPickItem extends vscode.QuickPickItem {
        workspace: vscode.WorkspaceFolder;
      }
      const items: WorkSpaceQuickPickItem[] = workspaceFolders.map((t) => {
        return {
          label: `name: ${t.name}`,
          workspace: t,
        };
      });
      currentWorkSpace = await vscode.window
        .showQuickPick(items)
        .then((item) => {
          return item ? item.workspace : null;
        });
    } else {
      currentWorkSpace = workspaceFolders[0];
    }
  }

  if (currentWorkSpace) {
    const pkgJson = await readFileSync(
      path.join(currentWorkSpace.uri.fsPath, "package.json"),
      {
        encoding: "utf-8",
      }
    );
    gitlabProjectInfo = await getProjectInfoByName(currentWorkSpace.name);
    pkg = JSON.parse(pkgJson);
  }
  console.log("gitlabProjectInfo", gitlabProjectInfo);

  return {
    pkg,
    workspace: currentWorkSpace,
    gitlabProjectInfo: gitlabProjectInfo,
  };
}

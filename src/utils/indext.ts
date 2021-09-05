import { exec, execSync } from "child_process";
import { fstat, readFileSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import {
  getProjectInfoByNameService,
  ICreateFeatureModel,
  IFinishFeature,
} from "./request-gitlab-api";

async function getCurrentWorkspace() {
  let currentWorkSpace: vscode.WorkspaceFolder | null = null;
  const workspaceFolders = vscode.workspace.workspaceFolders;
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
  return currentWorkSpace;
}

interface IProjectInfo {
  pkg: any;
  workspace: vscode.WorkspaceFolder | null;
  gitlabProjectInfo: any;
}
export async function getCurrentProjectInfo(): Promise<IProjectInfo> {
  // exec()
  let pkg = null;
  let gitlabProjectInfo = null;

  let currentWorkSpace: vscode.WorkspaceFolder | null =
    await getCurrentWorkspace();

  if (currentWorkSpace) {
    const pkgJson = await readFileSync(
      path.join(currentWorkSpace.uri.fsPath, "package.json"),
      {
        encoding: "utf-8",
      }
    );
    gitlabProjectInfo = await getProjectInfoByNameService(
      currentWorkSpace.name
    );
    pkg = JSON.parse(pkgJson);
  }
  console.log("gitlabProjectInfo", gitlabProjectInfo);

  return {
    pkg,
    workspace: currentWorkSpace,
    gitlabProjectInfo: gitlabProjectInfo,
  };
}

async function checkWrokspaceIsClean(currentWorkSpace: vscode.WorkspaceFolder) {
  try {
    const gitStatusBuffer = execSync("git status", {
      cwd: currentWorkSpace.uri.fsPath,
    });
    const gitStatusStr = gitStatusBuffer.toString("utf-8");
    const cleanKeyWord = "nothing to commit, working tree clean";
    if (gitStatusStr.includes(cleanKeyWord)) {
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message);
    return false;
  }
}

export async function createLocalFeatureGitBranch(params: ICreateFeatureModel) {
  let currentWorkSpace: vscode.WorkspaceFolder | null =
    await getCurrentWorkspace();
  if (currentWorkSpace) {
    try {
      const newBranchName = `feature/${params.name}`;
      // 1. 检查当前工作空间是否干净
      const isClean = await checkWrokspaceIsClean(currentWorkSpace);
      if (!isClean) {
        throw new Error(
          "当前工作空间存在未处理的文件，请处理并提交后再尝试操作"
        );
      }
      // 2. 本地从 master 分支中创建一个 Feature 分支
      // 3. 切换到新创建的分支
      // 4. 把新创建的分支推送到远程仓库
      exec(
        `git checkout master && git branch ${newBranchName} && git checkout ${newBranchName} && git push --set-upstream origin ${newBranchName}`,
        {
          cwd: currentWorkSpace.uri.fsPath,
        }
      );
      return true;
    } catch (error: any) {
      vscode.window.showErrorMessage(error.message || "创建新分支失败");
      return false;
    }
  } else {
    vscode.window.showErrorMessage("当前没打开工作空间");
    return false;
  }
}

export async function deleteLocalFeatureGitBranch(params: {
  source_branch: string;
}) {
  let currentWorkSpace: vscode.WorkspaceFolder | null =
    await getCurrentWorkspace();
  if (currentWorkSpace) {
    try {
      // 1. 检查当前工作空间是否干净
      const isClean = await checkWrokspaceIsClean(currentWorkSpace);
      if (!isClean) {
        throw new Error(
          "当前工作空间存在未处理的文件，请处理并提交后再尝试操作"
        );
      }
      // 2. 切换到 master 分支
      // 3. 删除功能分支
      exec(
        `git checkout master && git branch -D ${params.source_branch}`,
        {
          cwd: currentWorkSpace.uri.fsPath,
        }
      );
      return true;
    } catch (error: any) {
      vscode.window.showErrorMessage(error.message || "创建新分支失败");
      return false;
    }
  } else {
    vscode.window.showErrorMessage("当前没打开工作空间");
    return false;
  }
}

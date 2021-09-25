import { exec, execSync } from "child_process";
import { fstat, readFileSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import {
  deleteGitlabIssue,
  deleteGitlabMergeRequest,
  finishProjectFeature,
  getFixBranchesList,
  getProjectInfoByNameService,
  getProjectMergeRequestByUser,
  ICreateFeatureModel,
  IFinishFeature,
  searchGitlabIssue,
  searchGitlabMergeRequest,
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
    pkg = JSON.parse(pkgJson);
    console.log("pkgJson.gitlab", pkg);
    gitlabProjectInfo = await getProjectInfoByNameService(
      (pkg.gitlab && pkg.gitlab.name) || currentWorkSpace.name
    );
  }
  console.log("gitlabProjectInfo", gitlabProjectInfo);
  if (Array.isArray(gitlabProjectInfo)) {
    vscode.window.showErrorMessage('获取项目信息失败，请检查 package.json 里的 gitlab 字段配置')
  }

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

async function checkBranchIsExist(
  branchName: string,
  currentWorkSpace: vscode.WorkspaceFolder
) {
  try {
    // const gitStatusBuffer = execSync(`git checkout -b ${branchName}`, {
    const gitStatusBuffer = execSync(`git branch -a`, {
      cwd: currentWorkSpace.uri.fsPath,
    });
    const gitStatusStr = gitStatusBuffer.toString("utf-8");
    // const cleanKeyWord = branchName;
    if (gitStatusStr.includes(branchName)) {
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message);
    return true;
  }
}

async function askForDeleteExistBranch(
  newBranchName: string,
  project_id: number,
  currentWorkSpace: vscode.WorkspaceFolder
) {
  let isCover = await vscode.window
    .showInformationMessage(
      `当前工作空间已经存在 ${newBranchName} 分支，是否删除该分支？`,
      "确定",
      "取消"
    )
    .then((res) => {
      return res === "确定";
    });
  if (!isCover) {
    vscode.window.showInformationMessage(`请手动删除 ${newBranchName} 分支`);
    return false;
  } else {
    // 删除已经存在的分支
    execSync(`git checkout master && git branch -D ${newBranchName}`, {
      cwd: currentWorkSpace.uri.fsPath,
    });
    // 检查远程是否存在分支
    const gitStatusBuffer = execSync(
      `git fetch origin --prune && git branch -a`,
      {
        cwd: currentWorkSpace.uri.fsPath,
      }
    );
    const gitStatusStr = gitStatusBuffer.toString("utf-8");
    if (gitStatusStr.includes(newBranchName)) {
      // 删除远程分支
      execSync(`git push -d origin ${newBranchName}`, {
        cwd: currentWorkSpace.uri.fsPath,
      });
    }
    return true;
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
      execSync(`git checkout master && git fetch origin master`, {
        cwd: currentWorkSpace.uri.fsPath,
      });
      const isExist = await checkBranchIsExist(newBranchName, currentWorkSpace);
      if (isExist) {
        const isAllowDelete = await askForDeleteExistBranch(
          newBranchName,
          params.project_id,
          currentWorkSpace
        );
        if (!isAllowDelete) {
          // 用户选择先手动处理已经存在的分支
          return false;
        }
      }
      // 3.
      // 4. 切换到新创建的分支
      // 5. 把新创建的分支推送到远程仓库
      exec(
        `git branch ${newBranchName} && git checkout ${newBranchName} && git push --set-upstream origin ${newBranchName}`,
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
      exec(`git checkout master && git branch -D ${params.source_branch}`, {
        cwd: currentWorkSpace.uri.fsPath,
      });
      return true;
    } catch (error: any) {
      vscode.window.showErrorMessage(error.message || "删除分支失败");
      return false;
    }
  } else {
    vscode.window.showErrorMessage("当前没打开工作空间");
    return false;
  }
}

export interface ICreateFixedModel {
  project_id: number;
  milestone_id: number;
  fixedBranch: string;
  name: string;
  tapd: string;
}

export async function createFixedBranch(params: ICreateFixedModel) {
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

      console.log(
        "params.fixedBranch",
        params.fixedBranch,
        params.fixedBranch === "master"
      );
      if (params.fixedBranch === "master") {
        // hotfix/[修复描述]_[姓名]([修复分支名称])
        const newBranchName = `hotfix/${params.name}`;
        // 如果当前的修复是在 master 分支上
        // 2. 检查本地是否已经存在该 hotfix 分支
        const isExist = await checkBranchIsExist(
          newBranchName,
          currentWorkSpace
        );
        if (isExist) {
          const isAllowDelete = await askForDeleteExistBranch(
            newBranchName,
            params.project_id,
            currentWorkSpace
          );
          if (!isAllowDelete) {
            // 用户选择先手动处理已经存在的分支
            return false;
          }
        }
        // 3. 切换到 master 分支上并且从远端更新分支信息
        // 4. 本地从 master 分支中创建一个 hotfix 分支
        // 5. 切换到新创建的分支
        // 6. 把新创建的分支推送到远程仓库

        console.log(
          `git checkout master && git fetch origin ${params.fixedBranch}`
        );
        execSync(
          `git checkout master && git fetch origin ${params.fixedBranch}`,
          {
            cwd: currentWorkSpace.uri.fsPath,
          }
        );
        execSync(
          `git branch ${newBranchName} && git checkout ${newBranchName}`,
          {
            cwd: currentWorkSpace.uri.fsPath,
          }
        );
        execSync(`git push --set-upstream origin ${newBranchName}`, {
          cwd: currentWorkSpace.uri.fsPath,
        });
      } else {
        const newBranchName = `hotfix/${params.name}`;

        // 如果当前的修复是在 feature 分支上
        // 2. 检查本地是否已经存在改 feature 分支
        const isExist = await checkBranchIsExist(
          newBranchName,
          currentWorkSpace
        );
        if (isExist) {
          const isAllowDelete = await askForDeleteExistBranch(
            newBranchName,
            params.project_id,
            currentWorkSpace
          );
          if (!isAllowDelete) {
            // 用户选择先手动处理已经存在的分支
            return false;
          }
        }
        // 3. 切换到 feature 分支上并且从远端更新分支信息
        // 4. 从修复的 feature 分支上新建一个 hotfix 分支
        // 5. 切换到新创建的分支
        exec(
          `git checkout ${params.fixedBranch} && git pull origin ${params.fixedBranch} && git branch ${newBranchName} && git checkout ${newBranchName}`,
          {
            cwd: currentWorkSpace.uri.fsPath,
          }
        );
      }
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

export async function getFixedBranches(
  params: Parameters<typeof getProjectMergeRequestByUser>[0]
) {
  let currentWorkSpace: vscode.WorkspaceFolder | null =
    await getCurrentWorkspace();

  if (currentWorkSpace) {
    const gitFixedBranchesBuffer = execSync("git branch -a", {
      cwd: currentWorkSpace.uri.fsPath,
    });

    // 获取本地 hotfix 分支
    const tempArr = gitFixedBranchesBuffer
      .toString("utf-8")
      .split("\n")
      .map((item) => item.trim().replace(/^\* |remotes\/origin\//g, ""))
      .filter((item) => item);
    const fixedBranchesSet = Array.from(new Set(tempArr)).filter((item) =>
      /(H|h)otfix/.test(item)
    );

    // 获取线上自己的 hotfix merge request 分支
    const ownBranches: any[] = await getProjectMergeRequestByUser(params);
    const ownFixedBranches = ownBranches
      .filter((item) => /(H|h)otfix/.test(item.title))
      .map((item) => ({
        ...item,
        title: (item.title.replace(/^Draft: /g, "") as string).toLowerCase(),
      }));
    let tempList = fixedBranchesSet.map((item) => ({ title: item, iid: null }));

    tempList.forEach((ownBranch) => {
      if (ownFixedBranches.every((item) => item.title !== ownBranch.title)) {
        ownFixedBranches.push(ownBranch);
      }
    });

    return ownFixedBranches;
  } else {
    return [];
  }
}

interface IFinishFixed {
  hotfix_branch_id: number;
  fixedBranch: string;
  project_id: number;
  source_branch: string;
  is_delete_local_branch: boolean;
}

export async function finishedFixedBranch(params: IFinishFixed) {
  try {
    if (params.source_branch === "master") {
      if (params.hotfix_branch_id) {
        // 如果修复的是否是 master 分支，则去除 gitlab 上的 merge_request 的草稿状态
        const { fixedBranch: finishedBranch, hotfix_branch_id: feature_branch_id, ...restParams } = params
        const finishResult = await finishProjectFeature({
          ...restParams,
          feature_branch_id,
          finishedBranch,
        });
      } else {
        vscode.window.showErrorMessage(
          "远端未找到对应的修复分支：" + params.fixedBranch
        );
        // return false;
      }
    } else {
      // 如果修复的是 feature 分支，则在本地把修复分支合并到功能分支
      execSync(`git checkout ${params.source_branch} && git merge ${params.fixedBranch} -ff`)
      // 并且检查 gitlab 上是否有对应的修复分支，如果有则删除远程分支
      
    }
    return true;
  } catch (error) {
    console.error("finishedFixedBranch err", error);
    return false;
  }
}

import * as vscode from "vscode";

function commandError(command: string, message: string) {
  const error: any = new Error(message);
  error.command = command;
  return error;
}

export class LkDevOpsManager {
  /** 检查机器上是佛安装了 git */
  private checkGitExit() {
    // if (!shelljs.which("git")) {
    //   shelljs.echo("当前环境没有安装 git，请先安装");
    //   shelljs.exit(1);
    // }
    return true;
  }

  /** 检查当前的工作空间是否存在为提交的修改 */
  private checkWorkSpaceClean() {
    console.log("checkWorkSpaceClean");
    // dbg(command("git status --porcelain").trim());
    // return !command("git status --porcelain").trim();
  }

  async createTask() {
    this.checkGitExit();
    // if (this.checkWorkSpaceClean()) {
    //   vscode.window.showErrorMessage("当前存在为提交的文件，请先提交");
    // }
    const taskName = await vscode.window.showInputBox({
      value: "",
      placeHolder: "请输入新任务名称",
    });
    console.log("createTask: taskName" + taskName);
    if (!taskName) {
      return;
    }
    /**
     * 每次新建任务时
     * 1. 从 master 分支上迁出新的 feature/* 分支
     * 2. 在 gitlab 上新建一个 issue，关联对于的里程碑和 tapd 的任务
     * 3. 在 gitlab 上新建一个 草稿状态的 pr，关联对于的里程碑和 tapd 任务
     */
    const terminal = vscode.window.createTerminal("createTask");
    terminal.show(false);
    terminal.sendText("git checkout master");
    terminal.sendText(`git branch feature/${taskName}`);
    terminal.sendText(`git checkout feature/${taskName}`);
    // TODO 创建一个 issue
    // TODO 创建一个 pr
    const result = vscode.workspace
      .getConfiguration()
      .get("lkVscodeSnippets.taskList");
    console.log("当前存在的任务有：", result);
    vscode.workspace
      .getConfiguration()
      .update("lkVscodeSnippets.taskList", [taskName]);
    console.log("当前存在的任务有：", result);
    vscode.window.showInformationMessage("新任务创建成功");
  }

  finishTask() {
    /**
     * 每次完成任务时
     * 1. 合并 master 分支
     * 2. 推送当前分支
     * 3. 把当前分支合并到 develop
     * 4. 关闭 gitlab 上对于的 issue
     * 5. 把 gitlab 上对于的 pr 去除草稿状态
     */
  }
}

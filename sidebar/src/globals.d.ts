import * as vscode from 'vscode';

interface IProjectInfo {
  pkg: any;
  workspace: vscode.WorkspaceFolder | null;
}

declare global {
  type PostMessageParams = { command: string; value?: any };
  const tsvscode: {
    postMessage: (params: PostMessageParams) => void;
  };
  interface Window {
    userInfo: any;
    projectInfo: IProjectInfo;
  }
}

export {};
// _vSEbyS3yqofe6E9W9Dh

import Axios, { AxiosResponse } from "axios";
import * as vscode from "vscode";

const config = vscode.workspace.getConfiguration("lk-vscode-gitlab");
let gitlabAccessToken = config.get("gitlabAccessToken");

const request = Axios.create({
  baseURL: "https://git.liankaa.com/api/v4",
  headers: {
    "PRIVATE-TOKEN": gitlabAccessToken,
  },
});

function handleNetworkError(res: AxiosResponse, errmsg?: string) {
  vscode.window.showErrorMessage(
    errmsg
      ? errmsg + "出错"
      : `接口出错：${res.config.baseURL}${res.config.url}`
  );
}

function commonResponsePipe(res: AxiosResponse) {
  console.info("axios request res", res);
  if (res.status === 200 && res.data) {
    return res.data;
  } else {
    handleNetworkError(res, "获取用户信息");
    return null;
  }
}

export function getCurrentUserInfoService(accessToken?: string) {
  return request
    .get("/user", {
      headers: {
        "PRIVATE-TOKEN": accessToken || gitlabAccessToken,
      },
    })
    .then((res) => {
      if (res.status === 200 && accessToken) {
        gitlabAccessToken = accessToken;
      }
      return commonResponsePipe(res);
    });
}

export function getProjectInfoByNameService(name: string) {
  return request
    .get(`/projects?search=${name}&simple=true`, {
      headers: {
        "PRIVATE-TOKEN": gitlabAccessToken,
      },
    })
    .then((res) => {
      if (res.status === 200 && res.data) {
        if (res.data.length === 1) {
          return res.data[0];
        }
        return res.data;
      } else {
        handleNetworkError(res, "获取项目信息");
        return null;
      }
    });
}

export function getCurrentMileStonesService() {
  return request
    .get(`/groups/24/milestones?state=active`, {
      headers: {
        "PRIVATE-TOKEN": gitlabAccessToken,
      },
    })
    .then((res) => {
      if (res.status === 200 && res.data) {
        return res.data;
      } else {
        handleNetworkError(res, "获取当前的里程碑列表");
        return null;
      }
    });
}

export interface ICreateFeatureModel {
  project_id: number;
  milestone_id: number;
  name: string;
  tapd: string;
}

export function createIssueService(params: ICreateFeatureModel) {
  return request
    .post(
      `/projects/${params.project_id}/issues`,
      {
        id: params.project_id,
        title: params.name,
        issue_type: "issue",
        description: params.tapd,
        assignee_id: 10,
        milestone_id: params.milestone_id,
      },
      {
        headers: {
          "PRIVATE-TOKEN": gitlabAccessToken,
        },
      }
    )
    .then((res) => {
      if (res.status === 201 && res.data) {
        vscode.window.showInformationMessage("创建新 Issue 成功");
        return res.data;
      } else {
        handleNetworkError(res, "创建新 Issue ");
        return false;
      }
    });
}

export function createMergeRequestService(
  params: ICreateFeatureModel & { issueId: number }
) {
  const newBranchName = `feature/${params.name}`;
  return request
    .post(
      `/projects/${params.project_id}/merge_requests`,
      {
        id: params.project_id,
        source_branch: newBranchName,
        target_branch: "beta",
        title: "Draft: " + params.name,
        assignee_id: 10,
        description: [params.tapd, `Closed #${params.issueId}`].join("\n"),
        milestone_id: params.milestone_id,
        squash: true,
        remove_source_branch: false,
      },
      {
        headers: {
          "PRIVATE-TOKEN": gitlabAccessToken,
        },
      }
    )
    .then((res) => {
      if (res.status === 201 && res.data) {
        vscode.window.showInformationMessage("创建新 Merge_Request 成功");
        return res.data;
      } else {
        handleNetworkError(res, "创建新 Merge_Request ");
        return false;
      }
    });
}

interface IGetProjectMRByUser {
  project_id: number;
  author_id: number;
}

export function getProjectMergeRequestByUser(params: IGetProjectMRByUser) {
  return request
    .get(
      `/projects/${params.project_id}/merge_requests?author_id=${params.author_id}&state=opened`,
      {
        headers: {
          "PRIVATE-TOKEN": gitlabAccessToken,
        },
      }
    )
    .then((res) => {
      if (res.status === 200 && res.data) {
        return res.data;
      } else {
        handleNetworkError(res, "查询当前项目的 Merge_Request ");
        return false;
      }
    });
}

export interface IFinishFeature {
  project_id: number;
  merge_request_id: number;
  merge_request_title: string;
}

export function finishProjectFeature(params: IFinishFeature) {
  return request
    .put(
      `/projects/${params.project_id}/merge_requests/${params.merge_request_id}`,
      {
        id: params.project_id,
        title: params.merge_request_title.replace("Draft: ", ""),
      },
      {
        headers: {
          "PRIVATE-TOKEN": gitlabAccessToken,
        },
      }
    )
    .then((res) => {
      if (res.status === 200 && res.data) {
        return res.data;
      } else {
        handleNetworkError(res, "完成项目功能 ");
        return false;
      }
    });
}

interface IGetFixBranchesList {
  project_id: number;
  username: string;
}

export function getFixBranchesList(params: IGetFixBranchesList) {
  return request
    .get(
      `/projects/${params.project_id}/repository/branches?search=${params.username}`,
      {
        headers: {
          "PRIVATE-TOKEN": gitlabAccessToken,
        },
      }
    )
    .then((res) => {
      if (res.status === 200 && res.data) {
        return res.data;
      } else {
        handleNetworkError(res, "获取修复列表 ");
        return false;
      }
    });
}

function getProjectId() {}

export const getProjectIssue = function () {
  return request.get("/issues").then(commonResponsePipe);
};

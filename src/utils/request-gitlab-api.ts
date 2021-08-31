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

function handleNetworkError(res: AxiosResponse) {
  const errorMsgMap: Record<string, string> = {
    "/user": "获取用户信息",
  };

  if (errorMsgMap[res.config.url || ""]) {
    vscode.window.showErrorMessage(
      errorMsgMap[res.config.url || ""] ||
        `网络出错：${res.config.baseURL}${res.config.url}`
    );
  }
}

function commonResponsePipe(res: AxiosResponse) {
  console.info("axios request res", res);
  if (res.status === 200 && res.data) {
    return res.data;
  } else {
    handleNetworkError(res);
    return null;
  }
}

export function getCurrentUserInfo(accessToken?: string) {
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

export function getProjectInfoByName(name: string) {
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
        handleNetworkError(res);
        return null;
      }
    });
}

export function getCurrentMileStones() {
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
        handleNetworkError(res);
        return null;
      }
    });
}

function getProjectId() {}

export const getProjectIssue = function () {
  return request.get("/issues").then(commonResponsePipe);
};

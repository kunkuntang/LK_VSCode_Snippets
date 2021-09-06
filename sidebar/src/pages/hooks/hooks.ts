import { useState } from 'react';

export function getCurrentMileStonesHooks() {
  const [mileStonesList, setMileStonesList] = useState([]);

  function _getMileStonesList() {
    tsvscode.postMessage({
      command: 'getCurrentMileStones',
    });
  }

  function _setMileStonesList(event: MessageEvent<PostMessageParams>) {
    const data = event.data;
    if (data.command === 'getCurrentMileStones') {
      if (data.value) {
        console.log('data.value', data.value);
        setMileStonesList(data.value);
      } else {
        setMileStonesList([]);
      }
    }
  }

  return {
    mileStonesList,
    getMileStonesList: _getMileStonesList,
    setMileStonesList: _setMileStonesList,
  };
}

export class UserInfoModel {
  avatar_url = '';
  email = '';
  id = -1;
  name = '';
  username = '';
  web_url = '';
}

export function getUserInfoHooks(initialUserInfo = new UserInfoModel()) {
  const [userInfo, setUserInfo] = useState(initialUserInfo);

  function _getUserInfo(accessToken?: string) {
    tsvscode.postMessage({
      command: 'getUserInfo',
      value: accessToken,
    });
  }

  function _setUserInfo(event: MessageEvent<PostMessageParams>) {
    const data = event.data as PostMessageParams;
    if (data.command === 'getUserInfo') {
      if (data.value) {
        setUserInfo(data.value);
        window.userInfo = data.value;
      } else {
        // TODO 比如 token 出错
        setUserInfo(new UserInfoModel());
        window.userInfo = new UserInfoModel();
      }
    }
  }

  return {
    userInfo,
    getUserInfo: _getUserInfo,
    setUserInfo: _setUserInfo,
  };
}

export function getAccessTokenHooks(initialAccessToken = '') {
  const [accessToken, setAcToken] = useState(initialAccessToken);

  function _getAccessToken(accessToken?: string) {
    tsvscode.postMessage({
      command: 'getAccessToken',
      value: accessToken
    });
  }

  function _setAccessToken(event: MessageEvent<PostMessageParams>) {
    const data = event.data as PostMessageParams;
    console.log('message from vscode', data);
    if (data.command === 'getAccessToken') {
      if (data.value) {
        setAcToken(data.value);
      } else {
        // TODO 比如 token 出错
        setAcToken('');
      }
    }
  }

  return {
    accessToken,
    setAccessToken: _setAccessToken,
    getAccessToken: _getAccessToken,
  };
}

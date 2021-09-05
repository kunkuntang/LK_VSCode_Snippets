import React, { useState } from 'react';
import { useEffect } from 'react';
import Avatar from './components/Avatar';
import Login from './login/login';

import styles from './index.less';
import { history } from '@/.umi/core/history';

export class UserInfoModel {
  avatar_url = '';
  email = '';
  id = -1;
  name = '';
  username = '';
  web_url = '';
}

function useAccessTokenHooks(
  initialAccessToken = '',
  initialUserInfo = new UserInfoModel(),
) {
  const [accessToken, setAcToken] = useState(initialAccessToken);
  const [userInfo, setUserInfo] = useState(initialUserInfo);

  function _getAccessToken() {
    tsvscode.postMessage({
      command: 'getAccessToken',
    });
  }

  function _setAccessToken(accessToken: string) {
    _getUserInfo(accessToken);
  }

  function _getUserInfo(accessToken?: string) {
    tsvscode.postMessage({
      command: 'getUserInfo',
      value: accessToken,
    });
  }

  window.addEventListener('message', (event) => {
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
  });

  return {
    accessToken,
    setAccessToken: _setAccessToken,
    getAccessToken: _getAccessToken,
    userInfo,
    getUserInfo: _getUserInfo,
  };
}

function getProjectInfo() {
  tsvscode.postMessage({
    command: 'getCurrentProjectInfo',
  });

  window.addEventListener('message', (event) => {
    const data = event.data as PostMessageParams;
    if (data.command === 'getCurrentProjectInfo') {
      console.log('message from getCurrentProjectInfo', data);
      window.projectInfo = data.value;
    }
  });
}

export default function IndexPage() {
  const { accessToken, setAccessToken, getAccessToken, userInfo, getUserInfo } =
    useAccessTokenHooks();

  useEffect(() => {
    getAccessToken();
    getProjectInfo();
  }, []);

  useEffect(() => {
    if (accessToken) {
      getUserInfo();
    }
  }, [accessToken]);

  function goToCreateFeature() {
    history.push('/feature/add');
  }

  function goToCreateFxied() {
    history.push('/fixed/add');
  }

  function goToFinishFeature() {
    history.push('/feature/finish');
  }

  function goToFinishFixed() {
    history.push('/fixed/finish');
  }

  return (
    <div>
      <h1 className={styles.title}>lk-vscode-gitlab</h1>

      <Avatar userInfo={userInfo}></Avatar>
      {accessToken ? (
        <>
          <div className={styles['task-btn-con']}>
            <button onClick={goToCreateFeature}>添加新功能</button>
          </div>
          <div className={styles['task-btn-con']}>
            <button onClick={goToCreateFxied}>添加新修复</button>
          </div>

          <div
          className={styles['task-btn-divider']}
          ></div>

          <div className={styles['task-btn-con']}>
            <button onClick={goToFinishFeature}>完成新功能</button>
          </div>
          <div className={styles['task-btn-con']}>
            <button onClick={goToFinishFixed}>完成新修复</button>
          </div>
        </>
      ) : (
        <Login
          accessToken={accessToken}
          setAccessToken={setAccessToken}
        ></Login>
      )}
    </div>
  );
}

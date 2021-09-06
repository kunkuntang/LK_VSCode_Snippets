import React, { useState } from 'react';
import { useEffect } from 'react';
import Avatar from './components/Avatar';
import Login from './login/login';

import styles from './index.less';
import { history } from '@/.umi/core/history';
import { getAccessTokenHooks, getUserInfoHooks } from './hooks/hooks';

export class UserInfoModel {
  avatar_url = '';
  email = '';
  id = -1;
  name = '';
  username = '';
  web_url = '';
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
  const { accessToken, setAccessToken, getAccessToken } = getAccessTokenHooks();
  const { userInfo, setUserInfo, getUserInfo } = getUserInfoHooks();

  useEffect(() => {
    getAccessToken();
    getProjectInfo();
    window.addEventListener('message', setAccessToken);
    window.addEventListener('message', setUserInfo);
    return () => {
      window.removeEventListener('message', setAccessToken);
      window.removeEventListener('message', setUserInfo);
    };
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

          <div className={styles['task-btn-divider']}></div>

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
          getAccessToken={getAccessToken}
        ></Login>
      )}
    </div>
  );
}

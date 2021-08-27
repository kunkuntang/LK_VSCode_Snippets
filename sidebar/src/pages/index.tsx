import React, { useState } from 'react';
import { useEffect } from 'react';
import styles from './index.less';

export default function IndexPage() {
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    tsvscode.postMessage({
      command: 'getAccessToken',
    });
  }, []);

  window.addEventListener('message', (event) => {
    const data = event.data as PostMessageParams;
    console.log('mess', data);
    if (data.value) {
      setAccessToken(data.value);
    }
  });

  const hanldeSetAccessToken = function () {
    console.log('accessToken', accessToken);
    tsvscode.postMessage({
      command: 'setAccessToken',
      value: accessToken,
    });
  };

  return (
    <div>
      <h1 className={styles.title}>lk-vscode-gitlab</h1>

      <div className={styles['avatar']}>
        <img></img>
      </div>

      <div style={{ display: accessToken ? 'none' : 'block'}}>
        <div className={styles['set-access-token-title']}>
          当前还没有设置 gitlab access token
        </div>

        <input
          className={styles['access-token-input']}
          onChange={(e) => {
            setAccessToken(e.target.value);
          }}
        ></input>
        <button
          className={styles['set-access-token-btn']}
          onClick={hanldeSetAccessToken}
        >
          设置
        </button>
        <div className={styles['set-access-token-help-con']}>
          <a href="https://git.liankaa.com/help/user/profile/personal_access_tokens.md">
            帮助指引
          </a>
          <a href="https://git.liankaa.com/-/profile/personal_access_tokens">
            gitlab_access_tokens
          </a>
        </div>
      </div>
    </div>
  );
}

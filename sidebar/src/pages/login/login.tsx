import React from 'react';
import styles from './login.less';

interface IProps {
  accessToken: string;
  setAccessToken: (accessToken: string) => void;
}

export default function Login(props: IProps) {
  const { accessToken, setAccessToken } = props;
  let userAccessToken = accessToken || '';

  const hanldeSetAccessToken = function () {
    console.log('user input accessToken', userAccessToken);
    if (userAccessToken) {
      setAccessToken(userAccessToken);
    } else {
      tsvscode.postMessage({
        command: 'onError',
        value: '请输入 access_token ',
      });
    }
  };

  return (
    <>
      <div className={styles['set-access-token-title']}>
        当前还没有设置 gitlab access token
      </div>
      <input
        className={styles['access-token-input']}
        onChange={(e) => {
          userAccessToken = e.target.value;
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
    </>
  );
}

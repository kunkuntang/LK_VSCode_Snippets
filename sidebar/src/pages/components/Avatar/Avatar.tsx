import { UserInfoModel } from '@/pages';
import React from 'react';
import styles from './Avatar.less';

interface IProps {
  userInfo: UserInfoModel;
}

export default function Avatar(props: IProps) {
  return (
    <div className={styles['avatar-con']}>
      {props.userInfo.name ? (
        <>
          <img
            className={styles['avatar']}
            src={props.userInfo.avatar_url}
          ></img>
          <h3 className={styles['user-name']}>{props.userInfo.name}</h3>
        </>
      ): <div className={styles['avatar-bg']}></div>}
    </div>
  );
}

import { history } from '@/.umi/core/history';
import Avatar from '@/pages/components/Avatar';
import { Form, Input, Button, Select } from 'antd';
import React from 'react';
import styles from './createFeature.less';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export default function CreateFeature() {
  function handleCreateFeature() {}
  const userInfo = window.userInfo;

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log(values);
  };

  const onCancel = () => {
    history.goBack();
  };

  return (
    <div>
      <h1 className={styles.title}>lk-vscode-gitlab</h1>

      <Avatar userInfo={userInfo}></Avatar>

      <div style={{ color: '#fff' }}>
        <h2 style={{ color: '#fff' }}>当前项目</h2>
        <h3 style={{ color: '#fff' }}>
          {window.projectInfo && (
            <a href={window.projectInfo.gitlabProjectInfo.web_url || ''}>
              {window.projectInfo.workspace?.name ||
                window.projectInfo.gitlabProjectInfo.name ||
                ''}
            </a>
          )}
        </h3>
      </div>

      <div style={{ color: '#fff' }}>
        <h2 style={{ color: '#fff' }}>创建新功能</h2>
        <ul>
          <li>在本地和远端创建同名的 feature 分支</li>
          <li>
            在 gitlab 上创建同名的 issue 和 merge_request，并关联到当前迭代
          </li>
        </ul>
      </div>

      <Form
        {...layout}
        layout="vertical"
        form={form}
        name="createFeature"
        onFinish={onFinish}
        style={{
          color: '#fff',
        }}
      >
        <Form.Item
          className={styles['form-item']}
          name="name"
          label="功能名称"
          rules={[{ required: true, message: '功能名称必填' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          className={styles['form-item']}
          name="name"
          label="关联迭代"
          rules={[{ required: true, message: '关联迭代必填' }]}
        >
          <select placeholder="Select a option and change input text above">
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>
        </Form.Item>
        <Form.Item
          className={styles['form-item']}
          name="tapd"
          label="关联tapd信息"
          rules={[{ required: true, message: '关联tapd信息必填' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item style={{ marginTop: '15px' }}>
          <button className={styles['form-button']} type="submit">
            创建
          </button>
          <button className={styles['form-button']} onClick={onCancel}>
            返回
          </button>
        </Form.Item>
      </Form>
    </div>
  );
}

import { history } from '@/.umi/core/history';
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select } from 'antd';
import styles from './createFixed.less';
import Avatar from '@/pages/components/Avatar';
import { getCurrentMileStonesHooks } from '@/pages/hooks/hooks';

const TextArea = Input.TextArea;
const { Option } = Select;

interface ICreateFixedFormData {
  milestone_id: number;
  fixedBranch: string;
  name: string;
  tapd: string;
}

interface ICreateFixedModel extends ICreateFixedFormData {
  project_id: number;
}

interface IGetFixBranchesList {
  project_id: number;
  username: string;
}

export function getFixBranchesListHooks() {
  const [fixBranchesList, setFixBranchesList] = useState([]);

  function _getFixBranchesList(params: IGetFixBranchesList) {
    tsvscode.postMessage({
      command: 'getFixBranchesList',
      value: params,
    });
  }

  function _setFixBranchesList(event: MessageEvent<PostMessageParams>) {
    const data = event.data;
    if (data.command === 'getFixBranchesList') {
      if (data.value) {
        console.log('getFixBranchesList data.value', data.value);
        setFixBranchesList(data.value);
      } else {
        setFixBranchesList([]);
      }
    }
  }

  return {
    fixBranchesList,
    getFixBranchesList: _getFixBranchesList,
    setFixBranchesList: _setFixBranchesList,
  };
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function CreateFixed() {
  const { mileStonesList, getMileStonesList, setMileStonesList } =
    getCurrentMileStonesHooks();

  const { fixBranchesList, getFixBranchesList, setFixBranchesList } =
    getFixBranchesListHooks();

  useEffect(() => {
    getMileStonesList();
    getFixBranchesList({
      project_id: window.projectInfo.gitlabProjectInfo.id,
      username: userInfo.username,
    });
    window.addEventListener('message', setMileStonesList);
    window.addEventListener('message', setFixBranchesList);
    window.addEventListener('message', handleCreateFixed);
    return () => {
      window.removeEventListener('message', setMileStonesList);
      window.removeEventListener('message', setFixBranchesList);
      window.removeEventListener('message', handleCreateFixed);
    };
  }, []);

  const userInfo = window.userInfo;

  const [form] = Form.useForm();

  function handleCreateFixed() {
    const formData = form.getFieldsValue();
    const params: ICreateFixedModel = {
      project_id: window.projectInfo.gitlabProjectInfo.id,
      ...formData,
    };
    // TODO
  }

  const onFinish = (values: ICreateFixedFormData) => {
    console.log(values);
    tsvscode.postMessage({
      command: 'createFixed',
      value: {
        ...values,
        project_id: window.projectInfo.gitlabProjectInfo.id,
      },
    });
  };

  const onCancel = () => {
    history.goBack();
  };

  return (
    <div>
      <h1 className={styles.title}>lk-vscode-gitlab</h1>

      <Avatar userInfo={userInfo}></Avatar>

      <div className={styles.text}>
        <h2 className={styles.text}>当前项目</h2>
        <h3 className={styles.text}>
          {window.projectInfo && (
            <a href={window.projectInfo.gitlabProjectInfo.web_url || ''}>
              {window.projectInfo.workspace?.name ||
                window.projectInfo.gitlabProjectInfo.name ||
                ''}
            </a>
          )}
        </h3>
      </div>

      <div className={styles.text}>
        <h2 className={styles.text}>创建新修复</h2>
        <h3 className={styles.text}>修复新功能（feature 分支）问题</h3>
        <ul>
          <li>从未完成的新功能分支中建立新的分支</li>
          <li>
            在 gitlab 上创建同名的 issue 和
            merge_request，且源分支是修复的功能分支，然后关联到当前迭代
          </li>
        </ul>
        <h3 className={styles.text}>修复线上（master 分支）问题</h3>
        <ul>
          <li>从 master 分支中建立新的分支</li>
          <li>
            在 gitlab 上创建同名的 issue 和
            merge_request，且源分支是新创建的修复分支，并关联到当前迭代
          </li>
        </ul>
      </div>

      <Form
        {...layout}
        layout="vertical"
        form={form}
        name="createFixed"
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
          name="milestone_id"
          label="修复分支"
          rules={[{ required: true, message: '修复分支必填' }]}
        >
          <Select>
            {[{ name: 'master' }, ...fixBranchesList].map((item: any) => {
              return (
                <Option value={item.name} key={item.name}>
                  {item.name}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          className={styles['form-item']}
          name="milestone_id"
          label="关联里程碑"
          rules={[{ required: true, message: '关联里程碑必填' }]}
        >
          <Select>
            {mileStonesList.map((item: any) => {
              return (
                <Option value={item.id} key={item.id}>
                  {item.title}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          className={styles['form-item']}
          name="tapd"
          label="关联tapd信息"
          rules={[{ required: true, message: '关联tapd信息必填' }]}
        >
          <Input.TextArea className={styles['form-textarea']} />
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

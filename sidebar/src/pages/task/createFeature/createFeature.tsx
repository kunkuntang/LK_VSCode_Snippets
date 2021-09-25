import { history } from '@/.umi/core/history';
import Avatar from '@/pages/components/Avatar';
import { getCurrentMileStonesHooks } from '@/pages/hooks/hooks';
import { Form, Input, Button, Select } from 'antd';
import React from 'react';
import { useEffect } from 'react';
import styles from './createFeature.less';

const { Option } = Select;

interface ICreateFeatureFormData {
  milestone_id: number;
  name: string;
  tapd: string;
}

interface ICreateFeatureModel extends ICreateFeatureFormData {
  project_id: number;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

function createFeatureHooks() {}

export default function CreateFeature() {
  const { mileStonesList, getMileStonesList, setMileStonesList } =
    getCurrentMileStonesHooks();

  useEffect(() => {
    getMileStonesList();
    window.addEventListener('message', setMileStonesList);
    window.addEventListener('message', handleCreateFeature);
    return () => {
      window.removeEventListener('message', setMileStonesList);
      window.removeEventListener('message', handleCreateFeature);
    };
  }, []);
  const userInfo = window.userInfo;

  const [form] = Form.useForm();

  function handleCreateFeature(event: MessageEvent<PostMessageParams>) {
    const data = event.data;
    if (data.command === 'createFeature') {
      if (data.value) {
        history.goBack();
      }
    }
  }

  const onFinish = (values: ICreateFeatureFormData) => {
    console.log(values);
    tsvscode.postMessage({
      command: 'createFeature',
      value: {
        ...values,
        name: values.name + `_${userInfo.username}`,
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
        <h2 className={styles.text}>创建新功能</h2>
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

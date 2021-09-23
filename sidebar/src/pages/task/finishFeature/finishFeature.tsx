import Avatar from '@/pages/components/Avatar';
import styles from './finishFeature.less';
import { Form, Input, Button, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { history } from '@/.umi/core/history';
const { Option } = Select;

interface IFinishFeatureFormData {
  merge_request_id: number;
  is_delete_local_branch: boolean;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

function getCurrentMergeRequestHooks() {
  const [mergeRequestList, setMergeRequestList] = useState<
    {
      iid: number;
      title: string;
      source_branch: string;
    }[]
  >([]);

  function _getMergeRequestList(params: {
    project_id: number;
    author_id: number;
  }) {
    tsvscode.postMessage({
      command: 'getCurrentMergeRequest',
      value: {
        project_id: params.project_id,
        author_id: params.author_id,
      },
    });
  }

  function _setMergeRequestList(event: MessageEvent<PostMessageParams>) {
    const data = event.data;
    if (data.command === 'getCurrentMergeRequest') {
      if (data.value) {
        console.log('data.value', data.value);
        setMergeRequestList(data.value.filter((item: { title: string }) => item.title.includes('Feature')));
      } else {
        setMergeRequestList([]);
      }
    }
  }

  return {
    mergeRequestList,
    getMergeRequestList: _getMergeRequestList,
    setMergeRequestList: _setMergeRequestList,
  };
}

export default function FinishFeature() {
  const userInfo = window.userInfo;
  const { mergeRequestList, getMergeRequestList, setMergeRequestList } =
    getCurrentMergeRequestHooks();

  useEffect(() => {
    getMergeRequestList({
      project_id: window.projectInfo.gitlabProjectInfo.id,
      author_id: userInfo.id,
    });
    window.addEventListener('message', setMergeRequestList);
    window.addEventListener('message', handleFinishFeature);
    return () => {
      window.removeEventListener('message', setMergeRequestList);
      window.removeEventListener('message', handleFinishFeature);
    };
  }, []);

  function handleFinishFeature(event: MessageEvent<PostMessageParams>) {
    const data = event.data;
    if (data.command === 'finishFeature') {
      if (data.value) {
        history.goBack();
      }
    }
  }

  const [form] = Form.useForm();

  const onFinish = (values: IFinishFeatureFormData) => {
    console.log(values);
    const merge_request_id = values.merge_request_id;
    const selectMergeRequest = mergeRequestList.find((item) => {
      return item.iid === merge_request_id;
    });
    tsvscode.postMessage({
      command: 'finishFeature',
      value: {
        ...values,
        project_id: window.projectInfo.gitlabProjectInfo.id,
        merge_request_title: selectMergeRequest?.title,
        source_branch: selectMergeRequest?.source_branch,
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
          name="merge_request_id"
          label="完成的功能"
          rules={[{ required: true, message: '完成的功能必填' }]}
          valuePropName="checked"
        >
          <Select>
            {mergeRequestList.map((item: any) => {
              return (
                <Option value={item.iid} key={item.iid}>
                  {item.title}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          className={styles['form-item']}
          name="is_delete_local_branch"
          label="是否删除本地分支"
          initialValue={true}
          style={{ maxWidth: 'unset' }}
          valuePropName="checked"
        >
          <Switch></Switch>
        </Form.Item>
        <Form.Item style={{ marginTop: '15px' }}>
          <button className={styles['form-button']} type="submit">
            完成
          </button>
          <button className={styles['form-button']} onClick={onCancel}>
            返回
          </button>
        </Form.Item>
      </Form>
    </div>
  );
}

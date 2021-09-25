import Avatar from '@/pages/components/Avatar';
import styles from './finishFixed.less';
import { Form, Input, Button, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { history } from '@/.umi/core/history';
const { Option } = Select;

interface IFinishFixedFormData {
  fixedBranch: string;
  is_delete_local_branch: boolean;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

function getCurrentHotfixedHooks() {
  const [hotfixedList, setHotfixedList] = useState<
    {
      iid: number;
      title: string;
      source_branch: string;
    }[]
  >([]);

  function _getHotfixedList(params: { project_id: number; author_id: number }) {
    tsvscode.postMessage({
      command: 'getCurrentHotfixedBranch',
      value: {
        project_id: params.project_id,
        author_id: params.author_id,
      },
    });
  }

  function _setHotfixedList(event: MessageEvent<PostMessageParams>) {
    const data = event.data;
    if (data.command === 'getCurrentHotfixedBranch') {
      if (data.value) {
        console.log('data.value', data.value);
        setHotfixedList(data.value);
      } else {
        setHotfixedList([]);
      }
    }
  }

  return {
    hotfixedList,
    getHotfixedList: _getHotfixedList,
    setHotfixedList: _setHotfixedList,
  };
}

export default function finishFixed() {
  const userInfo = window.userInfo;
  const { hotfixedList, getHotfixedList, setHotfixedList } =
    getCurrentHotfixedHooks();

  useEffect(() => {
    getHotfixedList({
      project_id: window.projectInfo.gitlabProjectInfo.id,
      author_id: userInfo.id,
    });
    window.addEventListener('message', setHotfixedList);
    window.addEventListener('message', handleFinishFixed);
    return () => {
      window.removeEventListener('message', setHotfixedList);
      window.removeEventListener('message', handleFinishFixed);
    };
  }, []);

  function handleFinishFixed(event: MessageEvent<PostMessageParams>) {
    const data = event.data;
    if (data.command === 'finishFixed') {
      if (data.value) {
        history.goBack();
      }
    }
  }

  const [form] = Form.useForm();

  const onFinish = (values: IFinishFixedFormData) => {
    console.log(values);
    const fixedBranch = values.fixedBranch;
    let matchRes = fixedBranch.match(/{(\w+)}/);
    let source_branch = '';
    if (matchRes) {
      source_branch = matchRes[1];
    }
    const selectHotfixed = hotfixedList.find((item) => {
      return item.title === fixedBranch;
    });
    if (source_branch) {
      tsvscode.postMessage({
        command: 'finishFixed',
        value: {
          ...values,
          project_id: window.projectInfo.gitlabProjectInfo.id,
          merge_request_id: selectHotfixed?.iid,
          source_branch,
        },
      });
    } else {
      tsvscode.postMessage({
        command: 'finishFixed',
        value: '请选择正确的修复分支，格式：***_username_{source_branch',
      });
    }
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
          name="fixedBranch"
          label="完成的修复"
          rules={[{ required: true, message: '完成的的修复必填' }]}
          valuePropName="checked"
        >
          <Select>
            {hotfixedList
              .filter((item: any) => item.title.indexOf(userInfo.username) > -1)
              .map((item: any, index: number) => {
                return (
                  <Option value={item.title} key={index}>
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

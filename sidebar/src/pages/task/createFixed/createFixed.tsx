import { Input, Form } from 'antd';
import React from 'react';

const TextArea = Input.TextArea;

export default function CreateFixed() {
  function handleCreateFeature() {}

  return (
    <Form>
      <div>
        <label htmlFor="name">功能名称：</label>
        <Input></Input>
      </div>
      <div>
        <label htmlFor="name">关联迭代：</label>
        <input></input>
      </div>
      <div>
        <label htmlFor="name">关联tapd链接：</label>
        <TextArea></TextArea>
      </div>
    </Form>
  );
}

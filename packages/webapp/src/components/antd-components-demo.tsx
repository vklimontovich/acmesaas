// pages/components.tsx
import React from 'react';
import { Button, DatePicker, Input, Switch, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const ComponentsPage: React.FC = () => {
  // Example table data
  const columns: ColumnsType<{ key: string; name: string; age: number; tags: string[] }> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (_, { tags }) => (
        <>
          {tags.map((tag) => (
            <Tag color="blue" key={tag}>
              {tag.toUpperCase()}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      tags: ['nice', 'developer'],
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      tags: ['cool', 'teacher'],
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      tags: ['awesome', 'designer'],
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      

      <h3>Button</h3>
      <Button type="primary">Primary Button</Button>
      <Button type="default" style={{ marginLeft: 8 }}>Default Button</Button>
      <Button type="dashed" style={{ marginLeft: 8 }}>Dashed Button</Button>
      <Button type="text" style={{ marginLeft: 8 }}>Text Button</Button>
      <Button type="link" style={{ marginLeft: 8 }}>Link Button</Button>

      <h3 style={{ marginTop: 24 }}>Input</h3>
      <Input placeholder="Basic input" style={{ width: 200 }} />
      <Input.Password placeholder="Password input" style={{ width: 200, marginLeft: 8 }} />

      <h3 style={{ marginTop: 24 }}>DatePicker</h3>
      <DatePicker />

      <h3 style={{ marginTop: 24 }}>Switch</h3>
      <Switch />

      <h3 style={{ marginTop: 24 }}>Tooltip</h3>
      <Tooltip title="Tooltip text">
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Hover me</span>
      </Tooltip>

      <h3 style={{ marginTop: 24 }}>Table</h3>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default ComponentsPage;
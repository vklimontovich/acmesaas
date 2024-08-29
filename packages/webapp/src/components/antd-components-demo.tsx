"use client";
import React from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Collapse,
  DatePicker,
  Input,
  InputNumber,
  Pagination,
  Progress,
  Radio,
  Rate,
  Select,
  Slider,
  Spin,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Transfer,
  Tree,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { Step } = Steps;
const { TabPane } = Tabs;
const { TreeNode } = Tree;

const AntdComponentsDemo: React.FC = () => {
  // Example table data
  const columns: ColumnsType<{ key: string; name: string; age: number; tags: string[] }> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Tags",
      key: "tags",
      dataIndex: "tags",
      render: (_, { tags }) => (
        <>
          {tags.map(tag => (
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
      key: "1",
      name: "John Brown",
      age: 32,
      tags: ["nice", "developer"],
    },
    {
      key: "2",
      name: "Jim Green",
      age: 42,
      tags: ["cool", "teacher"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      tags: ["awesome", "designer"],
    },
  ];

  return (
    <div>
      <Button type="primary">Primary Button</Button>
      <Button type="default" style={{ marginLeft: 8 }}>
        Default Button
      </Button>
      <Button type="dashed" style={{ marginLeft: 8 }}>
        Dashed Button
      </Button>
      <Button type="text" style={{ marginLeft: 8 }}>
        Text Button
      </Button>
      <Button type="link" style={{ marginLeft: 8 }}>
        Link Button
      </Button>

      <h3 style={{ marginTop: 24 }}>Input</h3>
      <Input placeholder="Basic input" style={{ width: 200 }} />
      <Input.Password placeholder="Password input" style={{ width: 200, marginLeft: 8 }} />
      <InputNumber min={1} max={10} defaultValue={3} style={{ marginTop: 16 }} />

      <h3 style={{ marginTop: 24 }}>DatePicker</h3>
      <DatePicker />
      <RangePicker style={{ marginLeft: 8 }} />

      <h3 style={{ marginTop: 24 }}>Switch</h3>
      <Switch />

      <h3 style={{ marginTop: 24 }}>Checkbox</h3>
      <Checkbox>Checkbox</Checkbox>

      <h3 style={{ marginTop: 24 }}>Radio</h3>
      <Radio>Radio</Radio>

      <h3 style={{ marginTop: 24 }}>Select</h3>
      <Select defaultValue="Option1" style={{ width: 120 }}>
        <Select.Option value="Option1">Option 1</Select.Option>
        <Select.Option value="Option2">Option 2</Select.Option>
        <Select.Option value="Option3">Option 3</Select.Option>
      </Select>

      <h3 style={{ marginTop: 24 }}>Slider</h3>
      <Slider defaultValue={30} />

      <h3 style={{ marginTop: 24 }}>Rate</h3>
      <Rate />

      <h3 style={{ marginTop: 24 }}>Progress</h3>
      <Progress percent={50} />

      <h3 style={{ marginTop: 24 }}>Spin</h3>
      <Spin />

      <h3 style={{ marginTop: 24 }}>Alert</h3>
      <Alert message="Success Text" type="success" />

      <h3 style={{ marginTop: 24 }}>Badge</h3>
      <Badge count={5}>
        <Avatar shape="square" size="large" />
      </Badge>

      <h3 style={{ marginTop: 24 }}>Card</h3>
      <Card title="Card Title" bordered={false} style={{ width: 300 }}>
        Card content
      </Card>

      <h3 style={{ marginTop: 24 }}>Collapse</h3>
      <Collapse defaultActiveKey={["1"]}>
        <Panel header="This is panel header 1" key="1">
          <p>Panel content 1</p>
        </Panel>
        <Panel header="This is panel header 2" key="2">
          <p>Panel content 2</p>
        </Panel>
      </Collapse>

      <h3 style={{ marginTop: 24 }}>Table</h3>
      <Table columns={columns} dataSource={data} />

      <h3 style={{ marginTop: 24 }}>Pagination</h3>
      <Pagination defaultCurrent={1} total={50} />

      <h3 style={{ marginTop: 24 }}>Tabs</h3>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Tab 1" key="1">
          Tab 1 content
        </TabPane>
        <TabPane tab="Tab 2" key="2">
          Tab 2 content
        </TabPane>
        <TabPane tab="Tab 3" key="3">
          Tab 3 content
        </TabPane>
      </Tabs>

      <h3 style={{ marginTop: 24 }}>Steps</h3>
      <Steps current={1}>
        <Step title="Finished" description="This is a description." />
        <Step title="In Progress" description="This is a description." />
        <Step title="Waiting" description="This is a description." />
      </Steps>

      <h3 style={{ marginTop: 24 }}>Tree</h3>
      <Tree>
        <TreeNode title="Parent 1" key="0-0">
          <TreeNode title="Child 1" key="0-0-0" />
          <TreeNode title="Child 2" key="0-0-1" />
        </TreeNode>
      </Tree>

      <h3 style={{ marginTop: 24 }}>Transfer</h3>
      <Transfer
        dataSource={[
          { key: "1", title: "Item 1" },
          { key: "2", title: "Item 2" },
          { key: "3", title: "Item 3" },
        ]}
        targetKeys={["2"]}
        render={item => item.title}
      />

      <h3 style={{ marginTop: 24 }}>Upload</h3>
      <Upload>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      <Upload.Dragger name="files" action="/upload.do" style={{ marginTop: 16 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
      </Upload.Dragger>
    </div>
  );
};

export { AntdComponentsDemo };

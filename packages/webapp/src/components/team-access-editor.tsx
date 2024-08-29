"use server";
import { prisma } from "@/lib/server/prisma";
import { Table } from "antd";
import { getPageContext } from "@/lib/server/page-context";

export const OrgAccess: React.FC<{userId: string, orgId: string}> = async props => {
  const users = await prisma.user.findMany({ where: { memberships: {some: {organizationId: props.orgId}} } });
  return (
    <Table
      columns={[
        {
          title: "Member",
          dataIndex: "name",
          key: "name",
          render: (name: string, data) => <a>{JSON.stringify(data)}</a>,
        },
        { title: "", dataIndex: "actions", key: "name", render: (data) => <a>{JSON.stringify(data)}</a> },
      ]}
      dataSource={users.map(u => ({
        email: u.email,
        self: u.id === context.user.id,
      }))}
    ></Table>
  );
};

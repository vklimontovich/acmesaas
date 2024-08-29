"use client";
import { Button, Modal, notification, Table, Tag } from "antd";
import { Check, MailCheck, Trash, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import Input from "antd/es/input";
import axios from "axios";
import { useTeamPageContext } from "@/components/team-page";
import Link from "next/link";

export type TeamAccessEditorUserProps =
  | {
      email: string;
      self: boolean;
      status: "invited";
      invitationCode: string;
      invitationId: string;
      userId?: never;
    }
  | {
      email: string;
      self: boolean;
      status: "active";
      userId: string;
      invitationCode?: never;
      invitationId?: never;
    };
export const InvitationButton: React.FC<{ onSuccess: (invited: TeamAccessEditorUserProps) => void }> = props => {
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const { team } = useTeamPageContext();
  const inviteUser = async () => {
    setInviting(true);
    try {
      const {
        data: { code, id },
      } = await axios.post("/api/team/invite", { email, teamId: team.id });
      props.onSuccess({ email, self: false, status: "invited", invitationCode: code, invitationId: id });
    } catch (error) {
      console.error("Failed to invite user", error);
      notification.error({ message: "Failed to invite user" });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="flex flex-nowrap gap-2 items-center">
      <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} size="large" />
      <Button
        type="primary"
        icon={<UserPlus />}
        size="large"
        onClick={inviteUser}
        loading={inviting}
        disabled={!email || email.indexOf("@") <= 0}
      >
        Invite Member
      </Button>
    </div>
  );
};

export const DeleteButton: React.FC<{
  user: TeamAccessEditorUserProps;
  onDeleted: (user: TeamAccessEditorUserProps) => Promise<void> | void;
}> = props => {
  const { team } = useTeamPageContext();
  const [deleting, setDeleting] = useState(false);
  const deleteUser = async () => {
    setDeleting(true);
    try {
      if (props.user.status === "invited") {
        await axios.delete(`/api/team/invite?invitationId=${props.user.invitationId}`);
      } else {
        await axios.delete(`/api/team?userId=${props.user.userId}&teamId=${team.id}`);
      }
      await props.onDeleted(props.user);
    } catch (error) {
      console.error("Failed to delete user", error);
      notification.error({ message: "Failed to delete user" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      danger
      icon={<Trash className="w-4 h-4" />}
      type="link"
      size="small"
      onClick={deleteUser}
      loading={deleting}
    />
  );
};

function ShowInvitation(props: { user: TeamAccessEditorUserProps }) {
  const [visible, setVisible] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return (
    <>
      <Button type="link" size="small" onClick={() => setVisible(true)}>
        Show Invitation
      </Button>
      <Modal
        title="Invitation"
        open={visible}
        width={"90%"}
        onOk={() => setVisible(false)}
        onClose={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      >
        Copy this link to invite the <b>{props.user.email}</b> to the team:
        <div className="mt-2">
          <Link href={`${origin}/invite?code=${props.user.invitationCode}`}>
            <code className={"whitespace-nowrap"}>
              {origin}/invite?code={props.user.invitationCode}
            </code>
          </Link>
        </div>
      </Modal>
    </>
  );
}

export const TeamAccessEditorView: React.FC<{
  users: TeamAccessEditorUserProps[];
}> = props => {
  const [users, setUsers] = useState<TeamAccessEditorUserProps[]>(props.users);

  return (
    <div>
      <div className="mb-2">
        <InvitationButton onSuccess={newUser => setUsers([...users, newUser])} />
      </div>
      <Table
        pagination={false}
        size="small"
        bordered={true}
        columns={[
          {
            title: "Member",
            dataIndex: "email",
            key: "email",
          },
          {
            title: "Status",
            dataIndex: "name",
            key: "name",
            render: (_, user) =>
              user.status === "invited" ? (
                <div>
                  <Tag icon={<MailCheck className="h-3 w-3 mr-1 ant-icon inline" />}>Invited</Tag>
                  <ShowInvitation user={user} />
                </div>
              ) : (
                <Tag color="success" icon={<Check className="h-3 w-3 mr-1 ant-icon inline" />}>
                  Active
                </Tag>
              ),
          },
          {
            title: "",
            dataIndex: "actions",
            key: "name",
            render: (_, user) =>
              user.self ? (
                <span>You</span>
              ) : (
                <DeleteButton user={user} onDeleted={user => setUsers(users.filter(u => u.email !== user.email))} />
              ),
          },
        ]}
        dataSource={users}
      />
    </div>
  );
};

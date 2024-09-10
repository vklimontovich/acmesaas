"use client";
import { Button, Modal, notification, Skeleton, Table, Tag } from "antd";
import { Check, MailCheck, Trash, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import Input from "antd/es/input";
import axios from "axios";
import { useTeamPageContext } from "@/components/team-page";
import Link from "next/link";
import { InlineError } from "@/components/errors/inline-error";
import { TeamAccessEntry } from "@/lib/schema/invitation";

export const InvitationButton: React.FC<{ onSuccess: (invited: TeamAccessEntry) => void }> = props => {
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const { team, user } = useTeamPageContext();
  const inviteUser = async () => {
    setInviting(true);
    try {
      const {
        data: { code, id },
      } = await axios.post("/api/team/members", { email, teamId: team.id });
      props.onSuccess({ email, status: "invited", invitationCode: code, invitationId: id, invitedByUserId: user.id });
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
  user: TeamAccessEntry;
  onDeleted: (user: TeamAccessEntry) => Promise<void> | void;
}> = props => {
  const { team } = useTeamPageContext();
  const [deleting, setDeleting] = useState(false);
  const deleteUser = async () => {
    setDeleting(true);
    try {
      if (props.user.status === "invited") {
        await axios.delete(`/api/team/members?invitationId=${props.user.invitationId}&teamId=${team.id}`);
      } else {
        await axios.delete(`/api/team/members?userId=${props.user.userId}&teamId=${team.id}`);
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

function ShowInvitation(props: { user: TeamAccessEntry }) {
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

export const TeamAccessEditor: React.FC<{}> = props => {
  const [users, setUsers] = useState<TeamAccessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>();
  const { team, user } = useTeamPageContext();
  useEffect(() => {
    if (!team?.id) {
      return;
    }
    const controller = new AbortController();
    axios
      .get(`/api/team/members?teamId=${team.id}`, { signal: controller.signal })
      .then(res => {
        setUsers(res.data);
      })
      .catch(e => {
        if (!controller.signal.aborted) {
          console.error("Failed to load team members from /api/team/members", e);
          setError(e);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [team?.id]);

  if (loading) {
    return <Skeleton title={false} active paragraph={{ rows: 3, width: "100%" }} />;
  } else if (error) {
    return <InlineError error={error} title="Can't load the form" />;
  }

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
            render: (_, u: TeamAccessEntry) =>
              u.userId == user.id ? (
                <span className="text-foreground-light font-medium">You</span>
              ) : (
                <DeleteButton user={u} onDeleted={user => setUsers(users.filter(u => u.email !== user.email))} />
              ),
          },
        ]}
        dataSource={users}
      />
    </div>
  );
};

import React from "react";
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";
import { brand } from "@/lib/content/branding";

export type EmailComponent<P> = React.FC<P> & {
  subject: (props: P) => string;
  plainText: (props: P) => string;
};

export type InviteEmailProps = {
  inviterName?: string;
  teamName?: string;
  serviceName?: string;
  acceptInviteUrl?: string;
};

export const InviteEmail: EmailComponent<InviteEmailProps> = ({
  inviterName = "John Doe",
  teamName = "Acme Corp",
  serviceName = "Super Saas",
  acceptInviteUrl = "#",
}) => (
  <Html>
    <Head />
    <Preview>
      You{"'"}re invited to join {teamName} on {serviceName}!
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>
          You{"'"}re Invited to Join {teamName} on {serviceName}!
        </Heading>
        <Text style={text}>Hi there,</Text>
        <Text style={text}>
          {inviterName} has invited you to join the <b>{teamName}</b> on <b>{serviceName}</b>. We are excited to have
          you on board!
        </Text>
        <Text style={text}>To accept the invitation and get started, please click the link below:</Text>
        <Link href={acceptInviteUrl} style={button}>
          Accept Invitation
        </Link>
      </Container>
    </Body>
  </Html>
);

InviteEmail.subject = ({ teamName, serviceName }) =>
  `You're invited to join ${teamName || serviceName} on ${brand.serviceName}`;
InviteEmail.plainText = ({
  inviterName = "John Doe",
  teamName = "Acme Corp",
  serviceName = "Super Saas",
  acceptInviteUrl = "#",
}: InviteEmailProps) => `
You're invited to join ${teamName} on ${serviceName}!

Hi there,

${inviterName} has invited you to join the ${teamName} on ${serviceName}. We are excited to have you on board!

To accept the invitation and get started, please visit the following link:

${acceptInviteUrl}

If you have any questions or need assistance, feel free to reach out to us.
`;

const main = {
  backgroundColor: "#f6f9fc",
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "20px",
  maxWidth: "600px",
  margin: "0 auto",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
  color: "#333333",
};

const text = {
  fontSize: "16px",
  color: "#333333",
  marginBottom: "20px",
};

const button = {
  display: "inline-block",
  backgroundColor: "#000000",
  color: "#ffffff",
  fontWeight: "medium",
  padding: "10px 20px",
  borderRadius: "5px",
  textDecoration: "none",
};

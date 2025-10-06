import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Link,
} from "@react-email/components";
import * as React from "react";

interface CriticalIncidentEmailProps {
  incidentTitle: string;
  incidentDescription: string;
  incidentUrl: string;
}

export const CriticalIncidentEmail = ({
  incidentTitle,
  incidentDescription,
  incidentUrl,
}: CriticalIncidentEmailProps) => (
  <Html>
    <Head />
    <Preview>Critical Incident Reported: {incidentTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>New Critical Incident Reported</Heading>
        <Section style={box}>
          <Text style={paragraph}>
            A new high-priority incident has been reported that requires your
            attention.
          </Text>
          <Section style={section}>
            <Text style={label}>Title:</Text>
            <Text style={value}>{incidentTitle}</Text>
          </Section>
          <Section style={section}>
            <Text style={label}>Description:</Text>
            <Text style={value}>{incidentDescription}</Text>
          </Section>
          <Link href={incidentUrl} style={button}>
            View Incident Details
          </Link>
        </Section>
        <Text style={footer}>
          You are receiving this email because you are a key responder in your
          department.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default CriticalIncidentEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "20px",
  color: "#d92525",
};

const section = {
  marginBottom: "20px",
};

const label = {
  fontSize: "14px",
  color: "#5f6368",
  marginBottom: "4px",
};

const value = {
  fontSize: "16px",
  color: "#202124",
  paddingLeft: "4px",
  borderLeft: "3px solid #eee",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const button = {
  backgroundColor: "#007bff",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 20px",
  marginTop: "10px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "20px",
};

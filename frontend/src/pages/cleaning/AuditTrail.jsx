import React from 'react';
import TimelinePanel from '../../components/TimelinePanel';

export default function AuditTrail(props) {
  return <TimelinePanel data={props.data} />;
}

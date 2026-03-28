// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import * as S from './Footer.styled';
import { useAuth } from '../../providers/Auth.provider';
import { CypressFields } from '../../utils/enums/CypressFields';
import PlatformFlag from '../PlatformFlag';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const { sessionUserId } = useAuth();
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(sessionUserId);
  }, [sessionUserId]);

  return (
    <S.Footer>
      <div>
        <p>This website is hosted for demo purpose only. It is not an actual shop.</p>
        <p>
          <span data-cy={CypressFields.SessionId}>session-id: {sessionId}</span>
        </p>
      </div>
      <p>
        @ {currentYear} OpenTelemetry (<a href="https://github.com/open-telemetry/opentelemetry-demo">Source Code</a>)
      </p>
      <PlatformFlag />
    </S.Footer>
  );
};

export default Footer;

// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import * as S from './Footer.styled';
import { CypressFields } from '../../utils/enums/CypressFields';
import PlatformFlag from '../PlatformFlag';
import { useSession } from '../../providers/Session.provider';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const {
    session: { userId },
    selectedUser,
  } = useSession();

  return (
    <S.Footer>
      <div>
        <p>This website is hosted for demo purpose only. It is not an actual shop.</p>
        <p>
          <span data-cy={CypressFields.SessionId}>
            session-id: {selectedUser?.id || userId}
          </span>
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

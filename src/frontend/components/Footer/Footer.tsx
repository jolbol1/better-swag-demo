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
        <p>Better Swag is a demo merch store for Better Stack. Orders are simulated for observability demos only.</p>
        <p>
          <span data-cy={CypressFields.SessionId}>
            session-id: {selectedUser?.id || userId}
          </span>
        </p>
      </div>
      <p>
        @ {currentYear} Better Swag (<a href="https://github.com/open-telemetry/opentelemetry-demo">Demo Source</a>)
      </p>
      <PlatformFlag />
    </S.Footer>
  );
};

export default Footer;

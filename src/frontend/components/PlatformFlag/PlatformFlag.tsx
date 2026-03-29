// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import * as S from './PlatformFlag.styled';

const PlatformFlag = () => {
  const platform = typeof window !== 'undefined' ? window.ENV?.NEXT_PUBLIC_PLATFORM || 'local' : 'local';

  return (
    <S.Block>{platform}</S.Block>
  );
};

export default PlatformFlag;

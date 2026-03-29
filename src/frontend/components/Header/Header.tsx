// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import CartIcon from '../CartIcon';
import CurrencySwitcher from '../CurrencySwitcher';
import SessionControls from '../SessionControls';
import * as S from './Header.styled';

const Header = () => {
  return (
    <S.Header>
      <S.NavBar>
        <S.Container>
          <S.NavBarBrand href="/">
            <S.BrandImg />
          </S.NavBarBrand>
          <S.Controls>
            <CurrencySwitcher />
            <SessionControls />
            <CartIcon />
          </S.Controls>
        </S.Container>
      </S.NavBar>
    </S.Header>
  );
};

export default Header;

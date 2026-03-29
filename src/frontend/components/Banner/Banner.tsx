// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Image from 'next/image';
import Link from 'next/link';
import * as S from './Banner.styled';

const Banner = () => {
  return (
    <S.Banner>
      <S.TextContainer>
        <S.Eyebrow>Better Swag</S.Eyebrow>
        <S.Title>Merch for the people who read incident timelines for fun.</S.Title>
        <S.Description>
          Better Swag turns the existing demo storefront into a sharper merch drop: heavyweight layers,
          clean drinkware, canvas carry, and everyday essentials for teams that live in dashboards.
        </S.Description>
        <S.StatRow>
          <S.StatCard>
            <S.StatValue>10</S.StatValue>
            <S.StatLabel>Core items</S.StatLabel>
          </S.StatCard>
          <S.StatCard>
            <S.StatValue>4</S.StatValue>
            <S.StatLabel>Collections</S.StatLabel>
          </S.StatCard>
          <S.StatCard>
            <S.StatValue>1</S.StatValue>
            <S.StatLabel>Fast flow</S.StatLabel>
          </S.StatCard>
        </S.StatRow>
        <div>
          <Link href="#hot-products">
            <S.GoShoppingButton>Browse the Drop</S.GoShoppingButton>
          </Link>
          <Link href="/sign-in">
            <S.SecondaryAction>Pick a Demo User</S.SecondaryAction>
          </Link>
        </div>
      </S.TextContainer>
      <S.ImageContainer>
        <S.HoodieCard>
          <Image src="/images/products/OLJCESPC7Z.png" alt="Better Swag hoodie" width={512} height={512} />
        </S.HoodieCard>
        <S.MugCard>
          <Image src="/images/products/2ZYFJ3GM2N.png" alt="Better Swag mug" width={512} height={512} />
        </S.MugCard>
        <S.ToteCard>
          <Image src="/images/products/9SIQT8TOJO.png" alt="Better Swag tote" width={512} height={512} />
        </S.ToteCard>
      </S.ImageContainer>
    </S.Banner>
  );
};

export default Banner;

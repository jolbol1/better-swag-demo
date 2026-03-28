import * as Sentry from '@sentry/nextjs';
import NextErrorComponent from 'next/error';
import type { NextPageContext } from 'next';

type ErrorPageProps = {
  statusCode: number;
};

function ErrorPage({ statusCode }: ErrorPageProps) {
  return <NextErrorComponent statusCode={statusCode} />;
}

ErrorPage.getInitialProps = async (contextData: NextPageContext) => {
  await Sentry.captureUnderscoreErrorException(contextData);

  return NextErrorComponent.getInitialProps(contextData);
};

export default ErrorPage;

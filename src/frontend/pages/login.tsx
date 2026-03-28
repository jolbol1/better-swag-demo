import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LoginView from '../components/store/LoginView';

const LoginPage: NextPage = () => {
  const { query } = useRouter();
  const redirectTo = typeof query.from === 'string' && query.from ? query.from : '/';

  return (
    <>
      <Head>
        <title>Login | Better Swag</title>
      </Head>
      <LoginView redirectTo={redirectTo} />
    </>
  );
};

export default LoginPage;

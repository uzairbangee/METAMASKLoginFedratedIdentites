import React, { useEffect, useContext } from 'react';
import Login from '../components/login';
import Dashboard from '../components/dashboard';
import { AuthContext } from '../context/AuthProvider';
import { AwsContext } from '../context/AwsProvider';
import { AwsClient } from 'aws4fetch';
import awsconfig from "../aws-exports";
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import { ApolloProvider } from 'react-apollo';
// import { Rehydrated } from 'aws-appsync-react';
export default function Home() {

  // const { authState, dispatch } = useContext(AuthContext);

  // React.useEffect(() => {
  //   const address = JSON.parse(localStorage.getItem('address') || null);
  //   const sessionToken = JSON.parse(
  //     localStorage.getItem('sessionToken') || null
  //   );
  //   const secretKey = JSON.parse(localStorage.getItem('secretKey') || null);
  //   const accessKeyId = JSON.parse(localStorage.getItem('accessKeyId') || null);
  //   const expiration = JSON.parse(localStorage.getItem('expiration') || null);
  //   const today = new Date();

  //   if (address && sessionToken && expiration) {
  //     if (new Date(expiration) > today) {
  //       dispatch({
  //         type: 'LOGIN',
  //         payload: {
  //           address,
  //           sessionToken,
  //           secretKey,
  //           accessKeyId,
  //           expiration,
  //         },
  //       });
  //       // const aws = new AwsClient({
  //       //   accessKeyId,
  //       //   secretAccessKey: secretKey,
  //       //   sessionToken,
  //       //   region: 'us-east-1',
  //       //   service: 'execute-api',
  //       // });
  //       const clients = new AWSAppSyncClient({
  //         url: awsconfig.aws_appsync_graphqlEndpoint,
  //         region: awsconfig.aws_appsync_region,
  //         auth: {
  //           type: AUTH_TYPE.AWS_IAM,
  //           credentials: () => ({
  //             accessKeyId,
  //             secretAccessKey: secretKey,
  //             sessionToken
  //           }),
  //         },
  //         disableOffline: true
  //       });
  //       setAwsClient(clients);
  //     } else {
  //       dispatch({
  //         type: 'LOGOUT',
  //       });
  //     }
  //   }
  // }, []);

  return (
    
        <div className='app-container'>
          <Login />
        </div>
  )
}

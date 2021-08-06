import React, { useState } from 'react';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import awsconfig from "../aws-exports";

export const AwsContext = React.createContext();

export const AwsProvider = (props) => {
  const [client, setAwsClient] = useState({
    url: awsconfig.aws_appsync_graphqlEndpoint,
    region: awsconfig.aws_appsync_region,
    auth: {
      type: AUTH_TYPE.AWS_IAM
    },
  });

  return (
    <AwsContext.Provider
      value={{
        client,
        setAwsClient,
      }}
    >
      {props.children}
    </AwsContext.Provider>
  );
};
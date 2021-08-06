import React from "react";
import { AuthProvider } from '../context/AuthProvider';
import { AwsProvider } from '../context/AwsProvider';
import { ApolloProvider } from 'react-apollo';
// import { Rehydrated } from 'aws-appsync-react';
// import {client} from "../configure/client";
import awsconfig from "../aws-exports";
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';

// const address = JSON.parse(localStorage.getItem('address') || null);
// const sessionToken = JSON.parse(
//     localStorage.getItem('sessionToken') || null
// );
// const secretKey = JSON.parse(localStorage.getItem('secretKey') || null);
// const accessKeyId = JSON.parse(localStorage.getItem('accessKeyId') || null);
// const expiration = JSON.parse(localStorage.getItem('expiration') || null);
// const today = new Date();

export const wrapRootElement = ({ element }) => {

    // const sessionToken = JSON.parse(
    //     localStorage.getItem('sessionToken') || null
    // );
    // const secretKey = JSON.parse(localStorage.getItem('secretKey') || null);
    // const accessKeyId = JSON.parse(localStorage.getItem('accessKeyId') || null);

    // const client = new AWSAppSyncClient({
    //     url: awsconfig.aws_appsync_graphqlEndpoint,
    //     region: awsconfig.aws_appsync_region,
    //     auth: {
    //       type: AUTH_TYPE.AWS_IAM,
    //       credentials: () => ({
    //         accessKeyId,
    //         secretAccessKey: secretKey,
    //         sessionToken
    //       }),
    //     },
    // });

    return (
        // <AuthProvider>
        //     <AwsProvider>
        //         {element}
        //     </AwsProvider>
        // </AuthProvider>

        // <ApolloProvider client={client}>
        //     <Rehydrated>
                <AuthProvider>
                    <AwsProvider>
                        {element}
                    </AwsProvider>
                </AuthProvider>
        //     </Rehydrated>
        // </ApolloProvider>
    )
}
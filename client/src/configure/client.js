// import awsconfig from "../aws-exports";
// import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';

// const address = JSON.parse(localStorage.getItem('address') || null);
// const sessionToken = JSON.parse(
//     localStorage.getItem('sessionToken') || null
// );
// const secretKey = JSON.parse(localStorage.getItem('secretKey') || null);
// const accessKeyId = JSON.parse(localStorage.getItem('accessKeyId') || null);
// const expiration = JSON.parse(localStorage.getItem('expiration') || null);
// const today = new Date();

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
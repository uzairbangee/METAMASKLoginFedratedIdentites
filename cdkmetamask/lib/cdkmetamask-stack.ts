import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as neptune from "@aws-cdk/aws-neptune";
import * as cognito from "@aws-cdk/aws-cognito";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as appsync from '@aws-cdk/aws-appsync';
import * as rds from '@aws-cdk/aws-rds';

export class CdkmetamaskStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here


    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
      identityPoolName: "MetaMaskIdentityPool",
      developerProviderName: "developer_provider_name"
    });

    const authRole = new iam.Role(this, "CognitoAuthorizedRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      
    });

    authRole.addToPolicy(
      new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "execute-api:Invoke",
            "lambda:InvokeFunction",
            "cognito-identity:*",
            "appsync:GraphQL"
          ],
          resources: ["*"],
      })
    );

    const unAuthRole = new iam.Role(this, "CognitoUnauthorizedRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "unauthenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      
    });

    unAuthRole.addToPolicy(
      new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          actions: [
            "lambda:InvokeFunction",
            "cognito-identity:*",
          ],
          resources: ["*"],
      })
    );

    ///Attach particular role to identity pool
    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPoolRoleAttachment",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: authRole.roleArn, unauthenticated : unAuthRole.roleArn },
      }
    );

    const api = new apigw.RestApi(this, 'authAPI', {
      restApiName: 'authenticationAPIs',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS, // this is also the default
      },
      deploy: true
    });

    const authLayers = new lambda.LayerVersion(
      this,
      "metamaskLayer",
      {
        layerVersionName: "metamaskLayer",
        code: lambda.Code.fromAsset("lambda-layer"),
      }
    );

    const nonceLambda = new lambda.Function(this, "nonceLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/nonce"),
      timeout: cdk.Duration.seconds(60),
      layers: [authLayers]
    });

    const getnonce = api.root.addResource('getnonce');
    const getAllIntegration = new apigw.LambdaIntegration(nonceLambda);
    getnonce.addMethod('GET', getAllIntegration);

    const signupLambda = new lambda.Function(this, "signupLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/signup"),
      timeout: cdk.Duration.seconds(60),
      layers: [authLayers]
    });

    const signup = api.root.addResource('signup');
    const signupIntegration = new apigw.LambdaIntegration(signupLambda);
    signup.addMethod('POST', signupIntegration);

    const loginLambda = new lambda.Function(this, "loginLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/login"),
      timeout: cdk.Duration.seconds(60),
      layers: [authLayers],
      environment: {
        IDENTITY_POOL_ID: identityPool.ref,
        DEVELOPER_PROVIDER_NAME: identityPool.developerProviderName!
      }
    });

    const loginPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-identity:*"],
      resources: ["*"]
    });

    loginLambda.addToRolePolicy(loginPolicy);

    const login = api.root.addResource('login');
    const loginIntegration = new apigw.LambdaIntegration(loginLambda);
    login.addMethod('POST', loginIntegration);

    const userTable = new ddb.Table(this, 'CDKMETAMASKUSERTable', {
      partitionKey: {
        name: 'address',
        type: ddb.AttributeType.STRING,
      }
    });

    userTable.grantFullAccess(nonceLambda)
    nonceLambda.addEnvironment('USER_TABLE', userTable.tableName);

    userTable.grantFullAccess(signupLambda)
    signupLambda.addEnvironment('USER_TABLE', userTable.tableName);

    userTable.grantFullAccess(loginLambda)
    loginLambda.addEnvironment('USER_TABLE', userTable.tableName);

    const gql_api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-todos-appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM,
        },
      },
      xrayEnabled: true,
    });


    const todosLambda = new lambda.Function(this, 'AppSyncNotesHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda/todo'),
      memorySize: 1024
    });
    const lambdaDs = gql_api.addLambdaDataSource('lambdaDatasource', todosLambda);

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getTodos"
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "addTodo"
    });

    const todosTable = new ddb.Table(this, 'CDKTodosTable', {
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });
    todosTable.grantFullAccess(todosLambda)
    todosLambda.addEnvironment('TODOS_TABLE', todosTable.tableName);

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: gql_api.graphqlUrl
    });

  }
}

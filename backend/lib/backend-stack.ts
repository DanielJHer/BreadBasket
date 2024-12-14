import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const ordersTable = new cdk.aws_dynamodb.Table(this, 'BackendTable', {
      partitionKey: {
        name: 'OrderID',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda Function
    const submitOrderFunction = new cdk.aws_lambda.Function(
      this,
      'BackendLambda',
      {
        runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
        handler: 'submitOrder.handler',
        code: cdk.aws_lambda.Code.fromAsset('../lambda/submitOrder/'),
        environment: {
          TABLE_NAME: ordersTable.tableName,
        },
      }
    );

    // Grant lambda permissions to DynamoDB
    ordersTable.grantReadWriteData(submitOrderFunction);

    // API Gateway
    const apiGateway = new cdk.aws_apigateway.RestApi(this, 'BackendApi', {
      restApiName: 'Backend API',
    });

    const ordersResource = apiGateway.root.addResource('orders');
    ordersResource.addMethod(
      'POST',
      new cdk.aws_apigateway.LambdaIntegration(submitOrderFunction)
    );

    // Output API Gateway URL
    new cdk.CfnOutput(this, 'BackendApiUrl', {
      value: apiGateway.url, // Returns the API Gateway URL
      description: 'Backend API URL',
      exportName: 'BackendApiUrl',
    });
  }
}

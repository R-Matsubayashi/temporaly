resource "aws_iam_role" "myRdsFunction-role" {
  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRole"
          Effect = "Allow"
          Principal = {
            Service = "lambda.amazonaws.com"
          }
        },
      ]
      Version = "2012-10-17"
    }
  )
  force_detach_policies = false
  name                  = var.lambda_role_name
  path                  = "/service-role/"
}

data "aws_iam_policy" "AWSLambdaVPCAccessExecutionRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda-vpc-attach" {
  policy_arn = data.aws_iam_policy.AWSLambdaVPCAccessExecutionRole.arn
  role       = aws_iam_role.myRdsFunction-role.name
}

data "archive_file" "lambda-src-zip" {
  type        = "zip"
  source_dir  = "lambda-src"
  output_path = "lambda/myRdsFunction.zip"
}

resource "aws_lambda_function" "myRdsFunction" {
  function_name    = var.lambda_function_name
  handler          = "index.handler"
  runtime          = "nodejs12.x"
  role             = aws_iam_role.myRdsFunction-role.arn
  source_code_hash = filebase64sha256(data.archive_file.lambda-src-zip.output_path)
  timeout          = 30
  filename         = data.archive_file.lambda-src-zip.output_path

  environment {
    variables = {
      "db"       = var.db_name
      "endpoint" = aws_rds_cluster.db-cluster.endpoint // RDS Proxy を使用する場合は変更する
      "password" = var.db_password
      "user"     = var.db_username
      "table"    = var.db_table
    }
  }

  vpc_config {
    security_group_ids = [
      aws_default_security_group.sg.id,
    ]
    subnet_ids = [
      aws_subnet.subnet-a.id,
      aws_subnet.subnet-b.id,
    ]
  }
}

resource "aws_lambda_permission" "invoke" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.myRdsFunction.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.MyRdsFunction-API.execution_arn}/*/GET/${var.lambda_function_name}"
}

resource "aws_api_gateway_rest_api" "MyRdsFunction-API" {
  name        = var.api_name
  description = "Created by AWS Lambda"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "MyRdsFunction-API-Resource" {
  rest_api_id = aws_api_gateway_rest_api.MyRdsFunction-API.id
  parent_id   = aws_api_gateway_rest_api.MyRdsFunction-API.root_resource_id
  path_part   = var.api_path
}

resource "aws_api_gateway_method" "get" {
  rest_api_id   = aws_api_gateway_rest_api.MyRdsFunction-API.id
  resource_id   = aws_api_gateway_resource.MyRdsFunction-API-Resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "response_200" {
  http_method = aws_api_gateway_method.get.http_method
  resource_id = aws_api_gateway_resource.MyRdsFunction-API-Resource.id
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {}
  rest_api_id         = aws_api_gateway_rest_api.MyRdsFunction-API.id
  status_code         = "200"
}

resource "aws_api_gateway_integration" "MyRdsFunction-Integration" {
  rest_api_id             = aws_api_gateway_rest_api.MyRdsFunction-API.id
  resource_id             = aws_api_gateway_resource.MyRdsFunction-API-Resource.id
  http_method             = aws_api_gateway_method.get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  content_handling        = "CONVERT_TO_TEXT"
  uri                     = aws_lambda_function.myRdsFunction.invoke_arn
}

resource "aws_api_gateway_integration_response" "MyRdsFunction-IntegrationResponse" {
  rest_api_id = aws_api_gateway_rest_api.MyRdsFunction-API.id
  resource_id = aws_api_gateway_resource.MyRdsFunction-API-Resource.id
  http_method = aws_api_gateway_method.get.http_method
  status_code = aws_api_gateway_method_response.response_200.status_code
  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.MyRdsFunction-Integration]
}

resource "aws_api_gateway_deployment" "MyRdsFunction-Deployment" {
  depends_on = [aws_api_gateway_integration.MyRdsFunction-Integration]

  rest_api_id = aws_api_gateway_rest_api.MyRdsFunction-API.id
  stage_name  = var.api_stage

  lifecycle {
    create_before_destroy = true
  }
}

data "aws_region" "current" {}

output "api_url" {
  value = "https://${aws_api_gateway_rest_api.MyRdsFunction-API.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.api_stage}/${var.api_path}"
}
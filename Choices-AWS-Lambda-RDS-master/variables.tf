####################
#        AWS       #
####################
variable "aws_region" {
  type        = string
  description = "AWS region."
}

####################
#        VPC       #
####################
variable "vpc_cidr_block" {
  type        = string
  description = "CIDR block for VPC."
  default     = "10.0.0.0/16"
}

variable "my_ip" {
  type        = string
  description = "IP address to grant access to DB."
}

####################
#        DB        #
####################

variable "db_subnet_group" {
  type        = string
  description = "Name of DB subnet group."
  default     = "db-subnet-group"
}

variable "db_cluster_identifier" {
  type        = string
  description = "Name of DB cluster."
  default     = "sample-database-1"
}

variable "db_username" {
  type        = string
  description = "Name of DB master user."
  default     = "admin"
}

variable "db_password" {
  type        = string
  description = "Password for DB master user."
}

variable "db_instance_identifier" {
  type        = string
  description = "Name of DB instance."
  default     = "sample-database-1-instance-1"
}

variable "db_instance_size" {
  type        = string
  description = "Size of DB instance."
  default     = "db.t2.small"
}

variable "db_param_group" {
  type        = string
  description = "Name of DB cluster param group for UTF-8 encoding."
  default     = "paramgroup-for-utf8"
}

variable "db_name" {
  type        = string
  description = "Name of DB schema."
  default     = "sample_db"
}

variable "db_table" {
  type        = string
  description = "Name of DB table."
  default     = "nations"
}

####################
#        API       #
####################
variable "lambda_function_name" {
  type        = string
  description = "Name of Lambda function."
  default     = "myRdsFunction"
}

variable "lambda_role_name" {
  type        = string
  description = "Name of IAM role for Lambda function."
  default     = "myRdsFunction-role"
}

variable "api_name" {
  type        = string
  description = "Name of API."
  default     = "myRdsFunction-API"
}

variable "api_path" {
  type        = string
  description = "Path to the API."
  default     = "myRdsFunction"
}

variable "api_stage" {
  type        = string
  description = "Name of the stage to deploy the API."
  default     = "default"
}
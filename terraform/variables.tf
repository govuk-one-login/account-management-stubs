variable "system" {
  type    = string
  default = "Account Management Stubs"
}

variable "product" {
  type    = string
  default = "GOV.UK One Login"
}

variable "owner_email" {
  type    = string
  default = "one-login-home-team-tech@digital.cabinet-office.gov.uk"
}

variable "capabilities" {
  type    = list(string)
  default = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
}

variable "environment" {
  type        = string
  description = "The environment name"
  validation {
    condition     = contains(["dev", "build"], var.environment)
    error_message = "Valid values for var: environment are: dev, build"
  }
}

variable "pipelineBuildNotificationStackName" {
  type = string
}

variable "pipelineSigningProfileArn" {
  type = string
}

variable "pipelineSigningProfileVersionArn" {
  type = string
}

variable "pipelineSlackNotificationType" {
  type = string
}

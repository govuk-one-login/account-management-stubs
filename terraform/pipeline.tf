resource "aws_cloudformation_stack" "account_mgmt_stubs_pipeline" {
  name         = "account-mgmt-stubs-pipeline"
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/sam-deploy-pipeline/template-v2.yaml"

  parameters = {
    AbortOnCheckovFailure                   = "CONTINUE"
    AccessLogsCustomBucketNameEnabled       = "Yes"
    AdditionalCodeSigningVersionArns        = "none"
    AllowCrossAccountS3WriteAccess          = "False"
    AllowedServiceOne                       = "none"
    AllowedServiceTwo                       = "none"
    AllowedServiceThree                     = "none"
    AllowedServiceFour                      = "none"
    AllowedServiceFive                      = "none"
    AllowedServiceSix                       = "none"
    AllowedServiceSeven                     = "none"
    ArtifactSourceBucketArn                 = "none"
    ArtifactSourceBucketEventTriggerRoleArn = "none"
    ArtifactWriteTimeLoggingLambdaArn       = "None"
    AWSOrganizationId                       = "o-pjzf8d99ys,o-dpp53lco28"
    BuildNotificationStackName              = var.pipelineBuildNotificationStackName # see https://github.com/govuk-one-login/one-login-home-infra/blob/4e68ccb93248595f0962b82f632324e72214c387/platform-alerting/README.md
    ContainerSignerKmsKeyArn                = "none"
    DynamicResourcesPrefix                  = "none"
    ECSCanaryDeployment                     = "None"
    Environment                             = var.environment
    GitHubRepositoryName                    = "account-management-stubs"
    IncludePromotion                        = "No"
    LambdaCanaryDeployment                  = "None"
    LogRetentionDays                        = 90
    PipelineEnvironmentNameEnabled          = "No"
    ProgrammaticPermissionsBoundary         = "False"
    RequireManualApproval                   = "No"
    RequireTestContainerSignatureValidation = "No"
    RunTestContainerInVPC                   = "False"
    SAMStackName                            = "account-mgmt-stubs"
    SigningProfileArn                       = var.pipelineSigningProfileArn
    SigningProfileVersionArn                = var.pipelineSigningProfileVersionArn
    SlackNotificationType                   = var.pipelineSlackNotificationType
    StepFunctionsCanaryDeployment           = "None"
    TestComputeType                         = "BUILD_GENERAL1_SMALL"
    TestCoverageReportFormat                = "CLOVERXML"
    TestImageRepositoryUri                  = "none"
    TestReportFormat                        = "JUNITXML"
    TestStackName                           = "None"
    TrafficTestImageRepositoryUri           = "none"
    TruncatedPipelineStackName              = "none"
    VpcStackName                            = "vpc-enhanced"
  }

  capabilities = var.capabilities
}

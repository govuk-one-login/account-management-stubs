## Deploying Terraform

The Terraform uses separate backend configuration and variables files for each environment.
To deploy into eg. build:

```sh
cd terraform
tfenv install && tfenv use
AWS_PROFILE=di-account-build-admin
aws sso login
terraform init -backend-config=env/backend/build.tfbackend
terraform plan -var-file=env/build.tfvars
terraform apply -var-file=env/build.tfvars
```

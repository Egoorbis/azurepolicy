# Terraform for CIS Benchmark Web App

This module provisions the Azure landing zone for the CIS benchmark web application using managed identities (no keys). Resources include:
- Resource group, Linux App Service Plan, Linux Web App (Node 20), and Application Insights.
- Storage account (blob + queue) with private container for uploads and a queue for async parsing jobs.
- Managed identity role assignments: Storage Blob Data Contributor and Storage Queue Data Contributor for the web app.

## Prerequisites
- Terraform >= 1.14 (installed in runner)
- azurerm provider >= 4.10.0 (locked in `.terraform.lock.hcl`)
- Azure AD / Entra permissions to use OIDC and create resources in the target subscription.

## Usage
1) Set backend config for azurerm (storage account, container, key) if you use remote state.
2) Initialize (example keeps backend local; replace with your backend settings when ready):
   ```bash
   terraform init -backend=false
   ```
   For real backend usage:
   ```bash
   terraform init -reconfigure \
     -backend-config="resource_group_name=<state-rg>" \
     -backend-config="storage_account_name=<state-sa>" \
     -backend-config="container_name=<state-container>" \
     -backend-config="key=cis-webapp.tfstate"
   ```
3) Validate and plan:
   ```bash
   terraform fmt
   terraform validate
   terraform plan -var-file=terraform.tfvars
   ```
4) Apply when ready:
   ```bash
   terraform apply -var-file=terraform.tfvars
   ```

## Configuration
Edit `terraform.tfvars` (or pass `-var` flags) for:
- `resource_group_name`, `location`, `project_name`, `environment`, `owner`
- `app_service_plan_sku` (e.g., P1v3)
- `storage_account_tier`, `storage_account_replication` (e.g., Standard, ZRS)

App settings expect the app to use managed identity with `DefaultAzureCredential`:
- `AZURE_STORAGE_ACCOUNT_NAME`
- `AZURE_STORAGE_QUEUE_NAME`
- `AZURE_STORAGE_ACCOUNT_URL`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

terraform {
  backend "azurerm" {
    use_azuread_auth = true
    use_oidc         = true
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.10.0"
    }
  }
}

provider "azurerm" {
  features {}
  use_oidc = true
}

locals {
  name_prefix            = lower(replace("${var.project_name}-${var.environment}", "[^a-z0-9-]", ""))
  storage_account_prefix = lower(replace("${var.project_name}${var.environment}sa", "[^a-z0-9]", ""))
  storage_account_name   = substr(local.storage_account_prefix, 0, 24)
  tags = {
    environment = var.environment
    project     = var.project_name
    owner       = var.owner
  }
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.tags
}

resource "azurerm_service_plan" "app" {
  name                = "${local.name_prefix}-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku
  tags                = local.tags
}

resource "azurerm_storage_account" "benchmark" {
  name                            = local.storage_account_name
  resource_group_name             = azurerm_resource_group.rg.name
  location                        = azurerm_resource_group.rg.location
  account_tier                    = var.storage_account_tier
  account_replication_type        = var.storage_account_replication
  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  shared_access_key_enabled       = false
  allow_nested_items_to_be_public = false
  public_network_access_enabled   = true

  identity {
    type = "SystemAssigned"
  }

  blob_properties {
    versioning_enabled = true
  }

  tags = local.tags
}

resource "azurerm_storage_container" "benchmark_uploads" {
  name                  = "benchmark-uploads"
  storage_account_name  = azurerm_storage_account.benchmark.name
  container_access_type = "private"
}

resource "azurerm_application_insights" "appinsights" {
  name                = "${local.name_prefix}-appi"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  application_type    = "web"
  retention_in_days   = 30
  daily_data_cap_in_gb = 1
  tags                = local.tags
}

resource "azurerm_linux_web_app" "cis_benchmark" {
  name                = "${local.name_prefix}-web"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.app.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    ftps_state           = "Disabled"
    minimum_tls_version  = "1.2"
    http2_enabled        = true
    always_on            = true
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    "WEBSITE_RUN_FROM_PACKAGE"         = "1"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.appinsights.connection_string
    "AZURE_STORAGE_ACCOUNT_URL"        = azurerm_storage_account.benchmark.primary_blob_endpoint
  }

  tags = local.tags
}

resource "azurerm_role_assignment" "webapp_storage_blob_contributor" {
  scope                = azurerm_storage_account.benchmark.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_web_app.cis_benchmark.identity[0].principal_id
}

output "resource_group_name" {
  value       = azurerm_resource_group.rg.name
  description = "Resource group provisioned for the CIS benchmark web application."
}

output "web_app_name" {
  value       = azurerm_linux_web_app.cis_benchmark.name
  description = "Name of the App Service hosting the CIS benchmark portal."
}

output "storage_account_name" {
  value       = azurerm_storage_account.benchmark.name
  description = "Storage account that holds uploaded benchmarks and evidence."
}

output "application_insights_connection_string" {
  value       = azurerm_application_insights.appinsights.connection_string
  description = "Connection string for sending telemetry from the web app."
}

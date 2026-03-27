variable "resource_group_name" {
  description = "Name of the resource group to create or reuse for the CIS benchmark web app."
  type        = string
}

variable "location" {
  description = "Azure region for resource deployment."
  type        = string
}

variable "project_name" {
  description = "Short project name used for resource naming."
  type        = string
  default     = "cisbench"
}

variable "environment" {
  description = "Deployment environment label (e.g., dev, prod)."
  type        = string
  default     = "dev"
}

variable "owner" {
  description = "Owner or team label for tagging."
  type        = string
  default     = "platform-security"
}

variable "app_service_plan_sku" {
  description = "SKU for the App Service plan (e.g., P1v3)."
  type        = string
  default     = "P1v3"
}

variable "storage_account_tier" {
  description = "Storage account performance tier."
  type        = string
  default     = "Standard"
}

variable "storage_account_replication" {
  description = "Storage account replication type."
  type        = string
  default     = "ZRS"
}

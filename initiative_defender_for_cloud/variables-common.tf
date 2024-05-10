# The variables options for Terraform Modules 
# variables are maintained in the parent module
# Description and type can be added if the variable
# is specially handled in the live infrastructure code
# variable "department" {}
# variable "environment" {}
# variable "workload_name" {}
# variable "resource_group_name" {}
# variable "location" {}
variable "pipeline_name" {}
variable "mg_id" {
  type        = string
  description = "(required) Management Group ID for the Azure Policy Assignment"
}
variable "skip_remediation" {
  type        = bool
  description = "Skip creation of all remediation tasks for policies that DeployIfNotExists and Modify"
  default     = false
}

variable "skip_role_assignment" {
  type        = bool
  description = "Should the module skip creation of role assignment for policies that DeployIfNotExists and Modify"
  default     = false
}

variable "re_evaluate_compliance" {
  type        = bool
  description = "Should the module re-evaluate compliant resources for policies that DeployIfNotExists and Modify"
  default     = false
}

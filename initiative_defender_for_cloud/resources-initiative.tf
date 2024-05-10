data "azurerm_policy_definition" "defender_for_app_service" {
  display_name = "Configure Azure Defender for App Service to be enabled"
}

data "azurerm_policy_definition" "defender_for_sql_db" {
  display_name = "Configure Azure Defender for Azure SQL database to be enabled"
}

data "azurerm_policy_definition" "defender_for_oss_db" {
  display_name = "Configure Azure Defender for open-source relational databases to be enabled"
}

data "azurerm_policy_definition" "defender_for_arm" {
  display_name = "Configure Azure Defender for Resource Manager to be enabled"
}

data "azurerm_policy_definition" "defender_for_sql_vms" {
  display_name = "Configure Azure Defender for SQL servers on machines to be enabled"
}

data "azurerm_policy_definition" "defender_cspm" {
  display_name = "Configure Microsoft Defender CSPM plan"
}

data "azurerm_policy_definition" "defender_for_cosmos_db" {
  display_name = "Configure Microsoft Defender for Azure Cosmos DB to be enabled"
}

data "azurerm_policy_definition" "defender_for_containers" {
  display_name = "Configure Microsoft Defender for Containers plan"
}

data "azurerm_policy_definition" "defender_for_storage" {
  display_name = "Configure Microsoft Defender for Storage to be enabled"
}

module "configure_defender_for_cloud_plans_initiative" {
  source                  = "github.com/gettek/terraform-azurerm-policy-as-code/modules/initiative"
  initiative_name         = "Configure Defender for Cloud Plans"
  initiative_display_name = "[Security]: Configure Defender for Cloud Plans"
  initiative_description  = "Deploys and configure Defender for Cloud plans and extensions."
  initiative_category     = "Security Center"
  initiative_version      = "1.0.0"
  initiative_metadata     = {}
  management_group_id     = var.mg_id
  merge_effects           = false
  merge_parameters        = false

  member_definitions = [
    data.azurerm_policy_definition.defender_for_app_service,
    data.azurerm_policy_definition.defender_for_sql_db,
    data.azurerm_policy_definition.defender_for_oss_db,
    data.azurerm_policy_definition.defender_for_arm,
    data.azurerm_policy_definition.defender_for_sql_vms,
    data.azurerm_policy_definition.defender_cspm,
    data.azurerm_policy_definition.defender_for_cosmos_db,
    data.azurerm_policy_definition.defender_for_containers,
    data.azurerm_policy_definition.defender_for_storage,
    module.defender_for_kv.definition,
    module.defender_for_servers.definition,
  ]

}

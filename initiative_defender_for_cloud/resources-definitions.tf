module "defender_for_kv" {
  source              = "github.com/gettek/terraform-azurerm-policy-as-code/modules/definition"
  file_path           = "../policies/Security Center/configure_defender_for_keyvault_plan.json"
  management_group_id = var.mg_id
}

module "defender_for_servers" {
  source              = "github.com/gettek/terraform-azurerm-policy-as-code/modules/definition"
  file_path           = "../policies/Security Center/configure_defender_for_servers_plan.json"
  management_group_id = var.mg_id
}

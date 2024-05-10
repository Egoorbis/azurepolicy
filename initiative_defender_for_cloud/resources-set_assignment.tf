module "mg_configure_defender_for_cloud_plans_initiative" {
  source           = "github.com/gettek/terraform-azurerm-policy-as-code/modules/set_assignment"
  initiative       = module.configure_defender_for_cloud_plans_initiative.initiative
  assignment_scope = var.mg_id

  # resource remediation options
  skip_role_assignment   = var.skip_role_assignment
  skip_remediation       = var.skip_remediation
  re_evaluate_compliance = var.re_evaluate_compliance

  assignment_parameters = {
    effect_44433aa37ec2400293ea65c65ff0310a             = "Disabled",
    effect_50ea72657d8c429e9a7dCa1f410191c3             = "Disabled",
    effect_72f8cee72937403d84a1A4e3e57f3c21             = "Disabled",
    effect_82bf5b87728b4a74Ba4d6123845cf542             = "Disabled",
    effect_B40e7bcdA1e547feB9cf2f534d0bfb7d             = "Disabled",
    effect_B7021b2b08fd4dc09de73c6ece09faf9             = "Disabled",
    effect_B99b73e7074b40899395B7236f094491             = "Disabled",
    effect_Cfdc597275b344188ae17f5c36839390             = "Disabled",
    effect_Efd4031dB2324595BabfAe817348e91b             = "Disabled",
    dfeKeyVaultSubplan_ConfigureDefenderForKeyvaultPlan = "PerKeyVault",
    dfeServerSubplan_ConfigureDefenderForServersPlan    = "P1",
  }
}

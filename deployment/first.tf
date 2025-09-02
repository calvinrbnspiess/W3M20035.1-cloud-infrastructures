
terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
    }
    openstack = {
      source = "terraform-provider-openstack/openstack"
    }
  }
}

provider "openstack" {

  # Prefer using env variables instead of 
  # auth_url, domain_name, user_name, and password
  domain_name = "default"

  # CHANGE ME!!!! 
  # Check API access -> view credentials --> project ID
  tenant_id = "a822c938ca2c4d4d9a41c28b42a44f40"
}


resource "openstack_compute_instance_v2" "calvin" {
  count           = 2
  name            = "calvin-${count.index + 1}-name"
  image_id        = "c57c2aef-f74a-4418-94ca-d3fb169162bf"
  flavor_id       = "76a34987-433d-4d3d-be8f-84447b2e0a3e"
  key_pair        = "Calvin Reibenspiess"
  security_groups = ["default"]

  metadata = {
    this = "that"
  }

  network {
    name = "DHBW"  # Make sure this name exists in OpenStack
  }
}


resource "local_file" "floating_ip" {
  depends_on = [openstack_compute_instance_v2.calvin]

  content = join("\n", [
    for vm in openstack_compute_instance_v2.calvin :
    vm.network[0].fixed_ip_v4
  ])

  filename = "${path.module}/openstack-inventory.txt"
}

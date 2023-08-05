import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";
import * as network from "@pulumi/azure-native/network";
import * as azure from "@pulumi/azure";
class Networking{
    public constructor(){}
    public createResourceGroup(name: string, resources: any[]){
        const resourceGroup = new azure_native.resources.ResourceGroup(name,{
            resourceGroupName: name,
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        });
        resources.push(resourceGroup)
        return resourceGroup
    }
    public createVirtualNetwork(
        name: string,
        resourceGroupName: pulumi.Output<string>,
        addressPrefix: string, 
        dnsServer: string,
        resources: any[]
    ){
        const virtualNetwork = new network.VirtualNetwork(name, {
            resourceGroupName: resourceGroupName,
            addressSpace: {
                addressPrefixes: [addressPrefix],
            },
            dhcpOptions:{
                dnsServers:[dnsServer]
            },
            virtualNetworkName: name,
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            },
        })
        resources.push(virtualNetwork)
        return virtualNetwork
    }

    public createPublicIpAddress(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        location: pulumi.Output<string>, 
        addressVersion: string, 
        allocationMethod: string, 
        skuName: string,
        resources: any[]
    ){
        const ip = new network.PublicIPAddress(name,{
            resourceGroupName: resourceGroupName,
            publicIpAddressName: name,
            location: location,
            publicIPAddressVersion: addressVersion,
            publicIPAllocationMethod: allocationMethod,
            sku:{
                name: skuName
            },
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        })
        resources.push(ip)
        return ip
    }

    public createNatGateway(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        location: pulumi.Output<string>, 
        idIP: pulumi.Output<string>, 
        skuName: string,
        resources: any[]
    ){
        const nat = new network.NatGateway(name,{
            resourceGroupName: resourceGroupName,
            natGatewayName: name,
            location: location,
            publicIpAddresses: [{
                id: idIP
            }],
            sku:{
                name: skuName
            },
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        })
        resources.push(nat)
        return nat
    }

    public createRouteTable(name: string, resourceGroupName: pulumi.Output<string>, location: pulumi.Output<string>, resources: any[]){
        const routeTable = new azure.network.RouteTable(name,{
            resourceGroupName: resourceGroupName,
            location: location,
            name: name,
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        })
        resources.push(routeTable)
        return routeTable
    }

    public createRoute(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        routeTableName: pulumi.Output<string>, 
        addressPrefix: string, 
        nextHopType: string, 
        idIP: pulumi.Output<string>,
        resources: any[]
    ){
        let route: azure.network.Route
        if (nextHopType === "VirtualAppliance")
            route = new azure.network.Route(name,{
                resourceGroupName: resourceGroupName,
                routeTableName: routeTableName,
                name: name,
                addressPrefix: addressPrefix,
                nextHopType: nextHopType,
                nextHopInIpAddress: idIP,
            }) 
        else
            route = new azure.network.Route(name,{
                resourceGroupName: resourceGroupName,
                routeTableName: routeTableName,
                name: name,
                addressPrefix: addressPrefix,
                nextHopType: nextHopType,
            })
        resources.push(route)
        return route
    }

    public createNatSubnet(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        vNetName: pulumi.Output<string>, 
        addressPrefix: string, 
        idNatGateway: pulumi.Output<string>,
        idRouteTable: pulumi.Output<string>,
        location: pulumi.Output<string>,
        resources: any[]
    ){
        const subnet = new network.Subnet(name,{
            resourceGroupName: resourceGroupName,
            virtualNetworkName: vNetName,
            addressPrefix: addressPrefix,
            natGateway:{
                id: idNatGateway
            },
            routeTable:{
                id: idRouteTable,
                location: location,
                tags:{
                    "Name" : name,
                    "Project" : "Tesi Manca",
                    "Owner" : "Abbaldo",
                    "Company" : "Liquid Reply",
                    "BU" : "MCI",
                    "Environment" : "Tesi",
                }
            },
        })
        resources.push(subnet)
        return subnet
    }

    public createSubnet(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        vNetName: pulumi.Output<string>, 
        addressPrefix: string, 
        idRouteTable: pulumi.Output<string>,
        location: pulumi.Output<string>,
        resources: any[]
    ){
        const subnet = new network.Subnet(name,{
            resourceGroupName: resourceGroupName,
            virtualNetworkName: vNetName,
            addressPrefix: addressPrefix,
            routeTable:{
                id: idRouteTable,
                location: location,
                tags:{
                    "Name" : name,
                    "Project" : "Tesi Manca",
                    "Owner" : "Abbaldo",
                    "Company" : "Liquid Reply",
                    "BU" : "MCI",
                    "Environment" : "Tesi",
                }
            },
        })
        resources.push(subnet)
        return subnet
    }
}
export {Networking}

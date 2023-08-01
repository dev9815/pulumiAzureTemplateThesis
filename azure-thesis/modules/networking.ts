import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";
import * as network from "@pulumi/azure-native/network";
import * as azure from "@pulumi/azure";

class Networking{
    public constructor(){}

    public createResourceGroup(name: string){
        return new azure_native.resources.ResourceGroup(name,{
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
    }
    public createVirtualNetwork(
        name: string,
        resourceGroupName: pulumi.Output<string>,
        addressPrefix: string, 
        dnsServer: string
    ){
        return new network.VirtualNetwork(name, {
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
    }

    public createPublicIpAddress(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        location: pulumi.Output<string>, 
        addressVersion: string, 
        allocationMethod: string, 
        skuName: string
    ){
        return new network.PublicIPAddress(name,{
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
    }

    public createNatGateway(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        location: pulumi.Output<string>, 
        idIP: pulumi.Output<string>, 
        skuName: string
    ){
        return new network.NatGateway(name,{
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
    }

    public createRouteTable(name: string, resourceGroupName: pulumi.Output<string>, location: pulumi.Output<string>){
        return new azure.network.RouteTable(name,{
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
    }

    public createRoute(name: string, resourceGroupName: pulumi.Output<string>, routeTableName: pulumi.Output<string>, addressPrefix: string, nextHopType: string, idIP: pulumi.Output<string>){
        if (nextHopType === "VirtualAppliance")
            return new azure.network.Route(name,{
                resourceGroupName: resourceGroupName,
                routeTableName: routeTableName,
                name: name,
                addressPrefix: addressPrefix,
                nextHopType: nextHopType,
                nextHopInIpAddress: idIP,
            }) 
        else
            return new azure.network.Route(name,{
                resourceGroupName: resourceGroupName,
                routeTableName: routeTableName,
                name: name,
                addressPrefix: addressPrefix,
                nextHopType: nextHopType,
            })
    }

    public createNatSubnet(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        vNetName: pulumi.Output<string>, 
        addressPrefix: string, 
        idNatGateway: pulumi.Output<string>,
        idRouteTable: pulumi.Output<string>,
        location: pulumi.Output<string>,
    ){
        return new network.Subnet(name,{
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
    }

    public createSubnet(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        vNetName: pulumi.Output<string>, 
        addressPrefix: string, 
        idRouteTable: pulumi.Output<string>,
        location: pulumi.Output<string>,
    ){
        return new network.Subnet(name,{
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
    }
}

export {Networking}
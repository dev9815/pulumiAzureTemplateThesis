import * as pulumi from "@pulumi/pulumi";
import * as network from "@pulumi/azure-native/network";
import * as azure from "@pulumi/azure";

class BastionHost{
    public constructor(){}
    public createSecurityGroup(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        location: pulumi.Output<string>,
        access: string, 
        direction: string, 
        protocol: string,  
        nameRule: string, 
        sourcePort: string, 
        destinationPort: string, 
        destinationAddressPrefix: string, 
        priority: number,
        resources: any[]
    ){
        const sg = new network.NetworkSecurityGroup(name,{
            resourceGroupName: resourceGroupName,
            location: location,
            networkSecurityGroupName: name,
            securityRules:[{
                access: access,
                direction: direction,
                protocol: protocol,
                name: nameRule,
                sourcePortRange: sourcePort,
                destinationPortRange: destinationPort,
                sourceAddressPrefixes:[
                    "91.218.224.5/32",
                    "91.218.224.15/32",
                    "91.218.226.5/32",
                    "91.218.226.15/32",
                    "93.46.180.242/32",
                    "2.228.86.218/32",
                    "2.228.131.82/32",
                    "93.42.2.218/32",
                    "93.42.115.154/32",
                    "92.223.138.26/32",
                    "92.223.138.174/32",
                    "93.42.131.226/32"
                ],
                destinationAddressPrefix: destinationAddressPrefix,
                priority: priority  
            }],
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        })
        resources.push(sg)
        return sg
    }

    public createVmScaleSet(
        name: string,
        resourceGroupName: pulumi.Output<string>, 
        location: pulumi.Output<string>,
        skuName: string,
        adminUsername: string,
        disablePassword: boolean, 
        username: string, 
        publicKey: pulumi.Output<string>,
        caching: string,
        storageAccountType: string,
        nameNetInt: string,
        primary: boolean,
        nameIPConfig: string,
        idSubnet: pulumi.Output<string>,
        namePublicIPAddress: string, 
        idSecurityGroup: pulumi.Output<string>,
        publisher: string,
        offer: string,
        skuImage: string,
        version: string, 
        instances: number, 
        firstZone: string,
        secondZone: string,
        resources: any[]
    ){
        const vmss = new azure.compute.LinuxVirtualMachineScaleSet(name,{
            resourceGroupName: resourceGroupName,
            location: location,
            sku: skuName,
            name: name,
            adminUsername: adminUsername,
            //adminPassword: "Davidemanca.98",
            disablePasswordAuthentication: disablePassword,
            adminSshKeys:[{
            username: username,
            publicKey: publicKey
            }],
            osDisk:{
                caching: caching,
                storageAccountType: storageAccountType
            },
            
            networkInterfaces:[{
                name: nameNetInt,
                primary: primary,
                ipConfigurations:[{
                    name: nameIPConfig,
                    subnetId: idSubnet,
                    publicIpAddresses:[{
                        name: namePublicIPAddress
                    }],
                }],
                networkSecurityGroupId: idSecurityGroup,  
            }],
            sourceImageReference: {
                publisher: publisher,
                offer: offer,
                sku: skuImage,
                version: version,
            },
            instances: instances,
            zones:[firstZone, secondZone],
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        })
        resources.push(vmss)
        return vmss
    }

    public createAutoScaling(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        location: pulumi.Output<string>,
        idVmScaleSet: pulumi.Output<string>,
        nameProfileBoot: string,
        defualtCapacityBoot: number,
        minCapacityBoot: number,
        maxCapacityBoot: number,
        days: string[],
        hoursBoot: number,
        minutes: number,
        nameProfileShutdown: string,
        defualtCapacityShutdown: number,
        minCapacityShutdown: number,
        maxCapacityShutdown: number,
        hoursShutdown: number,
        timezone: string,
        resources: any[]
    ){
        const autoscaling = new azure.monitoring.AutoscaleSetting(name,{
            resourceGroupName: resourceGroupName,
            location: location,
            targetResourceId: idVmScaleSet,
            name: name,
            profiles:[
                {
                    name: nameProfileBoot,
                    capacity:{
                        default: defualtCapacityBoot,
                        minimum: minCapacityBoot,
                        maximum: maxCapacityBoot
                    },
                    recurrence: {
                        days: days,
                        hours: hoursBoot,
                        minutes: minutes,
                        timezone: timezone
                    }
                },
                {
                    name: nameProfileShutdown,
                    capacity:{
                        default: defualtCapacityShutdown,
                        minimum: minCapacityShutdown,
                        maximum: maxCapacityShutdown
                    },
                    recurrence: {
                        days: days,
                        hours: hoursShutdown,
                        minutes: minutes,
                        timezone: timezone
                    }
                }
            ],
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        })
        resources.push(autoscaling)
        return autoscaling
    }
}
export {BastionHost}

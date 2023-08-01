import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";
import * as azure from "@pulumi/azure";
import { LinuxVirtualMachineScaleSet } from "@pulumi/azure/compute/linuxVirtualMachineScaleSet";
import { NetworkSecurityGroup } from "@pulumi/azure-native/network";
import { AutoscaleSetting } from "@pulumi/azure/monitoring";

class AksCluster{
    public constructor(){}

    public createCluster(
        name: string, 
        resourceGroupName: pulumi.Output<string>, 
        location: pulumi.Output<string>,
        dnsPrefix: string,
        privateCluster: boolean,
        serviceCidr: string,
        dnsServiceIP: string,
        adminUsername: string,
        publicKey: pulumi.Output<string>,
        version: string,
        nodeResourceGroupName: string,
        enableRBAC: boolean,
        nameNodes: string,
        firstZone: string,
        secondZone: string,
        autoscaling: boolean,
        count: number,
        maxCount: number,
        minCount: number,
        mode: string,
        vmSize: string,
        type: string,
        osType: string,
        vmScaleSet: LinuxVirtualMachineScaleSet,
        bastionHostSG: NetworkSecurityGroup,
        autoscalingBH: AutoscaleSetting
    ){
        return new azure_native.containerservice.ManagedCluster(name,{
            resourceGroupName: resourceGroupName,
            location: location,
            dnsPrefix: dnsPrefix,
            apiServerAccessProfile:{
                enablePrivateCluster: privateCluster,
                //privateDNSZone: privateDns.id,
            },
            identity:{
                type: "SystemAssigned",
            },
            networkProfile:{
                serviceCidr: serviceCidr,
                dnsServiceIP: dnsServiceIP,
            
            },
            linuxProfile:{
                adminUsername: adminUsername,
                ssh:{
                    publicKeys:[{
                        keyData: publicKey
                    }]
                }
            },
            kubernetesVersion: version,
            nodeResourceGroup: nodeResourceGroupName,
            resourceName: name,
            enableRBAC: enableRBAC,
            agentPoolProfiles:[
                {
                    name: nameNodes,
                    availabilityZones:[firstZone, secondZone],
                    enableAutoScaling: autoscaling,
                    count: count,
                    maxCount: maxCount,
                    minCount: minCount,
                    mode: mode,
                    vmSize: vmSize,
                    type: type,
                    osType: osType,
    
    
                },
            ],
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        }, {dependsOn: [vmScaleSet, bastionHostSG, autoscalingBH]})
    }

    public createAutoScalingNodePool(
        name: string, 
        type: string,
        resourceGroupName: string, 
        location: string,
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
        timezone: string
    ){
        const vmssResource = azure.core.getResources({
            resourceGroupName: resourceGroupName,
            type: type 
        }).then(vmss => {
            return new azure.monitoring.AutoscaleSetting(name,{
                resourceGroupName: resourceGroupName,
                location: location,
                targetResourceId: vmss.resources![0].id ?? "",
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
        })
    }
}

export {AksCluster}
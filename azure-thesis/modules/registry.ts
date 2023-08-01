import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

class Registry{
    public constructor(){}

    public createRegistry(
        name: string, 
        resourceGroupName: pulumi.Output<string>,
        skuName: string,
        adminUser: boolean,
        location: pulumi.Output<string>,

    ){
        return new azure_native.containerregistry.Registry(name,{
            resourceGroupName: resourceGroupName,
            sku:{name: skuName},
            adminUserEnabled: adminUser,
            location: location,
            registryName: name,
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
}

export {Registry}
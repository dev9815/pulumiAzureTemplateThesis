import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";
import { ManagedCluster } from "@pulumi/azure-native/containerservice";
class DBServer{
    public constructor(){}

    public createFlexibleServer(
        name: string, 
        resourceGroupName: string, 
        location: string,
        passwordAuth: string,
        activeDirectoryAuth: string,
        createMode: string,
        adminLogin: string,
        adminPassword: string,
        skuName: string,
        skuTier: string,
        version: string,
        storageSize: number,
        cluster: ManagedCluster,
        resources: any[]
    ){
        const server = new azure_native.dbforpostgresql.Server(name,{
            serverName: name,
            resourceGroupName: resourceGroupName,
            location: location,
            authConfig:{
                passwordAuth: passwordAuth,
                activeDirectoryAuth: activeDirectoryAuth,
            },
            createMode: createMode,
            administratorLogin: adminLogin,
            administratorLoginPassword: adminPassword, 
            sku: {
                name: skuName,
                tier: skuTier
            },
            version: version,
            storage: {
                storageSizeGB: storageSize,
            },
            tags:{
                "Name" : name,
                "Project" : "Tesi Manca",
                "Owner" : "Abbaldo",
                "Company" : "Liquid Reply",
                "BU" : "MCI",
                "Environment" : "Tesi",
            }
        }, {dependsOn: cluster})
        resources.push(server)
        return server
    }

    public createDB(
        name: string,
        resourceGroupName: string, 
        serverName: pulumi.Output<string>, 
        charset: string,
        collation: string,
        cluster: ManagedCluster,
        resources: any[]
    ){
        const db = new azure_native.dbforpostgresql.Database(name,{
            resourceGroupName: resourceGroupName,
            serverName: serverName,
            charset: charset,
            databaseName: name,
            collation: collation
        }, {dependsOn: cluster})
        resources.push(db)
        return db
    }

    public createFirewallRule(
        name: string,
        resourceGroupName: string, 
        serverName: pulumi.Output<string>, 
        startIpAddress: string,
        endIpAddress: string,
        cluster: ManagedCluster,
        resources: any[]
    ){
        const rule = new azure_native.dbforpostgresql.FirewallRule(name,{
            resourceGroupName: resourceGroupName,
            serverName: serverName,
            startIpAddress: startIpAddress,
            endIpAddress: endIpAddress,
            firewallRuleName: name
        }, {dependsOn: cluster})
        resources.push(rule)
        return rule
    }
}
export {DBServer}

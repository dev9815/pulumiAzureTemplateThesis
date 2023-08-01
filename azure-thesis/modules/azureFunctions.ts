import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";
import * as network from "@pulumi/azure-native/network";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as tls from "@pulumi/tls"
import * as azure from "@pulumi/azure";
import * as azuread from "@pulumi/azuread";
import * as fs from "fs"
import { getConnectionString, signedBlobReadUrl } from "./helpers";
import { lookup } from "dns";
import { StringifyOptions } from "querystring";
import { StorageAccount } from "@pulumi/azure-native/storage/storageAccount";
import { ResourceGroupPolicyAssignment } from "@pulumi/azure/core";
import { BlobContainer } from "@pulumi/azure-native/storage/blobContainer";
import { Blob } from "@pulumi/azure-native/storage/blob";
import { Application } from "@pulumi/azuread/application";

class AzureFunction{
    public constructor(){}

    public createAppServicePlan(
        name: string,
        resourceGroupName: string,
        location: string,
        skuName: string,
        skuTier: string,
        kind: string,
    ){
        return new web.AppServicePlan(name,{
            resourceGroupName: resourceGroupName,
            location: location,
            name: name,
            sku:{
                name: skuName,
                tier: skuTier,
            },
            kind: kind,
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

    public createApplication(name: string, currentClient: Promise<azuread.GetClientConfigResult>, description: string){
        return new azuread.Application(name,{
            displayName: name,
            owners:[currentClient.then(current => current.objectId)],
            description: description,
        })
    }

    public createServicePrincipal(
        name: string, 
        applicationId: pulumi.Output<string>, 
        description: string, 
        accountEnabled: boolean, 
        currentClient: Promise<azuread.GetClientConfigResult>
    ){
        return new azuread.ServicePrincipal(name,{
            applicationId: applicationId,
            description: description,
            accountEnabled: true,
            owners:[currentClient.then(current => current.objectId)],
        })
    }

    public createApplicationPassword(name: string, appObjId: pulumi.Output<string>, endDateRelative: string){
        return new azuread.ApplicationPassword("davide-manca-clientSecret",{
            applicationObjectId: appObjId,
            displayName: "davide-manca-clientSecret",
            endDateRelative: "8760h"
        })
    }

    public createStorageAccount(name: string, resourceGroupName: string,location: string, accountName: string){
        return new storage.StorageAccount(name,{
            resourceGroupName: resourceGroupName,
            location: location,
            sku: {
                name: storage.SkuName.Standard_LRS
            },
            kind: storage.Kind.StorageV2,
            accountName: accountName,
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

    public createBlobContainer(name: string, resourceGroupName: string, account: StorageAccount){
        return new storage.BlobContainer(name, {
            resourceGroupName: resourceGroupName,
            accountName: account.name,
        }, {dependsOn: account});
    }

    public createBlob(
        name: string, 
        resourceGroupName: string, 
        containerName: pulumi.Output<string>, 
        source: pulumi.asset.Asset,
        account: StorageAccount
    ){
        return new storage.Blob(name, {
            resourceGroupName: resourceGroupName,
            accountName: account.name,
            containerName: containerName,
            source: source
        }, {dependsOn: account});
    }

    public createInsights(name: string, resourceGroupName: string, location: string, appType: string){
        return new azure.appinsights.Insights(name,{
            resourceGroupName: resourceGroupName,
            location: location,
            applicationType: appType,
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

    public createWebApp(
        name: string,
        resourceGroupName: string,
        location: string,
        farmId: pulumi.Output<string>,
        kind: string,
        instrumentationKey: pulumi.Output<string>,
        applicationId: pulumi.Output<string>,
        clientSecretValue: pulumi.Output<string>,
        tenantId: pulumi.Output<string>,
        extensionVersion: string, 
        workerRuntime: string,
        nodeVersion: string,
        codeContainer: BlobContainer,
        codeBlob: Blob,
        account: StorageAccount
    ){
        return new web.WebApp(name,{
            name: name,
            resourceGroupName: resourceGroupName,
            location: location,
            serverFarmId: farmId,
            kind: kind,
            siteConfig: {
                appSettings: [
                    { name: "APPINSIGHTS_INSTRUMENTATIONKEY", value: instrumentationKey},
                    { name: "AZURE_CLIENT_ID", value: applicationId},
                    { name: "AZURE_CLIENT_SECRET", value: clientSecretValue},
                    { name: "AZURE_TENANT_ID", value: tenantId},
                    { name: "AzureWebJobsStorage", value: getConnectionString(resourceGroupName, account.name)},
                    { name: "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING", value: getConnectionString(resourceGroupName, account.name)},
                    { name: "FUNCTIONS_EXTENSION_VERSION", value: extensionVersion },
                    { name: "FUNCTIONS_WORKER_RUNTIME", value: workerRuntime },
                    { name: "WEBSITE_NODE_DEFAULT_VERSION", value: nodeVersion },
                    { name: "WEBSITE_RUN_FROM_PACKAGE", value: signedBlobReadUrl(codeBlob, codeContainer, account, resourceGroupName)},
                ],
                http20Enabled: true,
                nodeVersion: nodeVersion,
                cors: {allowedOrigins:["*"]},
            },
        }, {dependsOn: account})
    }

    public createRoleAssignment(
        name: string, 
        principalId: pulumi.Output<string>, 
        idRole: string, 
        idSubscription: string, 
        description: string, 
        principalType: string, 
        applicationClient: Application
    ){
        return new azure_native.authorization.RoleAssignment(name,{
            principalId: principalId,
            roleDefinitionId: idRole,
            scope: idSubscription,
            description: description,
            principalType: principalType
        }, {dependsOn: applicationClient})
    }

    public createAzureFunction(
        planName: string,
        resourceGroupName: string,
        location: string,
        planSkuName: string,
        planSkuTier: string,
        planKind: string,
        storageName: string,
        storageAccountName: string,
        blobContainerName: string,
        blobName: string,
        source: pulumi.asset.Asset,
        insightsName: string,
        appType: string,
        webAppName: string,
        webAppKind: string,
        applicationClientId: pulumi.Output<string>,
        clientSecretValue: pulumi.Output<string>,
        tenantId: pulumi.Output<string>,
        extensionVersion: string, 
        workerRuntime: string,
        nodeVersion: string,
    ){
        const plan = this.createAppServicePlan(planName, resourceGroupName, location, planSkuName, planSkuTier, planKind)
        const strgAccount = this.createStorageAccount(storageName, resourceGroupName, location, storageAccountName)
        const container = this.createBlobContainer(blobContainerName, resourceGroupName, strgAccount)
        const blob = this.createBlob(blobName, resourceGroupName, container.name, source, strgAccount)
        const insights = this.createInsights(insightsName, resourceGroupName, location, appType)
        const webApp = this.createWebApp(webAppName, resourceGroupName, location, plan.id, webAppKind, insights.instrumentationKey, applicationClientId, clientSecretValue, tenantId, extensionVersion, workerRuntime, nodeVersion, container, blob, strgAccount)
    }
}

export {AzureFunction}
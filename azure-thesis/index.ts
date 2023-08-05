import * as pulumi from "@pulumi/pulumi";
import * as tls from "@pulumi/tls"
import * as azure from "@pulumi/azure";
import * as azuread from "@pulumi/azuread";
import {Networking} from "./modules/networking"
import {BastionHost} from "./modules/bastionHost"
import {AksCluster} from "./modules/aksCluster"
import {DBServer} from "./modules/dbServer"
import {Registry} from "./modules/registry"
import {LoadBalancer} from "./modules/loadBalancer"
import {AzureFunction} from "./modules/azureFunctions"
import {JsonForImport} from "./modules/jsonForImport"

//stack is local, it will be created when the template is called to be created (pulumi new) hence it doesn't make sense having the stack files in the template

const azureLocation = "WestEurope"
const config = new pulumi.Config();
const stackReference = pulumi.getStack();
const networking = new Networking();
const bastionHost = new BastionHost();
const aksCluster = new AksCluster();
const database = new DBServer();
const registry = new Registry();
const loadBalancer = new LoadBalancer();
const azureFunction = new AzureFunction();

if(stackReference  !== "async-resources"){
    const stackResources: any[] = []
    const listResourcesInfo: any[] = []
    const aksResourceGroupName = config.require("aksResourceGroupName")
    const resourceGroupName = config.require("resourceGroupName")
    const virtualNetworkName = config.require("virtualNetworkName")
    const vNetAddressPrefix = config.require("virtualNetworkAddressPrefix")
    const virtualNetworkDnsServer = config.require("virtualNetworkDnsServer")
    const firstPublicSubnetName = config.require("firstPublicSubnetName")
    const firstPublicSubnetAddressSpace = config.require("firstPublicSubnetAddressSpace")
    const secondPublicSubnetName = config.require("secondPublicSubnetName")
    const secondPublicSubnetAddressSpace = config.require("secondPublicSubnetAddressSpace")
    const firstPrivateSubnetName = config.require("firstPrivateSubnetName")
    const firstPrivateSubnetAddressSpace = config.require("firstPrivateSubnetAddressSpace")
    const secondPrivateSubnetName = config.require("secondPrivateSubnetName")
    const secondPrivateSubnetAddressSpace = config.require("secondPrivateSubnetAddressSpace")    

    const resourceGroup = networking.createResourceGroup(resourceGroupName, stackResources)
    const virtualNetwork = networking.createVirtualNetwork(virtualNetworkName, resourceGroup.name, vNetAddressPrefix, virtualNetworkDnsServer, stackResources)
    const firstPublicIp = networking.createPublicIpAddress("davide-manca-firstPublicIP-natG", resourceGroup.name, resourceGroup.location, "IPv4", "Static", "Standard", stackResources)
    const firstNatGateway = networking.createNatGateway("davide-manca-firstNatGateway", resourceGroup.name, resourceGroup.location, firstPublicIp.id, "Standard", stackResources)
    const privateRouteTable = networking.createRouteTable("davide-manca-privateRouteTable", resourceGroup.name, resourceGroup.location, stackResources)
    const firstPrivateRoute = networking.createRoute("d-manca-firstRT", resourceGroup.name, privateRouteTable.name, "10.0.48.0/24", "VirtualAppliance", firstPublicIp.ipAddress.apply(ip => ip ?? "not yet allocated"), stackResources)
    const secondPrivateRoute = networking.createRoute("d-manca-secondRT", resourceGroup.name, privateRouteTable.name, "10.0.0.0/16", "VnetLocal", pulumi.output(""), stackResources)
    const publicRouteTable = networking.createRouteTable("davide-manca-publicRouteTable", resourceGroup.name, resourceGroup.location, stackResources)
    const firstPublicRoute = networking.createRoute("davide-manca-secondPublicRoute", resourceGroup.name, publicRouteTable.name, "10.0.0.0/16", "VnetLocal", pulumi.output(""), stackResources)
    const firstPublicSubnet = networking.createNatSubnet(firstPublicSubnetName, resourceGroup.name, virtualNetwork.name, firstPublicSubnetAddressSpace, firstNatGateway.id, publicRouteTable.id, resourceGroup.location, stackResources)
    const secondPublicSubnet = networking.createSubnet(secondPublicSubnetName, resourceGroup.name, virtualNetwork.name, secondPublicSubnetAddressSpace, publicRouteTable.id, resourceGroup.location, stackResources)
    const firstPrivateSubnet = networking.createSubnet(firstPrivateSubnetName, resourceGroup.name, virtualNetwork.name, firstPrivateSubnetAddressSpace, privateRouteTable.id, resourceGroup.location, stackResources)
    const secondPrivateSubnet = networking.createSubnet(secondPrivateSubnetName, resourceGroup.name, virtualNetwork.name, secondPrivateSubnetAddressSpace, privateRouteTable.id, resourceGroup.location, stackResources)
//------------------------------------------------------------------------ BASTION HOST -----------------------------------------
    const bastionHostSG = bastionHost.createSecurityGroup("davide-manca-bastionHost-SG", resourceGroup.name, resourceGroup.location, "Allow", "Inbound", "tcp", "davide-manca-BH-SG", "*", "22", "0.0.0.0/0", 105, stackResources)
    const key = new tls.PrivateKey("davide-manca-keys",{algorithm: "RSA"})
    const vmScaleSet = bastionHost.createVmScaleSet(
        "davide-manca-vmss", 
        resourceGroup.name, 
        resourceGroup.location, 
        "Standard_F2", 
        "davide-manca", 
        true, 
        "davide-manca", 
        key.publicKeyOpenssh, 
        "ReadWrite", 
        "StandardSSD_LRS", 
        "davide-manca-BH-netInt", 
        true, 
        "davide-manca-BH-ipConf",
        firstPublicSubnet.id, 
        "davide-manca-publicIp", 
        bastionHostSG.id, 
        "Canonical", 
        "0001-com-ubuntu-server-focal", 
        "20_04-lts", 
        "latest", 
        1, 
        "1", 
        "2",
        stackResources
    )

    const autoscalingBH = bastionHost.createAutoScaling("davide-manca-autoscalingBH", resourceGroup.name, resourceGroup.location, vmScaleSet.id, "davide-manca-bootUp", 1, 1, 1, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], 7, 0, "davide-manca-shutdown", 0, 0, 0, 17, "UTC", stackResources)

// ---------------------------------------------------------- ---- AKS CLUSTER  ----------------------------------------------

    const cluster = aksCluster.createCluster(
        "d-manca-akscluster", 
        resourceGroup.name, 
        resourceGroup.location, 
        "davidemanca", 
        true, 
        "172.20.0.0/16", 
        "172.20.0.2", 
        "davide", 
        key.publicKeyOpenssh, 
        "1.25.6", 
        aksResourceGroupName, 
        true, 
        "dmancanodes1", 
        "1", 
        "2", 
        true, 
        2, 
        2, 
        1, 
        "System", 
        "Standard_DS2_v2", 
        "VirtualMachineScaleSets", 
        "Linux", 
        vmScaleSet, 
        bastionHostSG, 
        autoscalingBH,
        stackResources
    )

//---------------------------------------------------------- DB FLEXIBLE SERVER ------------------------------------------------------------

    const dbServer = database.createFlexibleServer("davide-manca-flexserver", aksResourceGroupName, azureLocation, "Enabled", "Enabled", "Default", "davidemanca", "Aaaaaaaaa.98", "Standard_B1ms", "Burstable", "12", 512, cluster, stackResources)
    const db = database.createDB("d-manca-db-postgresql", aksResourceGroupName, dbServer.name, "utf8", "en_US.utf8", cluster, stackResources)
    const firewallRule = database.createFirewallRule("d-manca-fwrule-dbserver", aksResourceGroupName, dbServer.name, "10.0.0.1", "10.0.255.254", cluster, stackResources)
    
//-------------------------------------------------------- CONTAINER REGISTRY  ---------------------------------------------

    const containerRegistry = registry.createRegistry("davideMancaRegistry", resourceGroup.name, "Standard", true, resourceGroup.location, stackResources)

    /*const applicationGateway = new network.ApplicationGateway("davide-manca-applicationGateway",{
        resourceGroupName: "davide-manca-resourceGroup",
        location: "WestEurope",
        applicationGatewayName: "davide-manca-applicationGateway",
        /*backendAddressPools:[{ 
            //id: lb.backendAddressPools![0].id ?? "",
            name: "backendPool",
            //backendAddresses:[{
              //  ipAddress:  
            //}]
        }],
        frontendIPConfigurations:[{
            //id: lb.frontendIPConfigurations![0].id ?? "",
            name: "frontendIP",
            //publicIPAddress: lb.frontendIPConfigurations![0].publicIPAddress,
            subnet: {id: firstPrivateSubnet.id}
        }],
        sku:{
            capacity: 1,
            name: "Standard_Small",
            tier: "Standard"
        },
        //zones:["1","2"],
        tags:{
            "Name" : "davide-manca-applicationGateway",
            "Project" : "Tesi Manca",
            "Owner" : "Abbaldo",
            "Company" : "Liquid Reply",
            "BU" : "MCI",
            "Environment" : "Tesi",
        }
    })*/
    
	const writeJson = new JsonForImport()
    writeJson.infrastructureToJson(stackResources, listResourcesInfo, "./import/sync-resources.json")
}else{
    const stackResources: any[] = []
    const listResourcesInfo: any[] = []
    const aksResourceGroupName = config.require("aksResourceGroupName")

    //There is a problem. The deployment has to be done in different times. By the fact that get functions are asynchronous they are called before
    //a synchronous function gets called so it's not able to fetch obviously the data needed to create other resources because the resource on which
    //the research still doesn't exist. And we need the get because we have to take some param such as the vmss id in order to give it to the autoscaling
    //in order to make it more flexible as a code POV. I could put instead the direct id copied from the portal or from the terminal and pasting it but
    //this doesn't make the solution reusable for each case because the resources are ephemeral and their id can change depending on their recreation.
    //So the solution would be to have these kind of needed params as outputs of each function so they can be used without performing any get() and 
    //having a clear and flexible solution, just like aws does.
    const autoscalingNodepool = aksCluster.createAutoScalingNodePool("d-manca-autoscalingNodes", "Microsoft.Compute/virtualMachineScaleSets", aksResourceGroupName, azureLocation, "d-manca-bootUpNodes", 2, 2, 2, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], 7, 0, "d-manca-shutdownNodes", 0, 0, 0, 17, "UTC", stackResources)
    const loadBalancerRule = loadBalancer.createRule("davide-manca-lbRule", aksResourceGroupName, "kubernetes", 80, 80, "Tcp", true, stackResources)
    azure.core.getSubscription({}).then(subscription => {
        azure.authorization.getRoleDefinition({
            name: "Contributor"
        }).then(role => {
            const tenantId = pulumi.output(azure.core.getClientConfig().then(client => client.tenantId))
            const currentClient = azuread.getClientConfig({})
            const applicationClient = azureFunction.createApplication("davide-manca-application", currentClient, "application for getting clientID and secret value for functionApp environment variables", stackResources)
            //azure portal creates automatically a service principal for the applica btion. Here i got to do by myself
            const servicePrincipal = azureFunction.createServicePrincipal("davide-manca-servicePrincipal", applicationClient.applicationId, "service principal for granting permmision to the application for functionapp", true, currentClient, stackResources)            
            const clientSecret = azureFunction.createApplicationPassword("davide-manca-clientSecret", applicationClient.objectId, "8760h", stackResources)
            const applicationPermission = azureFunction.createRoleAssignment(
                "davide-manca-roleToApplication", 
                servicePrincipal.objectId, 
                role.id, 
                subscription.id,
                "assigning contributor role for application in order to have permission to execute the function app",
                "ServicePrincipal",
                applicationClient,
                stackResources
            )
            const startDBServer = azureFunction.createAzureFunction(
                "davide-manca-planStartDB", 
                aksResourceGroupName, 
                azureLocation,
                "Y1", 
                "Dynamic", 
                "FunctionApp", 
                "davide-manca-accountStartDB", 
                "dmancaaccountstartdb", 
                "dmancastartdbzips", 
                "dmancastartdbzip", 
                new pulumi.asset.FileArchive("./startDB"), 
                "davide-manca-appInsights",
                "Node.JS",
                "d-manca-startDBServer",
                "functionapp",
                applicationClient.applicationId,
                clientSecret.value,
                tenantId,
                "~4",
                "node",
                "~18",
                stackResources
            )

            const stopDBServer = azureFunction.createAzureFunction(
                "davide-manca-planStopDB", 
                aksResourceGroupName, 
                azureLocation,
                "Y1", 
                "Dynamic", 
                "FunctionApp", 
                "davide-manca-accountStopDB", 
                "dmancaaccountstopdb", 
                "dmancastopdbzips", 
                "dmancastopdbzip", 
                new pulumi.asset.FileArchive("./stopDB"), 
                "davide-manca-appInsightsStopDB",
                "Node.JS",
                "d-manca-stopDBServer",
                "functionapp",
                applicationClient.applicationId,
                clientSecret.value,
                tenantId,
                "~4",
                "node",
                "~18",
                stackResources
            )

            const writeJson = new JsonForImport()
            writeJson.infrastructureToJson(stackResources, listResourcesInfo, "./import/async-resources.json")
        })
    })

}

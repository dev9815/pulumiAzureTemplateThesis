import * as network from "@pulumi/azure-native/network";
import * as azure from "@pulumi/azure";

class LoadBalancer{
    public constructor(){}

    public createRule(
        name: string,
        resourceGroupName: string,
        loadBalancerName: string,
        frontendPort: number,
        backendPort: number,
        protocol: string,
        disableOutboundSnat: boolean
    ){
        const aksLoadBalancer = network.getLoadBalancer({
            resourceGroupName: resourceGroupName,
            loadBalancerName: loadBalancerName
        }).then(lb => {
            return new azure.lb.Rule(name,{
                name: name,
                loadbalancerId: lb.id ?? "",
                frontendPort: frontendPort,
                backendPort: backendPort,
                frontendIpConfigurationName: lb.frontendIPConfigurations![0].name ?? "",
                protocol: protocol,
                backendAddressPoolIds:[lb.backendAddressPools![0].id ?? ""],
                disableOutboundSnat: disableOutboundSnat
            })
        })   
    
    }

}

export {LoadBalancer}
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs"
class JsonForImport{
    public constructor(){}
    public infrastructureToJson(list: any [], resources: any[], fileName: string){
        list.forEach(elem => {
            resources.push({
                type: elem.urn.apply((str: string) => {
                    const parts = str.split("::");
                    return parts.slice(-2, -1)[0];
                }), 
				name: elem.urn.apply((str: string) => {
                    if(str.includes("applicationPassword")) return "applicationPassword"
                    else if (str.includes("servicePrincipal")) return "servicePrincipal"
                    else if (str.includes("application")) return "application"
                    else return elem.name;
                }),
                id: elem.id
            })
        })
        return pulumi.all([resources]).apply(([res]) => {
            fs.writeFileSync(fileName, 
                JSON.stringify({
                    resources: res
                }, null, 1
            ));
        });
    }
}
export {JsonForImport}
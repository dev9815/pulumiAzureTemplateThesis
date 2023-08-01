const { DefaultAzureCredential } = require("@azure/identity");
const { PostgreSQLManagementFlexibleServerClient } = require("@azure/arm-postgresql-flexible");
const subscriptionId = "f90f5be4-e511-49e0-9d87-03798bdb54cd";
const resourceGroupName = "d-manca-aksResourceGroup";
const serverName = "davide-manca-flexserver";
const dbName = "d-manca-db";
module.exports = async function (context, myTimer) {
  if (myTimer.IsPastDue) {
    context.log("Function execution is past due!");
  }
  const credential = new DefaultAzureCredential();
  const postgresClient = new PostgreSQLManagementFlexibleServerClient(credential, subscriptionId);
  return postgresClient.servers.beginStart(resourceGroupName, serverName)
};

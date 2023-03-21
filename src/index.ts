import core from "@actions/core";
import github from "@actions/github";

import { ClientSecretCredential } from "@azure/identity";
import { WebSiteManagementClient } from "@azure/arm-appservice";

const getFromCore = () => {
  const subscriptionID = core.getInput("subscription-id");
  const ressourceGroup = core.getInput("resource-group");
  const appServiceName = core.getInput("app-service-name");
  const appId = core.getInput("app-id");
  const password = core.getInput("password");
  const tenantId = core.getInput("tenant-id");

  return {
    subscriptionID,
    ressourceGroup,
    appServiceName,
    appId,
    password,
    tenantId,
  };
};

const run = async () => {
  const {
    subscriptionID,
    ressourceGroup,
    appServiceName,
    appId,
    password,
    tenantId,
  } = getFromCore();

  // Create a new instance of the ClientSecretCredential class
  const credential = new ClientSecretCredential(tenantId, appId, password);

  // Create a new instance of the WebSiteManagementClient class
  const client = new WebSiteManagementClient(credential, subscriptionID);

  // TODO: handle slots
  // Call the listApplicationSettings method to retrieve the App Service's environment variables
  const appSettings = await client.webApps.listApplicationSettings(
    ressourceGroup,
    appServiceName
  );

  if (appSettings.properties) {
    core.setOutput("app-settings", Object.keys(appSettings.properties));
  }
};

export default run;

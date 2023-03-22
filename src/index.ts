import * as core from "@actions/core";

import { ClientSecretCredential } from "@azure/identity";
import { WebSiteManagementClient } from "@azure/arm-appservice";

const getFromCore = () => {
  const subscriptionID = core.getInput("subscription-id", { required: true });
  const ressourceGroup = core.getInput("ressource-group", { required: true });
  const appServiceName = core.getInput("app-service-name", { required: true });
  const appId = core.getInput("app-id", { required: true });
  const password = core.getInput("password", { required: true });
  const tenantId = core.getInput("tenant-id", { required: true });
  const slotName = core.getInput("slot-name", { required: false });

  return {
    subscriptionID,
    ressourceGroup,
    appServiceName,
    appId,
    password,
    tenantId,
    slotName,
  };
};

const getError = ({
  subscriptionID,
  ressourceGroup,
  appServiceName,
  appId,
  password,
  tenantId,
}: Partial<ReturnType<typeof getFromCore>>) => {
  if (!subscriptionID) {
    return "subscription-id is required";
  }

  if (!ressourceGroup) {
    return "ressource-group is required";
  }

  if (!appServiceName) {
    return "app-service-name is required";
  }

  if (!appId) {
    return "app-id is required";
  }

  if (!password) {
    return "password is required";
  }

  if (!tenantId) {
    return "tenant-id is required";
  }

  return undefined;
};

const run = async () => {
  const {
    subscriptionID,
    ressourceGroup,
    appServiceName,
    appId,
    password,
    tenantId,
    slotName,
  } = getFromCore();

  const error = getError({
    subscriptionID,
    ressourceGroup,
    appServiceName,
    appId,
    password,
    tenantId,
  });

  if (error) {
    core.setFailed(error);
    return;
  }

  // Create a new instance of the ClientSecretCredential class
  const credential = new ClientSecretCredential(tenantId, appId, password);

  // Create a new instance of the WebSiteManagementClient class
  const client = new WebSiteManagementClient(credential, subscriptionID);

  let properties:
    | {
        [propertyName: string]: string;
      }
    | undefined;

  if (slotName) {
    ({ properties } = await client.webApps.listApplicationSettingsSlot(
      ressourceGroup,
      appServiceName,
      slotName
    ));
  } else {
    ({ properties } = await client.webApps.listApplicationSettings(
      ressourceGroup,
      appServiceName
    ));
  }

  if (properties) {
    core.setOutput(
      "app-settings",
      `(\n${Object.keys(properties).join("\n")}\n)`
    );
  } else {
    core.setOutput("app-settings", "()");
  }
};

run();

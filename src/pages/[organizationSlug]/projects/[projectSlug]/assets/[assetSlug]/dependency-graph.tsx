// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import Section from "@/components/common/Section";
import DependencyGraph from "@/components/DependencyGraph";
import Page from "@/components/Page";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/const/viewConstants";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDimensions from "@/hooks/useDimensions";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { DependencyTreeNode, FlawDTO } from "@/types/api/api";
import { ViewDependencyTreeNode } from "@/types/view/assetTypes";
import { toSearchParams } from "@/utils/common";

import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";

const DependencyGraphPage: FunctionComponent<{
  graph: { root: ViewDependencyTreeNode };
  versions: string[];
  flaws: Array<FlawDTO>;
}> = ({ graph, flaws, versions }) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const dimensions = useDimensions();

  const router = useRouter();
  const all = router.query.all === "1";
  const menu = useAssetMenu();
  return (
    <Page
      Menu={menu}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          >
            {activeOrg.name}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Organization
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project?.slug}`}
          >
            {project?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex items-center gap-1 text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Asset
            </Badge>
          </Link>
        </span>
      }
      title="Dependency Graph"
    >
      <Section
        forceVertical
        title="Dependency Graph"
        description="This graph shows the dependencies of the asset. The risk of each dependency is calculated based on the risk of the affected package."
        Button={
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row items-center gap-4">
              <label
                htmlFor={"version-select"}
                className="block whitespace-nowrap text-sm"
              >
                Version
              </label>
              <Select
                onValueChange={(value) => {
                  router.push(
                    {
                      query: {
                        ...router.query,
                        version: value,
                      },
                    },
                    undefined,
                    { scroll: false },
                  );
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue
                    defaultValue={versions[0]}
                    placeholder={versions[0]}
                  />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem
                      className="text-sm"
                      key={version}
                      value={version}
                    >
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {graph.root.risk !== 0 && (
              <div className="flex flex-row items-center gap-4 whitespace-nowrap text-sm">
                <label htmlFor="allDependencies">
                  Display all dependencies
                </label>
                <Switch
                  id="allDependencies"
                  checked={all}
                  onCheckedChange={(onlyRisk) => {
                    router.push(
                      {
                        query: {
                          ...router.query,
                          all: all ? undefined : "1",
                        },
                      },
                      undefined,
                      { scroll: false },
                    );
                  }}
                />
              </div>
            )}
          </div>
        }
      >
        <Tabs
          defaultValue={(router.query.scanType as string | undefined) ?? "sca"}
        >
          <TabsList>
            <TabsTrigger
              onClick={() =>
                router.push({
                  query: {
                    ...router.query,
                    scanType: "sca",
                  },
                })
              }
              value="sca"
            >
              Application
            </TabsTrigger>
            <TabsTrigger
              onClick={() =>
                router.push({
                  query: {
                    ...router.query,
                    scanType: "container-scanning",
                  },
                })
              }
              value="container-scanning"
            >
              Container Image
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="h-screen w-full rounded-lg border bg-white dark:bg-black">
          <DependencyGraph
            flaws={flaws}
            width={dimensions.width - SIDEBAR_WIDTH}
            height={dimensions.height - HEADER_HEIGHT - 85}
            graph={graph}
          />
        </div>
      </Section>
    </Page>
  );
};

export default DependencyGraphPage;

const RISK_INHERITANCE_FACTOR = 0.33;
const recursiveAddRisk = (
  node: ViewDependencyTreeNode,
  flaws: Array<FlawDTO>,
) => {
  const flaw = flaws.find((p) => p.componentPurlOrCpe === node.name);

  // if there are no children, the risk is the risk of the affected package
  if (flaw) {
    node.risk = flaw.rawRiskAssessment;
    // update the parent node with the risk of this node
    let parent = node.parent;
    let i = 0;
    while (parent != null) {
      i++;
      parent.risk = parent.risk
        ? parent.risk + node.risk * (RISK_INHERITANCE_FACTOR / i)
        : node.risk * (RISK_INHERITANCE_FACTOR / i);
      parent = parent.parent;
    }
  }
  node.children.forEach((child) => recursiveAddRisk(child, flaws));

  return node;
};

const recursiveRemoveParent = (node: ViewDependencyTreeNode) => {
  node.parent = null;
  node.children.forEach((child) => recursiveRemoveParent(child));
};

const convertGraph = (
  graph: DependencyTreeNode,
  parent: ViewDependencyTreeNode | null = null,
): ViewDependencyTreeNode => {
  const convertedNode = {
    name: graph.name,
    children: [] as ViewDependencyTreeNode[],
    risk: 0,
    parent,
  };
  convertedNode.children = graph.children.map((child) =>
    convertGraph(child, convertedNode),
  );
  return convertedNode;
};

export const recursiveRemoveWithoutRisk = (node: ViewDependencyTreeNode) => {
  if (node.risk === 0) {
    return null;
  }
  node.children = node.children
    .map(recursiveRemoveWithoutRisk)
    .filter((n): n is ViewDependencyTreeNode => n !== null);
  return node;
};

export const getServerSideProps = middleware(
  async (context) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/";

    // check for version query parameter
    const version = context.query.version as string | undefined;

    const [resp, flawResp, versionsResp] = await Promise.all([
      apiClient(
        uri +
          "dependency-graph?" +
          toSearchParams({
            all: context.query.all === "1" ? "1" : undefined,
            version: version,
            scanType: context.query.scanType ?? "sca",
          }),
      ),
      apiClient(
        uri +
          "affected-packages?" +
          toSearchParams({
            version: version,
            scanType: context.query.scanType ?? "sca",
          }),
      ),
      apiClient(uri + "versions"),
    ]);

    // fetch a personal access token from the user

    const [graph, flaws, versions] = await Promise.all([
      resp.json() as Promise<{ root: DependencyTreeNode }>,
      flawResp.json() as Promise<Array<FlawDTO>>,
      versionsResp.json() as Promise<Array<string>>,
    ]);

    const converted = convertGraph(graph.root);

    recursiveAddRisk(converted, flaws);
    // we cannot return a circular data structure - remove the parent again
    recursiveRemoveParent(converted);

    // this wont remove anything, if the root node has 0 risk - thats not a bug, its a feature :)
    if (context.query.all !== "1") {
      recursiveRemoveWithoutRisk(converted);
    }

    return {
      props: {
        graph: { root: converted },
        flaws,
        versions,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
  },
);

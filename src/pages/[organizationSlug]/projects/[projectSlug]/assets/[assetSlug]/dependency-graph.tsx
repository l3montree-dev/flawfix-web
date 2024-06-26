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

import DependencyGraph from "@/components/DependencyGraph";
import Page from "@/components/Page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/const/viewConstants";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDimensions from "@/hooks/useDimensions";
import { getApiClientFromContext } from "@/services/flawFixApi";
import { AffectedPackage, DependencyTreeNode } from "@/types/api/api";
import { ViewDependencyTreeNode } from "@/types/view/assetTypes";

import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";

const DependencyGraphPage: FunctionComponent<{
  graph: { root: ViewDependencyTreeNode };
  versions: string[];
  affectedPackages: Array<AffectedPackage>;
}> = ({ graph, affectedPackages, versions }) => {
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
      fullscreen
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg?.slug}`}
            className="text-white hover:no-underline"
          >
            {activeOrg?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}`}
          >
            {project?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
          </Link>
          <span className="opacity-75">/</span>
          <span>Dependency Graph</span>
        </span>
      }
      title="Dependency Graph"
    >
      <div className="flex flex-row items-center justify-end gap-4 border-b bg-card  px-5 py-3 text-foreground">
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
                <SelectItem className="text-sm" key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {graph.root.risk === 0 && (
          <div className="flex flex-row items-center gap-4 text-sm">
            <label htmlFor="allDependencies">Display all dependencies</label>
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
      <DependencyGraph
        affectedPackages={affectedPackages}
        width={dimensions.width - SIDEBAR_WIDTH}
        height={dimensions.height - HEADER_HEIGHT - 85}
        graph={graph}
      />
    </Page>
  );
};

export default DependencyGraphPage;

const severityToRisk = (severity: string): number => {
  switch (severity) {
    case "CRITICAL":
      return 1;
    case "HIGH":
      return 0.7;
    case "MEDIUM":
      return 0.5;
    case "LOW":
      return 0.3;
    default:
      return 0;
  }
};

const RISK_INHERITANCE_FACTOR = 0.33;
const recursiveAddRisk = (
  node: ViewDependencyTreeNode,
  affected: Array<AffectedPackage>,
) => {
  const affectedPackage = affected.find((p) => p.PurlWithVersion === node.name);

  // if there are no children, the risk is the risk of the affected package
  if (affectedPackage) {
    node.risk = severityToRisk(affectedPackage.CVE.severity);
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
  node.children.forEach((child) => recursiveAddRisk(child, affected));

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

    const [resp, affectedResp, versionsResp] = await Promise.all([
      apiClient(
        uri + "dependency-graph" + (version ? "?version=" + version : " "),
      ),
      apiClient(
        uri + "affected-packages" + (version ? "?version=" + version : " "),
      ),
      apiClient(uri + "versions"),
    ]);

    // fetch a personal access token from the user

    const [graph, affected, versions] = await Promise.all([
      resp.json() as Promise<{ root: DependencyTreeNode }>,
      affectedResp.json() as Promise<Array<AffectedPackage>>,
      versionsResp.json() as Promise<Array<string>>,
    ]);

    const converted = convertGraph(graph.root);

    recursiveAddRisk(converted, affected);
    // we cannot return a circular data structure - remove the parent again
    recursiveRemoveParent(converted);

    // this wont remove anything, if the root node has 0 risk - thats not a bug, its a feature :)
    if (context.query.all !== "1") {
      recursiveRemoveWithoutRisk(converted);
    }

    return {
      props: {
        graph: { root: converted },
        affectedPackages: affected,
        versions,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrg,
    project: withProject,
    asset: withAsset,
  },
);

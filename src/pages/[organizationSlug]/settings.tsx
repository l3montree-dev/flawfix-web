// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { middleware } from "@/decorators/middleware";
import { GetServerSidePropsContext } from "next";
import { FunctionComponent } from "react";
import Page from "../../components/Page";
import { withOrgs } from "../../decorators/withOrgs";
import { withSession } from "../../decorators/withSession";
import { useActiveOrg } from "../../hooks/useActiveOrg";

import GithubAppInstallationAlert from "@/components/common/GithubAppInstallationAlert";
import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import { Button, buttonVariants } from "@/components/ui/button";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { cn } from "@/lib/utils";
import { encodeObjectBase64 } from "@/services/encodeService";

import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";
import { Form } from "@/components/ui/form";
import { AssetFormGeneral } from "@/components/asset/AssetForm";
import { useForm } from "react-hook-form";
import { OrganizationDTO, OrganizationDetailsDTO } from "@/types/api/api";
import OrgRegisterForm from "@/components/OrgRegister";
import { OrgForm } from "@/components/OrgForm";
import { toast } from "sonner";
import { browserApiClient } from "@/services/devGuardApi";
import { useStore } from "@/zustand/globalStoreProvider";

const Home: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const orgMenu = useOrganizationMenu();
  const updateOrganization = useStore((s) => s.updateOrganization);
  const router = useRouter();

  const form = useForm<OrganizationDetailsDTO>({
    defaultValues: activeOrg,
  });

  const handleUpdate = async (data: Partial<OrganizationDetailsDTO>) => {
    const resp = await browserApiClient("/organizations/" + activeOrg.slug, {
      method: "PATCH",
      body: JSON.stringify({
        ...data,
        numberOfEmployees: !!data.numberOfEmployees
          ? Number(data.numberOfEmployees)
          : undefined,
      }),
    });

    if (!resp.ok) {
      console.error("Failed to update organization");
    } else if (resp.ok) {
      toast("Success", {
        description: "Organization updated",
      });

      const newOrg = await resp.json();
      updateOrganization(newOrg);

      if (newOrg.slug !== activeOrg.slug) {
        router.push("/" + newOrg.slug + "/settings");
      }
    }
  };

  return (
    <Page
      Title={
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
      }
      title={activeOrg.name ?? "Loading..."}
      Menu={orgMenu}
    >
      <div className="flex flex-row justify-between">
        <h1 className="text-2xl font-semibold">Organization Settings</h1>
      </div>
      <div>
        <Section
          description={
            "Manage any third party integrations. You can connect the organization with a GitHub App Installation, a JIRA Project any many more."
          }
          title="Third-Party Integrations"
        >
          {activeOrg.githubAppInstallations?.map((installation) => (
            <ListItem
              key={installation.installationId}
              Title={
                <>
                  <img
                    alt={installation.targetLogin}
                    src={installation.targetAvatarUrl}
                    className="mr-2 inline-block h-6 w-6 rounded-full"
                  />
                  {installation.targetLogin}
                </>
              }
              description={
                "DevGuard uses a GitHub App to access your repositories and interact with your code."
              }
              Button={
                <Link
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "!text-secondary-foreground hover:no-underline",
                  )}
                  href={installation.settingsUrl}
                >
                  Manage GitHub App
                </Link>
              }
            />
          ))}
          <ListItem
            Title="Add a GitHub App"
            description="DevGuard uses a GitHub App to access your repositories and interact with your code."
            Button={
              <GithubAppInstallationAlert
                Button={
                  <Link
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "!text-black hover:no-underline",
                    )}
                    href={
                      "https://github.com/apps/devguard-app/installations/new?state=" +
                      encodeObjectBase64({
                        orgSlug: activeOrg.slug,
                        redirectTo: router.asPath,
                      })
                    }
                  >
                    Install GitHub App
                  </Link>
                }
              >
                <Button variant={"secondary"}>Install GitHub App</Button>
              </GithubAppInstallationAlert>
            }
          />
        </Section>
      </div>
      <hr />
      <div className="pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <OrgForm form={form} />
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </div>
      <hr />
      <Section
        title="Members"
        description="Manage the members of your organization."
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-6"></div>
        </div>
      </Section>
    </Page>
  );
};

export default Home;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
  },
);

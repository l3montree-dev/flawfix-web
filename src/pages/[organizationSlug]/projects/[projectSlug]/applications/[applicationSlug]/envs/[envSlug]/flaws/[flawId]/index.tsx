import Page from "@/components/Page";

import DateString from "@/components/common/DateString";
import FlawState from "@/components/common/FlawState";
import P from "@/components/common/P";
import Severity from "@/components/common/Severity";
import { withInitialState } from "@/decorators/withInitialState";
import { withSession } from "@/decorators/withSession";
import { getApiClientFromContext } from "@/services/flawFixApi";
import { FlawWithCVE } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";
import Markdown from "react-markdown";

const CVECard = dynamic(() => import("@/components/CVECard"), {
  ssr: false,
});

interface Props {
  flaw: FlawWithCVE;
}
const Index: FunctionComponent<Props> = ({ flaw }) => {
  const cve = flaw.cve;
  return (
    <Page title={flaw.ruleId}>
      <div className="flex gap-2 flex-row">
        <div className="flex-1">
          <h1 className="font-display font-bold text-4xl">{flaw.ruleId}</h1>
          <div className="flex mt-4 flex-row gap-2 text-sm">
            <FlawState state={flaw.state} />
            {cve && <Severity severity={cve.severity} />}
          </div>
          <div className="mt-4">
            <Markdown>{flaw.message?.replaceAll("\n", "\n\n")}</Markdown>
          </div>
        </div>

        {cve && <CVECard cve={cve} />}
      </div>
    </Page>
  );
};

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, applicationSlug, envSlug, flawId } =
      context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/applications/" +
      applicationSlug +
      "/envs/" +
      envSlug +
      "/flaws/" +
      flawId;

    const resp = await (await apiClient(uri)).json();

    return {
      props: {
        flaw: resp,
      },
    };
  }),
);

export default Index;

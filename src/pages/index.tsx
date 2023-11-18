import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React from "react";
import { withSession } from "../decorators/withSession";
import { withInitialState } from "../decorators/withInitialState";

const Index = () => {
  return <div></div>;
};

export const getServerSideProps: GetServerSideProps = withSession(
  withInitialState(
    async (ctx: GetServerSidePropsContext, _, { organizations }) => {
      // check if we can redirect to the first organization
      if (organizations.length > 0) {
        return {
          redirect: {
            destination: `/${organizations[0].slug}`,
            permanent: false,
          },
        };
      } else {
        // redirect to the create organization page
        return {
          redirect: {
            destination: `/setup-organization`,
            permanent: false,
          },
        };
      }
    },
  ),
);

export default Index;

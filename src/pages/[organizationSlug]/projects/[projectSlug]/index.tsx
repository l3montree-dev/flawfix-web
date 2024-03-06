import Select from "@/components/common/Select";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import Page from "../../../../components/Page";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import ListItem from "../../../../components/common/ListItem";
import Modal from "../../../../components/common/Modal";
import { withInitialState } from "../../../../decorators/withInitialState";
import { withSession } from "../../../../decorators/withSession";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import {
  getApiClient,
  getApiClientFromContext,
} from "../../../../services/flawFixApi";
import { AssetDTO, EnvDTO, ProjectDTO } from "../../../../types/api/api";
import { CreateAssetReq } from "../../../../types/api/req";
import { hasErrors } from "../../../../utils/common";

interface Props {
  project: ProjectDTO & {
    assets: Array<AssetDTO>;
  };
}
const Index: FunctionComponent<Props> = ({ project }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const activeOrg = useActiveOrg()!;
  const { register, getFieldState, formState, handleSubmit } =
    useForm<CreateAssetReq>();

  const handleCreateAsset = async (data: CreateAssetReq) => {
    const client = getApiClient();
    const resp = await client(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project.slug +
        "/assets",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    if (resp.ok) {
      const res: AssetDTO & {
        env: Array<EnvDTO>;
      } = await resp.json();
      // navigate to the new application
      router.push(
        `/${activeOrg.slug}/projects/${project.slug}/assets/${res.slug}`,
      );
    }
  };
  return (
    <>
      <Page
        Button={<Button onClick={() => setShowModal(true)}>New Asset</Button>}
        title={project.name}
      >
        {project.assets.map((asset) => (
          <ListItem
            key={asset.id}
            title={asset.name}
            description={asset.description}
            Button={
              <Button
                href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}`}
                variant="outline"
                intent="primary"
              >
                View Application
              </Button>
            }
          />
        ))}
      </Page>
      <Modal
        Help={<div>The Security Requirements are defined as...</div>}
        open={showModal}
        setOpen={setShowModal}
        title="Create new Asset"
      >
        <form className="text-black" onSubmit={handleSubmit(handleCreateAsset)}>
          <Input
            variant="dark"
            label="Name"
            {...register("name", {
              required: "Please enter a name",
            })}
            error={getFieldState("name")?.error}
          />
          <div className="mt-4">
            <Input
              variant="dark"
              label="Description"
              {...register("description", {
                required: "Please enter a description",
              })}
              error={getFieldState("description")?.error}
            />
          </div>
          <div className="mt-4">
            <Select label="Confidentiality Requirement">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </Select>
          </div>
          <div className="mt-4">
            <Select label="Integrity Requirement">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </Select>
          </div>
          <div className="mt-4">
            <Select label="Availability Requirement">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </Select>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              disabled={hasErrors(formState.errors)}
              type="submit"
              variant="solid"
            >
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export const getServerSideProps = withSession(
  withInitialState(async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug } = context.params!;
    const apiClient = getApiClientFromContext(context);
    const resp = await apiClient(
      "/organizations/" + organizationSlug + "/projects/" + projectSlug + "/",
    );

    const project = await resp.json();

    return {
      props: {
        project,
      },
    };
  }),
);
export default Index;

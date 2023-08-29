// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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

export type State =
  | "verifiedFix"
  | "pendingFix"
  | "pendingTransfered"
  | "unhandled"
  | "accepted"
  | "avoided"
  | "verifiedTransfered";

export type ClosedState =
  | "verifiedFix"
  | "avoided"
  | "accepted"
  | "verifiedTransfered";

export type PendingState = "pendingFix" | "pendingTransfered";

export type GroupAndProjects = {
  name: string;
  projects: Project[];
};

export type Project = {
  name: string;
  environment: Environment;
  status: "All handeled" | "Unhandeled Flaws";
  lastReport: string | null;
  lastReportDateTime: string | null;
};

export type Environment = "prod" | "stage" | "dev";

export interface IMember {
  email: string;
}

export interface IUser {
  name: string;
  imageUrl: string;
}

export interface IActivityItem {
  id: number;
  user: IUser;
  projectName: string;
  cve: string;
  newState: State;
  date: string;
  dateTime: string;
}

export interface IActivityItems {
  items: IActivityItem[];
}

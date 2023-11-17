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

import Link from "next/link";
import Sidebar from "./Sidebar";

interface Props {
  links: Array<{
    title: string;
    href: string;
  }>;
}

export default function SubnavSidebar({ links }: Props) {
  return (
    <Sidebar title="Navigation">
      <ol role="list" className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {links.map((link) => (
          <li key={link.href}>
            <Link className="text-sm text-blue-100" href={link.href}>
              {link.title}
            </Link>
          </li>
        ))}
      </ol>
    </Sidebar>
  );
}

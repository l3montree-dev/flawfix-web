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

import "focus-visible";
import "@/styles/tailwind.scss";
import { Lexend, Merriweather } from "next/font/google";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useHydrate } from "../zustand/globalStore";
import { StoreProvider } from "../zustand/globalStoreProvider";
import { useEffect } from "react";

export const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-merriweather",
  weight: "700",
});

// @ts-ignore
export default function App({ Component, pageProps }) {
  const store = useHydrate(pageProps.initialZustandState);

  useEffect(() => {
    store.getState().clientInit();
  }, [store]);
  return (
    <StoreProvider store={store}>
      <Component {...pageProps} />
    </StoreProvider>
  );
}

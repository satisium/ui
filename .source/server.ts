// @ts-nocheck
import * as __fd_glob_9 from "../content/docs/components/spotlight-card.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/components/fluid-switch.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/components/button.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/components/aurora-hero.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/components/ao.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/getting-started/installation.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/getting-started/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/components/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "components/meta.json": __fd_glob_1, "getting-started/meta.json": __fd_glob_2, }, {"index.mdx": __fd_glob_3, "getting-started/installation.mdx": __fd_glob_4, "components/ao.mdx": __fd_glob_5, "components/aurora-hero.mdx": __fd_glob_6, "components/button.mdx": __fd_glob_7, "components/fluid-switch.mdx": __fd_glob_8, "components/spotlight-card.mdx": __fd_glob_9, });
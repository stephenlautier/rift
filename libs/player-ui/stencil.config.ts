import { Config } from "@stencil/core";
import { reactOutputTarget } from "@stencil/react-output-target";

/**
 * Stencil config for @rift/player-ui.
 *
 * Source files are copied from apps/mfe-player/src/ during migration.
 * The hydrateModule and clientModule now reference the new @rift/player-ui
 * package name instead of @rift/mfe-player.
 */
export const config: Config = {
	namespace: "rift-player",
	outputTargets: [
		reactOutputTarget({
			outDir: "src/react",
			hydrateModule: "@rift/player-ui/hydrate",
			clientModule: "@rift/player-ui/react",
		}),
		{
			type: "dist",
			esmLoaderPath: "../loader",
		},
		{
			type: "dist-custom-elements",
			customElementsExportBehavior: "auto-define-custom-elements",
			externalRuntime: false,
		},
		{
			type: "dist-hydrate-script",
			dir: "./hydrate",
		},
		{
			type: "docs-readme",
		},
	],
};

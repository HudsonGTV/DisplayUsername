/**
 * @name DisplayUsername
 * @source https://github.com/HudsonGTV/BetterDiscordPlugins/blob/main/DisplayUsername/DisplayUsername.plugin.js
 * @author HG
 * @authorId 124667638298181632
 * @description Displays Discord handle next to display name and adds '`@`' symbol in profile card.
 * @version 1.0.2
 * @website https://hudsongreen.com/
 * @invite https://discord.gg/H3bebA97tV
 * @donate https://www.paypal.com/donate/?business=REFHYLZAZUWHJ
 */
 
const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
	info: {
		name: "DisplayUsername",
		authors: [
		{	
			name: "@hg"
			}
		],
		version: "1.0.2",
		description: "Displays Discord handle next to display name and adds '`@`' symbol in profile card.",
		github: "https://github.com/HudsonGTV/BetterDiscordPlugins/blob/main/DisplayUsername/DisplayUsername.plugin.js",
		github_raw: "https://raw.githubusercontent.com/HudsonGTV/BetterDiscordPlugins/main/DisplayUsername/DisplayUsername.plugin.js"
	},
	changelog: [
		{
			title: "Fixes",
			type: "fixed",
			items: [
				"Fixed visual bug causing uneven gap to sometimes appear between username and timestamp."
			]
		}
	],
	defaultConfig: []
};

module.exports = !global.ZeresPluginLibrary ? class {
	
	constructor() {
		this._config = config;
	}
	
	load() {
        BdApi.showConfirmationModal("Library plugin is needed",
            `The library plugin needed for AQWERT'sPluginBuilder is missing. Please click Download Now to install it.`, {
            confirmText: "Download",
            cancelText: "Cancel",
            onConfirm: () => {
                request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                    if (error)
                        return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");

                    fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                });
            }
        });
    }
	
	start() { }
	stop() { }
	
} : (([Plugin, Library]) => {
	
	const { DiscordModules, WebpackModules, Patcher, PluginUtilities } = Library;
	const { React } = DiscordModules;
	
	class plugin extends Plugin {
		
		constructor() {
            super();
        }


        onStart() {
			
			// Apply usernames
			this.applyUsername();
			
			// CSS to add @ symbol in profile card and to style username
            PluginUtilities.addStyle(
				"HG_DisplayUsernameCSS", 
				`
				/* display @ infront of username */
				.info-3ddo6z > span::before {
					color: #777;
					content: "@";
				}
				/* hide @ infront of nick in friends list */
				.username-Qpc78p::before {
					content: "" !important;
				}
				/* always show username in friends list */
				.discriminator-WV5K5s {
					visibility: visible;
				}
				/* style username in messages */
				.hg-username-handle {
					margin-left: 0.5rem;
					font-size: 0.75rem;
				}
				.hg-username-handle::after {
					margin-left: 0.25rem;
					content: "•";
				}
				/* fix timestamp margin */
				.compact-2Nkcau .headerText-2z4IhQ, .cozy-VmLDNB .headerText-2z4IhQ, .roleDot-PzIfeF {
					margin-right: 0rem;
				}
				`
			);
        }

        onStop() {
            Patcher.unpatchAll();
            PluginUtilities.removeStyle("HG_DisplayUsernameCSS");
        }
		
		applyUsername() {
			const [ module, key ] = BdApi.Webpack.getWithKey(BdApi.Webpack.Filters.byStrings("userOverride", "withMentionPrefix"), { searchExports: false });
			Patcher.after(module, key, (_, args, ret) => {
				let author = args[0].message.author;
				ret.props.children.push(
					React.createElement("span", { class: "hg-username-handle" }, '@' + author.username)
				);
			});
		}
		
	}
	
	return plugin;
	
})(global.ZeresPluginLibrary.buildPlugin(config));

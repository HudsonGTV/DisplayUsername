/**
 * @name DisplayUsernames
 * @source https://github.com/HudsonGTV/BetterDiscordPlugins/blob/main/DisplayUsername/DisplayUsername.plugin.js
 * @author HG
 * @authorId 124667638298181632
 * @description Displays Discord handle next to display names in chat and adds '@' symbol in profile cards.
 * @version 1.0.4
 * @website https://hudsongreen.com/
 * @invite https://discord.gg/H3bebA97tV
 * @donate https://www.paypal.com/donate/?business=REFHYLZAZUWHJ
 */
 
const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
	info: {
		name: "DisplayUsernames",
		authors: [
		{	
			name: "HG"
			}
		],
		version: "1.0.4",
		description: "Displays Discord handle next to display names in chat and adds '`@`' symbol in profile cards.",
		github: "https://github.com/HudsonGTV/BetterDiscordPlugins/blob/main/DisplayUsername/DisplayUsername.plugin.js",
		github_raw: "https://raw.githubusercontent.com/HudsonGTV/BetterDiscordPlugins/main/DisplayUsername/DisplayUsername.plugin.js"
	},
	changelog: [
		{
			title: "Fixes",
			type: "fixed",
			items: [
				"Fixed visual bug causing the wrong seperator to appear in replies.",
				"Fixed visual bug causing the wrong info to appear when user excecuted a slash command."
			]
		},
		/*{
			title: "Changes/Additions",
			type: "added",
			items: [
				""
			]
		}*/
	],
	defaultConfig: []
};

module.exports = !global.ZeresPluginLibrary ? class {
	
	constructor() {
		this._config = config;
	}
	
	load() {
		BdApi.showConfirmationModal("Library plugin is needed",
			`The library plugin needed for ZeresPluginLibrary is missing. Please click Download Now to install it.`, {
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
					margin-left: 0.25rem;
					font-size: 0.75rem;
				}
				/* seperator dot */
				.hg-username-handle::after {
					margin-left: 0.25rem;
					content: "•";
				}
				/* fix timestamp margin (discord likes to change it randomly) */
				.compact-2Nkcau .headerText-2z4IhQ, .cozy-VmLDNB .headerText-2z4IhQ, .roleDot-PzIfeF {
					margin-right: 0 !important;
				}
				/* change seperator in replies */
				.repliedMessage-3Z6XBG > .hg-username-handle::after {
					margin-left: 0;
					content: ":  ";
				}
				/* hide username in command replies */
				.executedCommand-14-SNW > .hg-username-handle {
					display: none;
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
				let discrim = author.discriminator;
				ret.props.children.push(
					React.createElement("span", { class: "hg-username-handle" }, '@' + author.username + (discrim != "0" ? "#" + discrim : ""))
				);
			});
			
		}
		
	}
	
	return plugin;
	
})(global.ZeresPluginLibrary.buildPlugin(config));

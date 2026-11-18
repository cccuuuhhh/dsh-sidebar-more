window.__ModuleLoader__.load({
	id: "dsh-sidebar-more",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");

		/**
		 * Fold every global panel row into the panel list's More menu.
		 *
		 * The More launcher is the only child of the sidebar's panel `<nav>` whose
		 * subtree carries `aria-haspopup="menu"`; every other child is one panel
		 * launcher, wrapped either as a bare `<button>` (older hosts) or as a
		 * `<div>` holding the button plus its unpin control (newer hosts). The
		 * rule below hides every nav child except the More launcher, so it covers
		 * both wrappings without knowing which one is in force.
		 *
		 * The `:has(button[aria-haspopup="menu"])` guard scopes the rule to the
		 * panel list alone and keeps it inert wherever this plugin's More trigger
		 * is absent, so disabling or uninstalling restores the shipped list
		 * unchanged. Matching on that ARIA attribute — part of the slot contract,
		 * not the stylesheet — avoids hashed CSS-module class names, the active
		 * locale, and any assumption about which panels are present.
		 */
		const FOLD_CSS =
			'nav:has(> * button[aria-haspopup="menu"]) > :not(:has(button[aria-haspopup="menu"]))' +
			'{display:none!important}';

		const NS = "sidebarMore";
		const zh = { plugins: "插件" };
		const en = { plugins: "Plugins" };

		/**
		 * Rows of the panel list's More menu.
		 *
		 * The owner never lists the Plugins panel in `entries`, so this occupant
		 * restores that row and appends every other panel in registration order.
		 * Each row opens through the owner's own `onOpen`, which resolves the id
		 * against the complete panel list (Plugins included), then closes the menu.
		 *
		 * `t` and `usePanelInfo` are injected by the slot system: the first because
		 * the registration declares `locale: NS`, the second because it is a
		 * standard prop of `sidebar.panellist.actions`.
		 *
		 * @param props - Menu owner share, injected standard hooks, and locale copy.
		 */
		function PanelMenuRows({ entries, onOpen, onDismiss, usePanelInfo, t }) {
			const activePanelId = usePanelInfo((info) => info.activePanelId);
			const rows = [{ id: "plugins", label: t("plugins") }].concat(entries ?? []);
			return React.createElement(
				React.Fragment,
				null,
				rows.map((entry) =>
					React.createElement(
						primitives.MenuItemButton,
						{
							key: entry.id,
							current: entry.id === activePanelId,
							onSelect: () => {
								onDismiss();
								onOpen(entry.id);
							},
						},
						entry.label,
					),
				),
			);
		}

		const inject = ["slots", "locale"];

		/**
		 * Register the folded panel menu and its stylesheet.
		 * @param ctx - Client context with the slot and locale services.
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "sidebar-more: dictionaries");

			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-sidebar-more";
				tag.dataset.pluginCss = "dsh-sidebar-more/fold.css";
				tag.textContent = FOLD_CSS;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "sidebar-more: fold stylesheet");

			ctx.slots.inject("sidebar.panellist.actions", () =>
				ctx.slots.register(
					{
						name: "sidebar.panellist.actions",
						id: "sidebar-more-panels",
						order: -1,
						locale: NS,
					},
					PanelMenuRows,
				),
			);
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});

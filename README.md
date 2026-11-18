# dsh-sidebar-more

Fold every global panel row in the DeepSeek Harness left sidebar into the built-in **More** menu, leaving a single **More** row above the workspace list.

把 DeepSeek Harness 左侧边栏的全局面板入口收进内置的「更多」菜单，工作区列表上方只留一个「更多」。

## What it does

The sidebar normally gives every global panel its own row — Plugins, the plugin market, scheduled tasks, context insight, the skill centre, and whatever later plugins register. On a laptop that list grows faster than it is used.

This plugin hides those rows and keeps the shipped **More** launcher, which already exists in the panel list. Every hidden panel is reachable from that menu, so nothing becomes unreachable:

```
Before                          After
┌──────────────────┐            ┌──────────────────┐
│  ▣  新会话        │            │  ▣  新会话        │
│  ⬡  插件          │            │  ⊞  更多          │  ← click to list
│  ◷  定时任务      │            │                  │     every panel
│  ◈  上下文        │            │  工作区           │
│  ▤  市场          │            │  …                │
│  ⊞  更多          │            └──────────────────┘
└──────────────────┘
```

The menu marks the panel currently shown in the main column, and opens any row in place.

Compared with keeping a custom popover, this reuses the launcher the host already renders, so the row keeps the host's icon, tooltip, keyboard behaviour and collapsed-rail presentation.

## Install

```sh
dsh plugin add github:cccuuuhhh/dsh-sidebar-more
```

Or, from the market, search for **Sidebar: fold panels into More**.

## Compatibility

- Requires DSH **0.2.x** (`>=0.2.0-rc.1 <0.3.0-0`).
- Client-only: it registers into the `sidebar.panellist.actions` slot and adds one stylesheet. It touches no built-in files, so uninstalling restores the shipped list exactly.
- Both panel-row layouts are supported: the bare-button list (older 0.2 builds) and the wrapper-plus-unpin layout (newer builds).

## How it works

The sidebar's panel list is a `<nav>` whose children are the panel launchers. Exactly one of those children is the **More** launcher, and it is the only one whose subtree contains `button[aria-haspopup="menu"]`. One rule hides every other child:

```css
nav:has(> * button[aria-haspopup="menu"])
  > :not(:has(button[aria-haspopup="menu"])) { display: none !important; }
```

The `:has(...)` guard scopes it to the panel list and makes it inert wherever the More launcher is absent. It matches an ARIA attribute from the slot contract rather than hashed CSS-module class names, so it does not depend on the stylesheet, the locale, or which panels are installed.

The menu content comes from the plugin's occupant of `sidebar.panellist.actions`. The host deliberately leaves the Plugins panel out of that list, so the occupant adds it back and appends the remaining panels in registration order.

## Limitations

- The hidden rows stay in the DOM (only `display: none`), so the host still owns their state; that is intentional and keeps uninstall clean.
- Panels added by other plugins appear in the menu automatically, without configuration.
- The stylesheet keys on the shipped More launcher. If a future DSH release removes or reshapes it, the rule stops applying and the panel rows come back rather than breaking the sidebar.

## Uninstall

```sh
dsh plugin remove dsh-sidebar-more
```

Both the menu rows and the stylesheet are disposed with the plugin.

## License

MIT

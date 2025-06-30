<script lang="ts" generics="T extends TreeItemFromDB = TreeItemFromDB">
  import type { IconifyIcon } from '@iconify/svelte'
  import { get } from 'txstate-utils'
  import { Icon } from '$lib'
  import type { TreeHeader, TreeItemFromDB, TypedTreeItem } from './treestore'

  export let header: TreeHeader<T>
  export let item: TypedTreeItem<T>
  $: icon = (typeof header.icon === 'function' ? header.icon(item) : header.icon) as { icon: IconifyIcon, label: string } | undefined
  $: headerComponent = header.component as any
</script>

{#if icon}
  <span class="icon">
    <Icon icon={icon.icon} tooltip={icon.label} inline width="1.5em" hiddenLabel={icon.label} />
  </span>
{/if}
{#if header.component}
  <svelte:component this={headerComponent} {item} {header} />
{:else if header.render}
  {@html header.render(item)}
{:else if header.get}
  {#if get(item, header.get)}{get(item, header.get)}{:else}&nbsp;{/if}
{/if}

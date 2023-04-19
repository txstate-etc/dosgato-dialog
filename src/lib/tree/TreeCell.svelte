<script lang="ts">
  import { get, titleCase } from 'txstate-utils'
  import { Icon } from '$lib'
  import type { TreeHeader, TreeItemFromDB, TypedTreeItem } from './treestore'

  type T = $$Generic<TreeItemFromDB>

  export let header: TreeHeader<T>
  export let item: TypedTreeItem<T>
  $: icon = typeof header.icon === 'function' ? header.icon(item).icon : header.icon?.icon
  $: iconLabel = typeof header.icon === 'function' ? header.icon(item).label : header.icon?.label
  $: headerComponent = header.component as any
</script>

{#if header.icon}
  <span class="icon">
    <Icon {icon} tooltip={iconLabel} inline width="1.5em" hiddenLabel={iconLabel} />
  </span>
{/if}
{#if header.component}
  <svelte:component this={headerComponent} {item} {header} />
{:else if header.render}
  {@html header.render(item)}
{:else if header.get}
  {#if get(item, header.get)}{get(item, header.get)}{:else}&nbsp;{/if}
{/if}

<script lang="ts" generics="T extends TreeItemFromDB = TreeItemFromDB">
  import { get, toArray } from 'txstate-utils'
  import { Icon } from '$lib'
  import type { TreeHeader, TreeItemFromDB, TypedTreeItem } from './treestore'

  export let header: TreeHeader<T>
  export let item: TypedTreeItem<T>
  $: icons = toArray((typeof header.icon === 'function' ? header.icon(item) : header.icon))
  $: leadingIcons = icons.filter(i => !i.trailing)
  $: trailingIcons = icons.filter(i => i.trailing)
  $: headerComponent = header.component as any
</script>

{#each leadingIcons as icon}
  <span class="icon">
    <Icon icon={icon.icon} tooltip={icon.tooltip} class={icon.class} inline width="1.5em" hiddenLabel={icon.label} />
  </span>
{/each}
{#if header.component}
  <svelte:component this={headerComponent} {item} {header} />
{:else if header.render}
  {@html header.render(item)}
{:else if header.get}
  {#if get(item, header.get)}{get(item, header.get)}{:else}&nbsp;{/if}
{/if}
{#if trailingIcons.length}
  <span class="trailing-icons">
    {#each trailingIcons as icon}
      <span class="icon">
        <Icon icon={icon.icon} tooltip={icon.tooltip} class={icon.class} inline width="1.5em" hiddenLabel={icon.label} />
      </span>
    {/each}
  </span>
{/if}

<style>
  .trailing-icons {
    margin-left: 10px;
    display: inline-flex;
    align-items: center;
  }
</style>

<script lang="ts" setup></script>


<template>
      <table class="w-full border border-black/10 bg-white/70 custom-table">
                    <thead class="bg-background/20  text-left ">
                        <slot name="tableHeader" />
                    </thead>
                    <tbody>
                       <slot name="tableBody" />
                    </tbody>
                </table>
</template>

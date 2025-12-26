<script lang="ts" setup>
import LayoutHeader from '~/components/LayoutHeader.vue';





</script>

<template>
 <div
  class="relative bg-background min-h-dvh w-full overflow-hidden crimson-text"
>
  <!-- main content -->
  <span
    class="absolute inset-0 bg-[url(/img/paper.png)] bg-repeat opacity-50 mix-blend-multiply pointer-events-none z-0"
  ></span>

  <!-- TODO: Gotta limit the figgure for huge screens -->
  <div class="grid grid-cols-3 z-10">
    <div class="border-stroke-light h-dvh border-r border-solid">
      <div
        class="aspect-4/4 relative flex items-end flex-col justify-end w-full border-stroke-light border-b"
      >
        <div class="ml-auto mix-blend-color-burn opacity-65 no-pointer-events">
          <img
            src="/img/news/2.png"
            alt="article 1"
            class="object-contain w-full h-full"
            draggable="false"
          />
        </div>
      </div>

      <div>
        <div
          class="ml-auto mix-blend-color-burn opacity-65 no-pointer-events w-[95%]"
        >
          <img
            src="/img/news/3.png"
            alt="article 1"
            class="object-contain w-full h-full"
            draggable="false"
          />
        </div>
      </div>
    </div>

    <div class="border-stroke-light h-dvh border-r border-solid">
      <div
        class="border-stroke-light border-t h-dvh flex flex-col items-center py-24"
      >

        <!-- Header -->
         <layout-header>
            <template #title>Sudoku Online</template>
            <template #subtitle>Play online sudoku games</template>
         </layout-header>
         <!-- Main content -->
         <div class="w-full ">
           <slot /> 
         </div>
      </div>
    </div>

    <div class="border-stroke-light h-dvh border-r border-solid">
      <div
        class="aspect-4/4 relative flex items-end flex-col justify-end w-full border-stroke-light border-b"
      >
        <div
          class="mr-auto mix-blend-color-burn opacity-65 no-pointer-events 4"
        >
          <img
            src="/img/news/4.png"
            alt="article 1"
            class="object-contain w-full h-full"
            draggable="false"
          />
        </div>
      </div>

      <div>
        <div
          class="mr-auto mix-blend-color-burn opacity-65 no-pointer-events w-[95%]"
        >
          <img
            src="/img/news/5.png"
            alt="article 1"
            class="object-contain w-full h-full"
            draggable="false"
          />
        </div>
      </div>
    </div>
  </div>
</div>

</template>

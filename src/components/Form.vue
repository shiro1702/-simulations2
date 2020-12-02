<template>
  <div class="">
    <h2 class="is-size-4 mb-3">{{title}}</h2>
    <b-field v-for="item in form" :label="item.name+ ':'" 
        :key="item.name"
        horizontal>
        <div class="is-flex is-align-items-center">
          <v-select v-if="item.options" class="is-flex-grow-2" multiple v-model="item.value" :options="item.options" />
        
          <div v-else-if="item.exstraOption">
            
          </div>
          <b-input v-else class="is-flex-grow-2" v-model="item.value" ></b-input>
          <b-tooltip v-if="item.tooltip" 
              class="control ml-2"
              :label="item.tooltip" 
              multilined>
            <b-icon
                icon="help-circle-outline">
            </b-icon>
          </b-tooltip>
        </div>
    </b-field>
  </div>
</template>

<script>
export default {
  props: ['title', 'form'],
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass">

</style>
